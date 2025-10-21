"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Modal from "@/components/Modal";
import Button from "@/components/visual/Button";

interface WelcomeModalProps {
  userName: string;
  planName?: string;
  onClose: () => void;
}

export default function WelcomeModal({ userName, planName, onClose }: WelcomeModalProps) {
  const [isOpen, setIsOpen] = useState(true);

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(onClose, 300); // Espera animação do modal fechar
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title=""
      variant="center"
      hideHeader
      dismissible={false}
      maxWidth="2xl"
    >
      <div className="overflow-hidden rounded-lg bg-white">
        {/* Header com gradiente rosa e imagem */}
        <div className="relative bg-gradient-to-br from-[#C5837B] to-[#B07268] px-8 py-12">
          <div className="flex items-center justify-center gap-8">
            <h1 className="text-5xl font-bold text-white tracking-[0.15em]">
              OBRI
            </h1>
            
            {/* Imagem de agradecimento */}
            <div className="relative w-[120px] h-[120px]">
              <Image
                src="/assets/agradecimento.png"
                alt="Agradecimento"
                fill
                className="object-contain"
                priority
              />
            </div>

            <h1 className="text-5xl font-bold text-white tracking-[0.15em]">
              GADO
            </h1>
          </div>
        </div>

        {/* Conteúdo do modal */}
        <div className="px-8 py-10">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 tracking-tight">
            Bem-vindo!!!
          </h2>

          <div className="space-y-5 text-gray-700 leading-relaxed text-[15px]">
            <p className="text-base">
              Olá, <span className="font-semibold text-gray-900">{userName}</span>,
            </p>
            <p className="text-justify">
              É com grande satisfação que damos as boas-vindas ao{" "}
              {planName && (
                <span className="font-semibold text-[#C5837B]">
                  Plano {planName}
                </span>
              )}
              {planName && " da "}
              <span className="font-bold text-[#C5837B]">Glowy</span>!
              Agradecemos imensamente pela confiança em nossa plataforma para
              otimizar a gestão e os agendamentos da sua empresa.
            </p>
            <p className="text-justify">
              Com o seu plano, você acaba de desbloquear o acesso a todas as
              nossas funcionalidades premium, pensadas para levar seu negócio a
              um novo patamar de eficiência e organização. Convidamos você a
              explorar a plataforma e descobrir como nossas ferramentas
              avançadas podem simplificar seu dia a dia e potencializar seus
              resultados.
            </p>
            <p className="text-justify">
              Nossa equipe de suporte está à sua inteira disposição para
              auxiliar em qualquer dúvida. Desejamos que sua experiência seja
              excelente e que nossa parceria traga muito sucesso.
            </p>
          </div>

          <div className="mt-8 mb-6 text-[15px]">
            <p className="text-gray-900 font-medium">Atenciosamente,</p>
            <p className="text-gray-900 font-semibold">Equipe Glowy</p>
          </div>

          <div className="flex justify-end">
            <Button
              onClick={handleClose}
              variant="primary"
              size="lg"
              className="px-12"
            >
              Continuar
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
