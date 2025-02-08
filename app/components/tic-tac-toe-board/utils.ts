import { assertIsBoardState, BoardState, CellState, FilledCellState, isBoardState, Win } from './types'

export const initialiseBoardState = (): BoardState => Array(9).fill(null) as BoardState

export const setBoardStateWithPath = (b: BoardState, path: number[], v: FilledCellState): BoardState => {
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

  assertIsBoardState(newState)
  return newState
}

export const pickNestedBoardState = (boardState: BoardState, path: number[]): BoardState => {
  for (const i of path) {
    const maybeBoardState = boardState[i]
    if (!isBoardState(maybeBoardState)) {
      throw new Error(`Invalid path when picking state: ${JSON.stringify(path)} | ${JSON.stringify(boardState)}`)
    }
    boardState = maybeBoardState
  }

  return boardState
}

const resolveCellState = (cell: CellState | BoardState): FilledCellState | null | false => {
  if (!isBoardState(cell)) return cell

  const win = findWin(cell)
  return win === false ? false : (win?.player ?? null)
}

/**
 * Check if the given board state has a win
 * @param board The board state to check
 * @returns win object if there is a win, false if there's a draw, null otherwise
 */
export const findWin = (board: BoardState): Win | null | false => {
  // The minimal(?) neighbours of each cell to check to find a win
  /* eslint-disable @stylistic/no-multi-spaces */
  const neighbourMap: Record<number, number[]> = {
    0: [1, 3, 4], 1: [4], 2: [4, 5],
    3: [4],       4: [],  5: [],
    6: [7],       7: [],  8: [],
  }
  /* eslint-enable @stylistic/no-multi-spaces */

  let movesAvailable = false
  for (const k of Object.keys(neighbourMap)) {
    const i = Number(k)
    const cell = resolveCellState(board[i])

    if (cell === false) return false

    if (cell === null) {
      movesAvailable = true
      continue
    }

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

  return movesAvailable ? null : false
}
