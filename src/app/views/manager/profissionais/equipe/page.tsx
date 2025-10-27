"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import Button from "@/components/visual/Button";
import CardIcon from "@/components/visual/CardIcon";
import BookLoader from "@/components/BookLoader";
import Modal from "@/components/Modal";
import Input from "@/components/visual/Input";
import Checkbox from "@/components/visual/Checkbox";
import Select from "@/components/visual/Select";
import { toaster } from "@/app/components/Toaster";
import Avatar from "@/components/Avatar";
import Tooltip from "@/components/visual/Tooltip";
import FooterConfirmation from "@/components/FooterConfirmation";

interface TeamMember {
  id: string;
  nome?: string | null;
  email: string;
  avatarUrl?: string | null;
  cargo?: string | null;
  salario?: number | null;
  comissaoTotal?: number | null; // Valor bruto de comissão acumulada
  ativo?: boolean;
  tipoUsuario?: string;
  dataAdmissao?: string;
  tipo: 'membro' | 'convite';
  // Campos especÃ­ficos para convites
  status?: 'PENDING' | 'ACCEPTED' | 'EXPIRED' | 'REVOKED';
  mensagem?: string | null;
  convidadoPor?: string;
  createdAt?: string;
  acceptedAt?: string | null;
  expiresAt?: string | null;
}

interface Service {
  id: string;
  nome: string;
  descricao?: string;
  duracao: number;
  preco?: number;
}

