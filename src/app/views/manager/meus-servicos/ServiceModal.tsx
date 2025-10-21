"use client";

import React, { useState, useEffect } from 'react';
import Button from "@/components/visual/Button";
import Input from "@/components/visual/Input";
import TextArea from "@/components/visual/TextArea";
import Select from "@/components/visual/Select";
import Modal from "@/components/Modal";

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

interface ServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (service: Omit<Service, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  service?: Service | null;
  title: string;
}

const durationOptions = [
  { value: '15', label: '15 minutos' },
  { value: '30', label: '30 minutos' },
  { value: '45', label: '45 minutos' },
  { value: '60', label: '1 hora' },
  { value: '90', label: '1h 30min' },
  { value: '120', label: '2 horas' },
  { value: '180', label: '3 horas' },
];

export default function ServiceModal({
  isOpen,
  onClose,
  onSave,
  service,
  title
}: ServiceModalProps) {
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

  // Reset form when modal opens/closes or service changes
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
      } else {
        setFormData({
          name: '',
          description: '',
          duration: '60',
          price: '',
          imageUrl: '',
          active: true,
        });
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      maxWidth="md"
      variant="center"
    >
      <div className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
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
              value={formData.duration}
              onChange={(value) => handleInputChange('duration', value)}
              options={durationOptions}
              error={errors.duration}
            />
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              URL da Imagem
            </label>
            <Input
              type="url"
              value={formData.imageUrl}
              onChange={(e) => handleInputChange('imageUrl', e.target.value)}
              placeholder="https://exemplo.com/imagem.jpg"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="active"
              checked={formData.active}
              onChange={(e) => handleInputChange('active', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="active" className="ml-2 block text-sm text-gray-700">
              Serviço ativo
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={loading}
            >
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
