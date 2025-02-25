// TODO move to shared file rather that this board specific one?
type FixedLength<T extends unknown[], L extends number> = T & { length: L }

export enum FilledCellState {
  X = 'X',
  O = 'O',
}

// 3 x 3 grid = 9 total cells
export type CellState = null | FilledCellState
export type BoardState = FixedLength<CellState[], 9> | FixedLength<BoardState[], 9>

export type Win = {
  cells: FixedLength<number[], 3>
  player: FilledCellState
}

const isCellState = (v: unknown): v is CellState => v === null
  || (typeof v === 'string' && Object.values(FilledCellState).includes(v))
export const isBoardState = (v: unknown): v is BoardState => Array.isArray(v)
  && v.length === 9
  && (
    v.every(e => isCellState(e))
    || v.every(e => isBoardState(e))
  )
// NOTE type assertions are weird: https://github.com/microsoft/TypeScript/issues/34523#issuecomment-700491122
export const assertIsBoardState: (v: unknown) => asserts v is BoardState = (v) => {
  if (!isBoardState(v)) throw new Error(`Board state is invalid: ${JSON.stringify(v)}`)
}
