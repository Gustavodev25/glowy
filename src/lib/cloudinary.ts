/**
 * Funções CLIENT-SIDE para upload de imagens via API
 * Para funções SERVER-SIDE, use cloudinary-server.ts
 */

/**
 * Faz upload de um arquivo para o Cloudinary via API route
 * @param file - Arquivo de imagem
 * @param folder - Pasta onde salvar (ex: 'empresas/servicos')
 * @param type - Tipo da imagem ('service', 'logo', 'banner')
 * @returns URL da imagem
 */
export async function uploadToCloudinary(file: File, folder: string = 'empresas/servicos', type: 'service' | 'logo' | 'banner' = 'service'): Promise<string> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);
    formData.append('type', type);

    const response = await fetch('/api/upload/image', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Falha no upload');
    }

    const result = await response.json();
    return result.url;
  } catch (error) {
    console.error('Erro ao fazer upload para Cloudinary:', error);
    throw new Error('Falha ao fazer upload da imagem');
  }
}
