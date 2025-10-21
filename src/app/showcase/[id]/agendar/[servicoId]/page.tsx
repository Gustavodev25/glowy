"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Topbar from "@/app/components/Topbar";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Phone,
  Mail,
  User,
  CreditCard,
  CheckCircle,
  Star,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Building2,
  Plus,
  X,
} from "lucide-react";
import { Button } from "@/components/visual/Button";
import CardIcon from "@/components/visual/CardIcon";
import Input from "@/components/visual/Input";
import Select from "@/components/visual/Select";
import TextArea from "@/components/visual/TextArea";
import Modal from "@/components/Modal";
import { useToast } from "@/contexts/ToastContext";

interface Empresa {
  id: string;
  nome: string;
  logo: string;
  banner?: string;
  biografia: string;
  avaliacao: number;
  totalAvaliacoes: number;
  endereco: string;
  telefone: string;
  email: string;
  horario: string;
  horariosDetalhados?: Array<{
    dia: number;
    aberto: boolean;
    abertura: string;
    fechamento: string;
    intervaloInicio?: string;
    intervaloFim?: string;
  }>;
}

interface Servico {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
  duracao: string;
  imagem: string;
}

interface AgendamentoData {
  dataAgendamento: string;
  horarioAgendamento: string;
  observacoes: string;
  formaPagamento: string;
}

interface User {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
}

interface HorarioDisponivel {
  hora: string;
  disponivel: boolean;
  ocupado?: boolean;
}

interface DiaCalendario {
  data: string;
  dia: number;
  mes: number;
  ano: number;
  diaSemana: number;
  hoje: boolean;
  passado: boolean;
  horarios: HorarioDisponivel[];
}

