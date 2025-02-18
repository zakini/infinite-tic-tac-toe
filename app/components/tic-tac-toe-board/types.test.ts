import { describe, expect, it } from 'vitest'
import { FilledCellState, isBoardState } from './types'

const X = FilledCellState.X
const O = FilledCellState.O
const _ = null

describe('board state predicate', () => {
  it('accepts array of cell states', () => {
    const boardState = [
      X, _, O,
      X, _, _,
      O, _, _,
    ]

    expect(isBoardState(boardState)).toBe(true)
  })

  it('accepts nested array of cell states', () => {
    const boardState = [
      [
        X, _, O,
        X, _, _,
        O, _, _,
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
        X, _, O,
        X, _, _,
        O, _, _,
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

    expect(isBoardState(boardState)).toBe(true)
  })

  it('does not accept mixed array of cells', () => {
    const boardState = [
      _, _, _,
      _, _, _,
      _, _, [
        X, _, O,
        X, _, _,
        O, _, _,
      ],
    ]

    expect(isBoardState(boardState)).toBe(false)
  })
})
