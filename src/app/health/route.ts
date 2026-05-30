export async function GET() {
  return new Response(JSON.stringify({
    status: "ok",
    service: "vox-dashboard",
    version: "12.0",
    timestamp: new Date().toISOString(),
  }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
