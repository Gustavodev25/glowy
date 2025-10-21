import { v2 as cloudinary } from 'cloudinary';

// Configuração do Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Faz upload de uma imagem para o Cloudinary (SERVER-SIDE ONLY)
 * @param base64Image - Imagem em base64
 * @param folder - Pasta onde salvar (ex: 'empresas/logos')
 * @returns Objeto com URL e public_id da imagem
 */
export async function uploadImage(base64Image: string, folder: string = 'empresas/logos') {
  try {
    const result = await cloudinary.uploader.upload(base64Image, {
      folder: folder,
      transformation: [
        { width: 400, height: 400, crop: 'fill' },
        { quality: 'auto' },
        { fetch_format: 'auto' }
      ]
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
    };
  } catch (error) {
    console.error('Erro ao fazer upload para Cloudinary:', error);
    throw new Error('Falha ao fazer upload da imagem');
  }
}

/**
 * Deleta uma imagem do Cloudinary (SERVER-SIDE ONLY)
 * @param publicId - ID público da imagem no Cloudinary
 */
export async function deleteImage(publicId: string) {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Erro ao deletar imagem do Cloudinary:', error);
    throw new Error('Falha ao deletar imagem');
  }
}
