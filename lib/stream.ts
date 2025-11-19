import { StreamingState, StreamEvent } from "@/types/chat";

/**
 * Iterate through a streaming text response
 */
export async function* iterateTextStream(
  response: Response
): AsyncGenerator<string> {
  if (!response.body) {
    throw new Error("Response body is null");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");

      // Keep the last incomplete line in the buffer
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (line.trim()) {
          yield line;
        }
      }
    }

    // Yield any remaining content in the buffer
    if (buffer.trim()) {
      yield buffer;
    }
  } finally {
    reader.releaseLock();
  }
}

/**
 * Parse a single line from the stream and update the streaming state
 */
export function parseStreamChunk(
  line: string,
  currentState: StreamingState
): StreamingState {
  const newState = { ...currentState };

  try {
    // Handle SSE format (data: {...})
    if (!line.startsWith("data: ")) {
      return currentState;
    }

    const jsonData = line.substring(6).trim();

    // Skip empty data or end markers
    if (!jsonData || jsonData === "{}") {
      return currentState;
    }

    const event = JSON.parse(jsonData);

    // Check if stream is done
    if (event.final_sse_message === true || event.status === "COMPLETED") {
      newState.done = true;
      newState.planSteps = newState.planSteps.map((step) => ({
        ...step,
        status: "complete",
      }));
      return newState;
    }

    // Extract plan/goals from blocks
    if (event.blocks && Array.isArray(event.blocks)) {
      for (const block of event.blocks) {
        // Handle plan blocks
        if (block.plan_block && block.plan_block.goals) {
          handleGoals(block.plan_block, newState);
        }
        
        // Handle diff blocks for plans
        if (block.diff_block && block.diff_block.field === "plan_block") {
          handlePlanDiffBlock(block.diff_block, newState);
        }

        // Handle answer blocks
        if (block.intended_usage === "ask_text" && block.diff_block) {
          handleAnswerDiffBlock(block.diff_block, newState);
        }
      }
    }

    // Extract sources from structured_answer_block
    if (event.structured_answer_block) {
      handleStructuredAnswer(event.structured_answer_block, newState);
    }

    // Also check web_results directly
    if (event.web_results && Array.isArray(event.web_results)) {
      handleWebResults(event.web_results, newState);
    }

  } catch (error) {
    console.error("Error parsing stream chunk:", error);
  }

  return newState;
}

function handleGoals(planBlock: any, state: StreamingState): void {
  if (!planBlock.goals || !Array.isArray(planBlock.goals)) return;

  planBlock.goals.forEach((goal: any, index: number) => {
    const status = planBlock.progress === "DONE" ? "complete" : 
                   planBlock.progress === "IN_PROGRESS" ? "active" : "pending";
    
    if (state.planSteps[index]) {
      state.planSteps[index] = {
        step: goal.description || goal.name || "",
        status,
      };
    } else {
      state.planSteps.push({
        step: goal.description || goal.name || "",
        status,
      });
    }
  });

  if (planBlock.progress === "IN_PROGRESS") {
    state.activeStepIndex = Math.max(0, state.planSteps.length - 1);
  }
}

function handlePlanDiffBlock(diffBlock: any, state: StreamingState): void {
  if (!diffBlock.patches || !Array.isArray(diffBlock.patches)) return;

  for (const patch of diffBlock.patches) {
    if (patch.op === "replace" && patch.path && patch.path.includes("/goals/") && patch.path.includes("/description")) {
      const match = patch.path.match(/\/goals\/(\d+)\/description/);
      if (match) {
        const index = parseInt(match[1]);
        if (state.planSteps[index]) {
          state.planSteps[index].step = patch.value;
          state.planSteps[index].status = "active";
          state.activeStepIndex = index;
        } else {
          state.planSteps.push({
            step: patch.value,
            status: "active",
          });
          state.activeStepIndex = state.planSteps.length - 1;
        }
      }
    }
  }
}

function handleAnswerDiffBlock(diffBlock: any, state: StreamingState): void {
  if (!diffBlock.patches || !Array.isArray(diffBlock.patches)) return;

  for (const patch of diffBlock.patches) {
    if (patch.op === "replace" && patch.path === "/answer") {
      state.answerText = patch.value || "";
    }
  }
}

function handleStructuredAnswer(structuredBlock: any, state: StreamingState): void {
  // Handle diff_block patches
  if (structuredBlock.diff_block && structuredBlock.diff_block.patches) {
    for (const patch of structuredBlock.diff_block.patches) {
      if (patch.op === "add" && patch.path && patch.path.includes("/rows/") && patch.value && patch.value.web_result) {
        const result = patch.value.web_result;
        const existing = state.sources.find((s) => s.url === result.url);
        
        if (!existing) {
          state.sources.push({
            url: result.url || "",
            title: result.name || result.title || "Untitled",
            status: mapStatus(patch.value.status || "CRAWLING"),
          });
        }
      }
      
      // Update source status
      if (patch.op === "replace" && patch.path && patch.path.includes("/rows/") && patch.path.endsWith("/status")) {
        const match = patch.path.match(/\/rows\/(\d+)\/status/);
        if (match) {
          const index = parseInt(match[1]);
          if (state.sources[index]) {
            state.sources[index].status = mapStatus(patch.value);
          }
        }
      }
    }
  }

  // Handle web_results array
  if (structuredBlock.web_results && Array.isArray(structuredBlock.web_results)) {
    handleWebResults(structuredBlock.web_results, state);
  }
}

function handleWebResults(webResults: any[], state: StreamingState): void {
  for (const result of webResults) {
    const existing = state.sources.find((s) => s.url === result.url);
    if (!existing) {
      state.sources.push({
        url: result.url || "",
        title: result.name || result.title || "Untitled",
        status: "success",
      });
    }
  }
}

function mapStatus(status: string): "crawling" | "success" | "error" {
  const s = status.toUpperCase();
  if (s === "CRAWLING") return "crawling";
  if (s === "SELECTED" || s === "REVIEWED" || s === "REVIEWING") return "success";
  if (s === "ERROR" || s === "FAILED") return "error";
  return "crawling";
}


/**
 * Create initial streaming state
 */
export function createInitialStreamingState(): StreamingState {
  return {
    planSteps: [],
    activeStepIndex: 0,
    sources: [],
    answerText: "",
    done: false,
  };
}

/**
 * Make a streaming request to the API
 */
export async function makeStreamingRequest(
  question: string
): Promise<Response> {
  // POST to the external mock Perplexity-style streaming API so
  // the UI receives the same SSE-format response for every question.
  const MOCK_ENDPOINT =
    "https://mock-askperplexity.piyushhhxyz.deno.net";

  const response = await fetch(MOCK_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "text/event-stream",
    },
    body: JSON.stringify({ question }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response;
}
