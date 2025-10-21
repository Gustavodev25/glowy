"use client";

import React, { useState, useEffect, useRef } from 'react';
import Button from "@/components/visual/Button";
import Input from "@/components/visual/Input";
import TextArea from "@/components/visual/TextArea";
import Select from "@/components/visual/Select";
import CardIcon from "@/components/visual/CardIcon";
import Drawer from "@/components/visual/Drawer";
import Loader from "@/components/visual/Loader";
import Modal from "@/components/Modal";
import ImageCropper from "@/app/components/ImageCropper";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { useToast } from "@/contexts/ToastContext";
import { SkeletonTemplateCard, SkeletonServiceCard, SkeletonForm } from "@/components/visual/Skeleton";
import { gsap } from "gsap";

interface Service {
  id: string;
  name: string;
  description?: string;
  duration: number;
  price?: number;
  imageUrl?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ServiceDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (service: Omit<Service, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  service?: Service | null;
  title: string;
}

// Templates de serviços pré-definidos focados em agendamento
const serviceTemplates = [
  {
    id: 'barbearia',
    name: 'Barbearia',
    icon: 'scissors',
    color: '#C5837B',
    services: [
      {
        name: 'Corte Masculino',
        description: 'Corte de cabelo masculino com acabamento profissional',
        duration: 30,
        price: 25,
        imageUrl: '/assets/servicos.jpeg'
      },
      {
        name: 'Barba',
        description: 'Aparar e modelar barba',
        duration: 20,
        price: 15,
        imageUrl: '/assets/servicos.jpeg'
      },
      {
        name: 'Corte + Barba',
        description: 'Corte de cabelo e barba completo',
        duration: 45,
        price: 35,
        imageUrl: '/assets/servicos.jpeg'
      },
      {
        name: 'Degradê',
        description: 'Corte degradê com acabamento especial',
        duration: 40,
        price: 30,
        imageUrl: '/assets/servicos.jpeg'
      }
    ]
  },
  {
    id: 'salao',
    name: 'Salão de Beleza',
    icon: 'building',
    color: '#C5837B',
    services: [
      {
        name: 'Corte Feminino',
        description: 'Corte de cabelo feminino com lavagem',
        duration: 60,
        price: 45,
        imageUrl: '/assets/servicos.jpeg'
      },
      {
        name: 'Escova',
        description: 'Escova progressiva ou tradicional',
        duration: 90,
        price: 80,
        imageUrl: '/assets/servicos.jpeg'
      },
      {
        name: 'Coloração',
        description: 'Coloração completa com tratamento',
        duration: 120,
        price: 120,
        imageUrl: '/assets/servicos.jpeg'
      },
      {
        name: 'Manicure',
        description: 'Manicure completa com esmaltação',
        duration: 45,
        price: 25,
        imageUrl: '/assets/servicos.jpeg'
      }
    ]
  },
  {
    id: 'psicologia',
    name: 'Psicologia',
    icon: 'brain',
    color: '#8b5cf6',
    services: [
      {
        name: 'Sessão Individual',
        description: 'Sessão de terapia individual',
        duration: 50,
        price: 120,
        imageUrl: '/assets/servicos.jpeg'
      },
      {
        name: 'Sessão de Casal',
        description: 'Terapia de casal',
        duration: 60,
        price: 150,
        imageUrl: '/assets/servicos.jpeg'
      },
      {
        name: 'Avaliação Psicológica',
        description: 'Avaliação psicológica completa',
        duration: 90,
        price: 200,
        imageUrl: '/assets/servicos.jpeg'
      },
      {
        name: 'Orientação Vocacional',
        description: 'Orientação para escolha profissional',
        duration: 60,
        price: 100,
        imageUrl: '/assets/servicos.jpeg'
      }
    ]
  },
  {
    id: 'pediatria',
    name: 'Pediatria',
    icon: 'baby',
    color: '#06b6d4',
    services: [
      {
        name: 'Consulta Pediátrica',
        description: 'Consulta médica pediátrica',
        duration: 30,
        price: 120,
        imageUrl: '/assets/servicos.jpeg'
      },
      {
        name: 'Vacinação Infantil',
        description: 'Aplicação de vacinas infantis',
        duration: 20,
        price: 80,
        imageUrl: '/assets/servicos.jpeg'
      },
      {
        name: 'Exame de Rotina',
        description: 'Exame físico de rotina',
        duration: 25,
        price: 100,
        imageUrl: '/assets/servicos.jpeg'
      },
      {
        name: 'Acompanhamento',
        description: 'Acompanhamento do desenvolvimento',
        duration: 30,
        price: 110,
        imageUrl: '/assets/servicos.jpeg'
      }
    ]
  },
  {
    id: 'clinica',
    name: 'Clínica Médica',
    icon: 'stethoscope',
    color: '#ef4444',
    services: [
      {
        name: 'Consulta Geral',
        description: 'Consulta médica geral',
        duration: 30,
        price: 150,
        imageUrl: '/assets/servicos.jpeg'
      },
      {
        name: 'Exame de Sangue',
        description: 'Coleta de sangue para exames',
        duration: 15,
        price: 50,
        imageUrl: '/assets/servicos.jpeg'
      },
      {
        name: 'Vacinação',
        description: 'Aplicação de vacinas',
        duration: 20,
        price: 80,
        imageUrl: '/assets/servicos.jpeg'
      },
      {
        name: 'Curativo',
        description: 'Aplicação de curativos',
        duration: 15,
        price: 30,
        imageUrl: '/assets/servicos.jpeg'
      }
    ]
  },
  {
    id: 'manicure',
    name: 'Manicure/Pedicure',
    icon: 'paintbrush',
    color: '#ec4899',
    services: [
      {
        name: 'Manicure Completa',
        description: 'Manicure completa com esmaltação',
        duration: 45,
        price: 25,
        imageUrl: '/assets/servicos.jpeg'
      },
      {
        name: 'Pedicure Completa',
        description: 'Pedicure completa com esmaltação',
        duration: 60,
        price: 35,
        imageUrl: '/assets/servicos.jpeg'
      },
      {
        name: 'Manicure + Pedicure',
        description: 'Serviço completo de unhas',
        duration: 90,
        price: 50,
        imageUrl: '/assets/servicos.jpeg'
      },
      {
        name: 'Nail Art',
        description: 'Arte nas unhas personalizada',
        duration: 60,
        price: 40,
        imageUrl: '/assets/servicos.jpeg'
      }
    ]
  },
  {
    id: 'massagem',
    name: 'Massagem',
    icon: 'massage',
    color: '#10b981',
    services: [
      {
        name: 'Massagem Relaxante',
        description: 'Massagem corporal relaxante',
        duration: 60,
        price: 80,
        imageUrl: '/assets/servicos.jpeg'
      },
      {
        name: 'Massagem Terapêutica',
        description: 'Massagem para alívio de dores',
        duration: 60,
        price: 100,
        imageUrl: '/assets/servicos.jpeg'
      },
      {
        name: 'Drenagem Linfática',
        description: 'Drenagem linfática corporal',
        duration: 90,
        price: 120,
        imageUrl: '/assets/servicos.jpeg'
      },
      {
        name: 'Massagem Facial',
        description: 'Massagem facial relaxante',
        duration: 45,
        price: 60,
        imageUrl: '/assets/servicos.jpeg'
      }
    ]
  },
  {
    id: 'odontologia',
    name: 'Odontologia',
    icon: 'tooth',
    color: '#3b82f6',
    services: [
      {
        name: 'Consulta Odontológica',
        description: 'Consulta e avaliação odontológica',
        duration: 30,
        price: 80,
        imageUrl: '/assets/servicos.jpeg'
      },
      {
        name: 'Limpeza Dental',
        description: 'Limpeza e profilaxia dental',
        duration: 45,
        price: 120,
        imageUrl: '/assets/servicos.jpeg'
      },
      {
        name: 'Restauração',
        description: 'Restauração de dente',
        duration: 60,
        price: 150,
        imageUrl: '/assets/servicos.jpeg'
      },
      {
        name: 'Extração',
        description: 'Extração de dente',
        duration: 30,
        price: 100,
        imageUrl: '/assets/servicos.jpeg'
      }
    ]
  },
  {
    id: 'oftalmologia',
    name: 'Oftalmologia',
    icon: 'eye',
    color: '#f59e0b',
    services: [
      {
        name: 'Consulta Oftalmológica',
        description: 'Consulta e exame oftalmológico',
        duration: 30,
        price: 100,
        imageUrl: '/assets/servicos.jpeg'
      },
      {
        name: 'Exame de Vista',
        description: 'Exame completo da visão',
        duration: 45,
        price: 80,
        imageUrl: '/assets/servicos.jpeg'
      },
      {
        name: 'Medição de Grau',
        description: 'Medição de grau para óculos',
        duration: 30,
        price: 60,
        imageUrl: '/assets/servicos.jpeg'
      },
      {
        name: 'Consulta de Urgência',
        description: 'Atendimento oftalmológico de urgência',
        duration: 20,
        price: 120,
        imageUrl: '/assets/servicos.jpeg'
      }
    ]
  },
  {
    id: 'farmacia',
    name: 'Farmácia',
    icon: 'pill',
    color: '#84cc16',
    services: [
      {
        name: 'Consulta Farmacêutica',
        description: 'Consulta com farmacêutico',
        duration: 20,
        price: 40,
        imageUrl: '/assets/servicos.jpeg'
      },
      {
        name: 'Medição de Pressão',
        description: 'Medição de pressão arterial',
        duration: 10,
        price: 15,
        imageUrl: '/assets/servicos.jpeg'
      },
      {
        name: 'Teste de Glicemia',
        description: 'Teste de glicemia capilar',
        duration: 5,
        price: 20,
        imageUrl: '/assets/servicos.jpeg'
      },
      {
        name: 'Orientações Medicamentosas',
        description: 'Orientações sobre medicamentos',
        duration: 15,
        price: 25,
        imageUrl: '/assets/servicos.jpeg'
      }
    ]
  },
  {
    id: 'estetica',
    name: 'Estética',
    icon: 'sparkles',
    color: '#10b981',
    services: [
      {
        name: 'Limpeza de Pele',
        description: 'Limpeza facial profunda',
        duration: 60,
        price: 60,
        imageUrl: '/assets/servicos.jpeg'
      },
      {
        name: 'Tratamento Facial',
        description: 'Tratamento facial completo',
        duration: 90,
        price: 120,
        imageUrl: '/assets/servicos.jpeg'
      },
      {
        name: 'Depilação',
        description: 'Depilação com cera',
        duration: 30,
        price: 40,
        imageUrl: '/assets/servicos.jpeg'
      },
      {
        name: 'Tratamento Corporal',
        description: 'Tratamento hidratante corporal',
        duration: 90,
        price: 100,
        imageUrl: '/assets/servicos.jpeg'
      }
    ]
  },
  {
    id: 'agendamento',
    name: 'Serviços Gerais',
    icon: 'calendar',
    color: '#6b7280',
    services: [
      {
        name: 'Consulta Personalizada',
        description: 'Consulta ou atendimento personalizado',
        duration: 30,
        price: 100,
        imageUrl: '/assets/servicos.jpeg'
      },
      {
        name: 'Atendimento Domiciliar',
        description: 'Atendimento no domicílio do cliente',
        duration: 60,
        price: 150,
        imageUrl: '/assets/servicos.jpeg'
      },
      {
        name: 'Serviço Expresso',
        description: 'Serviço rápido de 15 minutos',
        duration: 15,
        price: 50,
        imageUrl: '/assets/servicos.jpeg'
      },
      {
        name: 'Avaliação Inicial',
        description: 'Avaliação inicial do cliente',
        duration: 45,
        price: 80,
        imageUrl: '/assets/servicos.jpeg'
      }
    ]
  }
];

const durationOptions = [
  { value: '15', label: '15 minutos' },
  { value: '30', label: '30 minutos' },
  { value: '45', label: '45 minutos' },
  { value: '60', label: '1 hora' },
  { value: '90', label: '1h 30min' },
  { value: '120', label: '2 horas' },
  { value: '180', label: '3 horas' },
  { value: 'custom', label: 'Horário personalizado' },
];

export default function ServiceDrawer({
  isOpen,
  onClose,
  onSave,
  service,
  title
}: ServiceDrawerProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    duration: '60',
    price: '',
    imageUrl: '',
    active: true,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [showTemplates, setShowTemplates] = useState(true);
  const [customDuration, setCustomDuration] = useState({ hours: '0', minutes: '30' });
  const [showCustomDuration, setShowCustomDuration] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showCropper, setShowCropper] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string>('');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const toast = useToast();

