"use client";

import { use, useEffect, useState } from "react";
import Input from "@/components/visual/Input";
import TextArea from "@/components/visual/TextArea";
import Button from "@/components/visual/Button";
import CardIcon from "@/components/visual/CardIcon";
import { useRouter } from "next/navigation";

interface ConviteInfo {
  email: string;
  mensagem?: string;
  status: string;
  expired: boolean;
  empresa: { id: string; nome: string };
  convidadoPor: { email: string };
  createdAt: string;
}

export default function AcceptInvitePage({ params }: { params: Promise<{ token: string }> }) {
  const router = useRouter();
  const { token } = use(params);
  const [info, setInfo] = useState<ConviteInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/convites/${token}`);
        if (!res.ok) throw new Error("Convite inválido");
        const data = await res.json();
        setInfo(data);
        setEmail(data.email);
      } catch (e: any) {
        setError(e.message || "Erro ao carregar convite");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token]);

  const handleAccept = async () => {
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch(`/api/convites/${token}/accept`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, email, senha }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Falha ao aceitar convite");
      router.push("/views/manager/profissionais/equipe");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Carregando convite...</div>
      </div>
    );
  }

  if (!info || info.expired || info.status !== "PENDING") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="relative max-w-lg w-full">
          <div className="absolute inset-1 translate-x-2 translate-y-2 rounded-lg border border-gray-200 z-0 pointer-events-none" />
          <div className="relative z-10 bg-white rounded-lg border border-gray-200 p-8 text-center">
            <CardIcon size="lg" icon="alert" />
            <h1 className="text-xl font-semibold text-gray-900 mt-4">Convite inválido ou expirado</h1>
            <p className="text-gray-600 mt-2">Solicite um novo convite ao responsável.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-xl mx-auto">
        <div className="relative">
          <div className="absolute inset-1 translate-x-2 translate-y-2 rounded-lg border border-gray-200 z-0 pointer-events-none" />
          <div className="relative z-10 bg-white rounded-lg border border-gray-200 p-6 sm:p-8">
            <div className="text-center mb-6">
              <div className="inline-flex">
                <CardIcon size="lg" icon="briefcase" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mt-4">Convite para equipe</h1>
              <p className="text-gray-600 mt-1">
                Você foi convidado por <span className="font-medium">{info.convidadoPor.email}</span> para entrar em <span className="font-medium">{info.empresa.nome}</span>
              </p>
              {info.mensagem && (
                <blockquote className="mt-4 p-3 rounded-lg bg-[#F5D2D2]/30 border border-[#e5e7eb] text-gray-700">
                  {info.mensagem}
                </blockquote>
              )}
            </div>

            <div className="space-y-4">
              <Input label="Nome completo" value={nome} onChange={(e) => setNome(e.target.value)} required />
              <Input label="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} required />
              <Input label="Senha" type="password" value={senha} onChange={(e) => setSenha(e.target.value)} required />

              {error && <div className="text-sm text-red-600">{error}</div>}

              <div className="flex justify-end pt-2">
                <Button onClick={handleAccept} variant="primary" isLoading={submitting} disabled={submitting}>
                  Aceitar e criar acesso
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

