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
