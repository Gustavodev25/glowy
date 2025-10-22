'use client';

import React, { forwardRef, useState, useEffect, useRef } from 'react';
import Input from './Input';

// Função utilitária para combinar classes do Tailwind CSS.
const cn = (...inputs: (string | undefined | null | false)[]) => {
  return inputs.filter(Boolean).join(' ');
};

export interface AddressData {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  numero: string;
}

export interface AddressInputProps {
  label?: string;
  error?: string;
  helpText?: string;
  required?: boolean;
  containerClassName?: string;
  value?: AddressData;
  onChange?: (address: AddressData) => void;
  disabled?: boolean;
}

const AddressInput = forwardRef<HTMLDivElement, AddressInputProps>(
  (
    {
      label,
      error,
      helpText,
      required = false,
      containerClassName,
      value,
      onChange,
      disabled,
      ...props
    },
    ref
  ) => {
    const [addressData, setAddressData] = useState<AddressData>(
      value || {
        cep: '',
        logradouro: '',
        complemento: '',
        bairro: '',
        localidade: '',
        uf: '',
        numero: ''
      }
    );
    const [cepError, setCepError] = useState<string>('');
    const [isLoadingCep, setIsLoadingCep] = useState(false);
    const cepTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

    // Função para buscar CEP
    const fetchCepData = async (cep: string) => {
      if (!cep || cep.length < 8) return;

      const cleanCep = cep.replace(/\D/g, '');
      if (cleanCep.length !== 8) return;

      // Validar se é um CEP válido (não pode ser 00000000)
      if (cleanCep === '00000000' || /^(.)\1+$/.test(cleanCep)) {
        setCepError('CEP inválido');
        return;
      }

      setIsLoadingCep(true);
      setCepError('');

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos timeout

        const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`, {
          signal: controller.signal,
          mode: 'cors',
          headers: {
            'Accept': 'application/json',
          }
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.erro) {
          setCepError('CEP não encontrado');
          return;
        }

        const newAddressData = {
          ...addressData,
          cep: cleanCep,
          logradouro: data.logradouro || '',
          bairro: data.bairro || '',
          localidade: data.localidade || '',
          uf: data.uf || ''
        };

        setAddressData(newAddressData);
        if (onChange) {
          onChange(newAddressData);
        }
      } catch (error: any) {
        console.error('Erro ao buscar CEP:', error);

        if (error.name === 'AbortError') {
          setCepError('Tempo esgotado ao buscar CEP');
        } else if (error.message?.includes('Failed to fetch')) {
          setCepError('Erro de conexão. Verifique sua internet.');
        } else {
          setCepError('Erro ao buscar CEP. Tente novamente.');
        }
      } finally {
        setIsLoadingCep(false);
      }
    };

    // Debounce para busca de CEP
    const handleCepChange = (newCep: string) => {
      const newAddressData = { ...addressData, cep: newCep };
      setAddressData(newAddressData);

      if (onChange) {
        onChange(newAddressData);
      }

      // Limpar timeout anterior
      if (cepTimeoutRef.current) {
        clearTimeout(cepTimeoutRef.current);
      }

      // Buscar CEP após 500ms de inatividade
      cepTimeoutRef.current = setTimeout(() => {
        fetchCepData(newCep);
      }, 500);
    };

    // Atualizar quando value prop mudar
    useEffect(() => {
      if (value) {
        setAddressData(value);
      }
    }, [value]);

    // Limpar timeout ao desmontar
    useEffect(() => {
      return () => {
        if (cepTimeoutRef.current) {
          clearTimeout(cepTimeoutRef.current);
        }
      };
    }, []);

    const handleFieldChange = (field: keyof AddressData, newValue: string) => {
      const newAddressData = { ...addressData, [field]: newValue };
      setAddressData(newAddressData);

      if (onChange) {
        onChange(newAddressData);
      }
    };

    const containerClasses = cn('w-full', containerClassName);

    const labelClasses = cn(
      'block text-sm font-medium text-gray-700 mb-2',
      error && 'text-red-600',
      disabled && 'text-gray-500'
    );

    const errorClasses = cn(
      'mt-1 text-xs text-red-600 transition-opacity duration-200',
      error ? 'opacity-100' : 'opacity-0 h-0'
    );

    const helpTextClasses = cn(
      'mt-1 text-xs text-gray-500',
      error && 'opacity-0 h-0'
    );

    return (
      <div className={containerClasses} {...props} ref={ref}>
        <div className="space-y-4">
          {/* CEP */}
          <div className="relative">
            <Input
              label="CEP"
              type="text"
              value={addressData.cep}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '');
                const formattedCep = value.replace(/(\d{5})(\d{3})/, '$1-$2');
                handleCepChange(formattedCep);
              }}
              placeholder="00000-000"
              maxLength={9}
              disabled={disabled}
              error={cepError}
            />
            {isLoadingCep && (
              <div className="absolute right-3 top-8">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-[#C5837B]"></div>
              </div>
            )}
          </div>

          {/* Logradouro e Bairro */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Logradouro"
              type="text"
              value={addressData.logradouro}
              onChange={(e) => handleFieldChange('logradouro', e.target.value)}
              placeholder="Rua, Avenida, etc."
              disabled={disabled}
            />
            <Input
              label="Bairro"
              type="text"
              value={addressData.bairro}
              onChange={(e) => handleFieldChange('bairro', e.target.value)}
              placeholder="Nome do bairro"
              disabled={disabled}
            />
          </div>

          {/* Número e Complemento */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Número"
              type="text"
              value={addressData.numero}
              onChange={(e) => handleFieldChange('numero', e.target.value)}
              placeholder="123"
              disabled={disabled}
            />
            <Input
              label="Complemento"
              type="text"
              value={addressData.complemento}
              onChange={(e) => handleFieldChange('complemento', e.target.value)}
              placeholder="Apto, Casa, etc."
              disabled={disabled}
            />
          </div>

          {/* Cidade e UF */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Cidade"
              type="text"
              value={addressData.localidade}
              onChange={(e) => handleFieldChange('localidade', e.target.value)}
              placeholder="Nome da cidade"
              disabled={disabled}
            />
            <Input
              label="UF"
              type="text"
              value={addressData.uf}
              onChange={(e) => handleFieldChange('uf', e.target.value.toUpperCase())}
              placeholder="SP"
              maxLength={2}
              disabled={disabled}
            />
          </div>
        </div>

        {error && <p className={errorClasses}>{error}</p>}
        {helpText && !error && <p className={helpTextClasses}>{helpText}</p>}
      </div>
    );
  }
);

AddressInput.displayName = 'AddressInput';

export default AddressInput;
