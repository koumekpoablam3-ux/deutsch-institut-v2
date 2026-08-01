export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-[#f8f9fb] dark:bg-[#050d1a] flex">
      {/* Sidebar skeleton */}
      <div className="hidden lg:block w-64 bg-[#1B3A5C] h-screen shrink-0" />
      <div className="flex-1 lg:ml-64">
        <div className="p-4 lg:p-8 space-y-6">
          {/* Header skeleton */}
          <div className="h-7 bg-[#1B3A5C]/10 dark:bg-white/5 rounded w-48 animate-pulse" />
          {/* Banner skeleton */}
          <div className="bg-[#1B3A5C]/20 rounded-2xl p-6 h-28 animate-pulse" />
          {/* Level path skeleton */}
          <div className="bg-white dark:bg-[#132d4a] rounded-2xl p-6 shadow-sm">
            <div className="h-5 bg-[#1B3A5C]/10 dark:bg-white/5 rounded w-48 mb-6 animate-pulse" />
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="rounded-xl border-2 border-gray-200 dark:border-gray-700 p-4 text-center">
                  <div className="w-5 h-5 bg-[#1B3A5C]/10 dark:bg-white/5 rounded-full mx-auto mb-2 animate-pulse" />
                  <div className="h-7 bg-[#1B3A5C]/10 dark:bg-white/5 rounded w-12 mx-auto mb-2 animate-pulse" />
                  <div className="h-3 bg-[#1B3A5C]/10 dark:bg-white/5 rounded w-16 mx-auto mb-2 animate-pulse" />
                  <div className="h-5 bg-[#1B3A5C]/10 dark:bg-white/5 rounded-full w-16 mx-auto animate-pulse" />
                </div>
              ))}
            </div>
          </div>
          {/* Stats skeleton */}
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="h-5 bg-[#1B3A5C]/10 dark:bg-white/5 rounded w-24 animate-pulse" />
              <div className="bg-white dark:bg-[#132d4a] rounded-xl p-5 shadow-sm h-20 animate-pulse" />
              <div className="bg-white dark:bg-[#132d4a] rounded-xl p-5 shadow-sm h-20 animate-pulse" />
            </div>
            <div className="space-y-4">
              <div className="h-5 bg-[#1B3A5C]/10 dark:bg-white/5 rounded w-24 animate-pulse" />
              <div className="bg-white dark:bg-[#132d4a] rounded-xl p-4 shadow-sm h-20 animate-pulse" />
              <div className="bg-white dark:bg-[#132d4a] rounded-xl p-4 shadow-sm h-20 animate-pulse" />
              <div className="bg-white dark:bg-[#132d4a] rounded-xl p-4 shadow-sm h-20 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}