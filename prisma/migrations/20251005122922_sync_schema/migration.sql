-- DropForeignKey
ALTER TABLE "public"."agendamentos" DROP CONSTRAINT "agendamentos_servicoId_fkey";

-- AlterTable
ALTER TABLE "agendamentos" DROP COLUMN "dataAgendamento",
ADD COLUMN     "dataHora" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "duracao" INTEGER NOT NULL,
ADD COLUMN     "empresaId" TEXT NOT NULL,
ADD COLUMN     "valor" DECIMAL(10,2) NOT NULL;

-- AlterTable
ALTER TABLE "empresas" DROP COLUMN "endereco",
DROP COLUMN "logo",
DROP COLUMN "nome",
ADD COLUMN     "bairro" TEXT NOT NULL,
ADD COLUMN     "cep" TEXT NOT NULL,
ADD COLUMN     "cidade" TEXT NOT NULL,
ADD COLUMN     "complemento" TEXT,
ADD COLUMN     "documento" TEXT NOT NULL,
ADD COLUMN     "enderecoCompleto" TEXT,
ADD COLUMN     "estado" TEXT NOT NULL,
ADD COLUMN     "logoPublicId" TEXT,
ADD COLUMN     "logoUrl" TEXT,
ADD COLUMN     "logradouro" TEXT NOT NULL,
ADD COLUMN     "nomeEmpresa" TEXT NOT NULL,
ADD COLUMN     "nomeFantasia" TEXT,
ADD COLUMN     "numero" TEXT NOT NULL,
ADD COLUMN     "razaoSocial" TEXT,
ADD COLUMN     "tipoDocumento" TEXT NOT NULL,
ALTER COLUMN "telefone" SET NOT NULL,
ALTER COLUMN "email" SET NOT NULL;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "ativo" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "avatarPublicId" TEXT,
ADD COLUMN     "avatarUrl" TEXT,
ADD COLUMN     "telefone" TEXT,
ALTER COLUMN "twoFactorConfirmedAt" SET DATA TYPE TIMESTAMP(3);

-- CreateTable
CREATE TABLE "clientes" (
    "id" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT,
    "telefone" TEXT NOT NULL,
    "cpf" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clientes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "funcionarios" (
    "id" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "cargo" TEXT,
    "salario" DECIMAL(10,2),
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "funcionarios_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "empresas_documento_key" ON "empresas"("documento");

-- AddForeignKey
ALTER TABLE "clientes" ADD CONSTRAINT "clientes_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "funcionarios" ADD CONSTRAINT "funcionarios_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "funcionarios" ADD CONSTRAINT "funcionarios_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agendamentos" ADD CONSTRAINT "agendamentos_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agendamentos" ADD CONSTRAINT "agendamentos_servicoId_fkey" FOREIGN KEY ("servicoId") REFERENCES "servicos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agendamentos" ADD CONSTRAINT "agendamentos_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

