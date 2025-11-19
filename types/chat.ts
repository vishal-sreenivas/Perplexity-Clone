export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  streamingState?: StreamingState;
  timestamp: number;
}

export interface StreamingState {
  planSteps: PlanStep[];
  activeStepIndex: number;
  sources: Source[];
  answerText: string;
  done: boolean;
}

export interface PlanStep {
  step: string;
  status: "pending" | "active" | "complete";
}

export interface Source {
  url: string;
  title?: string;
  status: "crawling" | "success" | "error";
  favicon?: string;
}

export interface Citation {
  number: number;
  url: string;
  title?: string;
}

export interface StreamEvent {
  type: "plan" | "source" | "answer" | "citation" | "done";
  data: any;
}

export interface ApiRequest {
  question: string;
}
