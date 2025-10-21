import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authMiddleware } from "@/middleware/auth";
import { hashPassword, verifyPassword } from "@/lib/auth";

// POST - Redefinir senha usando perguntas de segurança
export async function POST(req: NextRequest) {
  try {
    const auth = await authMiddleware(req);
    if (!auth.authenticated) {
      return auth.response!;
    }

    const { answers, newPassword } = await req.json();

    if (!answers || !Array.isArray(answers) || answers.length === 0) {
      return NextResponse.json(
        { error: "Respostas das perguntas são obrigatórias" },
        { status: 400 }
      );
    }

    if (!newPassword || newPassword.length < 8) {
      return NextResponse.json(
        { error: "Nova senha deve ter no mínimo 8 caracteres" },
        { status: 400 }
      );
    }

    // Buscar as perguntas do usuário
    const questions = await prisma.securityQuestion.findMany({
      where: { userId: auth.user.id },
      select: { id: true, answer: true },
    });

    if (questions.length === 0) {
      return NextResponse.json(
        { error: "Você não possui perguntas de segurança configuradas" },
        { status: 400 }
      );
    }

    // Verificar se pelo menos uma resposta está correta
    let validAnswers = 0;
    for (const answer of answers) {
      const question = questions.find(q => q.id === answer.questionId);
      if (question) {
        const isValid = await verifyPassword(
          answer.answer.toLowerCase().trim(),
          question.answer
        );
        if (isValid) {
          validAnswers++;
        }
      }
    }

    // Exigir pelo menos 1 resposta correta (ou todas, se preferir)
    const requiredCorrectAnswers = Math.min(questions.length, answers.length);
    if (validAnswers < requiredCorrectAnswers) {
      return NextResponse.json(
        { error: "Respostas incorretas. Tente novamente." },
        { status: 400 }
      );
    }

    // Atualizar senha
    const hashedPassword = await hashPassword(newPassword);
    await prisma.user.update({
      where: { id: auth.user.id },
      data: {
        senha: hashedPassword,
        lastPasswordChange: new Date(),
      },
    });

    // Registrar log de atividade
    await prisma.activityLog.create({
      data: {
        userId: auth.user.id,
        action: "password_reset_with_questions",
        description: "Senha redefinida usando perguntas de segurança",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Senha redefinida com sucesso!",
    });
  } catch (error) {
    console.error("Erro ao redefinir senha:", error);
    return NextResponse.json(
      { error: "Erro ao redefinir senha" },
      { status: 500 }
    );
  }
}
