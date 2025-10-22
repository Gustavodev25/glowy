"use client";

import { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Calendar,
  Settings,
  X,
  User,
  Phone,
  Mail,
  Clock,
  CheckCircle,
  Search,
  Filter,
} from "lucide-react";
import BookLoader from "@/components/BookLoader";
import { Button } from "@/components/visual/Button";
import Modal from "@/components/Modal";
import { useToast } from "@/contexts/ToastContext";
import PageHeader from "@/components/PageHeader";
import CardIcon from "@/components/visual/CardIcon";
import Input from "@/components/visual/Input";
import Select from "@/components/visual/Select";

interface ScheduleItem {
  id: string;
  label: string;
  checked: boolean;
}

interface Category {
  id: string;
  label: string;
  color: string;
  count: number;
}

interface CalendarEvent {
  id: string;
  title: string;
  time: string;
  color: string;
  day: number;
  startHour: number;
  endHour: number;
  attendees: number;
  agendamento?: Agendamento;
}

interface Agendamento {
  id: string;
  empresaId: string;
  servicoId: string;
  clienteId: string;
  dataHora: string;
  duracao: number;
  valor: string;
  status: string;
  observacoes?: string;
  cliente: {
    id: string;
    nome: string;
    email: string;
    telefone: string;
    avatarUrl?: string;
  };
  servico: {
    id: string;
    nome: string;
    descricao: string;
    duracao: number;
    preco: string;
    imageUrl?: string;
  };
}

