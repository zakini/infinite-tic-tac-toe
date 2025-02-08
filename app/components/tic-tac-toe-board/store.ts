import { create } from 'zustand'
import { combine } from 'zustand/middleware'
import { initialiseBoardState, setBoardStateWithPath } from './utils'
import { assertIsBoardState, BoardState, CellState, FilledCellState, isBoardState } from './types'

const clearBoard = (board: BoardState): BoardState => {
  const newBoard: (CellState | BoardState)[] = []
  for (const i of board.keys()) {
    newBoard[i] = isBoardState(board[i]) ? clearBoard(board[i]) : null
  }

  assertIsBoardState(newBoard)
  return newBoard
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
    goDeeper: () => set(({ boardState }) => {
      // Embed the current board state into the centre (index 4) of a new board nested to the same depth
      const emptyState = clearBoard(boardState)
      const newState = [
        ...Array.from(Array<BoardState>(4)).map(() => structuredClone(emptyState)),
        boardState,
        ...Array.from(Array<BoardState>(4)).map(() => structuredClone(emptyState)),
      ]

      assertIsBoardState(newState)

      return { boardState: newState }
    }),
    clearBoard: () => set(({ boardState }) => ({ boardState: clearBoard(boardState) })),
  }),
))

export default useGameStore

if (import.meta.vitest) {
  const { it, expect, describe, beforeEach } = import.meta.vitest

  const X = FilledCellState.X
  const O = FilledCellState.O
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
          [
            _, _, _,
            _, _, _,
            _, _, _,
          ],
          [
            _, _, _,
            _, _, _,
            _, _, _,
          ],
          [
            _, _, _,
            _, _, _,
            _, _, _,
          ],
          [
            _, _, _,
            _, _, _,
            _, _, _,
          ],
          [
            _, _, _,
            _, _, _,
            _, _, _,
          ],
          [
            _, _, _,
            _, _, _,
            _, _, _,
          ],
          [
            _, _, _,
            _, _, _,
            _, _, _,
          ],
          [
            _, _, _,
            _, _, _,
            _, _, _,
          ],
          [
            _, _, _,
            _, _, _,
            _, _, _,
          ],
        ],
      })
      const takeTurn = useGameStore.getState().takeTurn

      const expectedBoardState: BoardState = [
        [
          _, _, _,
          _, _, _,
          _, _, _,
        ],
        [
          _, _, _,
          _, _, _,
          _, _, _,
        ],
        [
          _, _, _,
          _, _, _,
          _, _, _,
        ],
        [
          _, _, _,
          _, _, _,
          _, _, _,
        ],
        [
          _, _, _,
          _, _, _,
          _, _, _,
        ],
        [
          _, _, _,
          _, _, _,
          _, _, _,
        ],
        [
          _, _, _,
          _, _, _,
          _, _, _,
        ],
        [
          _, _, _,
          _, _, _,
          _, _, _,
        ],
        [
          _, _, _,
          X, _, _,
          _, _, _,
        ],
      ]
      takeTurn([8, 3])

      expect(useGameStore.getState().boardState).toStrictEqual(expectedBoardState)
      expect(useGameStore.getState().turn).toBe(FilledCellState.O)
    })

    it('can go deeper', () => {
      useGameStore.setState({
        boardState: [
          O, X, O,
          O, X, X,
          X, O, X,
        ],
      })
      const goDeeper = useGameStore.getState().goDeeper

      const expectedBoardState: BoardState = [
        [
          _, _, _,
          _, _, _,
          _, _, _,
        ],
        [
          _, _, _,
          _, _, _,
          _, _, _,
        ],
        [
          _, _, _,
          _, _, _,
          _, _, _,
        ],
        [
          _, _, _,
          _, _, _,
          _, _, _,
        ],
        [
          O, X, O,
          O, X, X,
          X, O, X,
        ],
        [
          _, _, _,
          _, _, _,
          _, _, _,
        ],
        [
          _, _, _,
          _, _, _,
          _, _, _,
        ],
        [
          _, _, _,
          _, _, _,
          _, _, _,
        ],
        [
          _, _, _,
          _, _, _,
          _, _, _,
        ],
      ]
      goDeeper()

      expect(useGameStore.getState().boardState).toStrictEqual(expectedBoardState)
    })

    it('can clear the board', () => {
      useGameStore.setState({
        boardState: [
          O, X, O,
          O, X, X,
          X, O, X,
        ],
      })
      const clearBoard = useGameStore.getState().clearBoard

      const expectedBoardState: BoardState = [
        _, _, _,
        _, _, _,
        _, _, _,
      ]
      clearBoard()

      expect(useGameStore.getState().boardState).toStrictEqual(expectedBoardState)
    })

    it('can clear a nested board', () => {
      useGameStore.setState({
        boardState: [
          [
            _, _, _,
            _, _, _,
            _, _, _,
          ],
          [
            _, _, _,
            _, _, _,
            _, _, _,
          ],
          [
            _, _, _,
            _, _, _,
            _, _, _,
          ],
          [
            _, _, _,
            _, _, _,
            _, _, _,
          ],
          [
            O, X, O,
            O, X, X,
            X, O, X,
          ],
          [
            _, _, _,
            _, _, _,
            _, _, _,
          ],
          [
            _, _, _,
            _, _, _,
            _, _, _,
          ],
          [
            _, _, _,
            _, _, _,
            _, _, _,
          ],
          [
            _, _, _,
            _, _, _,
            _, _, _,
          ],
        ],
      })
      const clearBoard = useGameStore.getState().clearBoard

      const expectedBoardState: BoardState = [
        [
          _, _, _,
          _, _, _,
          _, _, _,
        ],
        [
          _, _, _,
          _, _, _,
          _, _, _,
        ],
        [
          _, _, _,
          _, _, _,
          _, _, _,
        ],
        [
          _, _, _,
          _, _, _,
          _, _, _,
        ],
        [
          _, _, _,
          _, _, _,
          _, _, _,
        ],
        [
          _, _, _,
          _, _, _,
          _, _, _,
        ],
        [
          _, _, _,
          _, _, _,
          _, _, _,
        ],
        [
          _, _, _,
          _, _, _,
          _, _, _,
        ],
        [
          _, _, _,
          _, _, _,
          _, _, _,
        ],
      ]
      clearBoard()

      expect(useGameStore.getState().boardState).toStrictEqual(expectedBoardState)
    })
  })
}
