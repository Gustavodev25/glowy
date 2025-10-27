export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-6">
      <h1 className="text-3xl font-semibold text-gray-900">Página não encontrada</h1>
      <p className="mt-2 text-gray-600">A página que você procura não existe.</p>
      <a href="/" className="mt-6 inline-block px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 shadow-[3px_3px_0px_#e5e7eb] hover:bg-gray-50">
        Voltar para a página inicial
      </a>
    </div>
  );
}

