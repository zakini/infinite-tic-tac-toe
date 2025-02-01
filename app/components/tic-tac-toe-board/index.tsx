'use client'

import { create } from 'zustand'
import { combine } from 'zustand/middleware'
import { useShallow } from 'zustand/shallow'
import { BoardState, FilledCellState, isBoardState } from './types'
import { findWin, initialiseBoardState, pickNestedBoardState, setBoardStateWithPath } from './utils'

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
  const O = FilledCellState.O // eslint-disable-line @typescript-eslint/no-unused-vars
  const _ = null

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