export default function MinhaAgendaPage() {
  const toast = useToast();
  const [scheduleExpanded, setScheduleExpanded] = useState(true);
  const [categoriesExpanded, setCategoriesExpanded] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [viewMode, setViewMode] = useState<
    "Day" | "Week" | "Month" | "List" | "Agenda"
  >("Week");
  const [loading, setLoading] = useState(true);
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [selectedAgendamento, setSelectedAgendamento] =
    useState<Agendamento | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Estados de filtro e busca
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroServico, setFiltroServico] = useState<string>("todos");
  const [filtroStatus, setFiltroStatus] = useState<string>("todos");

  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([
    { id: "1", label: "Agendar Reunião", checked: false },
    { id: "2", label: "Revisão de Projeto", checked: false },
    { id: "3", label: "Reunião Online", checked: false },
    { id: "4", label: "Intervalo", checked: false },
    { id: "5", label: "Café", checked: false },
    { id: "6", label: "Outros", checked: false },
  ]);

  const [categories] = useState<Category[]>([
    { id: "1", label: "Trabalho", color: "#F97316", count: 18 },
    { id: "2", label: "Pessoal", color: "#6366F1", count: 12 },
    { id: "3", label: "Intervalos", color: "#DC2626", count: 14 },
  ]);

  const [events, setEvents] = useState<CalendarEvent[]>([]);

  // Componentes SVG para badges
  const ClockIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" />
      <path d="M12 12l3 2" />
      <path d="M12 7v5" />
    </svg>
  );

  const ChecksIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M7 12l5 5l10 -10" />
      <path d="M2 12l5 5m5 -5l5 -5" />
    </svg>
  );

  const XIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M18 6l-12 12" />
      <path d="M6 6l12 12" />
    </svg>
  );

  // Filtrar agendamentos por busca, serviço e status
  const agendamentosFiltrados = agendamentos.filter((ag) => {
    const dataAg = new Date(ag.dataHora);
    const matchMonth =
      dataAg.getMonth() === currentMonth.getMonth() &&
      dataAg.getFullYear() === currentMonth.getFullYear();

    if (!matchMonth) return false;

    // Filtro de busca
    const matchSearch =
      searchTerm === "" ||
      ag.cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ag.cliente.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ag.cliente.telefone.includes(searchTerm);

    // Filtro de serviço
    const matchServico =
      filtroServico === "todos" || ag.servicoId === filtroServico;

    // Filtro de status
    const matchStatus = filtroStatus === "todos" || ag.status === filtroStatus;

    return matchSearch && matchServico && matchStatus;
  });

  // Filtrar agendamentos por status e mês atual
  const agendamentosPendentes = agendamentosFiltrados.filter(
    (ag) => ag.status === "agendado",
  );
  const agendamentosConfirmados = agendamentosFiltrados.filter(
    (ag) => ag.status === "confirmado",
  );
  const agendamentosCancelados = agendamentosFiltrados.filter(
    (ag) => ag.status === "cancelado",
  );

  // Função para gerar iniciais do nome
  const getInitials = (nome: string) => {
    const names = nome.split(" ");
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return nome.substring(0, 2).toUpperCase();
  };

  // Função para gerar cor única baseada no ID do usuário
  const getUserColor = (userId: string) => {
    // Paleta de cores suaves e harmoniosas com opacidade de 20%
    const colors = [
      { bg: "rgba(197, 131, 123, 0.2)", text: "#7C4A3F" }, // Rosa/Terracota - cor padrão
      { bg: "rgba(99, 102, 241, 0.2)", text: "#4338CA" }, // Indigo
      { bg: "rgba(249, 115, 22, 0.2)", text: "#C2410C" }, // Laranja
      { bg: "rgba(34, 197, 94, 0.2)", text: "#15803D" }, // Verde
      { bg: "rgba(236, 72, 153, 0.2)", text: "#BE185D" }, // Rosa
      { bg: "rgba(168, 85, 247, 0.2)", text: "#7C3AED" }, // Roxo
      { bg: "rgba(14, 165, 233, 0.2)", text: "#0369A1" }, // Azul
      { bg: "rgba(234, 179, 8, 0.2)", text: "#A16207" }, // Amarelo
      { bg: "rgba(20, 184, 166, 0.2)", text: "#0F766E" }, // Teal
      { bg: "rgba(244, 63, 94, 0.2)", text: "#BE123C" }, // Vermelho
      { bg: "rgba(139, 92, 246, 0.2)", text: "#6D28D9" }, // Violeta
      { bg: "rgba(59, 130, 246, 0.2)", text: "#1D4ED8" }, // Azul claro
    ];

    // Gerar um índice baseado no hash do userId
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      hash = userId.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;

    return colors[index];
  };

  // Função para renderizar avatar do cliente
  const renderClientAvatar = (cliente: Agendamento["cliente"]) => {
    if (cliente.avatarUrl) {
      return (
        <div className="flex-shrink-0 w-10 h-10 rounded-full overflow-hidden">
          <img
            src={cliente.avatarUrl}
            alt={`Avatar de ${cliente.nome}`}
            className="w-full h-full object-cover"
          />
        </div>
      );
    }

    const color = getUserColor(cliente.id);

    return (
      <div
        className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
        style={{ backgroundColor: color.bg }}
      >
        <span className="text-sm font-semibold" style={{ color: color.text }}>
          {getInitials(cliente.nome)}
        </span>
      </div>
    );
  };

  useEffect(() => {
    fetchAgendamentos();
  }, [currentMonth]);

  const fetchAgendamentos = async () => {
    try {
      setLoading(true);

      // Buscar todos os agendamentos (sem filtro de status)
      const response = await fetch(`/api/agendamentos/empresa/meus`, {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setAgendamentos(data.agendamentos || []);
        convertToCalendarEvents(data.agendamentos || []);
      } else if (response.status === 401) {
        console.warn("⚠️ Erro de autenticação (401) - Sessão inválida");
        const errorData = await response.json();

        if (errorData.error?.includes("não encontrada")) {
          // Sessão não existe no banco - precisa fazer login novamente
          toast.error(
            "Sessão Expirada",
            "Por favor, faça login novamente. Redirecionando...",
          );
          setTimeout(() => {
            // Limpar cookie e redirecionar
            document.cookie =
              "auth=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
            window.location.href = "/login";
          }, 2000);
        }
        setAgendamentos([]);
      } else {
        console.error("❌ Erro na resposta:", response.status);
        toast.error("Erro", "Não foi possível carregar os agendamentos");
        setAgendamentos([]);
      }
    } catch (error) {
      console.error("❌ Erro ao buscar agendamentos:", error);
      toast.error("Erro", "Erro de conexão ao buscar agendamentos");
    } finally {
      setLoading(false);
    }
  };

  const getStartOfWeek = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  };

  const convertToCalendarEvents = (agendamentos: Agendamento[]) => {
    const events = agendamentos.map((ag) => {
      const date = new Date(ag.dataHora);
      const hours = date.getHours();
      const minutes = date.getMinutes();
      const startHour = hours + minutes / 60;
      const endHour = startHour + ag.duracao / 60;
      const dayOfWeek = date.getDay();

      return {
        id: ag.id,
        title: `${date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })} ${ag.servico.nome}`,
        time: date.toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        color: getColorByStatus(ag.status),
        day: dayOfWeek,
        startHour,
        endHour,
        attendees: 1,
        agendamento: ag,
      };
    });

    setEvents(events);
  };

  const getColorByStatus = (status: string) => {
    const colors: Record<string, string> = {
      agendado: "#F59E0B", // Laranja
      confirmado: "#10B981", // Verde
      em_atendimento: "#6366F1", // Azul
      concluido: "#6B7280", // Cinza
      cancelado: "#DC2626", // Vermelho
    };
    return colors[status] || "#F97316";
  };

  const handleEventClick = (event: CalendarEvent) => {
    if (event.agendamento) {
      setSelectedAgendamento(event.agendamento);
      setModalOpen(true);
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    if (!selectedAgendamento) return;

    try {
      setUpdating(true);
      const response = await fetch(
        `/api/agendamentos/${selectedAgendamento.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ status: newStatus }),
        },
      );

      if (response.ok) {
        toast.success("Sucesso", "Agendamento atualizado com sucesso!");
        setModalOpen(false);
        fetchAgendamentos(); // Recarregar dados
      } else {
        toast.error("Erro", "Não foi possível atualizar o agendamento");
      }
    } catch (error) {
      console.error("Erro ao atualizar:", error);
      toast.error("Erro", "Erro ao atualizar agendamento");
    } finally {
      setUpdating(false);
    }
  };

  const toggleScheduleItem = (id: string) => {
    setScheduleItems((items) =>
      items.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item,
      ),
    );
  };

  // Função para contar agendamentos em um dia específico
  const getAgendamentosCountForDay = (date: Date) => {
    return agendamentos.filter((ag) => {
      const agDate = new Date(ag.dataHora);
      return (
        agDate.getDate() === date.getDate() &&
        agDate.getMonth() === date.getMonth() &&
        agDate.getFullYear() === date.getFullYear()
      );
    }).length;
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Dias do mês anterior
    const prevMonth = new Date(year, month - 1, 0);
    const prevMonthYear = month === 0 ? year - 1 : year;
    const prevMonthIndex = month === 0 ? 11 : month - 1;
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const dayNum = prevMonth.getDate() - i;
      days.push({
        day: dayNum,
        date: new Date(prevMonthYear, prevMonthIndex, dayNum),
        isCurrentMonth: false,
        isToday: false,
      });
    }

    // Dias do mês atual
    const today = new Date();
    for (let day = 1; day <= daysInMonth; day++) {
      const isToday =
        day === today.getDate() &&
        month === today.getMonth() &&
        year === today.getFullYear();

      days.push({
        day,
        date: new Date(year, month, day),
        isCurrentMonth: true,
        isToday,
      });
    }

    // Dias do próximo mês para completar a grade
    const remainingDays = 42 - days.length;
    const nextMonthYear = month === 11 ? year + 1 : year;
    const nextMonthIndex = month === 11 ? 0 : month + 1;
    for (let day = 1; day <= remainingDays; day++) {
      days.push({
        day,
        date: new Date(nextMonthYear, nextMonthIndex, day),
        isCurrentMonth: false,
        isToday: false,
      });
    }

    return days;
  };

  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 8; hour <= 20; hour++) {
      slots.push(`${hour.toString().padStart(2, "0")}:00`);
    }
    return slots;
  };

  const getWeekDays = () => {
    // Usar currentMonth em vez de today para respeitar o mês selecionado
    const refDate = new Date(currentMonth);
    const currentDay = refDate.getDay();
    const startOfWeek = new Date(refDate);
    startOfWeek.setDate(
      refDate.getDate() - currentDay + (currentDay === 0 ? -6 : 1),
    ); // Segunda-feira

    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      weekDays.push({
        date: day,
        dayNumber: day.getDate(),
        month: day.getMonth(),
      });
    }
    return weekDays;
  };

  const getDayView = () => {
    return [
      {
        date: new Date(currentMonth),
        dayNumber: currentMonth.getDate(),
        month: currentMonth.getMonth(),
      },
    ];
  };

  const getMonthDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      days.push({
        date,
        dayNumber: day,
        month,
      });
    }
    return days;
  };

  // Escolher dias baseado no modo de visualização
  const getDisplayDays = () => {
    if (viewMode === "Day") return getDayView();
    if (viewMode === "Month") return getMonthDays();
    return getWeekDays(); // Week
  };

  const displayDays = getDisplayDays();
  const timeSlots = generateTimeSlots();
  const calendarDays = getDaysInMonth(currentMonth);

  return (
    <div className="min-h-screen bg-gray-50">
      <style jsx global>{`
        * {
          transition-property:
            background-color, border-color, color, fill, stroke, opacity,
            box-shadow, transform;
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
          transition-duration: 150ms;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
      <PageHeader
        title="Minha Agenda"
        description="Visualize e gerencie todos os seus agendamentos"
      />

      {/* Barra de Busca e Filtros */}
      <div className="px-4 md:px-6 pt-4 pb-2">
        <div className="flex flex-col md:flex-row gap-3 md:justify-between">
          {/* Campo de Busca */}
          <div className="w-full md:w-auto md:flex-1 md:max-w-md relative">
            <Search className="absolute left-7 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 z-10 pointer-events-none" />
            <Input
              type="text"
              placeholder="Buscar por nome, email ou telefone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-14"
              containerClassName="w-full"
            />
          </div>

          {/* Filtros do lado direito */}
          <div className="flex flex-col md:flex-row gap-3">
            {/* Filtro de Serviço */}
            <div className="min-w-[200px]">
              <Select
                value={filtroServico}
                onChange={(value) => setFiltroServico(value)}
                options={[
                  { value: "todos", label: "Todos os Serviços" },
                  ...Array.from(
                    new Set(agendamentos.map((ag) => ag.servico.nome)),
                  ).map((servico) => {
                    const servicoObj = agendamentos.find(
                      (ag) => ag.servico.nome === servico,
                    )?.servico;
                    return {
                      value: servicoObj?.id || "",
                      label: servico,
                    };
                  }),
                ]}
                placeholder="Todos os Serviços"
                containerClassName="w-full"
              />
            </div>

            {/* Filtro de Status */}
            <div className="min-w-[180px]">
              <Select
                value={filtroStatus}
                onChange={(value) => setFiltroStatus(value)}
                options={[
                  { value: "todos", label: "Todos os Status" },
                  { value: "agendado", label: "Pendentes" },
                  { value: "confirmado", label: "Confirmados" },
                  { value: "concluido", label: "Concluídos" },
                  { value: "cancelado", label: "Cancelados" },
                ]}
                placeholder="Todos os Status"
                containerClassName="w-full"
              />
            </div>

            {/* Botão de Limpar Filtros */}
            {(searchTerm !== "" ||
              filtroServico !== "todos" ||
              filtroStatus !== "todos") && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setFiltroServico("todos");
                  setFiltroStatus("todos");
                }}
                className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-medium flex items-center gap-2 self-start"
              >
                <X className="w-4 h-4" />
                Limpar
              </button>
            )}
          </div>
        </div>

        {/* Contador de Resultados */}
        {(searchTerm !== "" ||
          filtroServico !== "todos" ||
          filtroStatus !== "todos") && (
          <div className="mt-3 text-sm text-gray-600">
            Mostrando{" "}
            <span className="font-semibold text-gray-900">
              {agendamentosFiltrados.length}
            </span>{" "}
            de{" "}
            <span className="font-semibold text-gray-900">
              {
                agendamentos.filter((ag) => {
                  const dataAg = new Date(ag.dataHora);
                  return (
                    dataAg.getMonth() === currentMonth.getMonth() &&
                    dataAg.getFullYear() === currentMonth.getFullYear()
                  );
                }).length
              }
            </span>{" "}
            agendamentos
          </div>
        )}
      </div>

      <div className="px-4 md:px-6 pt-2 pb-6">
        <div className="flex flex-col lg:flex-row gap-6 h-auto lg:h-[calc(100vh-140px)]">
          {/* Left Column - Lista de Agendamentos Pendentes */}
          <div className="w-full lg:w-96 space-y-4 overflow-y-auto pr-2 hide-scrollbar max-h-[600px] lg:max-h-none">
            {/* Mini Calendar */}
            <div className="relative">
              {/* Borda de trás estática */}
              <div className="absolute inset-1 translate-x-2 translate-y-2 rounded-lg border border-gray-200 z-0 pointer-events-none"></div>
              {/* Card principal */}
              <div className="relative z-10 bg-white rounded-lg border border-gray-200 shadow-sm">
                <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CardIcon icon="calendar" color="#C5837B" size="md" />
                      <div>
                        <div className="font-semibold text-gray-900">
                          Calendário
                        </div>
                        <div className="text-sm text-gray-500">
                          Visualização mensal
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mini Calendar */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900">
                      {currentMonth.toLocaleDateString("pt-BR", {
                        month: "long",
                        year: "numeric",
                      })}
                    </h3>
                    <div className="flex gap-1">
                      <button
                        onClick={() =>
                          setCurrentMonth(
                            new Date(
                              currentMonth.getFullYear(),
                              currentMonth.getMonth() - 1,
                            ),
                          )
                        }
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() =>
                          setCurrentMonth(
                            new Date(
                              currentMonth.getFullYear(),
                              currentMonth.getMonth() + 1,
                            ),
                          )
                        }
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Calendar Grid */}
                  <div className="grid grid-cols-7 gap-1 text-xs">
                    {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map(
                      (day) => (
                        <div
                          key={day}
                          className="text-center text-gray-500 font-medium py-2"
                        >
                          {day}
                        </div>
                      ),
                    )}
                    {calendarDays.map((dayData, index) => {
                      const count = dayData.isCurrentMonth
                        ? getAgendamentosCountForDay(dayData.date)
                        : 0;
                      return (
                        <div
                          key={index}
                          className={`text-center py-2 rounded cursor-pointer hover:bg-gray-100 relative ${
                            dayData.isCurrentMonth
                              ? "text-gray-900"
                              : "text-gray-400"
                          } ${dayData.isToday ? "bg-[#C5837B] text-white hover:bg-[#B57369]" : ""}`}
                          onClick={() => {
                            if (dayData.isCurrentMonth) {
                              setCurrentMonth(new Date(dayData.date));
                              setViewMode("Day");
                            }
                          }}
                        >
                          {dayData.day}
                          {count > 0 && (
                            <span
                              className={`absolute top-0.5 right-0.5 w-4 h-4 text-[10px] font-semibold rounded-full flex items-center justify-center ${
                                dayData.isToday
                                  ? "bg-white text-[#C5837B]"
                                  : "bg-[#C5837B] text-white"
                              }`}
                            >
                              {count}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Lista de Agendamentos Pendentes */}
            <div className="relative">
              {/* Borda de trás estática */}
              <div className="absolute inset-1 translate-x-2 translate-y-2 rounded-lg border border-gray-200 z-0 pointer-events-none"></div>
              {/* Card principal */}
              <div className="relative z-10 bg-white rounded-lg border border-gray-200 shadow-sm">
                <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CardIcon icon="calendar" color="#C5837B" size="md" />
                      <div>
                        <div className="font-semibold text-gray-900">
                          Pendentes
                        </div>
                        <div className="text-sm text-gray-500">
                          {agendamentosPendentes.length} aguardando confirmação
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Lista */}
                <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto">
                  {loading ? (
                    <div className="p-8 flex justify-center">
                      <BookLoader size={32} className="text-[#C5837B]" />
                    </div>
                  ) : agendamentosPendentes.length === 0 ? (
                    <div className="p-8 text-center">
                      <CheckCircle className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">
                        Nenhum agendamento pendente
                      </p>
                    </div>
                  ) : (
                    agendamentosPendentes.map((agendamento) => (
                      <div
                        key={agendamento.id}
                        onClick={() => {
                          setSelectedAgendamento(agendamento);
                          setModalOpen(true);
                        }}
                        className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          {renderClientAvatar(agendamento.cliente)}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-sm font-semibold text-gray-900 truncate">
                                {agendamento.cliente.nome}
                              </p>
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800 ml-2 flex-shrink-0">
                                <ClockIcon />
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 truncate mb-2">
                              {agendamento.servico.nome}
                            </p>
                            <div className="flex items-center justify-between gap-4">
                              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                <Clock className="w-3.5 h-3.5" />
                                {new Date(
                                  agendamento.dataHora,
                                ).toLocaleDateString("pt-BR", {
                                  day: "2-digit",
                                  month: "short",
                                })}
                                {" às "}
                                {new Date(
                                  agendamento.dataHora,
                                ).toLocaleTimeString("pt-BR", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </div>
                              <span className="text-xs font-semibold text-gray-900">
                                {parseFloat(agendamento.valor).toLocaleString(
                                  "pt-BR",
                                  {
                                    style: "currency",
                                    currency: "BRL",
                                  },
                                )}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Lista de Agendamentos Confirmados */}
            <div className="relative">
              {/* Borda de trás estática */}
              <div className="absolute inset-1 translate-x-2 translate-y-2 rounded-lg border border-gray-200 z-0 pointer-events-none"></div>
              {/* Card principal */}
              <div className="relative z-10 bg-white rounded-lg border border-gray-200 shadow-sm">
                <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CardIcon icon="check" color="#C5837B" size="md" />
                      <div>
                        <div className="font-semibold text-gray-900">
                          Confirmados
                        </div>
                        <div className="text-sm text-gray-500">
                          {agendamentosConfirmados.length} agendamentos
                          confirmados
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Lista */}
                <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto">
                  {loading ? (
                    <div className="p-8 flex justify-center">
                      <BookLoader size={32} className="text-[#C5837B]" />
                    </div>
                  ) : agendamentosConfirmados.length === 0 ? (
                    <div className="p-8 text-center">
                      <Clock className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">
                        Nenhum agendamento confirmado
                      </p>
                    </div>
                  ) : (
                    agendamentosConfirmados.map((agendamento) => (
                      <div
                        key={agendamento.id}
                        onClick={() => {
                          setSelectedAgendamento(agendamento);
                          setModalOpen(true);
                        }}
                        className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          {renderClientAvatar(agendamento.cliente)}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-sm font-semibold text-gray-900 truncate">
                                {agendamento.cliente.nome}
                              </p>
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 ml-2 flex-shrink-0">
                                <ChecksIcon />
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 truncate mb-2">
                              {agendamento.servico.nome}
                            </p>
                            <div className="flex items-center justify-between gap-4">
                              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                <Clock className="w-3.5 h-3.5" />
                                {new Date(
                                  agendamento.dataHora,
                                ).toLocaleDateString("pt-BR", {
                                  day: "2-digit",
                                  month: "short",
                                })}
                                {" às "}
                                {new Date(
                                  agendamento.dataHora,
                                ).toLocaleTimeString("pt-BR", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </div>
                              <span className="text-xs font-semibold text-gray-900">
                                {parseFloat(agendamento.valor).toLocaleString(
                                  "pt-BR",
                                  {
                                    style: "currency",
                                    currency: "BRL",
                                  },
                                )}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Lista de Agendamentos Cancelados */}
            <div className="relative">
              {/* Borda de trás estática */}
              <div className="absolute inset-1 translate-x-2 translate-y-2 rounded-lg border border-gray-200 z-0 pointer-events-none"></div>
              {/* Card principal */}
              <div className="relative z-10 bg-white rounded-lg border border-gray-200 shadow-sm">
                <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CardIcon icon="alert" color="#C5837B" size="md" />
                      <div>
                        <div className="font-semibold text-gray-900">
                          Cancelados
                        </div>
                        <div className="text-sm text-gray-500">
                          {agendamentosCancelados.length} agendamentos
                          cancelados
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Lista */}
                <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto">
                  {loading ? (
                    <div className="p-8 flex justify-center">
                      <BookLoader size={32} className="text-[#C5837B]" />
                    </div>
                  ) : agendamentosCancelados.length === 0 ? (
                    <div className="p-8 text-center">
                      <CheckCircle className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">
                        Nenhum agendamento cancelado
                      </p>
                    </div>
                  ) : (
                    agendamentosCancelados.map((agendamento) => (
                      <div
                        key={agendamento.id}
                        onClick={() => {
                          setSelectedAgendamento(agendamento);
                          setModalOpen(true);
                        }}
                        className="p-4 hover:bg-gray-50 cursor-pointer transition-colors opacity-75"
                      >
                        <div className="flex items-start gap-3">
                          {renderClientAvatar(agendamento.cliente)}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-sm font-semibold text-gray-700 truncate">
                                {agendamento.cliente.nome}
                              </p>
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-gray-200 text-gray-700 ml-2 flex-shrink-0">
                                <XIcon />
                              </span>
                            </div>
                            <p className="text-sm text-gray-500 truncate mb-2 line-through">
                              {agendamento.servico.nome}
                            </p>
                            <div className="flex items-center justify-between gap-4">
                              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                                <Clock className="w-3.5 h-3.5" />
                                {new Date(
                                  agendamento.dataHora,
                                ).toLocaleDateString("pt-BR", {
                                  day: "2-digit",
                                  month: "short",
                                })}
                                {" às "}
                                {new Date(
                                  agendamento.dataHora,
                                ).toLocaleTimeString("pt-BR", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </div>
                              <span className="text-xs font-semibold text-gray-500 line-through">
                                {parseFloat(agendamento.valor).toLocaleString(
                                  "pt-BR",
                                  {
                                    style: "currency",
                                    currency: "BRL",
                                  },
                                )}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Calendário Gigante */}
          <div className="flex-1">
            <div className="relative h-full">
              {/* Borda de trás estática */}
              <div className="absolute inset-1 translate-x-2 translate-y-2 rounded-lg border border-gray-200 z-0 pointer-events-none"></div>
              {/* Card principal */}
              <div className="relative z-10 bg-white rounded-lg border border-gray-200 shadow-sm h-full flex flex-col">
                {/* Estatísticas do Período */}
                <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                  <div className="grid grid-cols-4 gap-3">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">
                        {
                          agendamentos.filter((ag) => {
                            const dataAg = new Date(ag.dataHora);
                            return (
                              dataAg.getMonth() === currentMonth.getMonth() &&
                              dataAg.getFullYear() ===
                                currentMonth.getFullYear()
                            );
                          }).length
                        }
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">Total</div>
                    </div>
                    <div className="text-center border-l border-gray-200">
                      <div className="text-2xl font-bold text-yellow-600">
                        {agendamentosPendentes.length}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        Pendentes
                      </div>
                    </div>
                    <div className="text-center border-l border-gray-200">
                      <div className="text-2xl font-bold text-green-600">
                        {agendamentosConfirmados.length}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        Confirmados
                      </div>
                    </div>
                    <div className="text-center border-l border-gray-200">
                      <div className="text-2xl font-bold text-gray-900 font-mono tracking-tight">
                        {agendamentos
                          .filter((ag) => {
                            const dataAg = new Date(ag.dataHora);
                            return (
                              ag.status !== "cancelado" &&
                              dataAg.getMonth() === currentMonth.getMonth() &&
                              dataAg.getFullYear() ===
                                currentMonth.getFullYear()
                            );
                          })
                          .reduce((sum, ag) => sum + parseFloat(ag.valor), 0)
                          .toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          })}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        Receita
                      </div>
                    </div>
                  </div>
                </div>

                {/* Calendar Header */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          const newDate = new Date(currentMonth);
                          newDate.setMonth(newDate.getMonth() - 1);
                          setCurrentMonth(newDate);
                        }}
                        className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <ChevronLeft className="w-4 h-4 text-black" />
                      </button>
                      <h2 className="text-lg font-semibold text-gray-900 min-w-[180px] text-center capitalize">
                        {currentMonth.toLocaleDateString("pt-BR", {
                          month: "long",
                          year: "numeric",
                        })}
                      </h2>
                      <button
                        onClick={() => {
                          const newDate = new Date(currentMonth);
                          newDate.setMonth(newDate.getMonth() + 1);
                          setCurrentMonth(newDate);
                        }}
                        className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <ChevronRight className="w-4 h-4 text-black" />
                      </button>
                    </div>

                    {/* Tabs de Visualização */}
                    <div className="flex bg-gray-100 rounded-lg p-1 relative">
                      {/* Indicador de tab ativa com animação smooth */}
                      <div
                        className="absolute top-1 bottom-1 bg-white rounded-md shadow-sm transition-all duration-300 ease-out"
                        style={{
                          left:
                            viewMode === "Day"
                              ? "4px"
                              : viewMode === "Week"
                                ? "calc(33.333% + 2px)"
                                : "calc(66.666%)",
                          width: "calc(33.333% - 4px)",
                        }}
                      />

                      <button
                        onClick={() => {
                          setCurrentMonth(new Date());
                          setViewMode("Day");
                        }}
                        className={`relative z-10 px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                          viewMode === "Day"
                            ? "text-gray-900"
                            : "text-gray-600 hover:text-gray-900"
                        }`}
                      >
                        Hoje
                      </button>
                      <button
                        onClick={() => setViewMode("Week")}
                        className={`relative z-10 px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                          viewMode === "Week"
                            ? "text-gray-900"
                            : "text-gray-600 hover:text-gray-900"
                        }`}
                      >
                        Semana
                      </button>
                      <button
                        onClick={() => setViewMode("Month")}
                        className={`relative z-10 px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                          viewMode === "Month"
                            ? "text-gray-900"
                            : "text-gray-600 hover:text-gray-900"
                        }`}
                      >
                        Mês
                      </button>
                    </div>
                  </div>

                  {/* Legenda de Status */}
                  <div className="flex items-center justify-center gap-6">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <span className="text-sm text-gray-600">Pendente</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span className="text-sm text-gray-600">Confirmado</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      <span className="text-sm text-gray-600">
                        Em Atendimento
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-gray-500"></div>
                      <span className="text-sm text-gray-600">Concluído</span>
                    </div>
                  </div>
                </div>

                {/* Calendário - Visualizações */}
                <div className="flex flex-1 overflow-hidden">
                  {loading ? (
                    <div className="flex-1 flex items-center justify-center">
                      <BookLoader size={48} className="text-[#C5837B]" />
                    </div>
                  ) : viewMode === "Month" ? (
                    /* Visualização Mensal */
                    <div className="flex-1 p-6 overflow-y-auto hide-scrollbar">
                      {/* Header dos dias da semana */}
                      <div className="grid grid-cols-7 gap-3 mb-3">
                        {[
                          "Domingo",
                          "Segunda",
                          "Terça",
                          "Quarta",
                          "Quinta",
                          "Sexta",
                          "Sábado",
                        ].map((dia) => (
                          <div
                            key={dia}
                            className="text-center text-sm font-bold text-gray-700 py-3 bg-gray-50 rounded-lg"
                          >
                            {dia}
                          </div>
                        ))}
                      </div>

                      {/* Grid do calendário GIGANTE */}
                      <div className="grid grid-cols-7 gap-3">
                        {calendarDays.map((dayData, index) => {
                          const dayEvents = events.filter((event) => {
                            if (!event.agendamento) return false;
                            const eventDate = new Date(
                              event.agendamento.dataHora,
                            );
                            return (
                              eventDate.getDate() === dayData.day &&
                              eventDate.getMonth() ===
                                dayData.date.getMonth() &&
                              eventDate.getFullYear() ===
                                dayData.date.getFullYear() &&
                              dayData.isCurrentMonth
                            );
                          });

                          return (
                            <div
                              key={index}
                              className={`min-h-[140px] p-3 rounded-xl border-2 transition-all cursor-pointer ${
                                dayData.isCurrentMonth
                                  ? dayData.isToday
                                    ? "bg-gradient-to-br from-[#C5837B]/20 to-[#C5837B]/10 border-[#C5837B] shadow-lg"
                                    : "bg-white border-gray-200 hover:border-[#C5837B]/50 hover:shadow-md"
                                  : "bg-gray-50/50 border-gray-100 cursor-default"
                              }`}
                              onClick={() => {
                                if (
                                  dayData.isCurrentMonth &&
                                  dayEvents.length > 0
                                ) {
                                  // Abrir modal com o primeiro evento do dia
                                  if (dayEvents[0]?.agendamento) {
                                    setSelectedAgendamento(
                                      dayEvents[0].agendamento,
                                    );
                                    setModalOpen(true);
                                  }
                                }
                              }}
                            >
                              {/* Número do dia */}
                              <div className="flex items-center justify-between mb-3">
                                <span
                                  className={`text-lg font-bold ${
                                    dayData.isCurrentMonth
                                      ? dayData.isToday
                                        ? "text-white bg-[#C5837B] rounded-full w-8 h-8 flex items-center justify-center shadow-sm"
                                        : "text-gray-900"
                                      : "text-gray-300"
                                  }`}
                                >
                                  {dayData.day}
                                </span>
                                {dayEvents.length > 0 && (
                                  <span className="text-xs font-bold text-white bg-[#C5837B] rounded-full px-2.5 py-1 shadow-sm">
                                    {dayEvents.length}
                                  </span>
                                )}
                              </div>

                              {/* Lista de eventos do dia */}
                              <div className="space-y-2">
                                {dayEvents.slice(0, 4).map((event) => (
                                  <div
                                    key={event.id}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleEventClick(event);
                                    }}
                                    className="px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer hover:scale-105 transition-all border-l-4 shadow-sm"
                                    style={{
                                      backgroundColor: `${event.color}15`,
                                      borderLeftColor: event.color,
                                      color:
                                        event.color === "#F59E0B"
                                          ? "#92400E"
                                          : event.color === "#10B981"
                                            ? "#065F46"
                                            : event.color === "#6366F1"
                                              ? "#3730A3"
                                              : event.color === "#DC2626"
                                                ? "#7F1D1D"
                                                : "#1F2937",
                                    }}
                                  >
                                    <div className="flex items-center gap-1 mb-1">
                                      <Clock className="w-3 h-3 opacity-70" />
                                      <span className="font-mono">
                                        {event.time}
                                      </span>
                                    </div>
                                    {event.agendamento && (
                                      <div className="truncate text-xs opacity-90">
                                        {event.agendamento.cliente.nome}
                                      </div>
                                    )}
                                  </div>
                                ))}
                                {dayEvents.length > 4 && (
                                  <div className="text-xs font-semibold text-gray-500 text-center py-1 bg-gray-100 rounded-lg">
                                    +{dayEvents.length - 4} agendamentos
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : viewMode === "Week" || viewMode === "Day" ? (
                    /* Visualização de Semana/Dia */
                    <>
                      {/* Time Column */}
                      <div className="w-16 border-r border-gray-200 flex-shrink-0">
                        <div className="h-12 border-b border-gray-200"></div>
                        {timeSlots.map((time) => (
                          <div
                            key={time}
                            className="h-16 border-b border-gray-100 flex items-start justify-end pr-2 pt-1"
                          >
                            <span className="text-xs text-gray-500">
                              {time}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Calendar Days */}
                      <div className="flex-1 overflow-y-auto hide-scrollbar">
                        {/* Day Headers */}
                        <div
                          className={`grid border-b border-gray-200 ${viewMode === "Day" ? "grid-cols-1" : "grid-cols-7"}`}
                        >
                          {displayDays.map((day: any, index: number) => {
                            const dayNames = [
                              "Dom",
                              "Seg",
                              "Ter",
                              "Qua",
                              "Qui",
                              "Sex",
                              "Sáb",
                            ];
                            const monthNames = [
                              "Jan",
                              "Fev",
                              "Mar",
                              "Abr",
                              "Mai",
                              "Jun",
                              "Jul",
                              "Ago",
                              "Set",
                              "Out",
                              "Nov",
                              "Dez",
                            ];
                            return (
                              <div
                                key={index}
                                className="border-r border-gray-200 p-3 text-center"
                              >
                                <div className="text-xs text-gray-500">
                                  {dayNames[day.date.getDay()]}
                                </div>
                                <div className="text-sm font-medium text-gray-900 mt-1">
                                  {day.dayNumber} {monthNames[day.month]}
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Calendar Grid */}
                        <div className="relative">
                          {timeSlots.map((time, timeIndex) => (
                            <div
                              key={time}
                              className={`grid border-b border-gray-100 ${viewMode === "Day" ? "grid-cols-1" : "grid-cols-7"}`}
                            >
                              {displayDays.map((day: any, dayIndex: number) => (
                                <div
                                  key={`${timeIndex}-${dayIndex}`}
                                  className="h-16 border-r border-gray-100 relative"
                                >
                                  {/* Events */}
                                  {events
                                    .filter((event) => {
                                      const eventDate = event.agendamento
                                        ? new Date(event.agendamento.dataHora)
                                        : null;
                                      if (!eventDate) return false;
                                      return (
                                        eventDate.toDateString() ===
                                        displayDays[
                                          dayIndex
                                        ].date.toDateString()
                                      );
                                    })
                                    .map((event) => {
                                      const startTime = Math.floor(
                                        event.startHour,
                                      );
                                      const endTime = Math.ceil(event.endHour);
                                      const isCurrentHour =
                                        timeIndex + 8 === startTime;

                                      if (isCurrentHour) {
                                        const height =
                                          (endTime - startTime) * 64;
                                        const agendamento = event.agendamento;
                                        return (
                                          <div
                                            key={event.id}
                                            onClick={() =>
                                              handleEventClick(event)
                                            }
                                            className="absolute left-1 right-1 rounded-lg p-2 text-white text-xs font-medium shadow-md cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all border-l-4"
                                            style={{
                                              backgroundColor: event.color,
                                              borderLeftColor:
                                                event.color === "#F59E0B"
                                                  ? "#D97706"
                                                  : event.color === "#10B981"
                                                    ? "#059669"
                                                    : event.color === "#6366F1"
                                                      ? "#4F46E5"
                                                      : event.color ===
                                                          "#DC2626"
                                                        ? "#B91C1C"
                                                        : "#6B7280",
                                              height: `${height}px`,
                                              top: `${(event.startHour - startTime) * 64}px`,
                                            }}
                                          >
                                            <div className="flex flex-col h-full">
                                              <div className="font-semibold truncate">
                                                {event.time}
                                              </div>
                                              {agendamento && (
                                                <>
                                                  <div className="text-xs opacity-90 truncate mt-0.5">
                                                    {agendamento.cliente.nome}
                                                  </div>
                                                  <div className="text-xs opacity-90 truncate">
                                                    {agendamento.servico.nome}
                                                  </div>
                                                  {height > 80 && (
                                                    <div className="text-xs opacity-80 mt-1">
                                                      {parseFloat(
                                                        agendamento.valor,
                                                      ).toLocaleString(
                                                        "pt-BR",
                                                        {
                                                          style: "currency",
                                                          currency: "BRL",
                                                        },
                                                      )}
                                                    </div>
                                                  )}
                                                </>
                                              )}
                                            </div>
                                          </div>
                                        );
                                      }
                                      return null;
                                    })}
                                </div>
                              ))}
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Detalhes do Agendamento */}
      {selectedAgendamento && (
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title="Detalhes do Agendamento"
          maxWidth="xl"
        >
          <div className="p-6">
            <div className="space-y-4">
              {/* Avatar e Nome do Cliente */}
              <div className="flex items-center gap-4 pb-4 border-b border-gray-200">
                {renderClientAvatar(selectedAgendamento.cliente)}
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {selectedAgendamento.cliente.nome}
                  </h3>
                  <p className="text-sm text-gray-500">Cliente</p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium ${
                      selectedAgendamento.status === "agendado"
                        ? "bg-yellow-100 text-yellow-800"
                        : selectedAgendamento.status === "confirmado"
                          ? "bg-green-100 text-green-800"
                          : selectedAgendamento.status === "em_atendimento"
                            ? "bg-blue-100 text-blue-800"
                            : selectedAgendamento.status === "concluido"
                              ? "bg-gray-100 text-gray-800"
                              : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    {selectedAgendamento.status === "agendado" ? (
                      <>
                        <ClockIcon /> Aguardando
                      </>
                    ) : selectedAgendamento.status === "confirmado" ? (
                      <>
                        <ChecksIcon /> Confirmado
                      </>
                    ) : selectedAgendamento.status === "em_atendimento" ? (
                      "🔵 Em Atendimento"
                    ) : selectedAgendamento.status === "concluido" ? (
                      "✔️ Concluído"
                    ) : (
                      <>
                        <XIcon /> Cancelado
                      </>
                    )}
                  </span>
                </div>
              </div>

              {/* Grid de Informações */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Card de Contato */}
                <div className="relative">
                  <div className="absolute inset-0 translate-x-1 translate-y-1 rounded-lg border border-gray-200 -z-10"></div>
                  <div className="relative bg-white rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <CardIcon icon="phone" color="#C5837B" size="sm" />
                      <h4 className="font-semibold text-gray-900">Contato</h4>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span className="truncate">
                          {selectedAgendamento.cliente.email}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span>{selectedAgendamento.cliente.telefone}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card de Serviço */}
                <div className="relative">
                  <div className="absolute inset-0 translate-x-1 translate-y-1 rounded-lg border border-gray-200 -z-10"></div>
                  <div className="relative bg-white rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <CardIcon icon="briefcase" color="#C5837B" size="sm" />
                      <h4 className="font-semibold text-gray-900">Serviço</h4>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-900">
                        {selectedAgendamento.servico.nome}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span>{selectedAgendamento.duracao} minutos</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card de Data/Hora */}
                <div className="relative">
                  <div className="absolute inset-0 translate-x-1 translate-y-1 rounded-lg border border-gray-200 -z-10"></div>
                  <div className="relative bg-white rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <CardIcon icon="calendar" color="#C5837B" size="sm" />
                      <h4 className="font-semibold text-gray-900">
                        Data e Hora
                      </h4>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-900">
                        {new Date(
                          selectedAgendamento.dataHora,
                        ).toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                      <p className="text-sm text-gray-600">
                        às{" "}
                        {new Date(
                          selectedAgendamento.dataHora,
                        ).toLocaleTimeString("pt-BR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Card de Valor */}
                <div className="relative">
                  <div className="absolute inset-0 translate-x-1 translate-y-1 rounded-lg border border-gray-200 -z-10"></div>
                  <div className="relative bg-white rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <CardIcon icon="gift" color="#C5837B" size="sm" />
                      <h4 className="font-semibold text-gray-900">Valor</h4>
                    </div>
                    <p className="text-2xl font-bold text-[#C5837B]">
                      {parseFloat(selectedAgendamento.valor).toLocaleString(
                        "pt-BR",
                        {
                          style: "currency",
                          currency: "BRL",
                        },
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Observações */}
              {selectedAgendamento.observacoes && (
                <div className="relative">
                  <div className="absolute inset-0 translate-x-1 translate-y-1 rounded-lg border border-gray-200 -z-10"></div>
                  <div className="relative bg-white rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <CardIcon icon="file-description" color="#C5837B" size="sm" />
                      <h4 className="font-semibold text-gray-900">
                        Observações
                      </h4>
                    </div>
                    <p className="text-sm text-gray-700">
                      {selectedAgendamento.observacoes}
                    </p>
                  </div>
                </div>
              )}

              {/* Ações */}
              <div className="pt-2">
                <div className="flex items-center gap-2 mb-3">
                  <CardIcon icon="briefcase" color="#C5837B" size="sm" />
                  <h4 className="font-semibold text-gray-900">
                    Ações Disponíveis
                  </h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selectedAgendamento.status === "agendado" && (
                    <Button
                      variant="primary"
                      onClick={() => handleUpdateStatus("confirmado")}
                      disabled={updating}
                    >
                      Confirmar
                    </Button>
                  )}
                  {selectedAgendamento.status === "confirmado" && (
                    <Button
                      variant="primary"
                      onClick={() => handleUpdateStatus("concluido")}
                      disabled={updating}
                    >
                      Concluir Serviço
                    </Button>
                  )}
                  {selectedAgendamento.status !== "cancelado" &&
                    selectedAgendamento.status !== "concluido" && (
                      <Button
                        variant="secondary"
                        onClick={() => handleUpdateStatus("cancelado")}
                        disabled={updating}
                      >
                        Cancelar agendamento
                      </Button>
                    )}
                  {selectedAgendamento.status === "cancelado" && (
                    <Button
                      variant="primary"
                      onClick={() => handleUpdateStatus("agendado")}
                      disabled={updating}
                    >
                      Reagendar
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
