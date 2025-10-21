"use client";

import { useState } from "react";
import { Upload, Download, Trash2, Eye } from "lucide-react";
import CardIcon from "@/components/visual/CardIcon";
import Button from "@/components/visual/Button";
import Modal from "@/components/Modal";
import Tooltip from "@/components/visual/Tooltip";
import FooterConfirmation from "@/components/FooterConfirmation";
import { useToast } from "@/contexts/ToastContext";
import UploadDocumentoDrawer from "./UploadDocumentoDrawer";

interface Documento {
  id: string;
  tipo: string;
  nome: string;
  descricao?: string;
  url: string;
  tamanho: number;
  mimeType: string;
  createdAt: string;
}

interface DocumentosTabProps {
  clienteId: string;
  documentos: Documento[];
  onUpdate: () => void;
}

export default function DocumentosTab({
  clienteId,
  documentos,
  onUpdate,
}: DocumentosTabProps) {
  const toast = useToast();
  const [showUploadDrawer, setShowUploadDrawer] = useState(false);
  const [viewDocument, setViewDocument] = useState<Documento | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<Documento | null>(
    null,
  );
  const [isDeleting, setIsDeleting] = useState(false);

  const openDeleteModal = (documento: Documento) => {
    setDocumentToDelete(documento);
    setDeleteModalOpen(true);
  };

  const cancelDelete = () => {
    setDeleteModalOpen(false);
    setDocumentToDelete(null);
  };

  const confirmDelete = async () => {
    if (!documentToDelete) return;

    try {
      setIsDeleting(true);
      const response = await fetch(`/api/documentos/${documentToDelete.id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (response.ok) {
        toast.success("Sucesso", "Documento excluído");
        setDeleteModalOpen(false);
        setDocumentToDelete(null);
        onUpdate();
      } else {
        toast.error("Erro", "Não foi possível excluir o documento");
      }
    } catch (error) {
      console.error("Erro ao excluir:", error);
      toast.error("Erro", "Não foi possível excluir o documento");
    } finally {
      setIsDeleting(false);
    }
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith("image/")) {
      return "camera";
    }
    if (mimeType === "application/pdf") {
      return "file-description";
    }
    return "files";
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const getTipoLabel = (tipo: string) => {
    const labels: Record<string, string> = {
      foto: "Foto",
      exame: "Exame",
      receita: "Receita",
      contrato: "Contrato",
      laudo: "Laudo",
      documento: "Documento",
    };
    return labels[tipo] || tipo;
  };

  return (
    <div>
      {/* Header com botão de upload */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          Documentos e Anexos
        </h2>
        <Button
          variant="primary"
          onClick={() => setShowUploadDrawer(true)}
          className="flex items-center gap-2"
        >
          <Upload className="w-4 h-4" />
          Enviar Documento
        </Button>
      </div>

      {/* Lista de Documentos */}
      {documentos.length === 0 ? (
        <div className="relative max-w-lg mx-auto">
          {/* Borda de trás estática */}
          <div className="absolute inset-0 translate-x-2 translate-y-2 bg-white border border-gray-300 rounded-lg" />

          {/* Card principal */}
          <div className="relative bg-white border border-gray-300 rounded-lg shadow-[3px_3px_0px_#e5e7eb] p-8 sm:p-12 text-center">
            <div className="flex justify-center mb-4 sm:mb-6">
              <CardIcon size="xl" icon="files" color="#C5837B" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
              Nenhum documento enviado
            </h3>
            <p className="text-gray-500 mb-6 text-sm sm:text-base">
              Comece enviando fotos, exames ou outros documentos
            </p>
            <Button variant="primary" onClick={() => setShowUploadDrawer(true)}>
              Enviar Primeiro Documento
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {documentos.map((doc) => (
            <div key={doc.id} className="relative">
              {/* Card com efeitos do Modal/Histórico */}
              <div className="relative bg-white border border-gray-300 rounded-lg shadow-[3px_3px_0px_#e5e7eb] overflow-hidden transition-all duration-200 hover:shadow-[5px_5px_0px_#C5837B] hover:border-[#C5837B]">
                {/* Efeito de brilho */}
                <span className="absolute top-0 left-0 -translate-x-1/3 -translate-y-1/3 w-24 h-24 bg-[#C5837B] rounded-full blur-3xl opacity-20 animate-pulse" />
                <span className="absolute bottom-0 right-0 translate-x-1/3 translate-y-1/3 w-24 h-24 bg-[#C5837B] rounded-full blur-3xl opacity-20 animate-pulse" />

                {/* Conteúdo do card */}
                <div className="relative z-10 p-4">
                  <div className="flex items-center gap-4">
                    {/* CardIcon */}
                    <div className="flex-shrink-0">
                      <CardIcon
                        size="lg"
                        icon={getFileIcon(doc.mimeType) as any}
                        color="#C5837B"
                      />
                    </div>

                    {/* Informações do documento */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 text-sm mb-1 truncate">
                        {doc.nome}
                      </h4>

                      <div className="flex flex-wrap gap-2 text-xs text-gray-600 mb-1">
                        <span className="px-2 py-0.5 bg-[#C5837B]/10 text-[#C5837B] rounded-full font-medium">
                          {getTipoLabel(doc.tipo)}
                        </span>
                        <span>{formatFileSize(doc.tamanho)}</span>
                        <span>•</span>
                        <span>
                          {new Date(doc.createdAt).toLocaleDateString("pt-BR")}
                        </span>
                      </div>

                      {doc.descricao && (
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {doc.descricao}
                        </p>
                      )}
                    </div>

                    {/* Ações */}
                    <div className="flex items-center gap-2">
                      <Tooltip content="Visualizar" position="top">
                        <button
                          onClick={() => setViewDocument(doc)}
                          className="p-2 text-gray-600 hover:text-[#C5837B] hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </Tooltip>

                      <Tooltip content="Baixar" position="top">
                        <a
                          href={doc.url}
                          download
                          className="inline-flex p-2 text-gray-600 hover:text-[#C5837B] hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                      </Tooltip>

                      <Tooltip content="Excluir" position="top">
                        <button
                          onClick={() => openDeleteModal(doc)}
                          className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </Tooltip>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Drawer de Upload */}
      <UploadDocumentoDrawer
        isOpen={showUploadDrawer}
        onClose={() => setShowUploadDrawer(false)}
        clienteId={clienteId}
        onSuccess={onUpdate}
      />

      {/* Modal de Visualização */}
      {viewDocument && (
        <Modal
          isOpen={!!viewDocument}
          onClose={() => setViewDocument(null)}
          title={viewDocument.nome}
          variant="center"
          maxWidth="2xl"
        >
          <div className="p-6">
            {viewDocument.mimeType.startsWith("image/") ? (
              <img
                src={viewDocument.url}
                alt={viewDocument.nome}
                className="max-w-full h-auto rounded-lg"
              />
            ) : viewDocument.mimeType === "application/pdf" ? (
              <iframe
                src={viewDocument.url}
                className="w-full h-[600px] rounded-lg"
                title={viewDocument.nome}
              />
            ) : (
              <div className="text-center py-12">
                <File className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">
                  Pré-visualização não disponível para este tipo de arquivo
                </p>
                <Button
                  variant="primary"
                  onClick={() => window.open(viewDocument.url, "_blank")}
                >
                  Abrir em Nova Aba
                </Button>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Modal de Confirmação de Exclusão */}
      <FooterConfirmation
        isOpen={deleteModalOpen}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        title="Permite esta ação?"
        subtitle="Após aceitar a ação será executada."
        message={`Você quer mesmo excluir o documento "${documentToDelete?.nome}"? Esta ação não pode ser desfeita.`}
        confirmText="Aceitar"
        cancelText="Cancelar"
        isLoading={isDeleting}
      />
    </div>
  );
}
