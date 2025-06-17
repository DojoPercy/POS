export async function POST(req: NextRequest) {
  return NextResponse.json(
    { error: "This endpoint is temporarily disabled." },
    { status: 503 }
  );
}
