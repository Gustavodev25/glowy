"use client";

import { useState } from "react";
import { FileText, Image as ImageIcon, File, X } from "lucide-react";
import Drawer from "@/components/visual/Drawer";
import Select from "@/components/visual/Select";
import TextArea from "@/components/visual/TextArea";
import Button from "@/components/visual/Button";
import CardIcon from "@/components/visual/CardIcon";
import { useToast } from "@/contexts/ToastContext";

interface UploadDocumentoDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  clienteId: string;
  onSuccess: () => void;
}

export default function UploadDocumentoDrawer({
  isOpen,
  onClose,
  clienteId,
  onSuccess,
}: UploadDocumentoDrawerProps) {
  const toast = useToast();
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [tipo, setTipo] = useState("foto");
  const [descricao, setDescricao] = useState("");

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith("image/")) {
      return <CardIcon size="lg" icon="camera" color="#C5837B" />;
    }
    if (file.type === "application/pdf") {
      return <CardIcon size="lg" icon="file-description" color="#C5837B" />;
    }
    return <CardIcon size="lg" icon="files" color="#C5837B" />;
  };

  const removeFile = () => {
    setSelectedFile(null);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("Erro", "Selecione um arquivo");
      return;
    }

    try {
      setUploading(true);

      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("tipo", tipo);
      formData.append("descricao", descricao);
      formData.append("clienteId", clienteId);

      const response = await fetch("/api/documentos/upload", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (response.ok) {
        toast.success("Sucesso", "Documento enviado com sucesso");
        setSelectedFile(null);
        setDescricao("");
        setTipo("foto");
        onSuccess();
        onClose();
      } else {
        const error = await response.json();
        toast.error("Erro", error.error || "Erro ao enviar documento");
      }
    } catch (error) {
      console.error("Erro ao fazer upload:", error);
      toast.error("Erro", "Não foi possível enviar o documento");
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    if (!uploading) {
      setSelectedFile(null);
      setDescricao("");
      setTipo("foto");
      onClose();
    }
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={handleClose}
      title="Enviar Documento"
      width="lg"
      position="right"
      dismissible={!uploading}
      footer={
        <div className="flex gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={handleClose}
            disabled={uploading}
            fullWidth
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={!selectedFile || uploading}
            isLoading={uploading}
            fullWidth
            onClick={handleUpload}
          >
            {uploading ? "Enviando..." : "Enviar"}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <Select
          label="Tipo de Documento"
          value={tipo}
          onChange={(value) => setTipo(value)}
          options={[
            { value: "foto", label: "Foto" },
            { value: "exame", label: "Exame" },
            { value: "receita", label: "Receita" },
            { value: "contrato", label: "Contrato" },
            { value: "laudo", label: "Laudo" },
            { value: "documento", label: "Documento" },
          ]}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Arquivo
          </label>

          {!selectedFile ? (
            <div className="relative">
              <input
                type="file"
                id="file-upload"
                onChange={handleFileSelect}
                accept="image/*,.pdf,.doc,.docx"
                className="hidden"
              />
              <label
                htmlFor="file-upload"
                className="relative flex flex-col items-center justify-center w-full h-40
                  bg-white border-2 border-dashed border-gray-300 rounded-2xl
                  shadow-[3px_3px_0px_#e5e7eb]
                  hover:border-[#C5837B] hover:shadow-[5px_5px_0px_#C5837B]
                  transition-all duration-200 ease-in-out cursor-pointer
                  active:translate-x-[3px] active:translate-y-[3px] active:shadow-none"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <div className="mb-4">
                    <CardIcon size="lg" icon="files" color="#C5837B" />
                  </div>
                  <p className="mb-2 text-sm font-semibold text-gray-700">
                    Clique para selecionar um arquivo
                  </p>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, PDF, DOC ou DOCX (máx. 10MB)
                  </p>
                </div>
              </label>
            </div>
          ) : (
            <div className="relative bg-white border border-gray-300 rounded-2xl p-4 shadow-[3px_3px_0px_#e5e7eb]">
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0">{getFileIcon(selectedFile)}</div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatFileSize(selectedFile.size)}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={removeFile}
                  className="flex-shrink-0 w-8 h-8 rounded-lg bg-gray-100 hover:bg-red-100
                    flex items-center justify-center text-gray-600 hover:text-red-600
                    transition-colors duration-200"
                  title="Remover arquivo"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        <TextArea
          label="Descrição (opcional)"
          placeholder="Ex: Resultado do exame de sangue realizado em 15/01/2025"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          rows={4}
          maxLength={500}
          helpText="Adicione detalhes relevantes sobre o documento"
        />
      </div>
    </Drawer>
  );
}
