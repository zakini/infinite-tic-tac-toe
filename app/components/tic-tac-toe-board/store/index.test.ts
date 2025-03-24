import { beforeEach, describe, expect, it } from 'vitest'
import useGameStore from '.'
import { BoardState, FilledCellState } from '../types'

const X = FilledCellState.X
const O = FilledCellState.O
const _ = null
/** All blank 1 level board */
const _1b: BoardState = [
  _, _, _,
  _, _, _,
  _, _, _,
] as const
/** Drawn 1 level board */
const d1b: BoardState = [
  O, X, O,
  O, X, X,
  X, O, X,
] as const
/** All blank 2 level board */
const _2b: BoardState = [
  _1b, _1b, _1b,
  _1b, _1b, _1b,
  _1b, _1b, _1b,
] as const

describe('game store', () => {
  beforeEach(() => {
    useGameStore.setState(useGameStore.getInitialState())
  })

  it('can take turn in 1 level board', () => {
    const takeTurn = useGameStore.getState().takeTurn

    const expectedBoardState: BoardState = [
      _, _, _,
      _, _, _,
      _, _, X,
    ]
    takeTurn([8])

    expect(useGameStore.getState().boardState).toStrictEqual(expectedBoardState)
    expect(useGameStore.getState().nextPlayer).toBe(FilledCellState.O)
    expect(useGameStore.getState().turnPath).toStrictEqual([])
  })

  it('can take turn in 2 level board', () => {
    useGameStore.setState({
      boardState: [
        _1b, _1b, _1b,
        _1b, _1b, _1b,
        _1b, _1b, _1b,
      ],
    })
    const takeTurn = useGameStore.getState().takeTurn

    const expectedBoardState: BoardState = [
      _1b, _1b, _1b,
      _1b, _1b, _1b,
      _1b, _1b, [
        _, _, _,
        X, _, _,
        _, _, _,
      ],
    ]
    takeTurn([8, 3])

    expect(useGameStore.getState().boardState).toStrictEqual(expectedBoardState)
    expect(useGameStore.getState().nextPlayer).toBe(FilledCellState.O)
    expect(useGameStore.getState().turnPath).toStrictEqual([3])
  })

  it('can take turn in 3 level board', () => {
    useGameStore.setState({
      boardState: [
        _2b, _2b, _2b,
        _2b, _2b, _2b,
        _2b, _2b, _2b,
      ],
    })
    const takeTurn = useGameStore.getState().takeTurn

    const expectedBoardState: BoardState = [
      _2b, _2b, _2b,
      _2b, _2b, _2b,
      _2b, _2b, [
        _1b, _1b, _1b,
        _1b, _1b, _1b,
        _1b, _1b, [
          _, _, _,
          _, X, _,
          _, _, _,
        ],
      ],
    ]
    takeTurn([8, 8, 4])

    expect(useGameStore.getState().boardState).toStrictEqual(expectedBoardState)
    expect(useGameStore.getState().nextPlayer).toBe(FilledCellState.O)
    expect(useGameStore.getState().turnPath).toStrictEqual([8, 4])
  })

  it('can\'t take turn in board that doesn\'t match turn path', () => {
    useGameStore.setState({
      boardState: [
        _2b, _2b, _2b,
        _2b, _2b, _2b,
        _2b, _2b, _2b,
      ],
      turnPath: [8, 3],
    })
    const takeTurn = useGameStore.getState().takeTurn

    const expectedBoardState: BoardState = [
      _2b, _2b, _2b,
      _2b, _2b, _2b,
      _2b, _2b, _2b,
    ]
    expect(() => takeTurn([8, 8, 4])).toThrowError()

    expect(useGameStore.getState().boardState).toStrictEqual(expectedBoardState)
    expect(useGameStore.getState().nextPlayer).toBe(FilledCellState.X)
    expect(useGameStore.getState().turnPath).toStrictEqual([8, 3])
  })

  it('allows turn anywhere if target board is complete', () => {
    useGameStore.setState({
      boardState: [
        _2b, _2b, _2b,
        _2b, _2b, _2b,
        _2b, _2b, [
          _1b, _1b, _1b,
          _1b, _1b, _1b,
          _1b, _1b, [
            _, _, _,
            O, O, _,
            X, X, _,
          ],
        ],
      ],
    })
    const takeTurn = useGameStore.getState().takeTurn

    const expectedBoardState: BoardState = [
      _2b, _2b, _2b,
      _2b, _2b, _2b,
      _2b, _2b, [
        _1b, _1b, _1b,
        _1b, _1b, _1b,
        _1b, _1b, [
          _, _, _,
          O, O, _,
          X, X, X,
        ],
      ],
    ]
    takeTurn([8, 8, 8])

    expect(useGameStore.getState().boardState).toStrictEqual(expectedBoardState)
    expect(useGameStore.getState().nextPlayer).toBe(FilledCellState.O)
    expect(useGameStore.getState().turnPath).toStrictEqual([])
  })

  it('can go deeper', () => {
    useGameStore.setState({
      boardState: d1b,
    })
    const goDeeper = useGameStore.getState().goDeeper

    const expectedBoardState: BoardState = [
      _1b, _1b, _1b,
      _1b, d1b, _1b,
      _1b, _1b, _1b,
    ]
    goDeeper()

    expect(useGameStore.getState().boardState).toStrictEqual(expectedBoardState)
    expect(useGameStore.getState().turnPath).toStrictEqual([])
  })

  it('can clear the board', () => {
    useGameStore.setState({
      boardState: d1b,
    })
    const clearBoard = useGameStore.getState().clearBoard

    const expectedBoardState = _1b
    clearBoard()

    expect(useGameStore.getState().boardState).toStrictEqual(expectedBoardState)
  })

  it('can clear a nested board', () => {
    useGameStore.setState({
      boardState: [
        _1b, _1b, _1b,
        _1b, d1b, _1b,
        _1b, _1b, _1b,
      ],
    })
    const clearBoard = useGameStore.getState().clearBoard

    const expectedBoardState: BoardState = [
      _1b, _1b, _1b,
      _1b, _1b, _1b,
      _1b, _1b, _1b,
    ]
    clearBoard()

    expect(useGameStore.getState().boardState).toStrictEqual(expectedBoardState)
  })
})
