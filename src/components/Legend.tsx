export function Legend() {
  const items: { color: string; icon: React.ReactNode; label: string }[] = [
    { color: 'bg-sky-100', icon: null, label: 'Water (unknown)' },
    { color: 'bg-gray-400', icon: <span className="text-slate-600 font-bold text-xs leading-none">{"\u2715"}</span>, label: 'Miss' },
    { color: 'bg-red-500', icon: <span className="text-white font-bold text-xs leading-none">{"\u{1F4A5}"}</span>, label: 'Hit' },
    { color: 'bg-red-800', icon: <span className="text-white font-bold text-xs leading-none">{"\u{1F525}"}</span>, label: 'Sunk' },
    { color: 'bg-blue-500', icon: null, label: 'Your ship' },
  ]

  return (
    <div className="bg-white/80 rounded-lg border border-slate-200 px-3 py-2">
      <h3 className="text-xs sm:text-sm font-semibold text-slate-600 mb-1.5">Legend</h3>
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        {items.map((item) => (
          <div key={item.label} className="flex items-center gap-1.5">
            <div className={`w-5 h-5 sm:w-6 sm:h-6 border border-slate-300 rounded-sm flex items-center justify-center ${item.color}`}>
              {item.icon}
            </div>
            <span className="text-[10px] sm:text-xs text-slate-600">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