export default function AgendamentoPage() {
  const params = useParams();
  const router = useRouter();
  const toast = useToast();

  const empresaId = params?.id as string;
  const servicoId = params?.servicoId as string;

  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  const [servico, setServico] = useState<Servico | null>(null);
  const [outrosServicos, setOutrosServicos] = useState<Servico[]>([]);
  const [todosServicos, setTodosServicos] = useState<Servico[]>([]);
  const [servicosAdicionais, setServicosAdicionais] = useState<Servico[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [modalServicosAberto, setModalServicosAberto] = useState(false);

  const [agendamentoData, setAgendamentoData] = useState<AgendamentoData>({
    dataAgendamento: "",
    horarioAgendamento: "",
    observacoes: "",
    formaPagamento: "dinheiro",
  });

  const [calendario, setCalendario] = useState<DiaCalendario[]>([]);
  const [mesAtual, setMesAtual] = useState(new Date());
  const [horariosOcupados, setHorariosOcupados] = useState<
    Record<string, string[]>
  >({});

  const formasPagamento = [
    { value: "dinheiro", label: "Dinheiro" },
    { value: "pix", label: "PIX" },
    { value: "cartao_debito", label: "Cartão de Débito" },
    { value: "cartao_credito", label: "Cartão de Crédito" },
  ];

  // Gerar horários disponíveis baseados nos horários da empresa
  const gerarHorariosDisponiveis = (
    diaSemana: number,
    data: string,
    horariosDetalhados?: Array<any>,
  ) => {
    const horarios: HorarioDisponivel[] = [];

    // Buscar configuração específica para o dia da semana
    const configuracaoDia = horariosDetalhados?.find(
      (h) => h.dia === diaSemana,
    );

    if (!configuracaoDia || !configuracaoDia.aberto) {
      return horarios; // Retorna array vazio se não trabalha neste dia
    }

    // Gerar horários baseados na configuração da empresa
    const horariosDisponiveis = gerarHorariosEntre(
      configuracaoDia.abertura,
      configuracaoDia.fechamento,
      configuracaoDia.intervaloInicio,
      configuracaoDia.intervaloFim,
    );

    // Verificar se há horários ocupados para esta data
    const ocupadosNoDia = horariosOcupados[data] || [];

    horariosDisponiveis.forEach((hora) => {
      horarios.push({
        hora,
        disponivel: true,
        ocupado: ocupadosNoDia.includes(hora),
      });
    });

    return horarios;
  };

  // Função auxiliar para gerar horários entre dois horários
  const gerarHorariosEntre = (
    inicio: string,
    fim: string,
    intervaloInicio?: string,
    intervaloFim?: string,
  ) => {
    const horarios: string[] = [];

    const [horaInicio, minutoInicio] = inicio.split(":").map(Number);
    const [horaFim, minutoFim] = fim.split(":").map(Number);

    let horaAtual = horaInicio;
    let minutoAtual = minutoInicio;

    while (
      horaAtual < horaFim ||
      (horaAtual === horaFim && minutoAtual < minutoFim)
    ) {
      const horarioAtual = `${horaAtual.toString().padStart(2, "0")}:${minutoAtual.toString().padStart(2, "0")}`;

      // Verificar se está no intervalo de almoço
      const noIntervalo =
        intervaloInicio &&
        intervaloFim &&
        horarioAtual >= intervaloInicio &&
        horarioAtual < intervaloFim;

      if (!noIntervalo) {
        horarios.push(horarioAtual);
      }

      // Avançar 30 minutos
      minutoAtual += 30;
      if (minutoAtual >= 60) {
        minutoAtual = 0;
        horaAtual++;
      }
    }

    return horarios;
  };

  // Função auxiliar para verificar se a empresa trabalha em um dia específico
  const empresaTrabalhaNoDia = (
    diaSemana: number,
    horariosDetalhados?: Array<any>,
  ) => {
    if (!horariosDetalhados || horariosDetalhados.length === 0) {
      return true; // Se não há configuração, assume que trabalha todos os dias
    }

    const configuracaoDia = horariosDetalhados.find((h) => h.dia === diaSemana);
    return configuracaoDia && configuracaoDia.aberto;
  };

  // Gerar calendário do mês
  const gerarCalendario = (data: Date) => {
    const ano = data.getFullYear();
    const mes = data.getMonth();
    const hoje = new Date();

    const primeiroDia = new Date(ano, mes, 1);
    const ultimoDia = new Date(ano, mes + 1, 0);
    const diasNoMes = ultimoDia.getDate();
    const primeiroDiaSemana = primeiroDia.getDay();

    const calendario: DiaCalendario[] = [];

    // Dias do mês anterior (para completar a primeira semana)
    for (let i = primeiroDiaSemana - 1; i >= 0; i--) {
      const diaAnterior = new Date(ano, mes, -i);
      calendario.push({
        data: diaAnterior.toISOString().split("T")[0],
        dia: diaAnterior.getDate(),
        mes: diaAnterior.getMonth(),
        ano: diaAnterior.getFullYear(),
        diaSemana: diaAnterior.getDay(),
        hoje: false,
        passado: true,
        horarios: [],
      });
    }

    // Dias do mês atual
    for (let dia = 1; dia <= diasNoMes; dia++) {
      const dataAtual = new Date(ano, mes, dia);
      const hoje = dataAtual.toDateString() === new Date().toDateString();
      const hojeLimite = new Date();
      hojeLimite.setHours(0, 0, 0, 0);
      const passado = dataAtual < hojeLimite;
      const diaSemana = dataAtual.getDay();

      // Verificar se a empresa trabalha neste dia
      const trabalhaNoDia = empresaTrabalhaNoDia(
        diaSemana,
        empresa?.horariosDetalhados,
      );

      const dataFormatada = dataAtual.toISOString().split("T")[0];

      calendario.push({
        data: dataFormatada,
        dia,
        mes,
        ano,
        diaSemana,
        hoje,
        passado: passado || !trabalhaNoDia,
        horarios: trabalhaNoDia
          ? gerarHorariosDisponiveis(
              diaSemana,
              dataFormatada,
              empresa?.horariosDetalhados,
            )
          : [],
      });
    }

    // Dias do próximo mês (para completar a última semana)
    const diasRestantes = 42 - calendario.length;
    for (let dia = 1; dia <= diasRestantes; dia++) {
      const proximoMes = new Date(ano, mes + 1, dia);
      calendario.push({
        data: proximoMes.toISOString().split("T")[0],
        dia,
        mes: proximoMes.getMonth(),
        ano: proximoMes.getFullYear(),
        diaSemana: proximoMes.getDay(),
        hoje: false,
        passado: false,
        horarios: [],
      });
    }

    return calendario;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Buscar dados do usuário logado
        const userResponse = await fetch("/api/auth/me", {
          credentials: "include",
        });
        if (userResponse.ok) {
          const userData = await userResponse.json();
          setUser(userData.user);
        } else {
          toast.error(
            "Faça login para agendar",
            "Você precisa estar logado para realizar um agendamento.",
          );
          router.push(`/showcase/${empresaId}`);
          return;
        }

        // Buscar dados da empresa
        const empresaResponse = await fetch(`/api/empresas/${empresaId}`);
        let empresaData = null;
        if (empresaResponse.ok) {
          empresaData = await empresaResponse.json();
          const empresa = empresaData.empresa || empresaData;
          setEmpresa(empresa);

          // Buscar todos os serviços da empresa (já vem junto com os dados da empresa)
          setTodosServicos(empresa.servicos || []);
          // Filtrar para não mostrar o serviço atual
          const outros = (empresa.servicos || []).filter(
            (s: Servico) => s.id !== servicoId,
          );
          setOutrosServicos(outros.slice(0, 3)); // Pegar apenas 3 serviços
        }

        // Buscar dados do serviço
        const servicoResponse = await fetch(`/api/servicos/${servicoId}`);
        if (servicoResponse.ok) {
          const servicoData = await servicoResponse.json();
          setServico(servicoData);
        }

        // Buscar horários ocupados do mês atual
        await fetchHorariosOcupados(mesAtual);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        toast.error(
          "Erro ao carregar dados",
          "Tente novamente ou entre em contato com o suporte.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [empresaId, servicoId, toast, router]);

  // Buscar horários ocupados quando mudar o mês
  useEffect(() => {
    if (empresa) {
      fetchHorariosOcupados(mesAtual);
    }
  }, [mesAtual, empresa]);

  const fetchHorariosOcupados = async (data: Date) => {
    try {
      const ano = data.getFullYear();
      const mes = data.getMonth() + 1;

      const response = await fetch(
        `/api/agendamentos/ocupados?empresaId=${empresaId}&ano=${ano}&mes=${mes}`,
      );
      if (response.ok) {
        const data = await response.json();
        setHorariosOcupados(data.horariosOcupados || {});
      }
    } catch (error) {
      console.error("Erro ao buscar horários ocupados:", error);
    }
  };

  useEffect(() => {
    setCalendario(gerarCalendario(mesAtual));
  }, [mesAtual, empresa]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error(
        "Usuário não autenticado",
        "Faça login para realizar o agendamento.",
      );
      return;
    }

    if (
      !agendamentoData.dataAgendamento ||
      !agendamentoData.horarioAgendamento
    ) {
      toast.error(
        "Campos obrigatórios",
        "Selecione a data e horário do agendamento.",
      );
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/agendamentos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          empresaId,
          servicoId,
          clienteNome: user.nome,
          clienteEmail: user.email,
          clienteTelefone: user.telefone || "",
          ...agendamentoData,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(
          "Agendamento realizado!",
          "Seu agendamento foi confirmado com sucesso.",
        );
        // Redirecionar para tela de confirmação
        router.push(`/agendamento/confirmacao/${data.agendamento.id}`);
      } else {
        const error = await response.json();
        toast.error(
          "Erro ao agendar",
          error.error || "Tente novamente ou entre em contato com o suporte.",
        );
      }
    } catch (error) {
      console.error("Erro ao agendar:", error);
      toast.error(
        "Erro ao agendar",
        "Verifique sua conexão e tente novamente.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (value: number): string => {
    return value.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const formatDate = (dateString: string): string => {
    if (!dateString) return "";
    const date = new Date(dateString + "T00:00:00");
    return date.toLocaleDateString("pt-BR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const nomesDiasSemana = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  const nomesMeses = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ];

  const navegarMes = (direcao: "anterior" | "proximo") => {
    const novoMes = new Date(mesAtual);
    if (direcao === "anterior") {
      novoMes.setMonth(novoMes.getMonth() - 1);
    } else {
      novoMes.setMonth(novoMes.getMonth() + 1);
    }
    setMesAtual(novoMes);
  };

  const selecionarData = (data: string) => {
    setAgendamentoData((prev) => ({ ...prev, dataAgendamento: data }));
  };

  const selecionarHorario = (hora: string) => {
    setAgendamentoData((prev) => ({ ...prev, horarioAgendamento: hora }));
  };

  const adicionarServico = (servico: Servico) => {
    // Verificar se o serviço já foi adicionado
    const jaAdicionado = servicosAdicionais.some((s) => s.id === servico.id);
    if (!jaAdicionado) {
      setServicosAdicionais((prev) => [...prev, servico]);
    }
  };

  const removerServico = (servicoId: string) => {
    setServicosAdicionais((prev) => prev.filter((s) => s.id !== servicoId));
  };

  const calcularTotal = () => {
    const precoServicoPrincipal = servico?.preco || 0;
    const precoServicosAdicionais = servicosAdicionais.reduce(
      (total, s) => total + s.preco,
      0,
    );
    return precoServicoPrincipal + precoServicosAdicionais;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <Topbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 h-96 bg-gray-200 rounded-2xl"></div>
              <div className="h-96 bg-gray-200 rounded-2xl"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!empresa || !servico) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <Topbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-16">
            <CardIcon size="xl" icon="alert" className="mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Serviço não encontrado
            </h1>
            <p className="text-gray-600 mb-6">
              O serviço solicitado não foi encontrado.
            </p>
            <Button onClick={() => router.back()} variant="outline">
              <ArrowLeft size={16} className="mr-2" />
              Voltar
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <Topbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            onClick={() => router.back()}
            variant="ghost"
            className="mb-4 flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            Voltar
          </Button>

          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Confirmar Agendamento
          </h1>
          <p className="text-gray-600">
            Escolha a data e horário, depois preencha suas informações
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Coluna Principal - Calendário (2/3) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Card 1: Calendário Grande */}
            <div className="relative">
              {/* Borda de trás */}
              <div className="absolute inset-1 translate-x-2 translate-y-2 rounded-2xl border border-gray-200 z-0 pointer-events-none"></div>

              {/* Card principal */}
              <div className="relative z-10 bg-white rounded-2xl border border-gray-200 overflow-hidden">
                {/* Header com gradiente */}
                <div className="relative p-4 pb-3 bg-gradient-to-br from-gray-50 to-white">
                  {/* Efeitos de fundo sutis */}
                  <span className="absolute top-0 right-0 w-32 h-32 bg-[#C5837B] rounded-full blur-3xl opacity-10" />

                  <div className="relative flex items-center gap-3">
                    <CardIcon
                      size="sm"
                      icon="calendar"
                      className="bg-[#C5837B]/10 flex-shrink-0"
                    />
                    <div>
                      <h3 className="text-base font-bold text-gray-900 mb-0.5">
                        Escolha a Data e Horário
                      </h3>
                      <p className="text-xs text-gray-600">
                        Selecione quando deseja ser atendido
                      </p>
                    </div>
                  </div>
                </div>

                {/* Calendário */}
                <div className="p-4">
                  {/* Navegação do mês */}
                  <div className="flex items-center justify-between mb-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navegarMes("anterior")}
                      className="p-1.5"
                    >
                      <ChevronLeft size={18} />
                    </Button>

                    <h4 className="text-base font-semibold text-gray-900">
                      {nomesMeses[mesAtual.getMonth()]} {mesAtual.getFullYear()}
                    </h4>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navegarMes("proximo")}
                      className="p-1.5"
                    >
                      <ChevronRight size={18} />
                    </Button>
                  </div>

                  {/* Dias da semana */}
                  <div className="grid grid-cols-7 gap-0.5 mb-2">
                    {nomesDiasSemana.map((dia) => (
                      <div
                        key={dia}
                        className="text-center text-xs font-medium text-gray-500 py-1"
                      >
                        {dia}
                      </div>
                    ))}
                  </div>

                  {/* Grid do calendário */}
                  <div className="grid grid-cols-7 gap-0.5 mb-4">
                    {calendario.map((dia, index) => {
                      const trabalhaNoDia = empresaTrabalhaNoDia(
                        dia.diaSemana,
                        empresa?.horariosDetalhados,
                      );
                      const diaPassado = dia.passado;
                      const naoDisponivel = !trabalhaNoDia && !diaPassado;

                      return (
                        <button
                          key={index}
                          onClick={() =>
                            !diaPassado &&
                            trabalhaNoDia &&
                            selecionarData(dia.data)
                          }
                          disabled={diaPassado || !trabalhaNoDia}
                          className={`
                            aspect-square p-1 text-xs rounded-md transition-all relative
                            ${
                              diaPassado
                                ? "text-gray-300 cursor-not-allowed"
                                : naoDisponivel
                                  ? "text-gray-400 cursor-not-allowed bg-gray-50"
                                  : dia.data === agendamentoData.dataAgendamento
                                    ? "bg-[#C5837B] text-white font-semibold"
                                    : dia.hoje
                                      ? "bg-[#C5837B]/20 text-[#C5837B] font-semibold hover:bg-[#C5837B]/30"
                                      : "text-gray-700 hover:bg-gray-100"
                            }
                          `}
                          title={
                            naoDisponivel
                              ? "Empresa não trabalha neste dia"
                              : ""
                          }
                        >
                          {dia.dia}
                          {naoDisponivel && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-0.5 h-0.5 bg-gray-400 rounded-full"></div>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Horários disponíveis */}
                  {agendamentoData.dataAgendamento && (
                    <div className="border-t border-gray-200 pt-4">
                      <h5 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5" />
                        Horários Disponíveis
                      </h5>

                      <div className="grid grid-cols-5 sm:grid-cols-6 gap-1.5">
                        {calendario
                          .find(
                            (dia) =>
                              dia.data === agendamentoData.dataAgendamento,
                          )
                          ?.horarios.map((horario, index) => (
                            <button
                              key={index}
                              onClick={() => selecionarHorario(horario.hora)}
                              disabled={!horario.disponivel || horario.ocupado}
                              className={`
                                p-2 text-xs rounded-md transition-all
                                ${
                                  !horario.disponivel || horario.ocupado
                                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                    : horario.hora ===
                                        agendamentoData.horarioAgendamento
                                      ? "bg-[#C5837B] text-white font-semibold"
                                      : "bg-gray-50 text-gray-700 hover:bg-[#C5837B]/10 hover:text-[#C5837B]"
                                }
                              `}
                            >
                              {horario.hora}
                            </button>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Coluna Lateral - Resumo e Serviços (1/3) */}
          <div className="space-y-6">
            {/* Card: Resumo do Agendamento */}
            <div className="relative">
              {/* Borda de trás */}
              <div className="absolute inset-1 translate-x-2 translate-y-2 rounded-2xl border border-gray-200 z-0 pointer-events-none"></div>

              {/* Card principal */}
              <div className="relative z-10 bg-white rounded-2xl border border-gray-200 overflow-hidden">
                {/* Header com gradiente */}
                <div className="relative p-4 pb-3 bg-gradient-to-br from-gray-50 to-white">
                  <span className="absolute top-0 right-0 w-32 h-32 bg-[#C5837B] rounded-full blur-3xl opacity-10" />

                  <div className="relative flex items-center gap-3">
                    <CardIcon
                      size="sm"
                      icon="sparkles"
                      className="bg-[#C5837B]/10 flex-shrink-0"
                    />
                    <div>
                      <h3 className="text-base font-bold text-gray-900 mb-0.5">
                        Seu Agendamento
                      </h3>
                      <p className="text-xs text-gray-600">
                        Revise os detalhes
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 space-y-4">
                  {/* Card do Serviço Selecionado - Uma Linha Compacta */}
                  <div className="relative group">
                    {/* Borda de trás interna */}
                    <div className="absolute inset-0.5 translate-x-1 translate-y-1 rounded-lg border border-gray-100 z-0 pointer-events-none"></div>

                    {/* Card do serviço - Layout inline */}
                    <div className="relative z-10 bg-gradient-to-r from-gray-50 to-transparent rounded-lg border border-gray-200 p-3">
                      {/* Efeito de brilho sutil */}
                      <span className="absolute inset-0 bg-gradient-to-r from-gray-100/50 to-transparent rounded-lg opacity-50" />

                      {/* Conteúdo inline */}
                      <div className="relative z-10 flex items-center gap-3">
                        {/* Imagem do serviço + Nome */}
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <img
                            src={servico.imagem}
                            alt={servico.nome}
                            className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                          />
                          <div className="min-w-0">
                            <h4 className="font-bold text-gray-900 text-sm truncate">
                              {servico.nome}
                            </h4>
                            <div className="flex items-center gap-2 mt-0.5">
                              <div className="flex items-center gap-1 text-xs text-gray-600">
                                <Clock className="w-3 h-3" />
                                {servico.duracao}
                              </div>
                              <span className="text-xs text-gray-400">•</span>
                              <span className="text-sm font-bold text-gray-900 font-mono">
                                R$ {formatCurrency(servico.preco)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Botão para incluir novos serviços */}
                  <div className="pt-3 border-t border-gray-200">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full flex items-center justify-center gap-2"
                      onClick={() => setModalServicosAberto(true)}
                    >
                      <Plus className="w-4 h-4" />
                      Incluir Novo Serviço
                    </Button>
                  </div>

                  {/* Serviços adicionais */}
                  {servicosAdicionais.length > 0 && (
                    <div className="space-y-2 pt-3 border-t border-gray-200">
                      <h5 className="text-xs font-semibold text-gray-700 mb-2">
                        Serviços Adicionais
                      </h5>
                      {servicosAdicionais.map((servicoAdicional) => (
                        <div
                          key={servicoAdicional.id}
                          className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg"
                        >
                          <img
                            src={servicoAdicional.imagem}
                            alt={servicoAdicional.nome}
                            className="w-8 h-8 rounded-lg object-cover flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <h6 className="font-medium text-gray-900 text-xs truncate">
                              {servicoAdicional.nome}
                            </h6>
                            <div className="flex items-center gap-2 mt-0.5">
                              <div className="flex items-center gap-1 text-xs text-gray-600">
                                <Clock className="w-3 h-3" />
                                {servicoAdicional.duracao}
                              </div>
                              <span className="text-xs text-gray-400">•</span>
                              <span className="text-xs font-bold text-gray-900 font-mono">
                                R$ {formatCurrency(servicoAdicional.preco)}
                              </span>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="p-1 h-6 w-6"
                            onClick={() => removerServico(servicoAdicional.id)}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Informações do Agendamento */}
                  {agendamentoData.dataAgendamento &&
                    agendamentoData.horarioAgendamento && (
                      <div className="space-y-2 pt-3 border-t border-gray-200">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-[#C5837B]/10 flex items-center justify-center flex-shrink-0">
                            <Calendar className="w-4 h-4 text-[#C5837B]" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-500">Data</p>
                            <p className="text-xs font-semibold text-gray-900 capitalize truncate">
                              {formatDate(agendamentoData.dataAgendamento)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-[#C5837B]/10 flex items-center justify-center flex-shrink-0">
                            <Clock className="w-4 h-4 text-[#C5837B]" />
                          </div>
                          <div className="flex-1">
                            <p className="text-xs text-gray-500">Horário</p>
                            <p className="text-xs font-semibold text-gray-900">
                              {agendamentoData.horarioAgendamento}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                  {/* Informações do Cliente */}
                  {user && (
                    <div className="pt-3 border-t border-gray-200">
                      <div className="flex items-center gap-2 mb-2">
                        <User className="w-3.5 h-3.5 text-gray-500" />
                        <span className="text-xs font-semibold text-gray-900">
                          Seus Dados
                        </span>
                      </div>
                      <div className="space-y-1.5 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Nome:</span>
                          <span className="font-medium text-gray-900">
                            {user.nome}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Email:</span>
                          <span className="font-medium text-gray-900 truncate ml-2">
                            {user.email}
                          </span>
                        </div>
                        {user.telefone && (
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Telefone:</span>
                            <span className="font-medium text-gray-900">
                              {user.telefone}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Card: Informações da Empresa */}
            <div className="relative">
              {/* Borda de trás */}
              <div className="absolute inset-1 translate-x-2 translate-y-2 rounded-2xl border border-gray-200 z-0 pointer-events-none"></div>

              {/* Card principal */}
              <div className="relative z-10 bg-white rounded-2xl border border-gray-200 overflow-hidden">
                {/* Header */}
                <div className="relative p-4 bg-gradient-to-br from-gray-50 to-white">
                  <span className="absolute top-0 right-0 w-32 h-32 bg-[#C5837B] rounded-full blur-3xl opacity-10" />

                  <div className="relative flex items-center gap-3">
                    <CardIcon
                      size="sm"
                      className="bg-[#C5837B]/10 flex-shrink-0"
                      circular={true}
                    >
                      <img
                        src={empresa.logo}
                        alt={empresa.nome}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    </CardIcon>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-bold text-gray-900 truncate">
                        {empresa.nome}
                      </h3>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Star
                          size={12}
                          className="fill-amber-400 text-amber-400"
                        />
                        <span className="text-xs font-semibold text-gray-900">
                          {empresa.avaliacao.toFixed(1)}
                        </span>
                        <span className="text-xs text-gray-500">
                          ({empresa.totalAvaliacoes})
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Informações */}
                <div className="p-4 space-y-2">
                  <div className="flex items-start gap-2 text-xs">
                    <MapPin className="w-3 h-3 text-gray-400 flex-shrink-0 mt-0.5" />
                    <p className="text-gray-600">{empresa.endereco}</p>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <Phone className="w-3 h-3 text-gray-400" />
                    <p className="text-gray-600">{empresa.telefone}</p>
                  </div>
                  <div className="flex items-start gap-2 text-xs">
                    <Mail className="w-3 h-3 text-gray-400 flex-shrink-0 mt-0.5" />
                    <p className="text-gray-600 break-all">{empresa.email}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Card: Finalizar Agendamento */}
            <div className="relative">
              {/* Borda de trás */}
              <div className="absolute inset-1 translate-x-2 translate-y-2 rounded-2xl border border-gray-200 z-0 pointer-events-none"></div>

              {/* Card principal */}
              <div className="relative z-10 bg-white rounded-2xl border border-gray-200 overflow-hidden">
                {/* Header compacto */}
                <div className="relative p-4 bg-gradient-to-br from-gray-50 to-white">
                  <span className="absolute top-0 right-0 w-32 h-32 bg-[#C5837B] rounded-full blur-3xl opacity-10" />

                  <div className="relative flex items-center gap-3">
                    <CardIcon
                      size="sm"
                      icon="alert"
                      className="bg-[#C5837B]/10 flex-shrink-0"
                    />
                    <div>
                      <h3 className="text-base font-bold text-gray-900">
                        Finalizar Agendamento
                      </h3>
                      <p className="text-xs text-gray-600">
                        Confirme seus dados
                      </p>
                    </div>
                  </div>
                </div>

                {/* Conteúdo compacto */}
                <form onSubmit={handleSubmit} className="p-4 space-y-3">
                  <Select
                    label="Forma de Pagamento"
                    value={agendamentoData.formaPagamento}
                    onChange={(value) =>
                      setAgendamentoData((prev) => ({
                        ...prev,
                        formaPagamento: value,
                      }))
                    }
                    options={formasPagamento}
                    placeholder="Escolha"
                  />

                  <TextArea
                    label="Observações (opcional)"
                    value={agendamentoData.observacoes}
                    onChange={(e) =>
                      setAgendamentoData((prev) => ({
                        ...prev,
                        observacoes: e.target.value,
                      }))
                    }
                    placeholder="Alguma observação?"
                    rows={2}
                  />

                  {/* Botão de confirmar */}
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    className="w-full"
                    disabled={
                      !agendamentoData.dataAgendamento ||
                      !agendamentoData.horarioAgendamento
                    }
                    isLoading={submitting}
                  >
                    Confirmar Agendamento
                  </Button>

                  <p className="text-xs text-gray-500 text-center">
                    Ao confirmar, você concorda com os termos de agendamento.
                  </p>
                </form>
              </div>
            </div>

            {/* Card: Outros Serviços */}
            {outrosServicos.length > 0 && (
              <div className="relative">
                {/* Borda de trás */}
                <div className="absolute inset-1 translate-x-2 translate-y-2 rounded-2xl border border-gray-200 z-0 pointer-events-none"></div>

                {/* Card principal */}
                <div className="relative z-10 bg-white rounded-2xl border border-gray-200 overflow-hidden">
                  {/* Header */}
                  <div className="relative p-6 pb-4 bg-gradient-to-br from-gray-50 to-white">
                    <span className="absolute top-0 right-0 w-32 h-32 bg-[#C5837B] rounded-full blur-3xl opacity-10" />

                    <div className="relative flex items-center gap-3">
                      <CardIcon
                        size="md"
                        icon="sparkles"
                        className="bg-[#C5837B]/10 flex-shrink-0"
                      />
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">
                          Outros Serviços
                        </h3>
                        <p className="text-sm text-gray-600">
                          Você também pode gostar
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Lista de serviços */}
                  <div className="p-6 space-y-4">
                    {outrosServicos.map((outroServico) => (
                      <div
                        key={outroServico.id}
                        onClick={() =>
                          router.push(
                            `/showcase/${empresaId}/agendar/${outroServico.id}`,
                          )
                        }
                        className="group cursor-pointer"
                      >
                        <div className="flex gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100 hover:border-[#C5837B]/30 hover:bg-[#C5837B]/5 transition-all">
                          <img
                            src={outroServico.imagem}
                            alt={outroServico.nome}
                            className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900 text-sm mb-1 truncate group-hover:text-[#C5837B] transition-colors">
                              {outroServico.nome}
                            </h4>
                            <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                              {outroServico.descricao}
                            </p>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <Clock className="w-3 h-3" />
                                {outroServico.duracao}
                              </div>
                              <span className="text-sm font-bold text-[#C5837B]">
                                R$ {formatCurrency(outroServico.preco)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => router.push(`/showcase/${empresaId}`)}
                    >
                      Ver Todos os Serviços
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Seleção de Serviços */}
      <Modal
        isOpen={modalServicosAberto}
        onClose={() => setModalServicosAberto(false)}
        title="Selecionar Serviços Adicionais"
        maxWidth="2xl"
      >
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {todosServicos
              .filter((s) => s.id !== servicoId) // Excluir o serviço principal
              .map((servicoItem) => {
                const jaAdicionado = servicosAdicionais.some(
                  (s) => s.id === servicoItem.id,
                );
                return (
                  <div
                    key={servicoItem.id}
                    className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                      jaAdicionado
                        ? "border-green-300 bg-green-50"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                    onClick={() =>
                      jaAdicionado
                        ? removerServico(servicoItem.id)
                        : adicionarServico(servicoItem)
                    }
                  >
                    <div className="flex items-start gap-3">
                      <img
                        src={servicoItem.imagem}
                        alt={servicoItem.nome}
                        className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 text-sm mb-1 truncate">
                          {servicoItem.nome}
                        </h4>
                        <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                          {servicoItem.descricao}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Clock className="w-3 h-3" />
                            {servicoItem.duracao}
                          </div>
                          <span className="text-sm font-bold text-gray-900">
                            R$ {formatCurrency(servicoItem.preco)}
                          </span>
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        {jaAdicionado ? (
                          <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                            <CheckCircle className="w-4 h-4 text-white" />
                          </div>
                        ) : (
                          <div className="w-6 h-6 rounded-full border-2 border-gray-300 flex items-center justify-center">
                            <Plus className="w-4 h-4 text-gray-400" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>

          {/* Resumo do total */}
          {servicosAdicionais.length > 0 && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-gray-900">
                  Total dos Serviços Adicionais:
                </span>
                <span className="text-lg font-bold text-gray-900">
                  R${" "}
                  {formatCurrency(
                    servicosAdicionais.reduce((total, s) => total + s.preco, 0),
                  )}
                </span>
              </div>
            </div>
          )}

          {/* Botões de ação */}
          <div className="flex gap-3 mt-6">
            <Button
              variant="outline"
              onClick={() => setModalServicosAberto(false)}
              className="flex-1"
            >
              Fechar
            </Button>
            <Button
              variant="primary"
              onClick={() => setModalServicosAberto(false)}
              className="flex-1"
            >
              Confirmar Seleção
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
