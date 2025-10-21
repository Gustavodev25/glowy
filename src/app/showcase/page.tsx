'use client';

import React, { useState } from 'react';
import Input from '@/components/visual/Input';
import Button from '@/components/visual/Button';
import Select from '@/components/visual/Select';

export default function ShowcasePage() {
  const [inputValue, setInputValue] = useState('');
  const [selectValue, setSelectValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const selectOptions = [
    { value: 'opcao1', label: 'Primeira Opção' },
    { value: 'opcao2', label: 'Segunda Opção' },
    { value: 'opcao3', label: 'Terceira Opção' },
    { value: 'opcao4', label: 'Quarta Opção' },
    { value: 'opcao5', label: 'Quinta Opção' },
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleSelectChange = (value: string) => {
    setSelectValue(value);
  };

  const handleClick = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            🎨 Component Showcase
          </h1>
          <p className="text-gray-600">
            Demonstração dos componentes Input, Select e Button
          </p>
        </div>

        {/* Demo */}
        <div className="space-y-6">
          <Input
            label="Digite algo"
            placeholder="Digite aqui..."
            value={inputValue}
            onChange={handleInputChange}
          />

          <Select
            label="Selecione uma opção"
            placeholder="Escolha uma opção..."
            value={selectValue}
            onChange={handleSelectChange}
            options={selectOptions}
          />

          <Button
            variant="primary"
            fullWidth
            isLoading={isLoading}
            onClick={handleClick}
          >
            {isLoading ? 'Carregando...' : 'Clique aqui'}
          </Button>
        </div>

        {/* Valores Atuais */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-gray-700 font-semibold mb-3 text-sm">📊 Valores Atuais</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Input:</span>
              <span className="font-mono text-gray-900">"{inputValue || 'vazio'}"</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Select:</span>
              <span className="font-mono text-gray-900">
                {selectValue ? selectOptions.find(opt => opt.value === selectValue)?.label : 'nenhuma seleção'}
              </span>
            </div>
          </div>
        </div>

        {/* Código */}
        <div className="mt-8 bg-gray-900 rounded-lg p-4">
          <h4 className="text-white font-semibold mb-3 text-sm">💻 Código</h4>
          <pre className="text-green-400 text-xs overflow-x-auto">
            {`<Input
  label="Digite algo"
  placeholder="Digite aqui..."
  value={inputValue}
  onChange={handleInputChange}
/>

<Select
  label="Selecione uma opção"
  placeholder="Escolha uma opção..."
  value={selectValue}
  onChange={handleSelectChange}
  options={selectOptions}
/>

<Button 
  variant="primary" 
  fullWidth
  isLoading={isLoading}
  onClick={handleClick}
>
  Clique aqui
</Button>`}
          </pre>
        </div>

        {/* Navigation */}
        <div className="text-center mt-6">
          <Button
            variant="outline"
            onClick={() => window.history.back()}
          >
            ← Voltar
          </Button>
        </div>
      </div>
    </div>
  );
}
