export default function BlogLoading() {
  return (
    <div className="min-h-screen pt-16 bg-[#f8f9fb] dark:bg-[#050d1a]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="text-center mb-12 space-y-3">
          <div className="h-4 bg-[#D4A843]/20 rounded-full w-24 mx-auto animate-pulse" />
          <div className="h-8 bg-[#1B3A5C]/10 dark:bg-white/5 rounded w-64 mx-auto animate-pulse" />
          <div className="h-4 bg-[#1B3A5C]/10 dark:bg-white/5 rounded w-96 max-w-full mx-auto animate-pulse" />
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-[#132d4a] rounded-2xl overflow-hidden shadow-sm">
              <div className="h-40 bg-[#1B3A5C]/10 dark:bg-white/5 animate-pulse" />
              <div className="p-5 space-y-3">
                <div className="h-3 bg-[#1B3A5C]/10 dark:bg-white/5 rounded w-28 animate-pulse" />
                <div className="h-5 bg-[#1B3A5C]/10 dark:bg-white/5 rounded w-full animate-pulse" />
                <div className="h-5 bg-[#1B3A5C]/10 dark:bg-white/5 rounded w-4/5 animate-pulse" />
                <div className="h-3 bg-[#1B3A5C]/10 dark:bg-white/5 rounded w-full animate-pulse" />
                <div className="h-3 bg-[#1B3A5C]/10 dark:bg-white/5 rounded w-2/3 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}