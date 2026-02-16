export type GameStatsData = {
  playerShots: number
  playerHits: number
  playerMisses: number
  playerShipsSunk: number
  aiShots: number
  aiHits: number
  aiMisses: number
  aiShipsSunk: number
  turns: number
}

export function createGameStats(): GameStatsData {
  return {
    playerShots: 0,
    playerHits: 0,
    playerMisses: 0,
    playerShipsSunk: 0,
    aiShots: 0,
    aiHits: 0,
    aiMisses: 0,
    aiShipsSunk: 0,
    turns: 0,
  }
}

export function GameStats({ stats, winner }: { stats: GameStatsData; winner: string }) {
  const playerAcc = stats.playerShots > 0
    ? ((stats.playerHits / stats.playerShots) * 100).toFixed(1)
    : '0.0'
  const aiAcc = stats.aiShots > 0
    ? ((stats.aiHits / stats.aiShots) * 100).toFixed(1)
    : '0.0'

  const rows: { label: string; player: string | number; ai: string | number }[] = [
    { label: 'Total Shots', player: stats.playerShots, ai: stats.aiShots },
    { label: 'Hits', player: stats.playerHits, ai: stats.aiHits },
    { label: 'Misses', player: stats.playerMisses, ai: stats.aiMisses },
    { label: 'Accuracy', player: `${playerAcc}%`, ai: `${aiAcc}%` },
    { label: 'Ships Sunk', player: stats.playerShipsSunk, ai: stats.aiShipsSunk },
    { label: 'Turns', player: stats.turns, ai: stats.turns },
  ]

  return (
    <div className="bg-white/90 rounded-lg border border-slate-200 px-4 py-3 max-w-md mx-auto mt-4">
      <h3 className="text-sm sm:text-base font-bold text-slate-700 mb-2 text-center">
        Game Recap
      </h3>
      <div className="grid grid-cols-3 gap-y-1 text-xs sm:text-sm">
        <div />
        <div className="font-semibold text-center text-blue-700">You</div>
        <div className="font-semibold text-center text-red-700">AI</div>
        {rows.map((r) => (
          <div key={r.label} className="contents">
            <div className="text-slate-600">{r.label}</div>
            <div className="text-center">{r.player}</div>
            <div className="text-center">{r.ai}</div>
          </div>
        ))}
      </div>
      <div className="text-center mt-2 text-xs sm:text-sm font-semibold">
        <span className={winner === 'Player' ? 'text-green-700' : 'text-red-700'}>
          {winner === 'Player' ? 'Victory!' : 'Defeat'}
        </span>
      </div>
    </div>
  )
}
