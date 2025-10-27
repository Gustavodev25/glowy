export default function NotFoundPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <h1>404 - Página não encontrada</h1>
        <p>A página que você procura não existe.</p>
        <a href="/">Voltar para a página inicial</a>
      </div>
    </div>
  );
}

