// app/api/perfil/atualizar/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authMiddleware } from "@/middleware/auth";
import { uploadImage, deleteImage } from "@/lib/cloudinary-server";

export async function PUT(request: NextRequest) {
  try {
    const auth = await authMiddleware(request);

    if (!auth.authenticated) {
      return auth.response!;
    }

    const body = await request.json();
    const { nome, telefone, avatarBase64 } = body;

    // Validações básicas
    if (!nome || nome.trim() === "") {
      return NextResponse.json(
        { error: "Nome é obrigatório" },
        { status: 400 }
      );
    }

    const updateData: any = {
      nome: nome.trim(),
      telefone: telefone || null,
    };

    // Se houver avatar, fazer upload para Cloudinary
    if (avatarBase64) {
      try {
        // Buscar avatar antigo para deletar
        const user = await prisma.user.findUnique({
          where: { id: auth.user.id },
          select: { avatarPublicId: true },
        });

        // Deletar avatar antigo se existir
        if (user?.avatarPublicId) {
          await deleteImage(user.avatarPublicId);
        }

        // Upload novo avatar
        const uploadResult = await uploadImage(avatarBase64, "avatars");
        updateData.avatarUrl = uploadResult.url;
        updateData.avatarPublicId = uploadResult.publicId;
      } catch (error) {
        console.error("Erro ao fazer upload do avatar:", error);
        return NextResponse.json(
          { error: "Erro ao fazer upload da imagem" },
          { status: 500 }
        );
      }
    }

    // Atualizar usuário
    const updatedUser = await prisma.user.update({
      where: { id: auth.user.id },
      data: updateData,
      select: {
        id: true,
        nome: true,
        email: true,
        telefone: true,
        avatarUrl: true,
        tipoUsuario: true,
      },
    });

    return NextResponse.json({
      message: "Perfil atualizado com sucesso",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Erro ao atualizar perfil:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
