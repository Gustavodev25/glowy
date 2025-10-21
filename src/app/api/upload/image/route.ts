import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Configuração do Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = formData.get('folder') as string || 'empresas/servicos';
    const imageType = formData.get('type') as string || 'service'; // 'service', 'logo', 'banner'

    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo fornecido' }, { status: 400 });
    }

    // Converter File para buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Configurações de transformação baseadas no tipo
    let transformation;
    switch (imageType) {
      case 'banner':
        // Banner: 1200x300 (4:1 ratio) com qualidade alta
        transformation = [
          { width: 1200, height: 300, crop: 'fill' },
          { quality: 'auto:best' },
          { fetch_format: 'auto' }
        ];
        break;
      case 'logo':
        // Logo: 400x400 quadrado
        transformation = [
          { width: 400, height: 400, crop: 'fill' },
          { quality: 'auto' },
          { fetch_format: 'auto' }
        ];
        break;
      case 'service':
      default:
        // Serviço: 400x400 quadrado
        transformation = [
          { width: 400, height: 400, crop: 'fill' },
          { quality: 'auto' },
          { fetch_format: 'auto' }
        ];
        break;
    }

    // Upload para Cloudinary
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: folder,
          transformation: transformation
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(buffer);
    });

    return NextResponse.json({
      url: (result as any).secure_url,
      publicId: (result as any).public_id
    });

  } catch (error) {
    console.error('Erro no upload:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
