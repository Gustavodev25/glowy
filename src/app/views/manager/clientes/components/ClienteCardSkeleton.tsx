export default function ClienteCardSkeleton() {
  return (
    <div className="relative">
      {/* Card com efeitos do Modal */}
      <div className="relative bg-white border border-gray-300 rounded-lg shadow-[3px_3px_0px_#e5e7eb] overflow-hidden">
        {/* Efeito de brilho igual ao Modal */}
        <span className="absolute top-0 left-0 -translate-x-1/3 -translate-y-1/3 w-24 h-24 bg-[#C5837B] rounded-full blur-3xl opacity-20 animate-pulse" />
        <span className="absolute bottom-0 right-0 translate-x-1/3 translate-y-1/3 w-24 h-24 bg-[#C5837B] rounded-full blur-3xl opacity-20 animate-pulse" />
        
        {/* Conteúdo do card */}
        <div className="relative z-10 p-4 animate-pulse">
          <div className="flex items-start gap-3 mb-3">
            {/* Avatar Skeleton */}
            <div className="w-12 h-12 rounded-full bg-gray-200" />

            {/* Info Skeleton */}
            <div className="flex-1 min-w-0">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
            </div>
          </div>

          {/* Detalhes Skeleton */}
          <div className="space-y-1.5 pt-3 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-gray-200" />
              <div className="h-3 bg-gray-200 rounded w-28" />
            </div>

            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-gray-200" />
              <div className="h-3 bg-gray-200 rounded w-32" />
            </div>
          </div>

          {/* Footer Skeleton */}
          <div className="mt-3 pt-2 border-t border-gray-100">
            <div className="h-2 bg-gray-200 rounded w-24" />
          </div>
        </div>
      </div>
    </div>
  );
}
