"use client";

import { useState, useEffect } from "react";
import { ClipboardList, FileText, Calendar, Printer } from "lucide-react";
import Button from "@/components/visual/Button";
import CardIcon from "@/components/visual/CardIcon";
import NovaAnamneseDrawer from "./NovaAnamneseDrawer";
import DetalhesAnamneseDrawer from "./DetalhesAnamneseDrawer";
import Tooltip from "@/components/visual/Tooltip";

interface RespostaFormulario {
  id: string;
  respostas: any;
  observacoes?: string;
  createdAt: string;
  formulario: {
    id: string;
    nome: string;
    descricao?: string;
  };
  agendamento?: {
    id: string;
    dataHora: string;
  };
}

interface AnamneseTabProps {
  clienteId: string;
  clienteNome: string;
  respostas: RespostaFormulario[];
  onUpdate: () => void;
}

export default function AnamneseTab({
  clienteId,
  clienteNome,
  respostas,
  onUpdate,
}: AnamneseTabProps) {
  const [showNovaAnamneseDrawer, setShowNovaAnamneseDrawer] = useState(false);
  const [showDetalhesDrawer, setShowDetalhesDrawer] = useState(false);
  const [anamneseSelecionada, setAnamneseSelecionada] =
    useState<RespostaFormulario | null>(null);
  const [empresaData, setEmpresaData] = useState<any>(null);

  // Buscar dados da empresa
  useEffect(() => {
    const fetchEmpresa = async () => {
      try {
        const response = await fetch('/api/empresa', {
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          setEmpresaData(data.empresa);
        }
      } catch (error) {
        console.error('Erro ao buscar empresa:', error);
      }
    };
    fetchEmpresa();
  }, []);

  const handleVerDetalhes = (anamnese: RespostaFormulario) => {
    setAnamneseSelecionada(anamnese);
    setShowDetalhesDrawer(true);
  };

  const handleImprimir = (anamnese: RespostaFormulario) => {
    // Debug: verificar dados da empresa
    console.log('Dados da empresa para impressão:', empresaData);

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const respostas = anamnese.respostas || {};
    const dataFormatada = new Date(anamnese.createdAt).toLocaleDateString("pt-BR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    const horaFormatada = new Date(anamnese.createdAt).toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });

    // Formatar CNPJ
    const formatCNPJ = (cnpj: string) => {
      if (!cnpj || cnpj.startsWith('TEMP-')) return '';
      const numbers = cnpj.replace(/\D/g, '');
      if (numbers.length === 14) {
        return numbers.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
      }
      if (numbers.length === 11) {
        // CPF
        return numbers.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4');
      }
      return cnpj;
    };

    const formatLabel = (key: string): string => {
      const labels: Record<string, string> = {
        motivoConsulta: "Motivo da consulta",
        historicoMedico: "Histórico médico (doenças, cirurgias)",
        medicamentos: "Medicamentos em uso",
        alergias: "Alergias conhecidas",
        gestante: "Está gestante ou amamentando?",
        tratamentosAnteriores: "Tratamentos estéticos anteriores",
        expectativas: "Expectativas com o tratamento",
        cuidadosPele: "Rotina atual de cuidados com a pele",
        exposicaoSolar: "Exposição solar frequente?",
      };
      return labels[key] || key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase()).trim();
    };

    // Preparar dados da empresa
    const nomeEmpresa = empresaData?.nomeEmpresa || empresaData?.nomeFantasia || 'EMPRESA';
    const razaoSocial = empresaData?.razaoSocial && empresaData.razaoSocial !== nomeEmpresa ? empresaData.razaoSocial : '';
    const cnpjFormatado = formatCNPJ(empresaData?.documento || '');
    const endereco = empresaData?.enderecoCompleto ||
                     (empresaData && empresaData.logradouro ?
                       `${empresaData.logradouro}, ${empresaData.numero}${empresaData.complemento ? ' - ' + empresaData.complemento : ''} - ${empresaData.bairro}, ${empresaData.cidade}/${empresaData.estado} - CEP: ${empresaData.cep}`
                       : '');
    const telefone = empresaData?.telefone || '';
    const email = empresaData?.email || '';

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Anamnese - ${clienteNome}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          @page {
            margin: 1.5cm;
          }

          body {
            font-family: 'Courier New', monospace;
            color: #000;
            line-height: 1.4;
            font-size: 11pt;
          }

          .container {
            max-width: 800px;
            margin: 0 auto;
          }

          /* Cabeçalho da Empresa */
          .company-header {
            text-align: center;
            padding-bottom: 15px;
            margin-bottom: 20px;
            border-bottom: 2px solid #000;
          }

          .company-name {
            font-size: 16pt;
            font-weight: bold;
            margin-bottom: 5px;
          }

          .company-doc {
            font-size: 10pt;
            margin-bottom: 3px;
          }

          .company-address {
            font-size: 9pt;
            margin-bottom: 2px;
          }

          .company-contact {
            font-size: 9pt;
          }

          /* Título do Documento */
          .document-header {
            text-align: center;
            margin: 20px 0;
            padding: 10px 0;
            border-top: 1px solid #000;
            border-bottom: 1px solid #000;
          }

          .document-title {
            font-size: 14pt;
            font-weight: bold;
            text-transform: uppercase;
          }

          /* Informações do Paciente */
          .info-section {
            margin: 20px 0;
            border: 1px solid #000;
            padding: 10px;
          }

          .info-row {
            display: flex;
            margin-bottom: 8px;
            font-size: 10pt;
          }

          .info-label {
            font-weight: bold;
            width: 180px;
            flex-shrink: 0;
          }

          .info-value {
            flex: 1;
          }

          /* Campos do Formulário */
          .fields-section {
            margin: 20px 0;
          }

          .section-title {
            font-size: 11pt;
            font-weight: bold;
            text-transform: uppercase;
            margin: 20px 0 10px 0;
            padding-bottom: 5px;
            border-bottom: 1px solid #000;
          }

          .field-item {
            margin-bottom: 15px;
            page-break-inside: avoid;
            border: 1px solid #ccc;
            padding: 10px;
          }

          .field-label {
            font-weight: bold;
            font-size: 10pt;
            margin-bottom: 5px;
            text-transform: uppercase;
          }

          .field-value {
            font-size: 10pt;
            line-height: 1.5;
            white-space: pre-wrap;
            min-height: 20px;
            padding: 5px 0;
          }

          .field-value:empty::after {
            content: "(Não informado)";
            color: #666;
            font-style: italic;
          }

          /* Observações */
          .observations-section {
            margin: 20px 0;
            border: 2px solid #000;
            padding: 12px;
            page-break-inside: avoid;
          }

          .observations-title {
            font-weight: bold;
            font-size: 11pt;
            margin-bottom: 8px;
            text-transform: uppercase;
          }

          .observations-text {
            font-size: 10pt;
            line-height: 1.5;
            white-space: pre-wrap;
          }

          /* Rodapé */
          .footer {
            margin-top: 40px;
            padding-top: 15px;
            border-top: 1px solid #000;
          }

          .footer-info {
            font-size: 9pt;
            text-align: center;
            margin-bottom: 30px;
          }

          .signature-section {
            margin-top: 50px;
            display: flex;
            justify-content: space-between;
          }

          .signature-box {
            width: 45%;
            text-align: center;
          }

          .signature-line {
            border-top: 1px solid #000;
            margin-bottom: 5px;
            padding-top: 5px;
          }

          .signature-label {
            font-size: 9pt;
          }

          @media print {
            body {
              print-color-adjust: exact;
              -webkit-print-color-adjust: exact;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <!-- Cabeçalho da Empresa -->
          <div class="company-header">
            <div class="company-name">${nomeEmpresa}</div>
            ${razaoSocial ? `<div class="company-doc" style="font-size: 9pt; margin-bottom: 3px;">${razaoSocial}</div>` : ''}
            ${cnpjFormatado ? `<div class="company-doc">CNPJ: ${cnpjFormatado}</div>` : ''}
            ${endereco ? `<div class="company-address">${endereco}</div>` : ''}
            ${telefone || email ? `
              <div class="company-contact">
                ${telefone ? `Tel: ${telefone}` : ''}
                ${telefone && email ? ' | ' : ''}
                ${email ? `Email: ${email}` : ''}
              </div>
            ` : ''}
          </div>

          <!-- Título do Documento -->
          <div class="document-header">
            <div class="document-title">${anamnese.formulario.nome}</div>
          </div>

          <!-- Informações do Paciente -->
          <div class="info-section">
            <div class="info-row">
              <span class="info-label">PACIENTE:</span>
              <span class="info-value">${clienteNome}</span>
            </div>
            <div class="info-row">
              <span class="info-label">DATA DE PREENCHIMENTO:</span>
              <span class="info-value">${dataFormatada} às ${horaFormatada}</span>
            </div>
            <div class="info-row">
              <span class="info-label">DOCUMENTO Nº:</span>
              <span class="info-value">${anamnese.id.substring(0, 8).toUpperCase()}</span>
            </div>
          </div>

          <!-- Campos do Formulário -->
          <div class="fields-section">
            <div class="section-title">DADOS DO FORMULÁRIO</div>

            ${Object.entries(respostas).map(([key, value]) => `
              <div class="field-item">
                <div class="field-label">${formatLabel(key)}</div>
                <div class="field-value">${String(value)}</div>
              </div>
            `).join('')}
          </div>

          <!-- Observações -->
          ${anamnese.observacoes ? `
            <div class="observations-section">
              <div class="observations-title">OBSERVAÇÕES ADICIONAIS</div>
              <div class="observations-text">${anamnese.observacoes}</div>
            </div>
          ` : ''}

          <!-- Rodapé -->
          <div class="footer">
            <div class="footer-info">
              Documento gerado eletronicamente em ${new Date().toLocaleDateString("pt-BR")} às ${new Date().toLocaleTimeString("pt-BR")}
            </div>

            <div class="signature-section">
              <div class="signature-box">
                <div class="signature-line">_____________________________</div>
                <div class="signature-label">Assinatura do Profissional</div>
              </div>
              <div class="signature-box">
                <div class="signature-line">_____________________________</div>
                <div class="signature-label">Assinatura do Paciente</div>
              </div>
            </div>
          </div>
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 250);
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  if (respostas.length === 0) {
    return (
      <div className="relative max-w-lg mx-auto">
        {/* Borda de trás estática */}
        <div className="absolute inset-0 translate-x-2 translate-y-2 bg-white border border-gray-300 rounded-lg" />

        {/* Card principal */}
        <div className="relative bg-white border border-gray-300 rounded-lg shadow-[3px_3px_0px_#e5e7eb] p-8 sm:p-12 text-center">
          <div className="flex justify-center mb-4 sm:mb-6">
            <CardIcon size="xl" icon="file-description" color="#C5837B" />
          </div>
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
            Nenhuma anamnese registrada
          </h3>
          <p className="text-gray-500 mb-6 text-sm sm:text-base">
            Este cliente ainda não possui formulários preenchidos
          </p>
          <Button
            variant="primary"
            onClick={() => setShowNovaAnamneseDrawer(true)}
          >
            Preencher Anamnese
          </Button>
        </div>

        {/* Drawer de Nova Anamnese */}
        <NovaAnamneseDrawer
          isOpen={showNovaAnamneseDrawer}
          onClose={() => setShowNovaAnamneseDrawer(false)}
          clienteId={clienteId}
          onSuccess={onUpdate}
        />
      </div>
    );
  }

  const respostasOrdenadas = [...respostas].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          Histórico de Anamneses
        </h2>
        <Button
          variant="primary"
          onClick={() => setShowNovaAnamneseDrawer(true)}
          className="flex items-center gap-2"
        >
          <ClipboardList className="w-4 h-4" />
          Nova Anamnese
        </Button>
      </div>

      {respostasOrdenadas.map((resposta) => (
        <div key={resposta.id} className="bg-white border border-gray-300 rounded-lg shadow-[3px_3px_0px_#e5e7eb] overflow-hidden transition-all duration-200 hover:shadow-[5px_5px_0px_#C5837B] hover:border-[#C5837B]">
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
                  icon="file-description"
                  color="#C5837B"
                />
              </div>

              {/* Informações da anamnese */}
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-900 text-sm mb-1">
                  {resposta.formulario.nome}
                </h4>

                <div className="flex flex-wrap gap-2 text-xs text-gray-600 mb-1">
                  <span className="px-2 py-0.5 bg-[#C5837B]/10 text-[#C5837B] rounded-full font-medium">
                    Anamnese
                  </span>
                  <span>•</span>
                  <span>
                    {new Date(resposta.createdAt).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>

                {resposta.agendamento && (
                  <div className="flex items-center gap-1 text-xs text-gray-600 mb-1">
                    <Calendar className="w-3 h-3" />
                    <span>
                      Vinculado ao atendimento de{" "}
                      {new Date(resposta.agendamento.dataHora).toLocaleDateString(
                        "pt-BR",
                      )}
                    </span>
                  </div>
                )}

                {resposta.observacoes && (
                  <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                    {resposta.observacoes}
                  </p>
                )}
              </div>

              {/* Botões de ação */}
              <div className="flex items-center gap-2">
                <Tooltip content="Imprimir Anamnese" position="bottom">
                  <button
                    onClick={() => handleImprimir(resposta)}
                    className="p-2 text-gray-600 hover:text-[#C5837B] hover:bg-gray-100 rounded-lg transition-colors"
                    aria-label="Imprimir anamnese"
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                </Tooltip>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleVerDetalhes(resposta)}
                >
                  Ver Detalhes
                </Button>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Drawer de Nova Anamnese */}
      <NovaAnamneseDrawer
        isOpen={showNovaAnamneseDrawer}
        onClose={() => setShowNovaAnamneseDrawer(false)}
        clienteId={clienteId}
        onSuccess={onUpdate}
      />

      {/* Drawer de Detalhes */}
      <DetalhesAnamneseDrawer
        isOpen={showDetalhesDrawer}
        onClose={() => setShowDetalhesDrawer(false)}
        anamnese={anamneseSelecionada}
      />
    </div>
  );
}
