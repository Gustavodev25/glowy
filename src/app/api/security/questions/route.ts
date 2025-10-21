import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authMiddleware } from "@/middleware/auth";
import { hashPassword } from "@/lib/auth";

// GET - Listar perguntas de segurança (sem respostas)
export async function GET(req: NextRequest) {
  try {
    const auth = await authMiddleware(req);
    if (!auth.authenticated) {
      return auth.response!;
    }

    const questions = await prisma.securityQuestion.findMany({
      where: { userId: auth.user.id },
      select: {
        id: true,
        question: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ questions });
  } catch (error) {
    console.error("Erro ao buscar perguntas:", error);
    return NextResponse.json(
      { error: "Erro ao buscar perguntas" },
      { status: 500 }
    );
  }
}

// POST - Adicionar pergunta de segurança
export async function POST(req: NextRequest) {
  try {
    const auth = await authMiddleware(req);
    if (!auth.authenticated) {
      return auth.response!;
    }

    const { question, answer } = await req.json();

    if (!question || !answer) {
      return NextResponse.json(
        { error: "Pergunta e resposta são obrigatórias" },
        { status: 400 }
      );
    }

    // Verificar limite de 3 perguntas
    const count = await prisma.securityQuestion.count({
      where: { userId: auth.user.id },
    });

    if (count >= 3) {
      return NextResponse.json(
        { error: "Você já possui o máximo de 3 perguntas de segurança" },
        { status: 400 }
      );
    }

    // Hash da resposta
    const hashedAnswer = await hashPassword(answer.toLowerCase().trim());

    await prisma.securityQuestion.create({
      data: {
        userId: auth.user.id,
        question,
        answer: hashedAnswer,
      },
    });

    // Registrar log de atividade
    await prisma.activityLog.create({
      data: {
        userId: auth.user.id,
        action: "security_question_added",
        description: "Pergunta de segurança adicionada",
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao adicionar pergunta:", error);
    return NextResponse.json(
      { error: "Erro ao adicionar pergunta" },
      { status: 500 }
    );
  }
}

// DELETE - Remover pergunta de segurança
export async function DELETE(req: NextRequest) {
  try {
    const auth = await authMiddleware(req);
    if (!auth.authenticated) {
      return auth.response!;
    }

    const { questionId } = await req.json();

    await prisma.securityQuestion.delete({
      where: {
        id: questionId,
        userId: auth.user.id, // Garantir que só deleta suas próprias perguntas
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao remover pergunta:", error);
    return NextResponse.json(
      { error: "Erro ao remover pergunta" },
      { status: 500 }
    );
  }
}
