// Hex grid logic for the حروف game: letter assignment, neighbor lookup, and win detection.
//
// POSITIONING — mirrors hex-grid.tsx exactly:
//   cx(r,c) = c * hSpacing + (N-1-r) * rowOffset + w/2
//   cy(r)   = r * vSpacing + h/2
//   Two cells are adjacent when their center-to-center distance < hSpacing * 1.1.
//
// Win conditions:
//   team1 wins by connecting row 0 (top) to row (size-1) (bottom).
//   team2 wins by connecting col 0 (left) to col (size-1) (right).

import type { HexCell, GridSize, TeamId } from '../types'

// Must match DIMS in hex-grid.tsx exactly.
const HEX_DIMS: Record<GridSize, { w: number; h: number; gap: number }> = {
  4: { w: 100, h: 112, gap: 4 },
  5: { w: 90,  h: 100, gap: 4 },
  6: { w: 75,  h: 86,  gap: 4 },
}

const ALL_ARABIC_LETTERS = [
  'أ', 'ب', 'ت', 'ث', 'ج', 'ح', 'خ', 'د', 'ذ', 'ر', 'ز',
  'س', 'ش', 'ص', 'ض', 'ط', 'ظ', 'ع', 'غ', 'ف', 'ق', 'ك',
  'ل', 'م', 'ن', 'ه', 'و', 'ي',
] as const  // 28 letters

function shuffle<T>(arr: T[]): T[] {
  const result = [...arr]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const temp = result[i]
    result[i] = result[j]
    result[j] = temp
  }
  return result
}

export function getArabicLetters(size: GridSize): string[] {
  const cellCount = size * size  // 16, 25, or 36

  if (cellCount <= ALL_ARABIC_LETTERS.length) {
    return shuffle([...ALL_ARABIC_LETTERS]).slice(0, cellCount)
  }

  // 6×6 = 36 cells: all 28 letters + 8 random repeats
  const repeats = shuffle([...ALL_ARABIC_LETTERS]).slice(0, cellCount - ALL_ARABIC_LETTERS.length)
  return shuffle([...ALL_ARABIC_LETTERS, ...repeats])
}

export function generateGrid(size: GridSize): HexCell[][] {
  const letters = getArabicLetters(size)
  let letterIndex = 0

  const grid: HexCell[][] = []
  for (let row = 0; row < size; row++) {
    const gridRow: HexCell[] = []
    for (let col = 0; col < size; col++) {
      gridRow.push({
        id: `r${row}c${col}`,
        row,
        col,
        letter: letters[letterIndex++],
        owner: null,
        isSelected: false,
      })
    }
    grid.push(gridRow)
  }
  return grid
}

export function getNeighbors(
  row: number,
  col: number,
  gridSize: GridSize
): { row: number; col: number }[] {
  // Exact same constants as hex-grid.tsx — must stay in sync.
  const { w, h, gap } = HEX_DIMS[gridSize]
  const N = gridSize
  const hSpacing = w + gap
  const vSpacing = Math.round(h * 0.75 + gap * 0.5)
  const rowOffset = hSpacing / 2

  function getCenterPixel(r: number, c: number): { x: number; y: number } {
    // Exact formula copied from hex-grid.tsx cell positioning.
    const x = c * hSpacing + (N - 1 - r) * rowOffset
    const y = r * vSpacing
    return { x: x + w / 2, y: y + h / 2 }
  }

  const myCenter = getCenterPixel(row, col)
  const neighbors: { row: number; col: number }[] = []
  const threshold = w * 1.3

  for (let r = Math.max(0, row - 1); r <= Math.min(gridSize - 1, row + 1); r++) {
    for (let c = Math.max(0, col - 1); c <= Math.min(gridSize - 1, col + 1); c++) {
      if (r === row && c === col) continue
      const otherCenter = getCenterPixel(r, c)
      const dx = myCenter.x - otherCenter.x
      const dy = myCenter.y - otherCenter.y
      const distance = Math.sqrt(dx * dx + dy * dy)
      if (distance < threshold) {
        neighbors.push({ row: r, col: c })
      }
    }
  }

  return neighbors
}

export function checkWin(
  grid: HexCell[][],
  teamId: TeamId,
  gridSize: GridSize
): { won: boolean; path: string[] } {
  const isStartCell = (cell: HexCell): boolean =>
    teamId === 'team1' ? cell.row === 0 : cell.col === 0

  const isEndCell = (cell: HexCell): boolean =>
    teamId === 'team1' ? cell.row === gridSize - 1 : cell.col === gridSize - 1

  // BFS: start from all team-owned cells on the starting edge.
  const parentMap = new Map<string, string | null>()
  const queue: HexCell[] = []

  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      const cell = grid[r][c]
      if (cell.owner === teamId && isStartCell(cell)) {
        parentMap.set(cell.id, null)
        queue.push(cell)
      }
    }
  }

  let head = 0
  while (head < queue.length) {
    const current = queue[head++]

    if (isEndCell(current)) {
      // Trace back from this cell to a start cell to build the path.
      const path: string[] = []
      let cellId: string | null = current.id
      while (cellId !== null) {
        path.unshift(cellId)
        const parent = parentMap.get(cellId)
        cellId = parent !== undefined ? parent : null
      }
      return { won: true, path }
    }

    for (const { row, col } of getNeighbors(current.row, current.col, gridSize)) {
      const neighbor = grid[row][col]
      if (neighbor.owner === teamId && !parentMap.has(neighbor.id)) {
        parentMap.set(neighbor.id, current.id)
        queue.push(neighbor)
      }
    }
  }

  return { won: false, path: [] }
}
