"use client";

interface SecurityLevelProps {
  level: number; // 0-100
  status: "baixo" | "medio" | "alto";
}

export default function SecurityLevel({ level, status }: SecurityLevelProps) {
  const getColor = () => {
    if (status === "alto") return "bg-green-500";
    if (status === "medio") return "bg-yellow-500";
    return "bg-red-500";
  };

  const getTextColor = () => {
    if (status === "alto") return "text-green-700";
    if (status === "medio") return "text-yellow-700";
    return "text-red-700";
  };

  const getIcon = () => {
    if (status === "alto") {
      return (
        <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      );
    }
    if (status === "medio") {
      return (
        <svg className="w-7 h-7 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      );
    }
    return (
      <svg className="w-7 h-7 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    );
  };

  const getStatusText = () => {
    if (status === "alto") return "Alta Segurança";
    if (status === "medio") return "Segurança Média";
    return "Baixa Segurança";
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {getIcon()}
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Nível de Segurança</h3>
            <p className={`text-sm font-medium ${getTextColor()}`}>{getStatusText()}</p>
          </div>
        </div>
        <div className="text-right">
          <div className={`text-3xl font-bold ${getTextColor()}`}>{level}%</div>
        </div>
      </div>

      {/* Barra de progresso */}
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div
          className={`h-full ${getColor()} transition-all duration-500 ease-out`}
          style={{ width: `${level}%` }}
        />
      </div>

      {/* Recomendações */}
      {status !== "alto" && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-start gap-2">
            <svg className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
            </svg>
            <div className="flex-1">
              <p className="text-sm text-gray-700 font-medium mb-2">Recomendações:</p>
              <ul className="text-sm text-gray-600 space-y-1">
                {status === "baixo" && (
                  <>
                    <li>• Ative a autenticação em duas etapas (2FA)</li>
                    <li>• Configure um email de recuperação</li>
                    <li>• Adicione perguntas de segurança</li>
                  </>
                )}
                {status === "medio" && (
                  <>
                    <li>• Complete todas as perguntas de segurança</li>
                    <li>• Verifique seu email de recuperação</li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
