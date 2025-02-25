import { describe, expect, it } from 'vitest'
import { BoardState, FilledCellState } from './types'
import { findWin } from './utils'

const X = FilledCellState.X
const O = FilledCellState.O
const _ = null

describe('win finder', () => {
  it('finds wins', () => {
    const board: BoardState = [
      X, _, O,
      O, X, _,
      _, _, X,
    ]

    expect(findWin(board)).toStrictEqual({
      cells: [0, 4, 8],
      player: X,
    })
  })

  it('ignores lines of empty cells', () => {
    const board: BoardState = [
      X, _, O,
      O, _, _,
      _, _, X,
    ]

    expect(findWin(board)).toBeNull()
  })

  it('finds nested wins', () => {
    const board: BoardState = [
      // X
      [
        X, _, O,
        O, X, _,
        _, _, X,
      ],
      // _
      [
        _, _, _,
        _, _, _,
        _, _, _,
      ],
      // O
      [
        O, _, O,
        O, X, _,
        _, X, X,
      ],
      // O
      [
        O, _, O,
        O, X, _,
        _, X, X,
      ],
      // X
      [
        X, _, O,
        O, X, _,
        _, _, X,
      ],
      // _
      [
        _, _, _,
        _, _, _,
        _, _, _,
      ],
      // _
      [
        _, _, _,
        _, _, _,
        _, _, _,
      ],
      // _
      [
        _, _, _,
        _, _, _,
        _, _, _,
      ],
      // X
      [
        X, _, O,
        O, X, _,
        _, _, X,
      ],
    ]

    expect(findWin(board)).toStrictEqual({
      cells: [0, 4, 8],
      player: X,
    })
  })

  it('finds draws', () => {
    // OXO
    // OXX
    // XOX

    const board: BoardState = [
      O, X, O,
      O, X, X,
      X, O, X,
    ]

    expect(findWin(board)).toBe(false)
  })
})
