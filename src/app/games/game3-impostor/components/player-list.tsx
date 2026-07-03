import type { ImpPlayer } from '../types'

interface Props {
  players: ImpPlayer[]
  votes?: Record<string, string>
  revealedImpostorNames?: string[]
  showVoteCounts?: Record<string, number>
  highlightEliminated?: string
}

export default function PlayerList({
  players,
  votes = {},
  revealedImpostorNames = [],
  showVoteCounts,
  highlightEliminated,
}: Props) {
  const votersForTarget = (name: string) =>
    Object.entries(votes).filter(([, t]) => t === name).map(([v]) => v)

  return (
    <div className="grid grid-cols-2 gap-2">
      {players.map((p) => {
        const voteCount = showVoteCounts?.[p.name] ?? 0
        const isRevealed = revealedImpostorNames.includes(p.name)
        const isHighlighted = highlightEliminated === p.name

        return (
          <div
            key={p.id}
            className={`rounded-xl px-3 py-2 flex items-center gap-2 transition-all ${
              p.isEliminated
                ? 'bg-zinc-800/50 border border-zinc-700/50 opacity-50'
                : isHighlighted
                  ? 'bg-red-900/60 border-2 border-red-500 animate-pulse'
                  : 'bg-zinc-800 border border-zinc-700'
            }`}
          >
            <span className="text-base font-semibold text-white truncate flex-1">
              {p.isEliminated ? <s>{p.name}</s> : p.name}
            </span>

            {isRevealed && (
              <span className="text-purple-400 text-xs font-bold shrink-0">🎭</span>
            )}

            {showVoteCounts !== undefined && voteCount > 0 && (
              <span className="bg-red-700 text-white text-xs font-bold rounded-full px-2 py-0.5 shrink-0">
                {voteCount}
              </span>
            )}

            {Object.keys(votes).length > 0 && votersForTarget(p.name).length > 0 && !showVoteCounts && (
              <span className="text-yellow-400 text-xs shrink-0">
                ({votersForTarget(p.name).length})
              </span>
            )}
          </div>
        )
      })}
    </div>
  )
}
