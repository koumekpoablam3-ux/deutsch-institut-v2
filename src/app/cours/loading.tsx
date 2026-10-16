export default function CoursLoading() {
  return (
    <div className="min-h-screen pt-16 bg-[#f8f9fb] dark:bg-[#050d1a]">
      <div className="relative h-80 bg-[#1B3A5C] animate-pulse" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-[#132d4a] rounded-2xl overflow-hidden shadow-sm">
              <div className="h-44 bg-[#1B3A5C]/10 dark:bg-white/5 animate-pulse" />
              <div className="p-5 space-y-3">
                <div className="h-4 bg-[#1B3A5C]/10 dark:bg-white/5 rounded w-3/4 animate-pulse" />
                <div className="flex gap-3">
                  <div className="h-3 bg-[#1B3A5C]/10 dark:bg-white/5 rounded w-16 animate-pulse" />
                  <div className="h-3 bg-[#1B3A5C]/10 dark:bg-white/5 rounded w-20 animate-pulse" />
                </div>
                <div className="flex justify-between pt-3 border-t border-[#1B3A5C]/5">
                  <div className="h-5 bg-[#1B3A5C]/10 dark:bg-white/5 rounded w-24 animate-pulse" />
                  <div className="h-9 w-24 bg-[#1B3A5C]/10 dark:bg-white/5 rounded-lg animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}