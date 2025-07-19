// TODO move to shared file rather that this board specific one?
type FixedLength<T extends unknown[], L extends number> = T & { length: L }

export enum FilledCellState {
  X = 'X',
  O = 'O',
}

// 3 x 3 grid = 9 total cells
export type CellState = null | FilledCellState
export type SingleLevelBoardState = FixedLength<CellState[], 9>
export type BoardState = SingleLevelBoardState | FixedLength<BoardState[], 9>

export type Win = {
  cells: FixedLength<number[], 3>
  player: FilledCellState
}

export enum BoardCondition {
  Empty = 'Empty',
  InProgress = 'InProgress',
  Drawn = 'Drawn',
  WonX = 'WonX',
  WonO = 'WonO',
}

export const isCellState = (v: unknown): v is CellState => v === null
  || (typeof v === 'string' && Object.values(FilledCellState).includes(v))
export const isBoardState = (v: unknown): v is BoardState => Array.isArray(v)
  && v.length === 9
  && (
    v.every(e => isCellState(e))
    || v.every(e => isBoardState(e))
  )
// NOTE type assertions are weird
// See: https://github.com/microsoft/TypeScript/issues/34523#issuecomment-700491122
export const assertIsBoardState: (v: unknown) => asserts v is BoardState = (v) => {
  if (!isBoardState(v)) throw new Error(`Board state is invalid: ${JSON.stringify(v)}`)
}

const isBoardCondition = (v: unknown): v is BoardCondition => typeof v === 'string'
  && isNaN(Number(v))
  && Object.keys(BoardCondition).includes(v)
export const assertIsBoardCondition: (v: unknown) => asserts v is BoardCondition = (v) => {
  if (!isBoardCondition(v)) throw new Error(`Invalid Board Condition: ${JSON.stringify(v)}`)
}
