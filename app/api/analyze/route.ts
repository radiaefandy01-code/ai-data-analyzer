import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const context = body?.context;

    if (!context) {
      return NextResponse.json(
        {
          error: "Analysis context tidak ditemukan.",
        },
        { status: 400 }
      );
    }

    const prompt = `
Anda adalah seorang AI Data Analyst.

Analisis data berikut berdasarkan statistical analysis dan data insights yang diberikan.

Tujuan:
1. Jelaskan kondisi utama dataset.
2. Identifikasi pola atau temuan penting.
3. Jelaskan masalah data jika ada.
4. Berikan rekomendasi yang relevan.
5. Jangan membuat angka atau fakta yang tidak terdapat dalam data.

Gunakan bahasa Indonesia yang mudah dipahami.

Berikan jawaban dengan struktur:

RINGKASAN
- ...

TEMUAN UTAMA
- ...

MASALAH DATA
- ...

REKOMENDASI
- ...

DATA ANALYSIS CONTEXT:
${JSON.stringify(context, null, 2)}
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
    });

    return NextResponse.json({
      success: true,
      analysis: response.text,
    });
  } catch (error) {
    console.error("Gemini Analysis Error:", error);

    return NextResponse.json(
      {
        error: "Gagal melakukan analisis AI.",
      },
      { status: 500 }
    );
  }
}