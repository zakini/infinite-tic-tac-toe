import { combine } from 'zustand/middleware'
import { findWin, initialiseBoardState, turnValid } from '../utils'
import { assertIsBoardState, BoardState, CellState, FilledCellState, isBoardState } from '../types'

const getBoardStateAtPath = (board: BoardState, path: number[]): BoardState => {
  if (path.length <= 0) return board

  const nestedBoard = board[path[0]]
  assertIsBoardState(nestedBoard)
  return getBoardStateAtPath(nestedBoard, path.slice(1))
}

const setBoardStateAtPath = (
  board: BoardState, path: number[], value: FilledCellState,
): BoardState => {
  if (path.length <= 0) throw new Error('Path cannot be empty')

  const i = path[0]
  const rest = path.slice(1)
  const target = board[i]

  let newState
  if (rest.length <= 0) {
    if (target !== null) {
      throw new Error(
        'Attempted to set state for non-empty cell: '
        + `${JSON.stringify(board)} | ${JSON.stringify(path)} | ${value}`,
      )
    }

    newState = [
      ...board.slice(0, i),
      value,
      ...board.slice(i + 1),
    ]
  } else {
    if (!isBoardState(target)) {
      throw new Error(
        'Attempted to set nested state for non-nested cell: '
        + `${JSON.stringify(board)} | ${JSON.stringify(path)} | ${value}`,
      )
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

const createCoreSlice = combine(
  {
    boardState: initialiseBoardState() as BoardState,
    nextPlayer: FilledCellState.X,
    turnPath: [] as number[],
    previousTurn: null as [number, ...number[]] | null,
  },
  (set, _, store) => ({
    takeTurn: (turn: [number, ...number[]]) => set(({ boardState, nextPlayer, turnPath }) => {
      if (!turnValid(turn, turnPath)) {
        throw new Error(
          'Attempted to take turn in invalid cell: '
          + `next player: ${nextPlayer} `
          + `| turn: ${JSON.stringify(turn)} `
          + `| turn path: ${JSON.stringify(turnPath)}`,
        )
      }

      const newBoardState = setBoardStateAtPath(boardState, turn, nextPlayer)

      let newTurnPath: number[] = []
      if (turn.length > 1) {
        newTurnPath = [...turn.slice(0, -2), turn[turn.length - 1]]

        const targetBoard = getBoardStateAtPath(newBoardState, newTurnPath)
        // Target board is already complete, next player's move can be anywhere
        if (findWin(targetBoard) !== null) newTurnPath = []
      }

      return {
        boardState: newBoardState,
        nextPlayer: nextPlayer === FilledCellState.X ? FilledCellState.O : FilledCellState.X,
        turnPath: newTurnPath,
        previousTurn: turn,
      }
    }),
    goDeeper: () => set(({ boardState, previousTurn }) => {
      // Embed the current board state into same cell as the last turn of a new board nested to the
      // same depth
      const nestInto = previousTurn === null
        // This should never happen, but just in case, nest into the middle board
        ? 4
        : previousTurn[previousTurn?.length - 1]
      const emptyState = clearBoard(boardState)
      const newState = findWin(boardState) === false
        // Game was drawn, clear the board
        ? Array.from(Array<BoardState>(9)).map(() => structuredClone(emptyState))
        // Game was won, nested it into a deeper board
        : [
            ...Array.from(
              Array<BoardState>(nestInto)).map(() => structuredClone(emptyState),
            ),
            boardState,
            ...Array.from(
              Array<BoardState>(9 - 1 - nestInto)).map(() => structuredClone(emptyState),
            ),
          ]

      assertIsBoardState(newState)

      return {
        boardState: newState,
        turnPath: [],
      }
    }),
    startNewGame: () => set(store.getInitialState()),
  }),
)

export default createCoreSlice
export type CoreSlice = ReturnType<typeof createCoreSlice>
