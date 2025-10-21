"use client";

import { useState } from "react";
import Stepper from "@/components/visual/Stepper";
import Input from "@/components/visual/Input";
import Button from "@/components/visual/Button";
import Select from "@/components/visual/Select";
import TextArea from "@/components/visual/TextArea";
import AddressInput, { AddressData } from "@/components/visual/AddressInput";
import Switch from "@/components/ui/Switch";
import Modal from "@/components/Modal";
import Loader from "@/components/visual/Loader";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { useToast } from "@/contexts/ToastContext";
import ImageCropper from "@/app/components/ImageCropper";
import CardIcon from "@/components/visual/CardIcon";

interface CompanyDetailsStepperProps {
  onComplete: () => void;
}

interface FormData {
  // Informações básicas da empresa
  companyName: string;
  businessType: string;
  description: string;

  // Documento (CNPJ/CPF)
  tipoDocumento: "CNPJ" | "CPF";
  documento: string;
  razaoSocial: string;
  nomeFantasia: string;

  // Contato
  phone: string;
  email: string;

  // Endereço
  address: AddressData;

  // Logo e Banner
  logoUrl?: string;
  bannerUrl?: string;

  // Serviços
  services: Array<{ name: string; description?: string; duration: number; price: string; imageUrl?: string }>;

  // Horários de funcionamento
  businessHours: Array<{
    dayOfWeek: number;
    isOpen: boolean;
    openTime: string;
    closeTime: string;
    breakStart: string;
    breakEnd: string;
  }>;
}

const businessTypes = [
  { value: "manicure", label: "Manicure/Pedicure" },
  { value: "barbershop", label: "Barbearia" },
  { value: "salon", label: "Salão de Beleza" },
  { value: "clinic", label: "Clínica Médica" },
  { value: "dentist", label: "Consultório Odontológico" },
  { value: "spa", label: "Spa/Estética" },
  { value: "gym", label: "Academia" },
  { value: "restaurant", label: "Restaurante" },
  { value: "other", label: "Outro" },
];

const daysOfWeek = [
  { value: 0, label: "Domingo" },
  { value: 1, label: "Segunda-feira" },
  { value: 2, label: "Terça-feira" },
  { value: 3, label: "Quarta-feira" },
  { value: 4, label: "Quinta-feira" },
  { value: 5, label: "Sexta-feira" },
  { value: 6, label: "Sábado" },
];

