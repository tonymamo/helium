import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.FASTAPI_URL;

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ projectId: string; locale: string }> },
) {
  const { projectId, locale } = await context.params;

  try {
    const response = await fetch(
      `${API_URL}/localizations/${projectId}/${locale}`,
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("FastAPI Error:", {
        status: response.status,
        statusText: response.statusText,
        error: errorData,
      });
      return NextResponse.json(
        { detail: `FastAPI Error: ${errorData.detail || response.statusText}` },
        { status: response.status },
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Fetch Error:", error);
    return NextResponse.json(
      { detail: "Failed to fetch localizations" },
      { status: 500 },
    );
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ projectId: string; locale: string }> },
) {
  const { projectId, locale } = await context.params;
  const body = await request.json();

  try {
    const response = await fetch(
      `${API_URL}/localizations/${projectId}/${locale}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("[API] Error updating localizations:", {
        status: response.status,
        statusText: response.statusText,
        data,
      });
      return NextResponse.json(
        { detail: data.detail || "Failed to update localizations" },
        { status: response.status },
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("[API] Exception updating localizations:", error);
    return NextResponse.json(
      {
        detail:
          error instanceof Error
            ? error.message
            : "Failed to update localizations",
      },
      { status: 500 },
    );
  }
}
