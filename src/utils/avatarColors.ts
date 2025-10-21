/**
 * Gera uma cor consistente baseada em uma string (nome ou ID)
 * A mesma string sempre retornará a mesma cor
 * 
 * Paleta de cores igual à usada na Minha Agenda
 */

const avatarColors = [
  { bg: "rgba(197, 131, 123, 0.2)", text: "#7C4A3F" }, // Rosa/Terracota - cor padrão Glowy
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

/**
 * Hash simples de string para número (mesma função da Minha Agenda)
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

/**
 * Retorna uma cor de avatar consistente baseada no ID ou nome
 * @param identifier - ID ou nome para gerar a cor
 * @returns Objeto com background e text color em rgba/hex
 */
export function getAvatarColor(identifier: string) {
  const hash = hashString(identifier);
  const index = hash % avatarColors.length;
  return avatarColors[index];
}

/**
 * Extrai as iniciais de um nome
 * @param name - Nome completo
 * @returns String com até 2 iniciais em maiúsculo
 */
export function getInitials(name: string): string {
  if (!name) return "?";

  const words = name.trim().split(/\s+/);

  if (words.length === 1) {
    return words[0].charAt(0).toUpperCase();
  }

  // Pega primeira letra do primeiro nome e do último nome
  return (
    words[0].charAt(0).toUpperCase() + words[words.length - 1].charAt(0).toUpperCase()
  );
}
