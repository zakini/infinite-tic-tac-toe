'use client'

import { useState } from 'react'

enum FilledCellState {
  X = 'X',
  O = 'O',
}

type CellState = FilledCellState | null

type FixedLengthArray<T, L extends number> = readonly T[] & { length: L }
// 3 x 3 grid = 9 total cells
type BoardState = FixedLengthArray<CellState, 9>

const isBoardState = (v: readonly CellState[]): v is BoardState => v.length === 9

const setBoardStateIndex = (b: BoardState, i: number, v: FilledCellState): BoardState => {
  const arr = [
    ...b.slice(0, i),
    v,
    ...b.slice(i + 1),
  ]
  if (!isBoardState(arr)) throw new Error(`Board state does not have 9 elements: ${JSON.stringify(arr)}`)
  return arr
}

const toggleTurn = (t: FilledCellState): FilledCellState => t === FilledCellState.X
  ? FilledCellState.O
  : FilledCellState.X

const findWin = (board: BoardState): FixedLengthArray<number, 3> | null => {
  // The minimal(?) neighbours of each cell to check to find a win
  /* eslint-disable @stylistic/no-multi-spaces */
  const neighbourMap: Record<number, number[]> = {
    0: [1, 3, 4], 1: [4], 2: [4, 5],
    3: [4],       4: [],  5: [],
    6: [7],       7: [],  8: [],
  }
  /* eslint-enable @stylistic/no-multi-spaces */

  for (const k of Object.keys(neighbourMap)) {
    const i = Number(k)
    const cell = board[i]

    if (cell === null) continue

    for (const j of neighbourMap[i]) {
      if (cell !== board[j]) continue

      // check next cell in that line
      const k = j + (j - i)

      if (cell === board[k]) return [i, j, k]
    }
  }

  return null
}

export default function TicTacToeBoard() {
  const [boardState, setBoardState] = useState<BoardState>(Array(9).fill(null) as BoardState)
  const [turn, setTurn] = useState(FilledCellState.X)
  const win = findWin(boardState)

  return (
    <div className="grid grid-cols-3 aspect-square w-1/2 bg-black gap-px">
      {boardState.map((cell, i) => (
        <button
          key={i}
          className={`relative ${win?.includes(i) ? 'bg-green-500' : 'bg-white'}`}
          disabled={cell !== null || win !== null}
          onClick={() => {
            setBoardState(b => setBoardStateIndex(b, i, turn))
            setTurn(t => toggleTurn(t))
          }}
        >
          <span className="absolute">{cell}</span>
        </button>
      ))}
    </div>
  )
}

if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest

  const X = FilledCellState.X
  const O = FilledCellState.O
  const _ = null

  it('finds wins', () => {
    const board: BoardState = [
      X, _, O,
      O, X, _,
      _, _, X,
    ]

    expect(findWin(board)).toStrictEqual([0, 4, 8])
  })

  it('ignores lines of empty cells', () => {
    const board: BoardState = [
      X, _, O,
      O, _, _,
      _, _, X,
    ]

    expect(findWin(board)).toBeNull()
  })
}
