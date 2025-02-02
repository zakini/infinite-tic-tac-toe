import { create } from 'zustand'
import { combine } from 'zustand/middleware'
import { initialiseBoardState, setBoardStateWithPath } from './utils'
import { BoardState, FilledCellState, isBoardState } from './types'

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

export default useGameStore

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
