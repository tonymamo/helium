import { NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function GET(
  request: Request,
  context: { params: Promise<{ projectId: string; locale: string }> },
) {
  try {
    const { projectId } = await context.params;

    if (!projectId) {
      return NextResponse.json(
        { error: "Project ID is required" },
        { status: 400 },
      );
    }

    const response = await fetch(
      `${API_URL}/translation-validation/${projectId}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Translation validation error:", error);
    return NextResponse.json(
      { error: "Failed to validate translations" },
      { status: 500 },
    );
  }
}