  // Reset form when drawer opens/closes or service changes
  useEffect(() => {
    if (isOpen) {
      if (service) {
        setFormData({
          name: service.name,
          description: service.description || '',
          duration: service.duration.toString(),
          price: service.price ? service.price.toString() : '',
          imageUrl: service.imageUrl || '',
          active: service.active,
        });
        setShowTemplates(false);
        setSelectedTemplate(null);
      } else {
        setFormData({
          name: '',
          description: '',
          duration: '60',
          price: '',
          imageUrl: '',
          active: true,
        });
        setShowTemplates(true);
        setSelectedTemplate(null);
      }
      setErrors({});
    }
  }, [isOpen, service]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }

    if (!formData.duration || parseInt(formData.duration) <= 0) {
      newErrors.duration = 'Duração deve ser maior que 0';
    }

    if (formData.price && parseFloat(formData.price) < 0) {
      newErrors.price = 'Preço não pode ser negativo';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await onSave({
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        duration: parseInt(formData.duration),
        price: formData.price ? parseFloat(formData.price) : undefined,
        imageUrl: formData.imageUrl.trim() || undefined,
        active: formData.active,
      });
      onClose();
    } catch (error) {
      console.error('Erro ao salvar serviço:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleDurationChange = (value: string) => {
    if (value === 'custom') {
      setShowCustomDuration(true);
      // Calcula valores iniciais com base na duração atual
      const currentDuration = parseInt(formData.duration);
      const hours = Math.floor(currentDuration / 60);
      const minutes = currentDuration % 60;
      setCustomDuration({ hours: hours.toString(), minutes: minutes.toString() });
    } else {
      setShowCustomDuration(false);
      handleInputChange('duration', value);
    }
  };

  const handleCustomDurationChange = (type: 'hours' | 'minutes', value: string) => {
    const newCustomDuration = { ...customDuration, [type]: value };
    setCustomDuration(newCustomDuration);

    // Calcula a duração total em minutos
    const totalMinutes = (parseInt(newCustomDuration.hours) * 60) + parseInt(newCustomDuration.minutes);
    setFormData(prev => ({ ...prev, duration: totalMinutes.toString() }));
  };

  // Função para gerar opções de horas (0-23)
  const generateHourOptions = () => {
    const options = [];
    for (let hour = 0; hour <= 23; hour++) {
      options.push({ value: hour.toString(), label: hour.toString().padStart(2, '0') });
    }
    return options;
  };

  // Função para gerar opções de minutos (0, 5, 10, ..., 55)
  const generateMinuteOptions = () => {
    const options = [];
    for (let minute = 0; minute <= 55; minute += 5) {
      options.push({ value: minute.toString(), label: minute.toString().padStart(2, '0') });
    }
    return options;
  };

  // Função para transição com blur
  const animateTransition = (callback: () => void) => {
    if (!contentRef.current) {
      callback();
      return;
    }

    setIsTransitioning(true);

    // Animação de saída (blur out)
    gsap.to(contentRef.current, {
      opacity: 0,
      filter: 'blur(10px)',
      scale: 0.98,
      duration: 0.2,
      ease: 'power2.in',
      onComplete: () => {
        // Executa o callback (mudança de estado)
        callback();

        // Pequeno delay para garantir que o DOM foi atualizado
        setTimeout(() => {
          if (!contentRef.current) return;

          // Animação de entrada (blur in)
          gsap.fromTo(
            contentRef.current,
            {
              opacity: 0,
              filter: 'blur(10px)',
              scale: 0.98,
            },
            {
              opacity: 1,
              filter: 'blur(0px)',
              scale: 1,
              duration: 0.3,
              ease: 'power2.out',
              onComplete: () => {
                setIsTransitioning(false);
              },
            }
          );
        }, 50);
      },
    });
  };

  const handleTemplateSelect = (templateId: string) => {
    animateTransition(() => {
      setSelectedTemplate(templateId);
      setShowTemplates(false);
    });
  };

  const handleTemplateServiceSelect = (templateService: any) => {
    animateTransition(() => {
      setFormData({
        name: templateService.name,
        description: templateService.description,
        duration: templateService.duration.toString(),
        price: templateService.price.toString(),
        imageUrl: templateService.imageUrl,
        active: true,
      });
      // Muda para o formulário após selecionar o template
      setSelectedTemplate(null);
    });
  };

  const handleBackToTemplates = () => {
    animateTransition(() => {
      setShowTemplates(true);
      setSelectedTemplate(null);
      setFormData({
        name: '',
        description: '',
        duration: '60',
        price: '',
        imageUrl: '',
        active: true,
      });
    });
  };

  const handleImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const imageUrl = event.target?.result as string;
      setImageToCrop(imageUrl);
      setShowCropper(true);
    };
    reader.readAsDataURL(file);
  };

  const handleCropComplete = async (croppedImageBlob: Blob) => {
    try {
      setUploadingImage(true);

      const croppedFile = new File([croppedImageBlob], "service-image-cropped.png", {
        type: "image/png",
      });

      const imageUrl = await uploadToCloudinary(croppedFile);
      setFormData(prev => ({ ...prev, imageUrl }));

      toast.success("Imagem ajustada!", "A imagem foi cortada e salva com sucesso.");
    } catch (error) {
      console.error("Erro ao fazer upload da imagem:", error);
      toast.error("Erro ao fazer upload da imagem", "Tente novamente ou entre em contato com o suporte.");
    } finally {
      setUploadingImage(false);
      setShowCropper(false);
      setImageToCrop('');
    }
  };

  const handleCropCancel = () => {
    setShowCropper(false);
    setImageToCrop('');
  };

  // Footer com botões para o formulário
  const drawerFooter = !showTemplates && !selectedTemplate ? (
    <div className="flex justify-end space-x-3">
      <Button
        type="button"
        variant="ghost"
        onClick={onClose}
        disabled={loading}
      >
        Voltar
      </Button>
      <Button
        type="submit"
        variant="primary"
        isLoading={loading}
        form="service-form"
      >
        Salvar
      </Button>
    </div>
  ) : undefined;

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={showTemplates ? 'Escolher Template' : title}
      width="lg"
      position="right"
      footer={drawerFooter}
    >
      <div ref={contentRef}>
        {isTransitioning && showTemplates && (
          /* Skeleton para Templates */
          <div>
            <div className="h-4 w-3/4 bg-gray-200 rounded mb-6 animate-pulse"></div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <SkeletonTemplateCard key={i} />
              ))}
            </div>
          </div>
        )}

        {isTransitioning && selectedTemplate && (
          /* Skeleton para Lista de Serviços */
          <div>
            <div className="h-4 w-32 bg-gray-200 rounded mb-6 animate-pulse"></div>
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <SkeletonServiceCard key={i} />
              ))}
            </div>
          </div>
        )}

        {isTransitioning && !showTemplates && !selectedTemplate && (
          /* Skeleton para Formulário */
          <SkeletonForm />
        )}

        {!isTransitioning && showTemplates && (
          /* Templates View */
          <div>
            <p className="text-sm text-gray-600 mb-6">
              Escolha um template para começar rapidamente ou crie um serviço personalizado.
            </p>

            <div className="space-y-4">
              {serviceTemplates.map((template) => (
                <div
                  key={template.id}
                  className="relative cursor-pointer"
                  onClick={() => handleTemplateSelect(template.id)}
                >
                  {/* Borda de trás estática */}
                  <div className="absolute inset-1 translate-x-2 translate-y-2 rounded-lg border border-gray-200 z-0 pointer-events-none"></div>

                  {/* Card principal */}
                  <div className="relative z-10 bg-white rounded-lg border border-gray-200 p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3 mb-3">
                      <CardIcon
                        size="md"
                        icon={template.icon as any}
                        color={template.color}
                      />
                      <div>
                        <h3 className="font-medium text-gray-900">{template.name}</h3>
                        <p className="text-sm text-gray-500">{template.services.length} serviços</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                      {template.services.slice(0, 4).map((service, index) => (
                        <div key={index} className="truncate">
                          {service.name}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <div
                onClick={() => animateTransition(() => setShowTemplates(false))}
                className="relative cursor-pointer"
              >
                {/* Borda de trás estática */}
                <div className="absolute inset-1 translate-x-2 translate-y-2 rounded-lg border border-dashed border-gray-300 z-0 pointer-events-none"></div>

                {/* Card principal */}
                <div className="relative z-10 bg-white rounded-lg border-2 border-dashed border-gray-300 p-6 hover:border-gray-400 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col items-center gap-2 text-gray-600">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span className="font-medium text-base">Criar Serviço Personalizado</span>
                    <p className="text-sm text-gray-500">Comece do zero com suas próprias configurações</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {!isTransitioning && selectedTemplate && (
          /* Template Services View */
          <div>
            <div className="mb-6">
              <button
                onClick={handleBackToTemplates}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Voltar aos templates
              </button>
            </div>

            <div className="space-y-3">
              {serviceTemplates.find(t => t.id === selectedTemplate)?.services.map((templateService, index) => (
                <div
                  key={index}
                  className="relative cursor-pointer"
                  onClick={() => handleTemplateServiceSelect(templateService)}
                >
                  {/* Borda de trás estática */}
                  <div className="absolute inset-1 translate-x-2 translate-y-2 rounded-lg border border-gray-200 z-0 pointer-events-none"></div>

                  {/* Card principal */}
                  <div className="relative z-10 bg-white rounded-lg border border-gray-200 p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                        <img
                          src={templateService.imageUrl}
                          alt={templateService.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{templateService.name}</h3>
                        <p className="text-sm text-gray-500">{templateService.description}</p>
                        <div className="flex items-center gap-4 mt-1 text-xs text-gray-600">
                          <span>{templateService.duration} min</span>
                          <span>R$ {templateService.price}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!isTransitioning && !showTemplates && !selectedTemplate && (
          /* Form View */
          <div>
            <form id="service-form" onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Imagem do Serviço
                </label>
                <div className="relative inline-block">
                  {/* Card principal com estilo CardIcon */}
                  <div className="relative inline-flex items-center justify-center bg-white text-gray-700 border border-gray-300 rounded-2xl shadow-[3px_3px_0px_#e5e7eb] transition-transform transition-shadow duration-100 ease-linear hover:bg-gray-50 active:translate-x-[3px] active:translate-y-[3px] active:shadow-none w-24 h-24 overflow-hidden cursor-pointer">
                    {uploadingImage ? (
                      /* Loader durante upload */
                      <div className="flex items-center justify-center">
                        <Loader size="md" color="primary" />
                      </div>
                    ) : formData.imageUrl ? (
                      /* Imagem carregada */
                      <img
                        src={formData.imageUrl}
                        alt="Imagem do serviço"
                        className="w-full h-full object-cover rounded-2xl"
                      />
                    ) : (
                      /* Estado inicial */
                      <div className="text-center flex flex-col items-center justify-center p-2">
                        <svg className="w-8 h-8 text-gray-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-xs text-gray-500">Foto</p>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      disabled={uploadingImage}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleImageUpload(file);
                        }
                      }}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome do Serviço *
                </label>
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Ex: Corte de Cabelo"
                  error={errors.name}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição
                </label>
                <TextArea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Descreva o serviço oferecido..."
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duração *
                </label>
                <Select
                  value={showCustomDuration ? 'custom' : formData.duration}
                  onChange={handleDurationChange}
                  options={durationOptions}
                  error={errors.duration}
                />
                {showCustomDuration && (
                  <div className="mt-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Definir duração personalizada
                    </label>
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <Select
                          value={customDuration.hours}
                          onChange={(value) => handleCustomDurationChange('hours', value)}
                          options={generateHourOptions()}
                          placeholder="Horas"
                          size="sm"
                        />
                      </div>
                      <span className="text-gray-400 text-lg">:</span>
                      <div className="flex-1">
                        <Select
                          value={customDuration.minutes}
                          onChange={(value) => handleCustomDurationChange('minutes', value)}
                          options={generateMinuteOptions()}
                          placeholder="Minutos"
                          size="sm"
                        />
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Total: {parseInt(customDuration.hours) > 0 ? `${customDuration.hours}h ` : ''}{customDuration.minutes}min
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Preço (R$)
                </label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                  placeholder="0,00"
                  error={errors.price}
                />
              </div>

            </form>
          </div>
        )}
      </div>

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
    </Drawer>
  );
}