export default function GerenciarEquipe() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteUserType, setInviteUserType] = useState("usuario");
  const [sendingInvite, setSendingInvite] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [showHelpModal, setShowHelpModal] = useState(false);

  // Estados para modal de editar
  const [showEditModal, setShowEditModal] = useState(false);
  const [memberToEdit, setMemberToEdit] = useState<TeamMember | null>(null);
  const [editUserType, setEditUserType] = useState("usuario");
  const [editCargo, setEditCargo] = useState("");
  const [editSalario, setEditSalario] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // Estados para serviÃ§os
  const [services, setServices] = useState<Service[]>([]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [loadingServices, setLoadingServices] = useState(false);

  // Estados para confirmaÃ§Ãµes
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [toggleStatusModalOpen, setToggleStatusModalOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<TeamMember | null>(null);
  const [memberToToggle, setMemberToToggle] = useState<TeamMember | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isTogglingStatus, setIsTogglingStatus] = useState(false);

  // FunÃ§Ã£o para carregar dados da equipe
  const loadTeamData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/empresa/equipe', {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Falha ao carregar equipe');
      const data = await res.json();
      setTeamMembers(data.equipe || []);
    } catch (error) {
      console.error('Erro ao carregar equipe:', error);
      toaster.create({
        title: 'Erro ao carregar equipe',
        description: 'Não foi possível carregar os dados da equipe. Tente novamente.',
        type: 'error',
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeamData();
    loadServices();
  }, []);

  // Quando abrir o modal de ediÃ§Ã£o, buscar serviÃ§os vinculados do funcionÃ¡rio
  useEffect(() => {
    const fetchLinkedServices = async () => {
      if (!showEditModal || !memberToEdit) return;
      try {
        const res = await fetch(`/api/empresa/funcionarios/${memberToEdit.id}`, {
          credentials: 'include',
        });
        if (res.ok) {
          const data = await res.json();
          const ids = (data.servicos || []).map((s: any) => s.id);
          setSelectedServices(ids);
        } else {
          setSelectedServices([]);
        }
      } catch (e) {
        setSelectedServices([]);
      }
    };
    fetchLinkedServices();
  }, [showEditModal, memberToEdit]);

  // FunÃ§Ã£o para carregar serviÃ§os
  const loadServices = async () => {
    try {
      setLoadingServices(true);
      const res = await fetch('/api/services', {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Falha ao carregar serviÃ§os');
      const data = await res.json();
      // Converter nome em inglÃªs para portuguÃªs
      const servicos = (data.services || []).map((s: any) => ({
        id: s.id,
        nome: s.name,
        descricao: s.description,
        duracao: s.duration,
        preco: s.price
      }));
      setServices(servicos);
    } catch (error) {
      console.error('Erro ao carregar serviÃ§os:', error);
    } finally {
      setLoadingServices(false);
    }
  };

  // Abrir modal de editar
  const handleEditClick = (member: TeamMember) => {
    setMemberToEdit(member);
    setEditUserType(member.tipoUsuario || "usuario");
    setEditCargo(member.cargo || "");
    setEditSalario(member.salario ? String(member.salario) : "");
    setSelectedServices([]); // TODO: carregar serviÃ§os vinculados do backend
    setEditError(null);
    setShowEditModal(true);
  };

  // Salvar ediÃ§Ã£o
  const handleSaveEdit = async () => {
    if (!memberToEdit) return;

    setEditError(null);
    setSavingEdit(true);
    try {
      const res = await fetch(`/api/empresa/funcionarios/${memberToEdit.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipoUsuario: editUserType,
          cargo: editCargo || null,
          salario: editSalario ? parseFloat(editSalario) : null,
          servicosIds: selectedServices
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Falha ao salvar alterações');

      toaster.create({
        title: 'Alterações salvas com sucesso!',
        description: `As informações de ${memberToEdit.nome} foram atualizadas.`,
        type: 'success',
        duration: 5000,
      });

      setShowEditModal(false);
      setMemberToEdit(null);

      // Recarregar dados da equipe
      loadTeamData();
    } catch (e: any) {
      setEditError(e.message);

      toaster.create({
        title: 'Erro ao salvar alterações',
        description: e.message || 'Ocorreu um erro ao tentar salvar as alterações. Tente novamente.',
        type: 'error',
        duration: 5000,
      });
    } finally {
      setSavingEdit(false);
    }
  };

  // Abrir modal de confirmaÃ§Ã£o para toggle status
  const handleToggleStatusClick = (member: TeamMember) => {
    setMemberToToggle(member);
    setToggleStatusModalOpen(true);
  };

  // Confirmar toggle de status
  const confirmToggleStatus = async () => {
    if (!memberToToggle) return;

    setIsTogglingStatus(true);
    try {
      // Aqui vocÃª pode adicionar chamada de API se necessÃ¡rio
      // Por enquanto, apenas atualizando o estado local
      const newStatus = !memberToToggle.ativo;

      setTeamMembers((prev) =>
        prev.map((member) =>
          member.id === memberToToggle.id && member.tipo === 'membro'
            ? { ...member, ativo: newStatus }
            : member
        )
      );

      toaster.create({
        title: newStatus ? 'Profissional ativado' : 'Profissional desativado',
        description: `${memberToToggle.nome} foi ${newStatus ? 'ativado' : 'desativado'} com sucesso.`,
        type: newStatus ? 'success' : 'warning',
        duration: 3000,
      });

      setToggleStatusModalOpen(false);
      setMemberToToggle(null);
    } catch (error) {
      toaster.create({
        title: 'Erro',
        description: 'Não foi possível alterar o status do profissional.',
        type: 'error',
        duration: 3000,
      });
    } finally {
      setIsTogglingStatus(false);
    }
  };

  // Cancelar toggle de status
  const cancelToggleStatus = () => {
    setToggleStatusModalOpen(false);
    setMemberToToggle(null);
  };

  // Abrir modal de confirmaÃ§Ã£o para excluir
  const handleDeleteClick = (member: TeamMember) => {
    setMemberToDelete(member);
    setDeleteModalOpen(true);
  };

  // Confirmar exclusÃ£o
  const confirmDelete = async () => {
    if (!memberToDelete) return;

    setIsDeleting(true);
    try {
      // Aqui vocÃª pode adicionar chamada de API para excluir
      // Por enquanto, apenas removendo do estado local
      setTeamMembers((prev) =>
        prev.filter((member) => member.id !== memberToDelete.id)
      );

      toaster.create({
        title: 'Removido com sucesso',
        description: `${memberToDelete.nome || memberToDelete.email} foi removido da equipe.`,
        type: 'success',
        duration: 3000,
      });

      setDeleteModalOpen(false);
      setMemberToDelete(null);
    } catch (error) {
      toaster.create({
        title: 'Erro',
        description: 'Não foi possível remover o membro da equipe.',
        type: 'error',
        duration: 3000,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Cancelar exclusÃ£o
  const cancelDelete = () => {
    setDeleteModalOpen(false);
    setMemberToDelete(null);
  };

  const handleSendInvite = async () => {
    setInviteError(null);
    setSendingInvite(true);
    try {
      const res = await fetch('/api/convites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: inviteEmail,
          tipoUsuario: inviteUserType,
          servicosIds: selectedServices
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Falha ao enviar convite');

      // Sucesso - Mostrar toast e fechar modal
      toaster.create({
        title: 'Convite enviado com sucesso!',
        description: `Um e-mail de convite foi enviado para ${inviteEmail}`,
        type: 'success',
        duration: 5000,
      });

      setShowAddModal(false);
      setInviteEmail("");
      setInviteUserType("usuario");
      setSelectedServices([]);

      // Recarregar dados da equipe
      loadTeamData();
    } catch (e: any) {
      setInviteError(e.message);

      // Erro - Mostrar toast de erro
      toaster.create({
        title: 'Erro ao enviar convite',
        description: e.message || 'Ocorreu um erro ao tentar enviar o convite. Tente novamente.',
        type: 'error',
        duration: 5000,
      });
    } finally {
      setSendingInvite(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <BookLoader size={48} className="text-[#C5837B]" />
      </div>
    );
  }

  // Filtrar apenas membros ativos (nÃ£o convites)
  const membrosAtivos = teamMembers.filter((m) => m.tipo === 'membro');
  const convites = teamMembers.filter((m) => m.tipo === 'convite');

  const ativos = membrosAtivos.filter((p) => p.ativo).length;
  const pendentes = convites.filter((c) => c.status === 'PENDING').length;
  const cargosUnicos = Array.from(new Set(membrosAtivos.map((p) => p.cargo).filter(Boolean))).length;
  const mediaSalarial =
    membrosAtivos.length > 0
      ? membrosAtivos.reduce((sum, p) => sum + (p.salario || 0), 0) / membrosAtivos.length
      : 0;

  const cards: Array<{ key: string; titulo: string; valor: number; sufixo: string; sufixoClass: string; moeda?: boolean; icon: React.ReactNode; }> = [
    {
      key: 'ativos',
      titulo: 'Membros',
      valor: ativos,
      sufixo: 'Ativos',
      sufixoClass: 'text-green-600',
      icon: (
        <svg className="w-5 h-5 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 6a2 2 0 110 4 2 2 0 010-4" />
        </svg>
      ),
    },
    {
      key: 'pendentes',
      titulo: 'Convites',
      valor: pendentes,
      sufixo: 'Pendentes',
      sufixoClass: 'text-blue-600',
      icon: (
        <svg className="w-5 h-5 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      key: 'cargos',
      titulo: 'Cargos',
      valor: cargosUnicos,
      sufixo: 'Ativos',
      sufixoClass: 'text-gray-600',
      icon: (
        <svg className="w-5 h-5 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h18M6 10h12M9 13h6M10 17h4" />
        </svg>
      ),
    },
    {
      key: 'media',
      titulo: 'Comissão',
      valor: mediaSalarial,
      sufixo: 'Média',
      sufixoClass: 'text-gray-600',
      moeda: false as const,
      icon: (
        <svg className="w-5 h-5 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8V7m0 10v-1" />
        </svg>
      ),
    },
  ];

  const renderIcon = (key: string) => {
    switch (key) {
      case 'ativos':
        return (
          <svg className="w-5 h-5 text-gray-800" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M10 13a2 2 0 1 0 4 0a2 2 0 0 0 -4 0" />
            <path d="M8 21v-1a2 2 0 0 1 2 -2h4a2 2 0 0 1 2 2v1" />
            <path d="M15 5a2 2 0 1 0 4 0a2 2 0 0 0 -4 0" />
            <path d="M17 10h2a2 2 0 0 1 2 2v1" />
            <path d="M5 5a2 2 0 1 0 4 0a2 2 0 0 0 -4 0" />
            <path d="M3 13v-1a2 2 0 0 1 2 -2h2" />
          </svg>
        );
      case 'pendentes':
        return (
          <svg className="w-5 h-5 text-gray-800" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M3 7a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v10a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-10z" />
            <path d="M3 7l9 6l9 -6" />
          </svg>
        );
      case 'inativos':
        return (
          <svg className="w-5 h-5 text-gray-800" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M5 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0" />
            <path d="M3 21v-2a4 4 0 0 1 4 -4h4c.948 0 1.818 .33 2.504 .88" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            <path d="M16 19h6" />
          </svg>
        );
      case 'cargos':
        return (
          <svg className="w-5 h-5 text-gray-800" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M3 9a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v9a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-9z" />
            <path d="M8 7v-2a2 2 0 0 1 2 -2h4a2 2 0 0 1 2 2v2" />
          </svg>
        );
      case 'media':
        return (
          <svg className="w-5 h-5 text-gray-800" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M16.7 8a3 3 0 0 0 -2.7 -2h-4a3 3 0 0 0 0 6h4a3 3 0 0 1 0 6h-4a3 3 0 0 1 -2.7 -2" />
            <path d="M12 3v3m0 12v3" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5 text-gray-800" viewBox="0 0 24 24" />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Gerenciar Equipe</h1>
            <p className="text-gray-600">
              Gerencie os profissionais da sua equipe
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Tooltip content="Ajuda" position="bottom" delay={100}>
              <button
                type="button"
                onClick={() => setShowHelpModal(true)}
                className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 shadow-sm"
                aria-label="Ajuda"
                title="Ajuda"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                  <path d="M12 2l.642 .005l.616 .017l.299 .013l.579 .034l.553 .046c4.687 .455 6.65 2.333 7.166 6.906l.03 .29l.046 .553l.041 .727l.006 .15l.017 .617l.005 .642l-.005 .642l-.017 .616l-.013 .299l-.034 .579l-.046 .553c-.455 4.687 -2.333 6.65 -6.906 7.166l-.29 .03l-.553 .046l-.727 .041l-.15 .006l-.617 .017l-.642 .005l-.642 -.005l-.616 -.017l-.299 -.013l-.579 -.034l-.553 -.046c-4.687 -.455 -6.65 -2.333 -7.166 -6.906l-.03 -.29l-.046 -.553l-.041 -.727l-.006 -.15l-.017 -.617l-.004 -.318v-.648l.004 -.318l.017 -.616l.013 -.299l.034 -.579l.046 -.553c.455 -4.687 2.333 -6.65 6.906 -7.166l.29 -.03l.553 -.046l.727 -.041l.15 -.006l.617 -.017c.21 -.003 .424 -.005 .642 -.005zm0 13a1 1 0 0 0 -.993 .883l-.007 .117l.007 .127a1 1 0 0 0 1.986 0l.007 -.117l-.007 -.127a1 1 0 0 0 -.993 -.883zm1.368 -6.673a2.98 2.98 0 0 0 -3.631 .728a1 1 0 0 0 1.44 1.383l.171 -.18a.98 .98 0 0 1 1.11 -.15a1 1 0 0 1 -.34 1.886l-.232 .012a1 1 0 0 0 .111 1.994a3 3 0 0 0 1.371 -5.673z" />
                </svg>
              </button>
            </Tooltip>
            <Button
              variant="primary"
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 shadow-lg hover:shadow-xl transition-shadow"
            >
              <Plus className="w-5 h-5" />
              Convidar Profissional
            </Button>
          </div>
        </div>
      </div>

      {/* Cards de mÃ©tricas (conforme layout: 4 iguais) */}
      <div
        className={`grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 transition-all duration-300 ${teamMembers.length === 0 ? 'blur-sm grayscale opacity-60 pointer-events-none' : ''
          }`}
        style={{
          maskImage:
            teamMembers.length === 0
              ? 'linear-gradient(to bottom, black 60%, transparent 100%)'
              : 'none',
          WebkitMaskImage:
            teamMembers.length === 0
              ? 'linear-gradient(to bottom, black 60%, transparent 100%)'
              : 'none',
        }}
      >
        {cards.map((card) => (
          <div key={card.key} className="relative">
            {/* Borda de trÃ¡s com efeito animado */}
            {/* <div className="absolute inset-1 translate-x-2 translate-y-2 rounded-2xl border border-gray-200 z-0 pointer-events-none overflow-hidden"> */}
            {/* <MovingBorder duration={6000} rx={16} ry={16}>
                <div
                  className="h-12 w-12 opacity-70 blur-md"
                  style={{ background: "radial-gradient(#C5837B 45%, transparent 60%)" }}
                />
              </MovingBorder> */}
            {/* </div> */}
            {/* Borda de trÃ¡s estÃ¡tica (estilo Perfil) */}
            <div className="absolute inset-1 translate-x-2 translate-y-2 rounded-lg border border-gray-200 z-0 pointer-events-none"></div>
            {/* Card principal */}
            <div className="relative z-10 bg-white p-5 rounded-lg border border-gray-200">
              <div className="flex items-center gap-3">
                {renderIcon(card.key)}
                <span className="text-sm font-medium text-gray-900">{card.titulo}</span>
              </div>
              <div className="mt-4 flex items-baseline gap-3">
                <span className="text-2xl font-bold text-gray-900 font-mono tracking-tight">
                  {card.moeda
                    ? (card.valor as number).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                    : (card.key === 'media' ? `${card.valor as number}%` : (card.valor as number))}
                </span>
                <span className={`text-sm font-medium ${card.sufixoClass}`}>{card.sufixo}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabela */}
      <div className="relative">
        {/* Borda de trÃ¡s estÃ¡tica (estilo Perfil/Clientes) */}
        <div className="absolute inset-1 translate-x-2 translate-y-2 rounded-lg border border-gray-200 z-0 pointer-events-none"></div>

        {/* Card principal da tabela */}
        <div className="relative z-10 bg-white rounded-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-sm font-medium text-[#BCBCBC]">Profissionais</h2>
          </div>

          {/* Empty state sobreposto quando sem dados */}
          {teamMembers.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center z-20 p-4">
              <div className="relative max-w-lg mx-auto w-full">
                <div className="absolute inset-1 translate-x-2 translate-y-2 rounded-lg border border-gray-200 z-0 pointer-events-none"></div>
                <div className="relative z-10 bg-white rounded-lg border border-gray-200 p-6 sm:p-8 text-center">
                  <div className="flex justify-center items-center mb-6">
                    <CardIcon size="lg" icon="briefcase" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                    Nenhum profissional encontrado
                  </h3>
                  <p className="text-gray-500 mb-6 text-sm sm:text-base">
                    Comece convidando seu primeiro profissional para a equipe
                  </p>
                  <Button
                    variant="primary"
                    size="lg"
                    className="mx-auto text-base py-3 px-6"
                    onClick={() => setShowAddModal(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Convidar Profissional
                  </Button>
                </div>
              </div>
            </div>
          )}

          <div className={`overflow-x-auto transition-all duration-300 ${teamMembers.length === 0 ? 'blur-sm grayscale opacity-60 pointer-events-none' : ''}`}
            style={{
              maskImage: teamMembers.length === 0 ? 'linear-gradient(to bottom, black 60%, transparent 100%)' : 'none',
              WebkitMaskImage: teamMembers.length === 0 ? 'linear-gradient(to bottom, black 60%, transparent 100%)' : 'none',
            }}
          >
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Membro</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cargo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Comissão</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {teamMembers.map((member) => {
                  const getStatusBadge = (member: TeamMember) => {
                    if (member.tipo === 'membro') {
                      return member.ativo ? (
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                          Ativo
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-50 text-gray-700 border border-gray-200">
                          Inativo
                        </span>
                      );
                    }

                    // Convite
                    switch (member.status) {
                      case 'PENDING':
                        return (
                          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                            Convite Pendente
                          </span>
                        );
                      case 'EXPIRED':
                        return (
                          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
                            Convite Expirado
                          </span>
                        );
                      case 'REVOKED':
                        return (
                          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-50 text-gray-700 border border-gray-200">
                            Convite Revogado
                          </span>
                        );
                      default:
                        return null;
                    }
                  };

                  return (
                    <tr key={member.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="mr-4">
                            <Avatar
                              name={member.nome || member.email}
                              id={member.id}
                              imageUrl={member.avatarUrl}
                              size="md"
                            />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {member.nome || member.email}
                            </div>
                            <div className="text-xs text-gray-500">{member.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {member.tipo === 'convite' ? (
                            <span className="text-gray-400 italic">Aguardando</span>
                          ) : (
                            member.cargo || 'â€”'
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {member.tipo === 'convite' ? (
                            <Tooltip
                              content="A comissão será contabilizada de acordo com os agendamentos de um mês fechado"
                              position="bottom"
                              delay={100}
                            >
                              <div className="cursor-help inline-block">
                                <CardIcon icon="alert" size="sm" />
                              </div>
                            </Tooltip>
                          ) : member.salario ? (
                            <div className="space-y-0.5">
                              <div className="font-semibold text-gray-900">{member.salario}%</div>
                              <div className="text-xs text-gray-500">
                                {member.comissaoTotal
                                  ? member.comissaoTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                                  : 'R$ 0,00'
                                }
                              </div>
                            </div>
                          ) : (
                            <Tooltip
                              content="A comissão será contabilizada de acordo com os agendamentos de um mês fechado"
                              position="bottom"
                              delay={100}
                            >
                              <div className="cursor-help inline-block">
                                <CardIcon icon="alert" size="sm" />
                              </div>
                            </Tooltip>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(member)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {member.tipo === 'convite'
                          ? new Date(member.createdAt!).toLocaleDateString("pt-BR")
                          : member.dataAdmissao
                            ? new Date(member.dataAdmissao).toLocaleDateString("pt-BR")
                            : 'â€”'
                        }
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          {member.tipo === 'membro' ? (
                            <>
                              <Tooltip content={member.ativo ? "Desativar profissional" : "Ativar profissional"} position="bottom" delay={100}>
                                <button
                                  onClick={() => handleToggleStatusClick(member)}
                                  className="text-gray-600 hover:text-gray-900 p-1"
                                  aria-label={member.ativo ? "Desativar" : "Ativar"}
                                >
                                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                </button>
                              </Tooltip>
                              <Tooltip content="Editar profissional" position="bottom" delay={100}>
                                <button
                                  onClick={() => handleEditClick(member)}
                                  className="text-gray-600 hover:text-gray-900 p-1"
                                  aria-label="Editar"
                                >
                                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536M16.5 3.964a2.25 2.25 0 113.182 3.182L7.5 19.5 3 21l1.5-4.5L16.5 3.964z" />
                                  </svg>
                                </button>
                              </Tooltip>
                            </>
                          ) : (
                            <Tooltip content="Reenviar convite por email" position="bottom" delay={100}>
                              <button
                                className="text-blue-600 hover:text-blue-800 text-xs font-medium px-2 py-1"
                                aria-label="Reenviar convite"
                              >
                                Reenviar
                              </button>
                            </Tooltip>
                          )}
                          <Tooltip content={member.tipo === 'convite' ? "Cancelar convite" : "Remover profissional"} position="bottom" delay={100}>
                            <button
                              onClick={() => handleDeleteClick(member)}
                              className="text-gray-600 hover:text-red-600 p-1"
                              aria-label="Excluir"
                            >
                              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m-7 0V5a2 2 0 012-2h2a2 2 0 012 2v2" />
                              </svg>
                            </button>
                          </Tooltip>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal de convidar profissional (Modal.tsx) */}
      <Modal isOpen={showAddModal} onClose={() => { setShowAddModal(false); setSelectedServices([]); }} title="Convidar Profissional" maxWidth="lg">
        <div className="p-6 space-y-4">
          <Input
            label="E-mail do profissional"
            type="email"
            placeholder="nome@dominio.com"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            required
          />
          <Select
            label="Tipo de Usuário"
            placeholder="Selecione o tipo"
            value={inviteUserType}
            onChange={(value) => setInviteUserType(value)}
            options={[
              { value: "usuario", label: "Profissional" },
              { value: "dono", label: "Dono" }
            ]}
            required
          />

          {/* Seleção de Serviços com card de borda dupla (estilo KPIs) */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Serviços que o profissional pode realizar
            </label>
            {loadingServices ? (
              <div className="text-sm text-gray-500">Carregando serviços...</div>
            ) : services.length === 0 ? (
              <div className="text-sm text-gray-500">Nenhum serviço cadastrado ainda.</div>
            ) : (
              <div className="relative">
                <div className="absolute inset-1 translate-x-2 translate-y-2 rounded-lg border border-gray-200 z-0 pointer-events-none"></div>
                <div className="relative z-10 bg-white rounded-lg border border-gray-200">
                  <div className="p-3 max-h-60 overflow-y-auto space-y-2">
                    {services.map((service) => (
                      <div key={service.id} className="px-2 py-1 rounded hover:bg-gray-50">
                        <Checkbox
                          size="md"
                          checked={selectedServices.includes(service.id)}
                          onChange={(e) => {
                            const checked = (e.target as HTMLInputElement).checked;
                            if (checked) {
                              setSelectedServices([...selectedServices, service.id]);
                            } else {
                              setSelectedServices(selectedServices.filter(id => id !== service.id));
                            }
                          }}
                          label={
                            <div className="flex-1">
                              <div className="text-sm font-medium text-gray-900">{service.nome}</div>
                              {service.descricao && (
                                <div className="text-xs text-gray-500">{service.descricao}</div>
                              )}
                              <div className="text-xs text-gray-400 mt-0.5">
                                {service.duracao} min {service.preco && `â€¢ ${service.preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`}
                              </div>
                            </div>
                          }
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Selecione os serviços que este profissional poderá executar. Você pode alterar isso depois.
            </p>
          </div>

          {inviteError && <div className="text-sm text-red-600">{inviteError}</div>}
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => { setShowAddModal(false); setSelectedServices([]); }}>Cancelar</Button>
            <Button variant="primary" onClick={handleSendInvite} isLoading={sendingInvite} disabled={sendingInvite || !inviteEmail}>Enviar Convite</Button>
          </div>
        </div>
      </Modal>

      {/* Modal de ajuda (passo a passo) */}
      <Modal isOpen={showHelpModal} onClose={() => setShowHelpModal(false)} title="Como convidar e gerenciar profissionais" maxWidth="2xl">
        <div className="p-6 space-y-6">
          {/* Passo 1 */}
          <div className="relative">
            <div className="absolute inset-1 translate-x-2 translate-y-2 rounded-lg border border-gray-200 z-0 pointer-events-none"></div>
            <div className="relative z-10 bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-start gap-4">
                <img src="/assets/ajuda1.png" alt="Coruja ajudante" className="w-14 h-14 object-contain" />
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-gray-900">Passo 1 â€” Enviar convite</h3>
                  <p className="text-sm text-gray-600 mt-1">Clique em â€œConvidar Profissionalâ€, informe o e-mail, selecione o tipo de usuÃ¡rio e os serviÃ§os que ele poderÃ¡ realizar.</p>
                  {/* PrÃ©via do formulÃ¡rio real (desabilitado) */}
                  <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Input label="E-mail do profissional" placeholder="nome@dominio.com" disabled />
                    <Select label="Tipo de UsuÃ¡rio" placeholder="Selecione o tipo" value={"usuario"} onChange={() => { }} options={[{ value: 'usuario', label: 'Profissional' }, { value: 'dono', label: 'Dono' }]} disabled />
                    <div className="md:col-span-2">
                      <div className="relative">
                        <div className="absolute inset-1 translate-x-2 translate-y-2 rounded-lg border border-gray-200 z-0 pointer-events-none"></div>
                        <div className="relative z-10 bg-white rounded-lg border border-gray-200">
                          <div className="p-3 max-h-40 overflow-y-auto space-y-2">
                            {(services || []).slice(0, 4).map((s) => (
                              <Checkbox key={s.id} size="md" checked={false} onChange={() => { }} disabled label={<div>
                                <div className="text-sm font-medium text-gray-900">{s.nome}</div>
                                {s.descricao && <div className="text-xs text-gray-500">{s.descricao}</div>}
                              </div>} />
                            ))}
                            {services.length === 0 && (
                              <div className="text-xs text-gray-500">Exemplo de serviÃ§os aparecerÃ¡ aqui.</div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Passo 2 */}
          <div className="relative">
            <div className="absolute inset-1 translate-x-2 translate-y-2 rounded-lg border border-gray-200 z-0 pointer-events-none"></div>
            <div className="relative z-10 bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-start gap-4">
                <img src="/assets/ajuda2.png" alt="Convite por email" className="w-14 h-14 object-contain rounded" />
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-gray-900">Passo 2 â€” Profissional recebe o convite</h3>
                  <p className="text-sm text-gray-600 mt-1">O convidado recebe um e-mail com o link de aceite. Ao aceitar, ele entra na sua empresa como profissional.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Passo 3 */}
          <div className="relative">
            <div className="absolute inset-1 translate-x-2 translate-y-2 rounded-lg border border-gray-200 z-0 pointer-events-none"></div>
            <div className="relative z-10 bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-start gap-4">
                <img src="/assets/ajuda3.png" alt="Equipe atualizada" className="w-14 h-14 object-contain rounded" />
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-gray-900">Passo 3 â€” Equipe atualizada</h3>
                  <p className="text-sm text-gray-600 mt-1">ApÃ³s o aceite, o profissional aparece na lista de â€œProfissionaisâ€. VocÃª pode editar os dados a qualquer momento.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Passo 4 */}
          <div className="relative">
            <div className="absolute inset-1 translate-x-2 translate-y-2 rounded-lg border border-gray-200 z-0 pointer-events-none"></div>
            <div className="relative z-10 bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-start gap-4">
                <img src="/assets/ajuda4.png" alt="Editar profissional" className="w-14 h-14 object-contain" />
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-gray-900">Passo 4 â€” Editar profissional</h3>
                  <p className="text-sm text-gray-600 mt-1">Clique em “Editar” para ajustar cargo, comissão e os serviços que o profissional pode realizar.</p>
                  {/* PrÃ©via do card de serviÃ§os (desabilitado) */}
                  <div className="mt-3">
                    <div className="relative">
                      <div className="absolute inset-1 translate-x-2 translate-y-2 rounded-lg border border-gray-200 z-0 pointer-events-none"></div>
                      <div className="relative z-10 bg-white rounded-lg border border-gray-200">
                        <div className="p-3 max-h-28 overflow-y-auto space-y-2">
                          {(services || []).slice(0, 3).map((s) => (
                            <Checkbox key={s.id} size="md" checked={true} onChange={() => { }} disabled label={<div>
                              <div className="text-sm font-medium text-gray-900">{s.nome}</div>
                              {s.descricao && <div className="text-xs text-gray-500">{s.descricao}</div>}
                            </div>} />
                          ))}
                          {services.length === 0 && (
                            <div className="text-xs text-gray-500">VocÃª verÃ¡ aqui os serviÃ§os marcados para o profissional.</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* BotÃ£o de fechar removido conforme solicitado */}
        </div>
      </Modal>

      {/* Modal de editar profissional */}
      <Modal isOpen={showEditModal} onClose={() => { setShowEditModal(false); setSelectedServices([]); }} title="Editar Profissional" maxWidth="lg">
        <div className="p-6 space-y-4">
          <div className="text-sm text-gray-500 mb-4">
            Editando: <span className="font-medium text-gray-900">{memberToEdit?.nome || memberToEdit?.email}</span>
          </div>

          <Select
            label="Tipo de UsuÃ¡rio"
            placeholder="Selecione o tipo"
            value={editUserType}
            onChange={(value) => setEditUserType(value)}
            options={[
              { value: "usuario", label: "Profissional" },
              { value: "dono", label: "Dono" }
            ]}
            required
          />

          <Input
            label="Cargo"
            type="text"
            placeholder="Ex: Cabeleireiro, Manicure, etc."
            value={editCargo}
            onChange={(e) => setEditCargo(e.target.value)}
          />

          <Input
            label="Comissão (%)"
            type="number"
            placeholder="0.00"
            value={editSalario}
            onChange={(e) => setEditSalario(e.target.value)}
            step="0.01"
          />

          {/* Seleção de Serviços com card de borda dupla (estilo KPIs) */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Serviços que o profissional pode realizar
            </label>
            {loadingServices ? (
              <div className="text-sm text-gray-500">Carregando serviços...</div>
            ) : services.length === 0 ? (
              <div className="text-sm text-gray-500">Nenhum serviço cadastrado ainda.</div>
            ) : (
              <div className="relative">
                <div className="absolute inset-1 translate-x-2 translate-y-2 rounded-lg border border-gray-200 z-0 pointer-events-none"></div>
                <div className="relative z-10 bg-white rounded-lg border border-gray-200">
                  <div className="p-3 max-h-60 overflow-y-auto space-y-2">
                    {services.map((service) => (
                      <div key={service.id} className="px-2 py-1 rounded hover:bg-gray-50">
                        <Checkbox
                          size="md"
                          checked={selectedServices.includes(service.id)}
                          onChange={(e) => {
                            const checked = (e.target as HTMLInputElement).checked;
                            if (checked) {
                              setSelectedServices([...selectedServices, service.id]);
                            } else {
                              setSelectedServices(selectedServices.filter(id => id !== service.id));
                            }
                          }}
                          label={
                            <div className="flex-1">
                              <div className="text-sm font-medium text-gray-900">{service.nome}</div>
                              {service.descricao && (
                                <div className="text-xs text-gray-500">{service.descricao}</div>
                              )}
                              <div className="text-xs text-gray-400 mt-0.5">
                                {service.duracao} min {service.preco && `â€¢ ${service.preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`}
                              </div>
                            </div>
                          }
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Selecione os serviços que este profissional poderá executar.
            </p>
          </div>

          {editError && <div className="text-sm text-red-600">{editError}</div>}
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => { setShowEditModal(false); setSelectedServices([]); }}>Cancelar</Button>
            <Button variant="primary" onClick={handleSaveEdit} isLoading={savingEdit} disabled={savingEdit}>Salvar Alterações</Button>
          </div>
        </div>
      </Modal>

      {/* Confirmação de alteração de status */}
      <FooterConfirmation
        isOpen={toggleStatusModalOpen}
        onClose={cancelToggleStatus}
        onConfirm={confirmToggleStatus}
        title="Permite esta ação?"
        subtitle="Após aceitar a ação será executada."
        message={
          memberToToggle
            ? `Você quer mesmo ${memberToToggle.ativo ? 'desativar' : 'ativar'} o profissional "${memberToToggle.nome}"?`
            : ''
        }
        confirmText="Aceitar"
        cancelText="Cancelar"
        isLoading={isTogglingStatus}
      />

      {/* Confirmação de exclusão */}
      <FooterConfirmation
        isOpen={deleteModalOpen}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        title="Permite esta ação?"
        subtitle="Após aceitar a ação será executada."
        message={
          memberToDelete
            ? memberToDelete.tipo === 'convite'
              ? `Você quer mesmo cancelar o convite para "${memberToDelete.email}"? Esta ação não pode ser desfeita.`
              : `Você quer mesmo remover o profissional "${memberToDelete.nome}" da equipe? Esta ação não pode ser desfeita.`
            : ''
        }
        confirmText="Aceitar"
        cancelText="Cancelar"
        isLoading={isDeleting}
      />
    </div>
  );
}



