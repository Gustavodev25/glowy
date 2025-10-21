"use client";

import { useState, useRef, useEffect } from "react";
import { gsap } from "gsap";
import { useToast } from "@/contexts/ToastContext";
import Stepper from "./Stepper";
import ImageCropper from "./ImageCropper";
import Modal from "@/components/Modal";
import BookLoader from "@/components/BookLoader";
import { Input, TextArea } from "@/components/ui";

interface ConfiguracaoEmpresaProps {
  onCompletar: () => void;
  onVoltar: () => void;
}

const STEPS2 = ["Documento", "Nome da Empresa", "Contato", "Endereço", "Logo"];

export default function ConfiguracaoEmpresa({
  onCompletar,
  onVoltar,
}: ConfiguracaoEmpresaProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    // Etapa 1: Informações Básicas
    nomeEmpresa: "",
    descricao: "",
    endereco: "",
    telefone: "",
    email: "",
    tipoDocumento: "CNPJ" as "CNPJ" | "CPF",
    documento: "",
    razaoSocial: "",
    nomeFantasia: "",
    // Etapa 2: Logo
    logo: null as File | null,
    // Etapa 3: Serviços
    servicos: [{ nome: "", descricao: "", duracao: 60, preco: 0 }],
  });

  // Estados para validação e endereço
  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: string;
  }>({});
  const [enderecoData, setEnderecoData] = useState({
    cep: "",
    logradouro: "",
    bairro: "",
    cidade: "",
    estado: "",
    numero: "",
    complemento: "",
  });
  const [loadingCep, setLoadingCep] = useState(false);
  const [loadingDocumento, setLoadingDocumento] = useState(false);
  const [cnpjData, setCnpjData] = useState<any>(null);
  const [documentoValidado, setDocumentoValidado] = useState(false);

  // Estados para crop de imagem
  const [showCropper, setShowCropper] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string>("");
  const [croppedImageUrl, setCroppedImageUrl] = useState<string>("");

  const { success, error: showError } = useToast();

  // Refs para animações
  const containerRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const handleNext = () => {
    if (currentStep < STEPS2.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleCompletar();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCompletar = async () => {
    try {
      // Converter logo para base64 se existir
      let logoBase64 = null;
      if (formData.logo) {
        logoBase64 = await convertFileToBase64(formData.logo);
      }

      const response = await fetch("/api/empresa/configurar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          tipoDocumento: formData.tipoDocumento,
          documento: formData.documento,
          razaoSocial: formData.razaoSocial,
          nomeFantasia: formData.nomeFantasia,
          nomeEmpresa: formData.nomeEmpresa,
          descricao: formData.descricao,
          telefone: formData.telefone,
          email: formData.email,
          cep: enderecoData.cep,
          logradouro: enderecoData.logradouro,
          numero: enderecoData.numero,
          complemento: enderecoData.complemento,
          bairro: enderecoData.bairro,
          cidade: enderecoData.cidade,
          estado: enderecoData.estado,
          enderecoCompleto: formData.endereco,
          logoBase64,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Empresa criada:", data);
        success(
          "Empresa configurada!",
          "Sua empresa foi configurada com sucesso!",
        );
        onCompletar();
      } else {
        const error = await response.json();
        console.error("Erro ao configurar empresa:", error);
        showError("Erro", error.error || "Erro ao configurar empresa");
      }
    } catch (error) {
      console.error("Erro ao configurar empresa:", error);
      showError("Erro", "Erro de conexão ao configurar empresa");
    }
  };

  // Função auxiliar para converter File em base64
  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleServicoChange = (index: number, field: string, value: any) => {
    const newServicos = [...formData.servicos];
    newServicos[index] = { ...newServicos[index], [field]: value };
    setFormData((prev) => ({
      ...prev,
      servicos: newServicos,
    }));
  };

  const addServico = () => {
    setFormData((prev) => ({
      ...prev,
      servicos: [
        ...prev.servicos,
        { nome: "", descricao: "", duracao: 60, preco: 0 },
      ],
    }));
  };

  const removeServico = (index: number) => {
    if (formData.servicos.length > 1) {
      const newServicos = formData.servicos.filter((_, i) => i !== index);
      setFormData((prev) => ({
        ...prev,
        servicos: newServicos,
      }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageUrl = event.target?.result as string;
        setImageToCrop(imageUrl);
        setShowCropper(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropComplete = (croppedImageBlob: Blob) => {
    const croppedImageUrl = URL.createObjectURL(croppedImageBlob);
    setCroppedImageUrl(croppedImageUrl);

    // Criar um File object a partir do Blob
    const croppedFile = new File([croppedImageBlob], "logo-cropped.png", {
      type: "image/png",
    });

    handleInputChange("logo", croppedFile);
    setShowCropper(false);
    success("Logo ajustado!", "Sua logo foi cortada e ajustada com sucesso.");
  };

  const handleCropCancel = () => {
    setShowCropper(false);
    setImageToCrop("");
  };

  // Funções de validação
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^\(\d{2}\)\s\d{4,5}-\d{4}$/;
    return phoneRegex.test(phone);
  };

  const formatPhone = (value: string): string => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 6)
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    if (numbers.length <= 10)
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  };

  // Documento (CPF/CNPJ)
  const digitsOnly = (v: string) => v.replace(/\D/g, "");

  const formatCNPJ = (value: string): string => {
    const v = digitsOnly(value).slice(0, 14);
    if (v.length <= 2) return v;
    if (v.length <= 5) return `${v.slice(0, 2)}.${v.slice(2)}`;
    if (v.length <= 8) return `${v.slice(0, 2)}.${v.slice(2, 5)}.${v.slice(5)}`;
    if (v.length <= 12)
      return `${v.slice(0, 2)}.${v.slice(2, 5)}.${v.slice(5, 8)}/${v.slice(8)}`;
    return `${v.slice(0, 2)}.${v.slice(2, 5)}.${v.slice(5, 8)}/${v.slice(8, 12)}-${v.slice(12, 14)}`;
  };

  const formatCPF = (value: string): string => {
    const v = digitsOnly(value).slice(0, 11);
    if (v.length <= 3) return v;
    if (v.length <= 6) return `${v.slice(0, 3)}.${v.slice(3)}`;
    if (v.length <= 9) return `${v.slice(0, 3)}.${v.slice(3, 6)}.${v.slice(6)}`;
    return `${v.slice(0, 3)}.${v.slice(3, 6)}.${v.slice(6, 9)}-${v.slice(9, 11)}`;
  };

  const validateCPF = (cpf: string): boolean => {
    const v = digitsOnly(cpf);
    if (v.length !== 11 || /^([0-9])\1+$/.test(v)) return false;
    let sum = 0;
    for (let i = 0; i < 9; i++) sum += parseInt(v.charAt(i)) * (10 - i);
    let rev = 11 - (sum % 11);
    if (rev === 10 || rev === 11) rev = 0;
    if (rev !== parseInt(v.charAt(9))) return false;
    sum = 0;
    for (let i = 0; i < 10; i++) sum += parseInt(v.charAt(i)) * (11 - i);
    rev = 11 - (sum % 11);
    if (rev === 10 || rev === 11) rev = 0;
    return rev === parseInt(v.charAt(10));
  };

  const validateCNPJ = (cnpj: string): boolean => {
    const v = digitsOnly(cnpj);

    // Verifica se tem 14 dígitos
    if (v.length !== 14) return false;

    // Rejeita CNPJs com todos os dígitos iguais
    if (/^(\d)\1+$/.test(v)) return false;

    // Calcula o primeiro dígito verificador
    let tamanho = v.length - 2;
    let numeros = v.substring(0, tamanho);
    const digitos = v.substring(tamanho);
    let soma = 0;
    let pos = tamanho - 7;

    for (let i = tamanho; i >= 1; i--) {
      soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
      if (pos < 2) pos = 9;
    }

    let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    if (resultado !== parseInt(digitos.charAt(0))) return false;

    // Calcula o segundo dígito verificador
    tamanho = tamanho + 1;
    numeros = v.substring(0, tamanho);
    soma = 0;
    pos = tamanho - 7;

    for (let i = tamanho; i >= 1; i--) {
      soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
      if (pos < 2) pos = 9;
    }

    resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    return resultado === parseInt(digitos.charAt(1));
  };

  const formatCep = (value: string): string => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 5) return numbers;
    return `${numbers.slice(0, 5)}-${numbers.slice(5, 8)}`;
  };

  // Busca de endereço por CEP
  const buscarCep = async (cep: string) => {
    const cepLimpo = cep.replace(/\D/g, "");
    if (cepLimpo.length !== 8) return;

    setLoadingCep(true);
    try {
      const response = await fetch(
        `https://viacep.com.br/ws/${cepLimpo}/json/`,
      );
      const data = await response.json();

      if (!data.erro) {
        setEnderecoData((prev) => ({
          ...prev,
          logradouro: data.logradouro || "",
          bairro: data.bairro || "",
          cidade: data.localidade || "",
          estado: data.uf || "",
        }));

        // Atualiza o endereço completo no formData
        const enderecoCompleto = `${data.logradouro}, ${enderecoData.numero || ""}, ${data.bairro}, ${data.localidade} - ${data.uf}`;
        handleInputChange("endereco", enderecoCompleto);

        success("CEP encontrado!", "Endereço preenchido automaticamente.");
      } else {
        showError("CEP não encontrado", "Verifique o CEP digitado.");
      }
    } catch (error) {
      showError("Erro na busca", "Não foi possível buscar o CEP.");
    } finally {
      setLoadingCep(false);
    }
  };

  const handleCepChange = (value: string) => {
    const formattedCep = formatCep(value);
    setEnderecoData((prev) => ({ ...prev, cep: formattedCep }));

    if (formattedCep.replace(/\D/g, "").length === 8) {
      buscarCep(formattedCep);
    }
  };

  // Buscar dados por documento (CNPJ/CPF)
  const buscarDocumento = async () => {
    setValidationErrors({});
    setCnpjData(null);
    setDocumentoValidado(false);
    const tipo = formData.tipoDocumento;
    const docDigits = digitsOnly(formData.documento);

    if (tipo === "CNPJ") {
      if (!validateCNPJ(docDigits)) {
        setValidationErrors((prev) => ({
          ...prev,
          documento: "CNPJ inválido",
        }));
        return;
      }
      setLoadingDocumento(true);
      try {
        const res = await fetch(
          `https://brasilapi.com.br/api/cnpj/v1/${docDigits}`,
        );
        if (!res.ok)
          throw new Error("Não foi possível consultar o CNPJ agora.");
        const data = await res.json();

        // Salvar dados do CNPJ para exibir resumo
        setCnpjData({
          razaoSocial: data?.razao_social || "",
          nomeFantasia: data?.nome_fantasia || "",
          situacao: data?.descricao_situacao_cadastral || "",
          porte: data?.porte || "",
        });

        const nomeFantasia = data?.nome_fantasia || "";
        const razaoSocial = data?.razao_social || "";
        const nomeBase = nomeFantasia || razaoSocial;

        handleInputChange("nomeFantasia", nomeFantasia);
        handleInputChange("razaoSocial", razaoSocial);
        handleInputChange("nomeEmpresa", nomeBase);
        if (data?.cnae_fiscal_descricao)
          handleInputChange("descricao", data.cnae_fiscal_descricao);
        if (data?.email)
          handleInputChange("email", String(data.email).toLowerCase());
        if (data?.ddd_telefone_1) {
          const tel = String(data.ddd_telefone_1).replace(/\D/g, "");
          if (tel.length >= 10) {
            handleInputChange("telefone", formatPhone(tel));
          }
        }

        const cepRaw = String(data?.cep || "").replace(/\D/g, "");
        const cepFmt =
          cepRaw.length === 8 ? `${cepRaw.slice(0, 5)}-${cepRaw.slice(5)}` : "";
        const novoEnd = {
          cep: cepFmt,
          logradouro: data?.logradouro || "",
          numero: String(data?.numero || ""),
          bairro: data?.bairro || "",
          cidade: data?.municipio || "",
          estado: data?.uf || "",
          complemento: data?.complemento || "",
        };
        setEnderecoData(novoEnd);
        const enderecoCompleto = `${novoEnd.logradouro}${novoEnd.numero ? ", " + novoEnd.numero : ""}${novoEnd.bairro ? ", " + novoEnd.bairro : ""}${novoEnd.cidade ? ", " + novoEnd.cidade : ""}${novoEnd.estado ? " - " + novoEnd.estado : ""}${novoEnd.complemento ? ", " + novoEnd.complemento : ""}`;
        handleInputChange("endereco", enderecoCompleto);

        setDocumentoValidado(true);
        success("CNPJ validado!", "Dados da empresa carregados com sucesso.");
      } catch (e: any) {
        setValidationErrors((prev) => ({
          ...prev,
          documento: e?.message || "Falha ao consultar CNPJ",
        }));
      } finally {
        setLoadingDocumento(false);
      }
    } else {
      if (!validateCPF(docDigits)) {
        setValidationErrors((prev) => ({ ...prev, documento: "CPF inválido" }));
        return;
      }
      setDocumentoValidado(true);
      success("CPF válido", "Documento validado com sucesso.");
    }
  };

  const handleEnderecoFieldChange = (field: string, value: string) => {
    const newEnderecoData = { ...enderecoData, [field]: value };
    setEnderecoData(newEnderecoData);

    // Reconstrói o endereço completo
    const { cep, logradouro, numero, bairro, cidade, estado, complemento } =
      newEnderecoData;

    const enderecoCompleto = `${logradouro}${numero ? ", " + numero : ""}${bairro ? ", " + bairro : ""}${cidade ? ", " + cidade : ""}${estado ? " - " + estado : ""}${complemento ? ", " + complemento : ""}`;
    handleInputChange("endereco", enderecoCompleto);
  };

  // Animação dos elementos quando o componente aparece
  useEffect(() => {
    const tl = gsap.timeline();

    tl.fromTo(
      logoRef.current,
      { opacity: 0, y: -20, scale: 0.8 },
      { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: "back.out(1.7)" },
    )
      .fromTo(
        titleRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" },
        "-=0.3",
      )
      .fromTo(
        subtitleRef.current,
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" },
        "-=0.2",
      )
      .fromTo(
        contentRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" },
        "-=0.1",
      );
  }, []);

  // Animação quando muda de etapa
  useEffect(() => {
    if (contentRef.current) {
      gsap.fromTo(
        contentRef.current,
        { opacity: 0, x: 20 },
        { opacity: 1, x: 0, duration: 0.4, ease: "power2.out" },
      );
    }
  }, [currentStep]);

  const renderStepContent = () => {
    switch (
      currentStep === 2
        ? 21
        : currentStep === 3
          ? 2
          : currentStep >= 4
            ? currentStep - 1
            : currentStep
    ) {
      case 0: // Documento (CNPJ/CPF)
        return (
          <div className="space-y-4">
            {/* Toggle para tipo de documento */}
            <div className="flex justify-center mb-4">
              <div className="inline-flex rounded-lg border border-gray-300 p-1 bg-gray-50">
                <button
                  type="button"
                  onClick={() => {
                    handleInputChange("tipoDocumento", "CNPJ");
                    handleInputChange("documento", "");
                    setValidationErrors((prev) => ({ ...prev, documento: "" }));
                    setCnpjData(null);
                    setDocumentoValidado(false);
                  }}
                  className={`px-5 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    formData.tipoDocumento === "CNPJ"
                      ? "bg-[#C5837B] text-white shadow-sm"
                      : "bg-transparent text-gray-600 hover:text-gray-900"
                  }`}
                >
                  CNPJ
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleInputChange("tipoDocumento", "CPF");
                    handleInputChange("documento", "");
                    setValidationErrors((prev) => ({ ...prev, documento: "" }));
                    setCnpjData(null);
                    setDocumentoValidado(false);
                  }}
                  className={`px-5 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    formData.tipoDocumento === "CPF"
                      ? "bg-[#C5837B] text-white shadow-sm"
                      : "bg-transparent text-gray-600 hover:text-gray-900"
                  }`}
                >
                  CPF
                </button>
              </div>
            </div>

            {/* Input do documento */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {formData.tipoDocumento === "CNPJ"
                  ? "CNPJ da Empresa"
                  : "CPF do Responsável"}{" "}
                *
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={
                    formData.tipoDocumento === "CNPJ"
                      ? formatCNPJ(formData.documento)
                      : formatCPF(formData.documento)
                  }
                  onChange={(e) =>
                    handleInputChange("documento", e.target.value)
                  }
                  className={`w-full px-3 py-2 pr-24 border-0.5 rounded-md focus:outline-none focus:ring-2 focus:ring-[#C5837B] focus:border-[#C5837B] placeholder-gray-500 transition-all duration-300 ease-in-out bg-[#FFFFFF] text-black ${
                    validationErrors.documento
                      ? "border-red-500"
                      : "border-gray-400"
                  }`}
                  placeholder={
                    formData.tipoDocumento === "CNPJ"
                      ? "00.000.000/0001-00"
                      : "000.000.000-00"
                  }
                />
                <button
                  type="button"
                  onClick={buscarDocumento}
                  disabled={
                    loadingDocumento ||
                    (formData.tipoDocumento === "CNPJ"
                      ? digitsOnly(formData.documento).length !== 14
                      : digitsOnly(formData.documento).length !== 11)
                  }
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 px-3 py-1 bg-[#C5837B] text-white text-sm rounded hover:bg-[#B0736B] focus:outline-none focus:ring-2 focus:ring-[#C5837B] focus:ring-offset-1 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loadingDocumento ? "..." : "Validar"}
                </button>
              </div>
              {validationErrors.documento && (
                <p className="text-red-500 text-xs mt-1">
                  {validationErrors.documento}
                </p>
              )}
              {formData.tipoDocumento === "CPF" &&
                !validationErrors.documento && (
                  <p className="text-xs text-gray-500 mt-1">
                    Por privacidade, não buscamos dados por CPF. Apenas
                    validação.
                  </p>
                )}
            </div>

            {/* Resumo do CNPJ validado */}
            {documentoValidado &&
              cnpjData &&
              formData.tipoDocumento === "CNPJ" && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
                  <div className="flex items-start gap-2">
                    <svg
                      className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-green-800 mb-1">
                        CNPJ Validado com Sucesso!
                      </p>
                      <div className="text-xs text-green-700 space-y-1">
                        {cnpjData.razaoSocial && (
                          <p>
                            <span className="font-medium">Razão Social:</span>{" "}
                            {cnpjData.razaoSocial}
                          </p>
                        )}
                        {cnpjData.nomeFantasia && (
                          <p>
                            <span className="font-medium">Nome Fantasia:</span>{" "}
                            {cnpjData.nomeFantasia}
                          </p>
                        )}
                        {cnpjData.situacao && (
                          <p>
                            <span className="font-medium">Situação:</span>{" "}
                            {cnpjData.situacao}
                          </p>
                        )}
                        {cnpjData.porte && (
                          <p>
                            <span className="font-medium">Porte:</span>{" "}
                            {cnpjData.porte}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

            {/* Confirmação CPF validado */}
            {documentoValidado &&
              formData.tipoDocumento === "CPF" &&
              !validationErrors.documento && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
                  <div className="flex items-center gap-2">
                    <svg
                      className="w-5 h-5 text-green-500 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <p className="text-sm font-semibold text-green-800">
                      CPF Validado com Sucesso!
                    </p>
                  </div>
                </div>
              )}
          </div>
        );
      case 1: // Nome da Empresa
        return (
          <div className="space-y-4">
            <Input
              label="Nome do Estabelecimento *"
              type="text"
              value={formData.nomeEmpresa}
              onChange={(e) => handleInputChange("nomeEmpresa", (e.target as HTMLInputElement).value)}
              placeholder="Ex: Salão da Maria"
              required
            />

            <TextArea
              label="Descrição (Opcional)"
              value={formData.descricao}
              onChange={(e) => handleInputChange("descricao", (e.target as HTMLTextAreaElement).value)}
              placeholder="Uma breve descrição da sua empresa..."
              rows={4}
            />
          </div>
        );

      case 21: // Contato
        return (
          <div className="space-y-4">
            <Input
              label="Telefone *"
              type="tel"
              value={formData.telefone}
              onChange={(e) => handleInputChange("telefone", formatPhone((e.target as HTMLInputElement).value))}
              placeholder="(11) 99999-9999"
              required
              error={formData.telefone && !validatePhone(formData.telefone) ? "Formato inválido. Use: (11) 99999-9999" : undefined}
            />

            <Input
              label="Email da Empresa *"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", (e.target as HTMLInputElement).value)}
              placeholder="contato@empresa.com"
              required
              error={formData.email && !validateEmail(formData.email) ? "Email inválido. Use: exemplo@dominio.com" : undefined}
            />
          </div>
        );

      case 2: // Endereço
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="relative">
                  <Input
                    label="CEP *"
                    type="text"
                    value={enderecoData.cep}
                    onChange={(e) => handleCepChange((e.target as HTMLInputElement).value)}
                    placeholder="00000-000"
                    maxLength={9}
                    required
                    containerClassName="relative"
                  />
                  {loadingCep && (
                    <div className="absolute right-3 top-9">{/* below label */}
                      <BookLoader size={16} className="text-[#C5837B]" />
                    </div>
                  )}
                </div>
              </div>
              <div>
                <Input
                  label="Número *"
                  type="text"
                  value={enderecoData.numero}
                  onChange={(e) => handleEnderecoFieldChange("numero", (e.target as HTMLInputElement).value)}
                  placeholder="123"
                  required
                />
              </div>
            </div>

            <Input
              label="Logradouro *"
              type="text"
              value={enderecoData.logradouro}
              onChange={(e) => handleEnderecoFieldChange("logradouro", (e.target as HTMLInputElement).value)}
              placeholder="Rua das Flores"
              required
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Input
                  label="Bairro *"
                  type="text"
                  value={enderecoData.bairro}
                  onChange={(e) => handleEnderecoFieldChange("bairro", (e.target as HTMLInputElement).value)}
                  placeholder="Centro"
                  required
                />
              </div>
              <div>
                <Input
                  label="Complemento"
                  type="text"
                  value={enderecoData.complemento}
                  onChange={(e) => handleEnderecoFieldChange("complemento", (e.target as HTMLInputElement).value)}
                  placeholder="Apto 101"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Input
                  label="Cidade *"
                  type="text"
                  value={enderecoData.cidade}
                  onChange={(e) => handleEnderecoFieldChange("cidade", (e.target as HTMLInputElement).value)}
                  placeholder="São Paulo"
                  required
                />
              </div>
              <div>
                <Input
                  label="Estado *"
                  type="text"
                  value={enderecoData.estado}
                  onChange={(e) => handleEnderecoFieldChange("estado", (e.target as HTMLInputElement).value)}
                  placeholder="SP"
                  maxLength={2}
                  required
                />
              </div>
            </div>

            {/* Campo oculto para armazenar o endereço completo */
            }
            <input
              type="hidden"
              value={formData.endereco}
              onChange={(e) => handleInputChange("endereco", e.target.value)}
            />
          </div>
        );

      case 3: // Logo
        return (
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="w-full max-w-md">
                <label
                  htmlFor="logo-upload"
                  className="flex flex-col items-center justify-center w-full h-48 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors duration-300"
                >
                  {formData.logo ? (
                    <div className="flex flex-col items-center">
                      <div className="relative">
                        <img
                          src={
                            croppedImageUrl ||
                            URL.createObjectURL(formData.logo)
                          }
                          alt="Logo Preview"
                          className="max-h-32 max-w-32 object-contain mb-2 rounded-lg"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all duration-300 rounded-lg flex items-center justify-center">
                          <span className="text-white text-xs opacity-0 hover:opacity-100 transition-opacity duration-300">
                            Recortar novamente
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">
                        Clique para alterar ou recortar
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <svg
                        className="w-10 h-10 mb-4 text-gray-400"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 20 16"
                      >
                        <path
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                        />
                      </svg>
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">
                          Clique para fazer upload
                        </span>
                      </p>
                      <p className="text-xs text-gray-500">PNG, JPG ou SVG</p>
                    </div>
                  )}
                  <input
                    id="logo-upload"
                    type="file"
                    className="hidden"
                    onChange={handleFileChange}
                    accept="image/*"
                  />
                </label>
              </div>
            </div>

            {formData.logo && (
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">
                  Sua logo será exibida em formato quadrado
                </p>
                <button
                  type="button"
                  onClick={() => {
                    if (croppedImageUrl) {
                      setImageToCrop(croppedImageUrl);
                      setShowCropper(true);
                    }
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition duration-200 text-sm"
                >
                  Recortar Novamente
                </button>
              </div>
            )}
          </div>
        );
    }
  };

  const isStepValid = () => {
    switch (
      currentStep === 2
        ? 21
        : currentStep === 3
          ? 2
          : currentStep >= 4
            ? currentStep - 1
            : currentStep
    ) {
      case 0: // Documento
        return formData.tipoDocumento === "CNPJ"
          ? validateCNPJ(formData.documento)
          : validateCPF(formData.documento);
      case 1: // Nome da Empresa
        return formData.nomeEmpresa.trim() !== "";
      case 21: // Contato
        return (
          formData.telefone.trim() !== "" &&
          formData.email.trim() !== "" &&
          validatePhone(formData.telefone) &&
          validateEmail(formData.email)
        );
      case 2: // Endereço
        return (
          enderecoData.cep.trim() !== "" &&
          enderecoData.logradouro.trim() !== "" &&
          enderecoData.numero.trim() !== "" &&
          enderecoData.cidade.trim() !== "" &&
          enderecoData.estado.trim() !== ""
        );
      case 3: // Logo
        return true; // Logo é opcional
      default:
        return false;
    }
  };

  return (
    <div ref={containerRef} className="w-full max-w-md mx-auto px-4 sm:px-0">
      {/* Logo do App */}
      <div ref={logoRef} className="flex justify-start mb-3 sm:mb-4">
        <img
          src="/assets/logo.png"
          alt="Logo do App"
          className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg object-cover"
        />
      </div>

      <h2
        ref={titleRef}
        className="text-xl sm:text-2xl font-bold text-left text-gray-800 mb-2"
      >
        Configure sua Empresa
      </h2>
      <p
        ref={subtitleRef}
        className="text-xs sm:text-sm text-gray-600 text-left mb-4 sm:mb-6"
      >
        Vamos configurar sua empresa em algumas etapas simples
      </p>

      {/* Stepper */}
      <div className="mb-4 sm:mb-6">
        <Stepper
          steps={STEPS2}
          currentStep={currentStep}
          onStepClick={setCurrentStep}
        />
      </div>

      {/* Conteúdo da etapa atual */}
      <div ref={contentRef} className="mb-4 sm:mb-6">
        {renderStepContent()}
      </div>

      {/* Botões de navegação */}
      <div className="flex justify-between gap-2 sm:gap-4">
        <button
          onClick={currentStep === 0 ? onVoltar : handlePrevious}
          className="px-4 sm:px-6 py-2 text-sm sm:text-base border-0.5 border-gray-400 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition duration-200"
        >
          {currentStep === 0 ? "Voltar" : "Anterior"}
        </button>

        <button
          onClick={handleNext}
          disabled={!isStepValid()}
          className="px-4 sm:px-6 py-2 text-sm sm:text-base bg-[#C5837B] text-white rounded-md hover:bg-[#B0736B] focus:outline-none focus:ring-2 focus:ring-[#C5837B] focus:ring-offset-2 transition duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {currentStep === STEPS2.length - 1 ? "Concluir" : "Próximo"}
        </button>
      </div>

      {/* Modal de Crop de Imagem */}
      <Modal
        isOpen={showCropper}
        onClose={handleCropCancel}
        title="Ajustar Logo da Empresa"
        maxWidth="2xl"
      >
        <ImageCropper
          imageSrc={imageToCrop}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
        />
      </Modal>
    </div>
  );
}