export default function CompanyDetailsStepper({ onComplete }: CompanyDetailsStepperProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [validatingDocument, setValidatingDocument] = useState(false);
  const [documentValid, setDocumentValid] = useState(false);
  const [documentError, setDocumentError] = useState("");
  const toast = useToast();
  const [selectedDayIndex, setSelectedDayIndex] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploadingImages, setUploadingImages] = useState<Set<number>>(new Set());
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);

  // Estados para crop de imagem
  const [showCropper, setShowCropper] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string>("");
  const [currentServiceIndex, setCurrentServiceIndex] = useState<number | string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    // Informações básicas
    companyName: "",
    businessType: "",
    description: "",

    // Documento
    tipoDocumento: "CNPJ",
    documento: "",
    razaoSocial: "",
    nomeFantasia: "",

    // Contato
    phone: "",
    email: "",

    // Endereço
    address: {
      cep: "",
      logradouro: "",
      complemento: "",
      bairro: "",
      localidade: "",
      uf: "",
      numero: ""
    },

    // Logo e Banner
    logoUrl: "",
    bannerUrl: "",

    // Serviços
    services: [{ name: "", description: "", duration: 30, price: "", imageUrl: "" }],

    // Horários
    businessHours: daysOfWeek.map((day) => ({
      dayOfWeek: day.value,
      isOpen: false,
      openTime: "09:00",
      closeTime: "18:00",
      breakStart: "12:00",
      breakEnd: "13:00",
    })),
  });

  const totalSteps = 6;

  // Função para gerar opções de horas (07-23)
  const generateHourOptions = () => {
    const options = [];
    for (let hour = 7; hour <= 23; hour++) {
      options.push({ value: hour.toString().padStart(2, '0'), label: hour.toString().padStart(2, '0') });
    }
    return options;
  };

  // Função para gerar opções de minutos (00-59)
  const generateMinuteOptions = () => {
    const options = [];
    for (let minute = 0; minute <= 59; minute++) {
      options.push({ value: minute.toString().padStart(2, '0'), label: minute.toString().padStart(2, '0') });
    }
    return options;
  };

  // Funções de formatação
  const formatCNPJ = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1/$2')
      .replace(/(\d{4})(\d)/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
  };

  const formatCPF = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
  };

  const formatPhone = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2')
      .replace(/(\d{4})-(\d)(\d{4})/, '$1$2-$3')
      .replace(/(-\d{4})\d+?$/, '$1');
  };

  // Função para validar documento via API
  const validateDocument = async (documento: string, tipo: "CNPJ" | "CPF") => {
    if (!documento || documento.replace(/\D/g, '').length < (tipo === "CNPJ" ? 14 : 11)) {
      setDocumentValid(false);
      setDocumentError("");
      return;
    }

    setValidatingDocument(true);
    setDocumentError("");

    try {
      const response = await fetch("/api/validate-document", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          documento: documento.replace(/\D/g, ''),
          tipo: tipo
        }),
      });

      const data = await response.json();

      if (response.ok && data.valid) {
        setDocumentValid(true);
        setDocumentError("");

        // Se for CNPJ válido, preencher automaticamente os campos
        if (tipo === "CNPJ" && data.empresa) {
          setFormData(prev => ({
            ...prev,
            razaoSocial: data.empresa.razaoSocial || "",
            nomeFantasia: data.empresa.nomeFantasia || "",
            companyName: data.empresa.nomeFantasia || data.empresa.razaoSocial || ""
          }));
        }
      } else {
        setDocumentValid(false);
        setDocumentError(data.error || "Documento inválido");
      }
    } catch (error) {
      console.error("Erro ao validar documento:", error);
      setDocumentValid(false);
      setDocumentError("Erro ao validar documento. Tente novamente.");
    } finally {
      setValidatingDocument(false);
    }
  };

  const handleNext = async () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      await handleSubmit();
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/onboarding/complete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          // Informações básicas
          companyName: formData.companyName,
          businessType: formData.businessType,
          description: formData.description,

          // Documento
          tipoDocumento: formData.tipoDocumento,
          documento: formData.documento,
          razaoSocial: formData.razaoSocial,
          nomeFantasia: formData.nomeFantasia,

          // Contato
          phone: formData.phone,
          email: formData.email,

          // Endereço
          address: formData.address,

          // Logo e Banner
          logoUrl: formData.logoUrl,
          bannerUrl: formData.bannerUrl,

          // Serviços e horários
          services: formData.services,
          businessHours: formData.businessHours,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Empresa criada:", data);
        toast.success("Empresa configurada com sucesso!", "Todas as informações foram salvas corretamente.");
        onComplete();
      } else {
        const error = await response.json();
        console.error("Erro ao configurar empresa:", error);
        toast.error("Erro ao salvar configurações", error.error || "Tente novamente ou entre em contato com o suporte.");
      }
    } catch (error) {
      console.error("Erro:", error);
      toast.error("Erro ao salvar configurações", "Verifique sua conexão e tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const addService = () => {
    setFormData({
      ...formData,
      services: [...formData.services, { name: "", description: "", duration: 30, price: "", imageUrl: "" }],
    });
  };

  const removeService = (index: number) => {
    const newServices = formData.services.filter((_, i) => i !== index);
    setFormData({ ...formData, services: newServices });
  };

  const updateService = (index: number, field: string, value: any) => {
    const newServices = [...formData.services];
    newServices[index] = { ...newServices[index], [field]: value };
    setFormData({ ...formData, services: newServices });
  };

  // Função para formatar moeda brasileira
  const formatCurrency = (value: string): string => {
    // Remove tudo que não é dígito
    const numbers = value.replace(/\D/g, '');

    // Converte para centavos
    const amount = parseInt(numbers) / 100;

    // Formata com vírgulas e pontos
    return amount.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };


  const handleImageUpload = (index: number, file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const imageUrl = event.target?.result as string;
      setImageToCrop(imageUrl);
      setCurrentServiceIndex(index);
      setShowCropper(true);
    };
    reader.readAsDataURL(file);
  };

  const handleCropComplete = async (croppedImageBlob: Blob) => {
    try {
      // Criar um File object a partir do Blob
      const croppedFile = new File([croppedImageBlob], "image-cropped.png", {
        type: "image/png",
      });

      const imageUrl = await uploadToCloudinary(croppedFile, 'empresas/servicos', currentServiceIndex === "banner" ? 'banner' : currentServiceIndex === null ? 'logo' : 'service');

      if (currentServiceIndex === null) {
        // Logo da empresa
        setUploadingLogo(true);
        setFormData(prev => ({ ...prev, logoUrl: imageUrl }));
        toast.success("Logo atualizado!", "O logo foi cortado e salvo com sucesso.");
        setUploadingLogo(false);
      } else if (currentServiceIndex === "banner") {
        // Banner da empresa
        setUploadingBanner(true);
        setFormData(prev => ({ ...prev, bannerUrl: imageUrl }));
        toast.success("Banner atualizado!", "O banner foi cortado e salvo com sucesso.");
        setUploadingBanner(false);
      } else if (typeof currentServiceIndex === 'number') {
        // Imagem de serviço
        // Adiciona o índice ao set de uploads em andamento
        setUploadingImages(prev => new Set(prev).add(currentServiceIndex));
        updateService(currentServiceIndex, "imageUrl", imageUrl);
        toast.success("Imagem ajustada!", "A imagem foi cortada e salva com sucesso.");

        // Remove o índice do set de uploads em andamento
        setUploadingImages(prev => {
          const newSet = new Set(prev);
          newSet.delete(currentServiceIndex);
          return newSet;
        });
      }
    } catch (error) {
      console.error("Erro ao fazer upload da imagem:", error);
      toast.error("Erro ao fazer upload da imagem", "Tente novamente ou entre em contato com o suporte.");
      setUploadingLogo(false);
      setUploadingBanner(false);
    } finally {
      // Limpa estados do cropper
      setShowCropper(false);
      setImageToCrop("");
      setCurrentServiceIndex(null);
    }
  };

  const handleCropCancel = () => {
    setShowCropper(false);
    setImageToCrop("");
    setCurrentServiceIndex(null);
  };

  const updateBusinessHours = (index: number, field: string, value: any) => {
    const newHours = [...formData.businessHours];
    newHours[index] = { ...newHours[index], [field]: value };
    setFormData({ ...formData, businessHours: newHours });
  };

  const handleAddDay = (dayValue: string) => {
    const dayIndex = parseInt(dayValue);
    const newHours = [...formData.businessHours];
    newHours[dayIndex] = {
      ...newHours[dayIndex],
      isOpen: true
    };
    setFormData({ ...formData, businessHours: newHours });

    // Animação de blur melhorada
    setTimeout(() => {
      const element = document.querySelector(`[data-day-index="${dayIndex}"]`);
      if (element) {
        // Adiciona blur e pulse
        element.classList.add('blur-sm', 'animate-pulse');

        // Remove blur após 300ms mas mantém pulse
        setTimeout(() => {
          element.classList.remove('blur-sm');
        }, 300);

        // Remove pulse após 1.5s
        setTimeout(() => {
          element.classList.remove('animate-pulse');
        }, 1500);
      }
    }, 100);
  };

  const handleOpenModal = (dayIndex: number) => {
    setSelectedDayIndex(dayIndex);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedDayIndex(null);
  };

  const canProceed = (stepNumber: number): boolean => {
    switch (stepNumber) {
      case 1: // Documento
        return !!(formData.tipoDocumento && formData.documento.trim() && documentValid);
      case 2: // Informações Básicas
        return !!(formData.companyName.trim() && formData.businessType && formData.description.trim());
      case 3: // Contato e Endereço
        return !!(
          formData.phone.trim() &&
          formData.email.trim() &&
          formData.address.cep.trim() &&
          formData.address.logradouro.trim() &&
          formData.address.numero.trim() &&
          formData.address.bairro.trim() &&
          formData.address.localidade.trim() &&
          formData.address.uf.trim()
        );
      case 4: // Visual da Empresa
        return true; // Visual é opcional
      case 5: // Serviços
        return formData.services.some((s) => s.name.trim().length > 0);
      case 6: // Horários
        return true;
      default:
        return false;
    }
  };

  const steps = [
    {
      id: "step1",
      title: "Documento",
      content: (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Documento da Empresa</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Tipo de Documento *
              </label>
              <div className="grid grid-cols-2 gap-6">
                {/* Card CNPJ */}
                <div
                  onClick={() => setFormData(prev => ({ ...prev, tipoDocumento: "CNPJ" }))}
                  className="relative group cursor-pointer"
                >
                  {/* Borda de trás */}
                  <div className={`absolute inset-1 translate-x-2 translate-y-2 rounded-2xl border z-0 pointer-events-none transition-all duration-300 ${formData.tipoDocumento === "CNPJ"
                    ? "border-[#C5837B]/30"
                    : "border-gray-200"
                    }`}></div>

                  {/* Card principal */}
                  <div className={`relative z-10 bg-white rounded-2xl border overflow-hidden transition-all duration-300 transform ${formData.tipoDocumento === "CNPJ"
                    ? "border-[#C5837B] shadow-lg scale-[1.02]"
                    : "border-gray-200 hover:border-gray-300 hover:shadow-md hover:scale-[1.01]"
                    }`}>
                    <div className="relative p-6 bg-gradient-to-br from-gray-50 to-white">
                      {/* Efeitos de fundo sutis */}
                      {formData.tipoDocumento === "CNPJ" && (
                        <span className="absolute top-0 right-0 w-20 h-20 bg-[#C5837B] rounded-full blur-2xl opacity-10" />
                      )}

                      <div className="relative flex items-center gap-4">
                        {/* Ícone */}
                        <CardIcon
                          size="sm"
                          circular={true}
                          className={`w-12 h-12 transition-all duration-300 ${formData.tipoDocumento === "CNPJ"
                            ? "bg-[#C5837B] scale-110"
                            : "bg-gray-100 scale-100"
                            }`}
                        >
                          <svg className={`w-6 h-6 transition-all duration-300 ${formData.tipoDocumento === "CNPJ"
                            ? "text-black scale-100"
                            : "text-gray-600 scale-90"
                            }`} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                            <path d="M3 4m0 3a3 3 0 0 1 3 -3h12a3 3 0 0 1 3 3v10a3 3 0 0 1 -3 3h-12a3 3 0 0 1 -3 -3z" />
                            <path d="M9 10m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
                            <path d="M15 8l2 0" />
                            <path d="M15 12l2 0" />
                            <path d="M7 16l10 0" />
                          </svg>
                        </CardIcon>

                        {/* Info */}
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 text-lg leading-tight">
                            CNPJ
                          </h3>
                          <p className="text-sm text-gray-500 mt-1">
                            Pessoa Jurídica
                          </p>
                        </div>

                        {/* Check mark */}
                        {formData.tipoDocumento === "CNPJ" && (
                          <div className="w-6 h-6 bg-[#C5837B] rounded-full flex items-center justify-center animate-in zoom-in duration-300">
                            <svg className="w-4 h-4 text-white animate-in zoom-in duration-200" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card CPF */}
                <div
                  onClick={() => setFormData(prev => ({ ...prev, tipoDocumento: "CPF" }))}
                  className="relative group cursor-pointer"
                >
                  {/* Borda de trás */}
                  <div className={`absolute inset-1 translate-x-2 translate-y-2 rounded-2xl border z-0 pointer-events-none transition-all duration-300 ${formData.tipoDocumento === "CPF"
                    ? "border-[#C5837B]/30"
                    : "border-gray-200"
                    }`}></div>

                  {/* Card principal */}
                  <div className={`relative z-10 bg-white rounded-2xl border overflow-hidden transition-all duration-300 transform ${formData.tipoDocumento === "CPF"
                    ? "border-[#C5837B] shadow-lg scale-[1.02]"
                    : "border-gray-200 hover:border-gray-300 hover:shadow-md hover:scale-[1.01]"
                    }`}>
                    <div className="relative p-6 bg-gradient-to-br from-gray-50 to-white">
                      {/* Efeitos de fundo sutis */}
                      {formData.tipoDocumento === "CPF" && (
                        <span className="absolute top-0 right-0 w-20 h-20 bg-[#C5837B] rounded-full blur-2xl opacity-10" />
                      )}

                      <div className="relative flex items-center gap-4">
                        {/* Ícone */}
                        <CardIcon
                          size="sm"
                          circular={true}
                          className={`w-12 h-12 transition-all duration-300 ${formData.tipoDocumento === "CPF"
                            ? "bg-[#C5837B] scale-110"
                            : "bg-gray-100 scale-100"
                            }`}
                        >
                          <svg className={`w-6 h-6 transition-all duration-300 ${formData.tipoDocumento === "CPF"
                            ? "text-black scale-100"
                            : "text-gray-600 scale-90"
                            }`} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                            <path d="M8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0" />
                            <path d="M6 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2" />
                          </svg>
                        </CardIcon>

                        {/* Info */}
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 text-lg leading-tight">
                            CPF
                          </h3>
                          <p className="text-sm text-gray-500 mt-1">
                            Pessoa Física
                          </p>
                        </div>

                        {/* Check mark */}
                        {formData.tipoDocumento === "CPF" && (
                          <div className="w-6 h-6 bg-[#C5837B] rounded-full flex items-center justify-center animate-in zoom-in duration-300">
                            <svg className="w-4 h-4 text-white animate-in zoom-in duration-200" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Input
                label={formData.tipoDocumento === "CNPJ" ? "CNPJ" : "CPF"}
                type="text"
                value={formData.documento}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  const formatted = formData.tipoDocumento === "CNPJ"
                    ? formatCNPJ(value)
                    : formatCPF(value);
                  setFormData(prev => ({ ...prev, documento: formatted }));

                  // Validar documento após digitação completa
                  if (value.length === (formData.tipoDocumento === "CNPJ" ? 14 : 11)) {
                    validateDocument(formatted, formData.tipoDocumento);
                  } else {
                    setDocumentValid(false);
                    setDocumentError("");
                  }
                }}
                placeholder={formData.tipoDocumento === "CNPJ" ? "00.000.000/0000-00" : "000.000.000-00"}
                required
                disabled={validatingDocument}
              />

              {/* Status da validação */}
              {validatingDocument && (
                <div className="flex items-center gap-2 text-sm text-blue-600">
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  Validando documento...
                </div>
              )}

              {documentValid && !validatingDocument && (
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Documento válido!
                </div>
              )}

              {documentError && !validatingDocument && (
                <div className="flex items-center gap-2 text-sm text-red-600">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {documentError}
                </div>
              )}
            </div>
          </div>
        </div>
      ),
      isValid: canProceed(1),
    },
    {
      id: "step2",
      title: "Informações Básicas",
      content: (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Informações Básicas</h3>
          <div className="space-y-4">
            <Input
              label="Nome da Empresa"
              type="text"
              value={formData.companyName}
              onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
              placeholder="Ex: Studio Beleza"
              required
            />

            <Select
              label="Tipo de Negócio"
              value={formData.businessType}
              onChange={(value) => {
                setFormData(prev => ({ ...prev, businessType: value }));
              }}
              options={businessTypes}
              placeholder="Selecione..."
              required
            />

            <TextArea
              label="Descrição da Empresa"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descreva brevemente sua empresa e os serviços oferecidos..."
              rows={4}
              required
            />
          </div>
        </div>
      ),
      isValid: canProceed(2),
    },
    {
      id: "step3",
      title: "Contato e Endereço",
      content: (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Informações de Contato e Endereço</h3>
          <div className="space-y-4">
            <Input
              label="Telefone"
              type="tel"
              value={formData.phone}
              onChange={(e) => {
                const formatted = formatPhone(e.target.value);
                setFormData(prev => ({ ...prev, phone: formatted }));
              }}
              placeholder="(11) 99999-9999"
              required
            />

            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="contato@empresa.com"
              required
            />

            <AddressInput
              value={formData.address}
              onChange={(address: AddressData) => {
                setFormData(prev => ({ ...prev, address }));
              }}
            />
          </div>
        </div>
      ),
      isValid: canProceed(3),
    },
    {
      id: "step4",
      title: "Visual da Empresa",
      content: (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Visual da Empresa</h3>
          <div className="space-y-6">
            {/* Preview da Loja */}
            <div className="relative">
              {/* Borda de trás */}
              <div className="absolute inset-1 translate-x-2 translate-y-2 rounded-3xl border border-gray-200 z-0 pointer-events-none"></div>

              {/* Card principal */}
              <div className="relative z-10 bg-white rounded-3xl border border-gray-200 overflow-hidden">
                {/* Banner */}
                <div className="relative h-32 bg-gradient-to-r from-[#C5837B]/10 via-[#C5837B]/5 to-transparent">
                  {formData.bannerUrl ? (
                    <img
                      src={formData.bannerUrl}
                      alt="Banner da empresa"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnoiIHN0cm9rZT0iI0M1ODM3QiIgc3Ryb2tlLW9wYWNpdHk9Ii4xIiBzdHJva2Utd2lkdGg9IjIiLz48L2c+PC9zdmc+')] opacity-50" />
                  )}
                </div>

                {/* Profile Section */}
                <div className="px-8 pb-8 -mt-16 relative">
                  <div className="flex flex-col md:flex-row gap-6 items-start">
                    {/* Logo com CardIcon */}
                    <div className="relative">
                      <CardIcon size="xl" className="w-20 h-20" circular={true}>
                        {formData.logoUrl ? (
                          <img
                            src={formData.logoUrl}
                            alt="Logo da empresa"
                            className="w-16 h-16 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                      </CardIcon>
                    </div>

                    {/* Informações principais */}
                    <div className="flex-1 pt-4">
                      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                        {formData.companyName || "Nome da Empresa"}
                      </h1>

                      <p className="text-gray-600 mb-6 leading-relaxed max-w-3xl">
                        {formData.description || "Descrição da empresa aparecerá aqui..."}
                      </p>

                      {/* Informações de contato em grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-start gap-3 text-sm">
                          <CardIcon size="md" icon="home" />
                          <div>
                            <p className="font-medium text-gray-900">Endereço</p>
                            <p className="text-gray-600">
                              {formData.address.logradouro && formData.address.numero
                                ? `${formData.address.logradouro}, ${formData.address.numero} - ${formData.address.bairro}, ${formData.address.localidade}/${formData.address.uf}`
                                : "Endereço será exibido aqui..."
                              }
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3 text-sm">
                          <CardIcon size="md" icon="phone" />
                          <div>
                            <p className="font-medium text-gray-900">Telefone</p>
                            <p className="text-gray-600">{formData.phone || "Telefone será exibido aqui..."}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Upload de Logo e Banner */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Upload Logo */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  Logo da Empresa
                </label>
                <div className="relative">
                  <div className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center hover:border-gray-400 transition-colors cursor-pointer">
                    {uploadingLogo ? (
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-8 h-8 border-2 border-[#C5837B] border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-sm text-[#C5837B]">Carregando...</p>
                      </div>
                    ) : formData.logoUrl ? (
                      <img
                        src={formData.logoUrl}
                        alt="Logo da empresa"
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <div className="text-center">
                        <div className="text-gray-400 mb-2">
                          <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <p className="text-sm text-gray-500">Clique para adicionar logo</p>
                      </div>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={uploadingLogo}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          setImageToCrop(event.target?.result as string);
                          setShowCropper(true);
                          setCurrentServiceIndex(null); // null indica que é logo da empresa
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </div>
                <p className="text-xs text-gray-500">Logo é opcional, mas recomendado</p>
              </div>

              {/* Upload Banner */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  Banner da Empresa
                </label>
                <div className="relative">
                  <div className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center hover:border-gray-400 transition-colors cursor-pointer">
                    {uploadingBanner ? (
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-8 h-8 border-2 border-[#C5837B] border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-sm text-[#C5837B]">Carregando...</p>
                      </div>
                    ) : formData.bannerUrl ? (
                      <img
                        src={formData.bannerUrl}
                        alt="Banner da empresa"
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <div className="text-center">
                        <div className="text-gray-400 mb-2">
                          <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <p className="text-sm text-gray-500">Clique para adicionar banner</p>
                      </div>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={uploadingBanner}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          setImageToCrop(event.target?.result as string);
                          setShowCropper(true);
                          setCurrentServiceIndex("banner"); // "banner" indica que é banner da empresa
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </div>
                <p className="text-xs text-gray-500">
                  Banner é opcional. Recomendado: 1200x300 pixels (proporção 4:1) para melhor qualidade
                </p>
              </div>
            </div>
          </div>
        </div>
      ),
      isValid: canProceed(4),
    },
    {
      id: "step5",
      title: "Serviços Prestados",
      content: (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Serviços Prestados *</h3>
            <Button onClick={addService} variant="outline" size="sm">
              + Adicionar Serviço
            </Button>
          </div>
          <div className="space-y-4">
            {formData.services.map((service, index) => (
              <div key={index} className="relative">
                {/* Borda de trás estática */}
                <div className="absolute inset-1 translate-x-2 translate-y-2 rounded-lg border border-gray-200 z-0 pointer-events-none"></div>
                {/* Card principal */}
                <div className="relative z-10 bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center gap-4">
                    {/* Upload de Imagem */}
                    <div className="flex-shrink-0">
                      <div className="relative">
                        {/* Borda de trás estática */}
                        <div className="absolute inset-1 translate-x-2 translate-y-2 rounded-lg border border-gray-200 z-0 pointer-events-none"></div>
                        {/* Card principal */}
                        <div className="relative z-10 w-24 h-24 bg-white rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors cursor-pointer overflow-hidden">
                          {uploadingImages.has(index) ? (
                            /* Loader durante upload */
                            <div className="flex items-center justify-center">
                              <Loader size="md" color="primary" />
                            </div>
                          ) : service.imageUrl ? (
                            /* Imagem carregada */
                            <img
                              src={service.imageUrl}
                              alt={`Imagem do serviço ${index + 1}`}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            /* Estado inicial */
                            <div className="text-center">
                              <svg className="w-8 h-8 text-gray-400 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <p className="text-xs text-gray-500">Foto</p>
                            </div>
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            disabled={uploadingImages.has(index)}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                handleImageUpload(index, file);
                              }
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex-1 space-y-4">
                      <Input
                        label="Nome do serviço"
                        type="text"
                        value={service.name}
                        onChange={(e) => updateService(index, "name", e.target.value)}
                        placeholder="Nome do serviço"
                      />
                      <Input
                        label="Descrição do serviço"
                        type="text"
                        value={service.description || ""}
                        onChange={(e) => updateService(index, "description", e.target.value)}
                        placeholder="Descreva brevemente o serviço oferecido..."
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <Input
                          label="Duração (min)"
                          type="number"
                          value={service.duration}
                          onChange={(e) => updateService(index, "duration", parseInt((e.target as HTMLInputElement).value))}
                          min={5}
                          step={5}
                        />
                        <Input
                          label="Preço (R$)"
                          type="text"
                          value={service.price}
                          onChange={(e) => {
                            const formatted = formatCurrency(e.target.value);
                            updateService(index, "price", formatted);
                          }}
                          placeholder="0,00"
                        />
                      </div>
                    </div>
                    {formData.services.length > 1 && (
                      <button
                        onClick={() => removeService(index)}
                        className="text-red-500 hover:text-red-700 mt-1 p-1 rounded hover:bg-red-50 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ),
      isValid: canProceed(5),
    },
    {
      id: "step6",
      title: "Horário de Funcionamento",
      content: (
        <div>
          {/* Header com título e select de dias */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Horário de Funcionamento</h3>
            <Select
              value=""
              onChange={handleAddDay}
              options={daysOfWeek.map((day, index) => ({
                value: index.toString(),
                label: day.label
              }))}
              placeholder="Adicionar dia"
              size="sm"
              containerClassName="w-fit"
            />
          </div>

          {/* Lista de dias ativos */}
          <div className="space-y-3">
            {formData.businessHours
              .map((hours, index) => ({ hours, index }))
              .filter(({ hours }) => hours.isOpen)
              .map(({ hours, index }) => (
                <div key={index} className="relative" data-day-index={index}>
                  {/* Borda de trás estática */}
                  <div className="absolute inset-1 translate-x-2 translate-y-2 rounded-lg border border-gray-200 z-0 pointer-events-none"></div>
                  {/* Card principal */}
                  <div className="relative z-10 bg-white rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center justify-between">
                      {/* Switch e nome do dia */}
                      <div className="flex items-center gap-3">
                        <Switch
                          checked={hours.isOpen}
                          onChange={(e) => updateBusinessHours(index, "isOpen", e.target.checked)}
                        />
                        <h4 className="font-medium text-gray-900">{daysOfWeek[index].label}</h4>
                      </div>

                      {/* Botão configurar horários */}
                      <Button
                        onClick={() => handleOpenModal(index)}
                        variant="outline"
                        size="sm"
                      >
                        Configurar horários
                      </Button>
                    </div>
                  </div>
                </div>
              ))}

            {/* Empty state */}
            {formData.businessHours.filter(hours => hours.isOpen).length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum dia configurado</h3>
                <p className="text-gray-500 mb-4">Para começar a configurar os horários de funcionamento:</p>
                <div className="bg-gray-50 rounded-lg p-4 max-w-md mx-auto">
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                    <span className="font-medium">1.</span>
                    <span>Clique no select &quot;Adicionar dia&quot; no canto superior direito</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-600 mt-2">
                    <span className="font-medium">2.</span>
                    <span>Escolha o dia da semana que deseja configurar</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-600 mt-2">
                    <span className="font-medium">3.</span>
                    <span>Clique em &quot;Configurar horários&quot; para definir os horários</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ),
      isValid: canProceed(6),
    },
  ];

  return (
    <>
      {/* Efeito de blur animado nos cantos da página */}
      <span className="fixed top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-[#C5837B] rounded-full blur-[40px] opacity-20 animate-pulse z-0 pointer-events-none" />
      <span className="fixed bottom-0 right-0 translate-x-1/2 translate-y-1/2 w-40 h-40 bg-[#C5837B] rounded-full blur-[40px] opacity-20 animate-pulse z-0 pointer-events-none" />

      <Stepper
        steps={steps}
        currentStep={step}
        onNext={handleNext}
        onBack={handleBack}
        onComplete={handleSubmit}
        loading={loading}
        title="Complete o Perfil da sua Empresa"
        subtitle={`Passo ${step} de ${totalSteps}`}
        className={step === 4 ? "[&>div]:max-w-4xl" : ""}
      />

      {/* Modal de configuração de horários */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={selectedDayIndex !== null ? `Configurar horários - ${daysOfWeek[selectedDayIndex].label}` : ""}
      >
        {selectedDayIndex !== null && (
          <div className="px-6 py-6 space-y-8">
            {/* Horário de Funcionamento */}
            <div className="space-y-6">
              <h4 className="text-lg font-medium text-gray-900">Horário de Funcionamento</h4>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-700">Abre</label>
                  <div className="flex items-center gap-3">
                    <Select
                      value={formData.businessHours[selectedDayIndex].openTime.split(':')[0]}
                      onChange={(hour) => {
                        const currentMinute = formData.businessHours[selectedDayIndex].openTime.split(':')[1];
                        updateBusinessHours(selectedDayIndex, "openTime", `${hour}:${currentMinute}`);
                      }}
                      options={generateHourOptions()}
                      placeholder="09"
                      size="sm"
                    />
                    <span className="text-gray-400 text-lg">:</span>
                    <Select
                      value={formData.businessHours[selectedDayIndex].openTime.split(':')[1]}
                      onChange={(minute) => {
                        const currentHour = formData.businessHours[selectedDayIndex].openTime.split(':')[0];
                        updateBusinessHours(selectedDayIndex, "openTime", `${currentHour}:${minute}`);
                      }}
                      options={generateMinuteOptions()}
                      placeholder="00"
                      size="sm"
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-700">Fecha</label>
                  <div className="flex items-center gap-3">
                    <Select
                      value={formData.businessHours[selectedDayIndex].closeTime.split(':')[0]}
                      onChange={(hour) => {
                        const currentMinute = formData.businessHours[selectedDayIndex].closeTime.split(':')[1];
                        updateBusinessHours(selectedDayIndex, "closeTime", `${hour}:${currentMinute}`);
                      }}
                      options={generateHourOptions()}
                      placeholder="18"
                      size="sm"
                    />
                    <span className="text-gray-400 text-lg">:</span>
                    <Select
                      value={formData.businessHours[selectedDayIndex].closeTime.split(':')[1]}
                      onChange={(minute) => {
                        const currentHour = formData.businessHours[selectedDayIndex].closeTime.split(':')[0];
                        updateBusinessHours(selectedDayIndex, "closeTime", `${currentHour}:${minute}`);
                      }}
                      options={generateMinuteOptions()}
                      placeholder="00"
                      size="sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Horário de Intervalo */}
            <div className="space-y-6">
              <h4 className="text-lg font-medium text-gray-900">Intervalo</h4>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-700">Início</label>
                  <div className="flex items-center gap-3">
                    <Select
                      value={formData.businessHours[selectedDayIndex].breakStart.split(':')[0]}
                      onChange={(hour) => {
                        const currentMinute = formData.businessHours[selectedDayIndex].breakStart.split(':')[1];
                        updateBusinessHours(selectedDayIndex, "breakStart", `${hour}:${currentMinute}`);
                      }}
                      options={generateHourOptions()}
                      placeholder="12"
                      size="sm"
                    />
                    <span className="text-gray-400 text-lg">:</span>
                    <Select
                      value={formData.businessHours[selectedDayIndex].breakStart.split(':')[1]}
                      onChange={(minute) => {
                        const currentHour = formData.businessHours[selectedDayIndex].breakStart.split(':')[0];
                        updateBusinessHours(selectedDayIndex, "breakStart", `${currentHour}:${minute}`);
                      }}
                      options={generateMinuteOptions()}
                      placeholder="00"
                      size="sm"
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-700">Fim</label>
                  <div className="flex items-center gap-3">
                    <Select
                      value={formData.businessHours[selectedDayIndex].breakEnd.split(':')[0]}
                      onChange={(hour) => {
                        const currentMinute = formData.businessHours[selectedDayIndex].breakEnd.split(':')[1];
                        updateBusinessHours(selectedDayIndex, "breakEnd", `${hour}:${currentMinute}`);
                      }}
                      options={generateHourOptions()}
                      placeholder="13"
                      size="sm"
                    />
                    <span className="text-gray-400 text-lg">:</span>
                    <Select
                      value={formData.businessHours[selectedDayIndex].breakEnd.split(':')[1]}
                      onChange={(minute) => {
                        const currentHour = formData.businessHours[selectedDayIndex].breakEnd.split(':')[0];
                        updateBusinessHours(selectedDayIndex, "breakEnd", `${currentHour}:${minute}`);
                      }}
                      options={generateMinuteOptions()}
                      placeholder="00"
                      size="sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Botões de ação */}
            <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
              <Button
                onClick={handleCloseModal}
                variant="outline"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleCloseModal}
                variant="primary"
              >
                Salvar
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal de Crop de Imagem */}
      <Modal
        isOpen={showCropper}
        onClose={handleCropCancel}
        title="Ajustar Imagem do Serviço"
        maxWidth="2xl"
      >
        <ImageCropper
          imageSrc={imageToCrop}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
        />
      </Modal>
    </>
  );
}