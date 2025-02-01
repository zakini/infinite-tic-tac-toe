'use client'

import { create } from 'zustand'
import { combine } from 'zustand/middleware'
import { useShallow } from 'zustand/shallow'

type FixedLengthArray<T, L extends number> = readonly T[] & { length: L }

enum FilledCellState {
  X = 'X',
  O = 'O',
}

// 3 x 3 grid = 9 total cells
// We _have_ to define this as an interface for the circular dependency to work
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface BoardState extends FixedLengthArray<CellState, 9> {}
type SimpleCellState = null | FilledCellState
type CellState = SimpleCellState | BoardState

const isSimpleCellState = (v: unknown): v is SimpleCellState => v === null
  || (typeof v === 'string' && Object.values(FilledCellState).includes(v))
const isBoardState = (v: unknown): v is BoardState => Array.isArray(v)
  && v.length === 9
  && v.every(e => isSimpleCellState(e) || isBoardState(e))

const initialiseBoardState = (): BoardState => Array(9).fill(null) as BoardState

const setBoardStateWithPath = (b: BoardState, path: number[], v: FilledCellState): BoardState => {
  if (path.length <= 0) throw new Error('Path cannot be empty')

  const i = path[0]
  const rest = path.slice(1)
  const target = b[i]

  let newState
  if (rest.length <= 0) {
    if (target !== null) {
      throw new Error(`Attempted to set state for non-empty cell: ${JSON.stringify(b)} | ${JSON.stringify(path)} | ${v}`)
    }

    newState = [
      ...b.slice(0, i),
      v,
      ...b.slice(i + 1),
    ]
  } else {
    if (!isBoardState(target)) {
      throw new Error(`Attempted to set nested state for non-nested cell: ${JSON.stringify(b)} | ${JSON.stringify(path)} | ${v}`)
    }

    newState = [
      ...b.slice(0, i),
      setBoardStateWithPath(target, rest, v),
      ...b.slice(i + 1),
    ]
  }

  if (!isBoardState(newState)) throw new Error(`New board state is invalid: ${JSON.stringify(newState)}`)
  return newState
}

const pickNestedBoardState = (boardState: BoardState, path: number[]): BoardState => {
  for (const i of path) {
    const maybeBoardState = boardState[i]
    if (!isBoardState(maybeBoardState)) {
      throw new Error(`Invalid path when picking state: ${JSON.stringify(path)} | ${JSON.stringify(boardState)}`)
    }
    boardState = maybeBoardState
  }

  return boardState
}

type Win = {
  cells: FixedLengthArray<number, 3>
  player: FilledCellState
}

const findWin = (board: BoardState): Win | null => {
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
    const cell = resolveCellState(board[i])

    if (cell === null) continue

    for (const j of neighbourMap[i]) {
      if (cell !== resolveCellState(board[j])) continue

      // check next cell in that line
      const k = j + (j - i)

      if (cell === resolveCellState(board[k])) {
        return {
          cells: [i, j, k],
          player: cell,
        }
      }
    }
  }

  return null
}

const resolveCellState = (cell: CellState): FilledCellState | null => {
  return isBoardState(cell)
    ? findWin(cell)?.player ?? null
    : cell
}

const useGameStore = create(combine(
  {
    boardState: initialiseBoardState(),
    turn: FilledCellState.X,
  },
  set => ({
    takeTurn: (path: number[]) => set(({ boardState, turn }) => ({
      boardState: setBoardStateWithPath(boardState, path, turn),
      turn: turn === FilledCellState.X ? FilledCellState.O : FilledCellState.X,
    })),
  }),
))

type Props = {
  parentPath?: number[]
  disabled?: boolean | null
}

export default function TicTacToeBoard({ parentPath = [], disabled = null }: Props) {
  const [fullBoardState, takeTurn] = useGameStore(useShallow(
    state => [state.boardState, state.takeTurn],
  ))
  const boardState = pickNestedBoardState(fullBoardState, parentPath)
  const win = findWin(boardState)

  return (
    <div className="grid grid-cols-3 aspect-square w-full bg-black gap-px">
      {boardState.map((cell, i) => isBoardState(cell)
        ? (
            <TicTacToeBoard
              key={i}
              parentPath={[...parentPath, i]}
              disabled={disabled || win !== null}
            />
          )
        : (
            <button
              key={i}
              className={`relative aspect-square ${win?.cells?.includes(i) ? 'bg-green-500' : 'bg-white'}`}
              disabled={disabled || cell !== null || win !== null}
              onClick={() => {
                takeTurn([...parentPath, i])
              }}
            >
              <span className="absolute">{cell}</span>
            </button>
          ))}
    </div>
  )
}

if (import.meta.vitest) {
  const { it, expect, describe, beforeEach } = import.meta.vitest

  const X = FilledCellState.X
  const O = FilledCellState.O
  const _ = null

  describe('win finder', () => {
    it('finds wins', () => {
      const board: BoardState = [
        X, _, O,
        O, X, _,
        _, _, X,
      ]

      expect(findWin(board)).toStrictEqual({
        cells: [0, 4, 8],
        player: X,
      })
    })

    it('ignores lines of empty cells', () => {
      const board: BoardState = [
        X, _, O,
        O, _, _,
        _, _, X,
      ]

      expect(findWin(board)).toBeNull()
    })

    it('finds nested wins', () => {
      const board: BoardState = [
        X, _, O,
        O, X, _,
        _, _, [
          X, _, O,
          O, X, _,
          _, _, X,
        ],
      ]

      expect(findWin(board)).toStrictEqual({
        cells: [0, 4, 8],
        player: X,
      })
    })
  })

  describe('game store', () => {
    beforeEach(() => {
      useGameStore.setState(useGameStore.getInitialState())
    })

    it('can take turn in top level board', () => {
      const takeTurn = useGameStore.getState().takeTurn

      const expectedBoardState: BoardState = [
        _, _, _,
        _, _, _,
        _, _, X,
      ]
      takeTurn([8])

      expect(useGameStore.getState().boardState).toStrictEqual(expectedBoardState)
      expect(useGameStore.getState().turn).toBe(FilledCellState.O)
    })

    it('can take turn in nested board', () => {
      useGameStore.setState({
        boardState: [
          _, _, _,
          _, _, _,
          _, _, [
            _, _, _,
            _, _, _,
            _, _, _,
          ],
        ],
      })
      const takeTurn = useGameStore.getState().takeTurn

      const expectedBoardState: BoardState = [
        _, _, _,
        _, _, _,
        _, _, [
          _, _, _,
          X, _, _,
          _, _, _,
        ],
      ]
      takeTurn([8, 3])

      expect(useGameStore.getState().boardState).toStrictEqual(expectedBoardState)
      expect(useGameStore.getState().turn).toBe(FilledCellState.O)
    })
  })
}
