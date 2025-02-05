// TODO move to shared file rather that this board specific one?
type FixedLengthArray<T, L extends number> = readonly T[] & { length: L }

export enum FilledCellState {
  X = 'X',
  O = 'O',
}

// 3 x 3 grid = 9 total cells
// We _have_ to define this as an interface for the circular dependency to work
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface BoardState extends FixedLengthArray<CellState, 9> {}
export type SimpleCellState = null | FilledCellState
export type CellState = SimpleCellState | BoardState

export type Win = {
  cells: FixedLengthArray<number, 3>
  player: FilledCellState
}

const isSimpleCellState = (v: unknown): v is SimpleCellState => v === null
  || (typeof v === 'string' && Object.values(FilledCellState).includes(v))
export const isBoardState = (v: unknown): v is BoardState => Array.isArray(v)
  && v.length === 9
  && v.every(e => isSimpleCellState(e) || isBoardState(e))
// NOTE type assertions are weird: https://github.com/microsoft/TypeScript/issues/34523#issuecomment-700491122
export const assertIsBoardState: (v: unknown) => asserts v is BoardState = (v) => {
  if (!isBoardState(v)) throw new Error(`Board state is invalid: ${JSON.stringify(v)}`)
}
