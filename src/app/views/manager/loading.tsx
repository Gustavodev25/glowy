import UniversalLoader from "@/components/UniversalLoader";

export default function ManagerLoading() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <UniversalLoader size="xl" text="Carregando painel..." />
    </div>
  );
}
