'use client'

import type React from 'react'
import type { HexCell, GridSize } from '../types'

const CLIP = 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)'

interface HexCellProps {
  cell: HexCell
  teamColor: string | null
  gridSize: GridSize
  onClick: (cellId: string) => void
  isWinReveal?: boolean
  isWinningCell?: boolean
}

const SIZE_MAP: Record<GridSize, { w: number; h: number; font: string }> = {
  4: { w: 100, h: 112, font: 'text-3xl' },
  5: { w: 90, h: 100, font: 'text-2xl' },
  6: { w: 75, h: 86, font: 'text-xl' },
}

export default function HexCellComponent({
  cell,
  teamColor,
  gridSize,
  onClick,
  isWinReveal = false,
  isWinningCell = false,
}: HexCellProps) {
  const { letter, owner, isSelected, id } = cell
  const { w, h, font } = SIZE_MAP[gridSize]

  function handleClick(): void {
    if (owner === null && !isWinReveal) onClick(id)
  }

  // Claimed — team color fill, not interactive
  if (owner !== null && teamColor) {
    const winStyle: React.CSSProperties = isWinReveal && isWinningCell
      ? { animation: 'pulse-glow 0.8s ease-in-out infinite' }
      : {}
    const opacity = isWinReveal && !isWinningCell ? 0.3 : 1
    return (
      <div
        className={`flex items-center justify-center ${font} font-bold text-bg-primary`}
        style={{ width: w, height: h, clipPath: CLIP, backgroundColor: teamColor, opacity, ...winStyle }}
      >
        {letter}
      </div>
    )
  }

  // Selected — vivid gold fill
  if (isSelected) {
    return (
      <div
        className={`flex items-center justify-center ${font} font-bold text-bg-primary cursor-pointer`}
        style={{ width: w, height: h, clipPath: CLIP, backgroundColor: '#F0B030' }}
        onClick={handleClick}
      >
        {letter}
      </div>
    )
  }

  // Unclaimed — two-div border trick with group hover
  return (
    <div
      className="relative group cursor-pointer"
      style={{ width: w, height: h }}
      onClick={handleClick}
    >
      <div
        className="absolute inset-0 bg-[#3A3F5C] group-hover:bg-[#4A4F70] transition-colors"
        style={{ clipPath: CLIP }}
      />
      <div
        className={`absolute inset-[3px] bg-[#1E2340] group-hover:bg-[#2A3058] flex items-center justify-center ${font} font-bold text-[#F0F0FF] transition-colors`}
        style={{ clipPath: CLIP }}
      >
        {letter}
      </div>
    </div>
  )
}
