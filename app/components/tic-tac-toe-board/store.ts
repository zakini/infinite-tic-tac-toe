import { create } from 'zustand'
import { combine } from 'zustand/middleware'
import { findWin, initialiseBoardState, turnValid } from './utils'
import { assertIsBoardState, BoardState, CellState, FilledCellState, isBoardState } from './types'

const getBoardStateAtPath = (board: BoardState, path: number[]): BoardState => {
  if (path.length <= 0) return board

  const nestedBoard = board[path[0]]
  assertIsBoardState(nestedBoard)
  return getBoardStateAtPath(nestedBoard, path.slice(1))
}

const setBoardStateAtPath = (board: BoardState, path: number[], value: FilledCellState): BoardState => {
  if (path.length <= 0) throw new Error('Path cannot be empty')

  const i = path[0]
  const rest = path.slice(1)
  const target = board[i]

  let newState
  if (rest.length <= 0) {
    if (target !== null) {
      throw new Error(`Attempted to set state for non-empty cell: ${JSON.stringify(board)} | ${JSON.stringify(path)} | ${value}`)
    }

    newState = [
      ...board.slice(0, i),
      value,
      ...board.slice(i + 1),
    ]
  } else {
    if (!isBoardState(target)) {
      throw new Error(`Attempted to set nested state for non-nested cell: ${JSON.stringify(board)} | ${JSON.stringify(path)} | ${value}`)
    }

    newState = [
      ...board.slice(0, i),
      setBoardStateAtPath(target, rest, value),
      ...board.slice(i + 1),
    ]
  }

  assertIsBoardState(newState)
  return newState
}

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
    nextPlayer: FilledCellState.X,
    turnPath: [] as number[],
  },
  set => ({
    takeTurn: (path: number[]) => set(({ boardState, nextPlayer, turnPath }) => {
      if (!turnValid(path, turnPath)) {
        throw new Error(
          `Attempted to take turn in invalid cell: next player: ${nextPlayer} | path: ${JSON.stringify(path)} | turn path: ${JSON.stringify(turnPath)}`,
        )
      }

      const newBoardState = setBoardStateAtPath(boardState, path, nextPlayer)

      let newTurnPath: number[] = []
      if (path.length > 1) {
        newTurnPath = [...path.slice(0, -2), path[path.length - 1]]

        const targetBoard = getBoardStateAtPath(newBoardState, newTurnPath)
        // Target board is already complete, next player's move can be anywhere
        if (findWin(targetBoard) !== null) newTurnPath = []
      }

      return {
        boardState: newBoardState,
        nextPlayer: nextPlayer === FilledCellState.X ? FilledCellState.O : FilledCellState.X,
        turnPath: newTurnPath,
      }
    }),
    goDeeper: () => set(({ boardState }) => {
      // Embed the current board state into the centre (index 4) of a new board nested to the same depth
      const emptyState = clearBoard(boardState)
      const newState = [
        ...Array.from(Array<BoardState>(4)).map(() => structuredClone(emptyState)),
        boardState,
        ...Array.from(Array<BoardState>(4)).map(() => structuredClone(emptyState)),
      ]

      assertIsBoardState(newState)

      return {
        boardState: newState,
        turnPath: [],
      }
    }),
    clearBoard: () => set(({ boardState }) => ({ boardState: clearBoard(boardState) })),
  }),
))

export default useGameStore
