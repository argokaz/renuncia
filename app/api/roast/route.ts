import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { SYSTEM_PROMPT, buildRoastPrompt } from "@/lib/prompts";
import { generateJobId, encodeResult, getScoreEmoji } from "@/lib/utils";
import { addRecentScan } from "@/lib/recentStore";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
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

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      max_tokens: 2048,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
    });

    const text = completion.choices[0].message.content ?? "";

    // Parse the JSON response
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No se pudo parsear la respuesta de GPT-4o");
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

    // Save to recent scans (best-effort, non-blocking)
    try {
      addRecentScan({
        name: result.name ?? "Desconocido",
        job_title: result.job_title ?? "",
        company: result.company ?? "",
        score: result.score ?? 0,
        emoji: result.identity_md?.emoji ?? getScoreEmoji(result.score ?? 0),
        job_id: jobId,
        generated_at: result.generated_at,
        encoded: encodeResult(result),
      });
    } catch { /* never block the response */ }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error en /api/roast:", error);

    if (error instanceof Error && error.message.includes("API key")) {
      return NextResponse.json(
        { error: "Error de configuración: OPENAI_API_KEY no válida" },
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
