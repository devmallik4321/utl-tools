import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    {
      status: "ok",
      relay: "active",
    },
    { status: 200 }
  );
}

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    if (!rawBody || !rawBody.trim()) {
      return NextResponse.json(
        { error: "Invalid payload" },
        { status: 400 }
      );
    }

    let parsedBody: any;
    try {
      parsedBody = JSON.parse(rawBody);
    } catch {
      return NextResponse.json(
        { error: "Malformed JSON" },
        { status: 400 }
      );
    }

    // Strict validation: must be an object with ONLY "message" === "CHATGPT_TEST"
    if (
      typeof parsedBody !== "object" ||
      parsedBody === null ||
      Array.isArray(parsedBody) ||
      Object.keys(parsedBody).length !== 1 ||
      parsedBody.message !== "CHATGPT_TEST"
    ) {
      return NextResponse.json(
        { error: "Invalid payload" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        received: true,
        message: "CHATGPT_TEST",
      },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { error: "Invalid payload" },
      { status: 400 }
    );
  }
}

export async function PUT() {
  return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 });
}

export async function DELETE() {
  return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 });
}

export async function PATCH() {
  return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 });
}
