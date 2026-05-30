export async function GET() {
  return Response.json({
    status: "ok",
    service: "vox-dashboard",
    version: "12.0",
    timestamp: new Date().toISOString(),
  });
}
