import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI("AIzaSyAZO4_3wZmyHu5EDPcCbr5Z0JuaVexafRQ");

export async function POST(req: NextRequest) {
  try {
    const { userName } = await req.json();
    console.log("[Hero Message API] Gerando mensagem para:", userName);

    const now = new Date();
    const hour = now.getHours();
    const dayOfWeek = now.toLocaleDateString("pt-BR", { weekday: "long" });
    const date = now.toLocaleDateString("pt-BR");
    const day = now.getDay();

    let greeting = "";
    if (hour >= 5 && hour < 12) {
      greeting = "Bom dia";
    } else if (hour >= 12 && hour < 18) {
      greeting = "Boa tarde";
    } else {
      greeting = "Boa noite";
    }

    // Detectar contextos especiais
    let context = "";
    if (day === 5) {
      // Sexta-feira
      context = "É sexta-feira! Sextou!";
    } else if (day === 0) {
      // Domingo
      context = "Domingo de descanso!";
    } else if (day === 6) {
      // Sábado
      context = "Final de semana!";
    } else if (hour >= 0 && hour < 6) {
      // Madrugada
      context = "O que faz acordado a essa hora?";
    }

    const prompt = `Gere uma saudação MUITO CURTA e DIRETA para ${userName}.

Contexto:
- Horário: ${greeting}
- Contexto especial: ${context || "Dia normal"}

REGRAS IMPORTANTES:
- Máximo de 50 caracteres
- Formato: "${greeting}, ${userName}! [contexto curto]"
- Seja DIRETO e OBJETIVO
- Não use emojis
- Sem explicações

Exemplos:
- "Boa noite, ${userName}! Que faz acordado?"
- "Bom dia, ${userName}! Sextou!"
- "Boa tarde, ${userName}! Domingo é dia de ajudar!"

Gere APENAS a frase curta:`;

    const model = genAI.getGenerativeModel({
      model: "gemini-robotics-er-1.5-preview",
    });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const message = response.text().trim();

    console.log("[Hero Message API] Mensagem gerada:", message);
    return NextResponse.json({ message });
  } catch (error: any) {
    console.error("Erro ao gerar mensagem:", error);
    console.error("Stack trace:", error.stack);
    console.error("Message:", error.message);
    return NextResponse.json(
      { error: "Erro ao gerar mensagem", details: error.message },
      { status: 500 },
    );
  }
}
