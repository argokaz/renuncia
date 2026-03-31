import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { SYSTEM_PROMPT, buildRoastPrompt } from "@/lib/prompts";
import { generateJobId } from "@/lib/utils";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { linkedin_url, profile_text } = await req.json();

    if (!linkedin_url) {
      return NextResponse.json(
        { error: "linkedin_url es requerido" },
        { status: 400 }
      );
    }

    const prompt = buildRoastPrompt(linkedin_url, profile_text);

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const content = message.content[0];
    if (content.type !== "text") {
      throw new Error("Respuesta inesperada de Claude");
    }

    // Parse the JSON response
    let parsed;
    try {
      // Strip markdown code blocks if present
      const text = content.text
        .replace(/```json\s*/g, "")
        .replace(/```\s*/g, "")
        .trim();
      parsed = JSON.parse(text);
    } catch {
      // Try to extract JSON from the response
      const jsonMatch = content.text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No se pudo parsear la respuesta de Claude");
      }
      parsed = JSON.parse(jsonMatch[0]);
    }

    const jobId = generateJobId();
    const result = {
      ...parsed,
      linkedin_url,
      job_id: jobId,
      generated_at: new Date().toISOString(),
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error en /api/roast:", error);

    if (error instanceof Error && error.message.includes("API key")) {
      return NextResponse.json(
        { error: "Error de configuración: API key no válida" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        error: "Error interno del sistema. Irónicamente, esto también podría ser automatizado.",
      },
      { status: 500 }
    );
  }
}
