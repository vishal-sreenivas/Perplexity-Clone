# Streaming API Implementation

## Overview

The application now correctly parses the **real Perplexity API streaming format** from:
```
POST https://mock-askperplexity.piyushhhxyz.deno.net
```

## API Response Format

The API returns Server-Sent Events (SSE) with complex JSON structures. Each event contains:

```
event: message
data: { ...complex JSON with blocks, patches, etc... }
```

### Key Components

#### 1. **Goals/Plan Extraction**
Located in `blocks` array with `plan_block` or `diff_block` patches:
```json
{
  "blocks": [{
    "plan_block": {
      "goals": [{
        "description": "Listing top 10 singers...",
        "status": "IN_PROGRESS"
      }],
      "progress": "IN_PROGRESS"
    }
  }]
}
```

Or via diff patches:
```json
{
  "diff_block": {
    "field": "plan_block",
    "patches": [{
      "op": "replace",
      "path": "/goals/0/description",
      "value": "Listing top 10 singers and presenting results in a table"
    }]
  }
}
```

#### 2. **Sources Extraction**
From `structured_answer_block` with web results and status tracking:
```json
{
  "structured_answer_block": {
    "diff_block": {
      "patches": [{
        "op": "add",
        "path": "/rows/0",
        "value": {
          "web_result": {
            "name": "Top 10 Most Popular Artists - RouteNote",
            "url": "https://routenote.com/blog/top-10-most-popular-artists/",
            "snippet": "Who's the most popular music artist..."
          },
          "status": "SELECTED",
          "citation": 1
        }
      }]
    }
  }
}
```

Status values: `CRAWLING` → `REVIEWING` → `SELECTED`

#### 3. **Answer Extraction**
Built incrementally from markdown diff patches:
```json
{
  "blocks": [{
    "intended_usage": "ask_text",
    "diff_block": {
      "field": "markdown_block",
      "patches": [{
        "op": "replace",
        "path": "/answer",
        "value": "Here is a table of the top 10 singers in 2025..."
      }]
    }
  }]
}
```

#### 4. **Completion Detection**
Stream ends when:
```json
{
  "final_sse_message": true,
  "status": "COMPLETED"
}
```

Or:
```
event: end_of_stream
data: {}
```

## Implementation Details

### Streaming Parser (`lib/stream.ts`)

The parser processes SSE lines and extracts data through helper functions:

1. **`parseStreamChunk(line, state)`** - Main parsing logic
   - Filters `data:` prefixed lines
   - Parses JSON and routes to specific handlers
   - Detects completion signals

2. **`handleGoals(planBlock, state)`** - Extracts plan steps
   - Maps `IN_PROGRESS` → `active`, `DONE` → `complete`
   - Updates step descriptions and status

3. **`handlePlanDiffBlock(diffBlock, state)`** - Handles plan patches
   - Applies incremental updates to goal descriptions
   - Tracks active step index

4. **`handleAnswerDiffBlock(diffBlock, state)`** - Extracts answer text
   - Replaces entire answer with latest version
   - Markdown includes citations like `[1][2][3]`

5. **`handleStructuredAnswer(block, state)`** - Processes sources
   - Adds new sources from row patches
   - Updates source status (crawling/success/error)

6. **`handleWebResults(results, state)`** - Final source list
   - Ensures all cited sources are included
   - Deduplicates by URL

### Status Mapping

| API Status | UI Status |
|------------|-----------|
| `CRAWLING` | `crawling` |
| `REVIEWING` | `success` |
| `SELECTED` | `success` |
| `ERROR`/`FAILED` | `error` |

## UI Components

### Plan Component (`components/chat/plan.tsx`)
- Displays goals with status icons:
  - ⭕ Pending (gray)
  - 🔄 Active (blue spinner)
  - ✅ Complete (green checkmark)

### Sources Component (`components/chat/sources.tsx`)
- Shows web sources as clickable cards
- Real-time status badges:
  - 🔄 Crawling (blue spinner)
  - 🔍 Reviewing (yellow search icon)
  - ✅ Selected (green checkmark)
- Numbered citations when available

### Answer Component (`components/chat/answer.tsx`)
- Renders markdown with `react-markdown`
- Clickable links and citation superscripts
- Preserves tables and formatting

## Testing the Implementation

1. **Start the dev server:**
   ```bash
   npm run dev
   ```

2. **Navigate to chat:**
   - Go to http://localhost:3000
   - Click "Start Searching" or type a question

3. **Ask any question:**
   ```
   "list of top 10 singers, give table"
   ```

4. **Observe streaming:**
   - Plan steps appear first
   - Sources load with status updates
   - Answer builds incrementally
   - Citations appear at the end

## Sample Response

The API returns a pre-recorded response about top 10 singers with:
- 1 goal: "Listing top 10 singers and presenting results in a table format"
- 5 sources from RouteNote, ALive Experiences, Kworb, Billboard, etc.
- Complete markdown table with 10 singers
- Citations `[1][2][3][4][5]` linking to sources

## Key Differences from Mock Format

The real API does **not** use simple event types like `{"type": "plan"}`. Instead:

❌ **Old mock format (simple):**
```json
{"type": "plan", "data": {"step": "Searching..."}}
{"type": "source", "data": {"url": "...", "status": "crawling"}}
{"type": "answer", "data": {"delta": "Here is..."}}
```

✅ **Real Perplexity format (complex):**
```json
{
  "blocks": [{
    "plan_block": {...},
    "diff_block": {
      "patches": [...]
    }
  }],
  "structured_answer_block": {...},
  "web_results": [...],
  "status": "PENDING",
  "final_sse_message": false
}
```

The new implementation handles this complexity and correctly extracts all UI components.

## Future Enhancements

- [ ] Add retry logic for failed sources
- [ ] Cache responses for repeated questions
- [ ] Support image results from `media_block`
- [ ] Display related queries from `related_query_items`
- [ ] Show search progress percentage
- [ ] Enable source filtering/sorting

## References

- [Gist with full API response](https://gist.github.com/piyushhhxyz/6094e802d7cdb7efd60b1264220f7ead)
- [Raw streaming response](https://gist.githubusercontent.com/piyushhhxyz/6094e802d7cdb7efd60b1264220f7ead/raw/67f527fdfc3598168f90558c8f618a625bbdee9d/streaming%2520response)
