// OpenAI integration removed.
// This endpoint intentionally returns a 410 response to avoid confusion.
export async function POST() {
  return new Response(JSON.stringify({ error: 'OpenAI integration removed' }), {
    status: 410,
    headers: { 'Content-Type': 'application/json' },
  });
}
