'use client'

import { useState } from 'react'
import { create } from 'zustand'
import { combine } from 'zustand/middleware'
import { useShallow } from 'zustand/shallow'
import { BoardState, FilledCellState, isBoardState, Win } from './types'
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
    goDeeper: () => set(({ boardState }) => {
      const initialState = initialiseBoardState()
      // Embed the current board state into the centre (index 4) of a new board
      const newState = [
        ...initialState.slice(0, 4),
        boardState,
        ...initialState.slice(4 + 1),
      ]

      if (!isBoardState(newState)) {
        throw new Error(`New board state is invalid: ${JSON.stringify(newState)}`)
      }

      return { boardState: newState }
    }),
  }),
))

type ResultsProps = {
  win: Win | null
  className?: string
}

function Results({ win, className = 'relative' }: ResultsProps) {
  const [conceded, setConceded] = useState(false)
  const goDeeper = useGameStore(state => state.goDeeper)

  if (!win) return null

  if (conceded) {
    return (
      <div className={className}>
        <div className="absolute inset-0 bg-black opacity-50" />

        <span>Game Over: {win.player} wins</span>
      </div>
    )
  }

  return (
    <div className={className}>
      <div className="absolute inset-0 bg-black opacity-50" />
      <div className="absolute flex gap-2">
        <button className="bg-white" onClick={() => setConceded(true)}>Concede</button>
        <button className="bg-white" onClick={() => goDeeper()}>Go Deeper</button>
      </div>
    </div>
  )
}

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
  // We only need to know if the whole game is over at the top level
  const globalWin = parentPath.length <= 0 ? win : null

  return (
    <div className="relative grid aspect-square w-full grid-cols-3 gap-px bg-black">
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

      <Results win={globalWin} className="absolute inset-0" />
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
