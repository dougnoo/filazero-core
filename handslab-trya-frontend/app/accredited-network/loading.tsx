import { Skeleton } from "@/components/ui/skeleton"
import { Loader2 } from "lucide-react"

export default function AccreditedNetworkLoading() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <Skeleton className="h-8 w-1/3 mb-2" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </header>

      {/* Desktop Skeleton */}
      <div className="hidden lg:flex container mx-auto px-4 py-6 gap-6 flex-1">
        <div className="w-1/2 xl:w-3/5 h-full">
          <Skeleton className="w-full h-full rounded-lg" />
        </div>
        <div className="w-1/2 xl:w-2/5 h-full flex flex-col gap-6">
          <Skeleton className="w-full h-1/2 rounded-lg" />
          <Skeleton className="w-full flex-1 rounded-lg" />
        </div>
      </div>

      {/* Mobile/Tablet Skeleton */}
      <div className="lg:hidden container mx-auto px-4 py-6 flex-1">
        <Skeleton className="h-10 w-full mb-4" /> {/* TabsList Skeleton */}
        <Skeleton className="w-full h-[450px] rounded-lg" /> {/* Content Skeleton */}
      </div>

      <div className="flex items-center justify-center py-10 text-gray-500">
        <Loader2 className="h-8 w-8 animate-spin mr-2" />
        Carregando rede credenciada...
      </div>
    </div>
  )
}
