import { beforeEach, describe, expect, it } from 'vitest'
import { BoardCondition, type BoardState, FilledCellState, isCellState } from '../types'
import { findWin } from '../utils'
import useGameStore from '.'

const X = FilledCellState.X
const O = FilledCellState.O
const _ = null
/** All blank 1 level board */
const _1b: BoardState = [
  _, _, _,
  _, _, _,
  _, _, _,
] as const
/** All blank 2 level board */
const _2b: BoardState = [
  _1b, _1b, _1b,
  _1b, _1b, _1b,
  _1b, _1b, _1b,
] as const
/** 1 level board won by X */
const x1b: BoardState = [
  X, X, X,
  O, O, _,
  _, _, _,
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
      boardState: x1b,
    })
    const goDeeper = useGameStore.getState().goDeeper

    const expectedBoardState: BoardState = [
      _1b, _1b, _1b,
      _1b, x1b, _1b,
      _1b, _1b, _1b,
    ]
    goDeeper()

    expect(useGameStore.getState().boardState).toStrictEqual(expectedBoardState)
    expect(useGameStore.getState().turnPath).toStrictEqual([])
  })
})

describe('game store dev tools', () => {
  const calcDepth = (board: BoardState): number => isCellState(board[0])
    ? 1
    : 1 + calcDepth(board[0])
  const isBoardEmpty = (board: BoardState): boolean => board.reduce((empty, cell) => {
    if (!empty) return empty

    if (isCellState(cell)) return cell === null
    return isBoardEmpty(cell)
  }, true)

  const itForEachConditionAndDepth = it.for([
    [BoardCondition.Empty, 1],
    [BoardCondition.Empty, 2],
    [BoardCondition.Empty, 3],
    [BoardCondition.InProgress, 1],
    [BoardCondition.InProgress, 2],
    [BoardCondition.InProgress, 3],
    [BoardCondition.Drawn, 1],
    [BoardCondition.Drawn, 2],
    [BoardCondition.Drawn, 3],
    [BoardCondition.WonX, 1],
    [BoardCondition.WonX, 2],
    [BoardCondition.WonX, 3],
    [BoardCondition.WonO, 1],
    [BoardCondition.WonO, 2],
    [BoardCondition.WonO, 3],
  ] as const)
  itForEachConditionAndDepth(
    'can generate a %s %i level board state',
    { repeats: 50 },
    ([condition, depth]) => {
      const forceBoardCondition = useGameStore.getState().forceBoardCondition
      forceBoardCondition(condition, depth)

      const boardState = useGameStore.getState().boardState
      const win = findWin(boardState)

      expect(calcDepth(boardState)).toBe(depth)

      switch (condition) {
        case BoardCondition.Empty:
          expect(win).toBe(null)
          expect(isBoardEmpty(boardState)).toBe(true)
          break

        case BoardCondition.InProgress:
          expect(win).toBe(null)
          expect(isBoardEmpty(boardState)).toBe(false)
          break

        case BoardCondition.Drawn:
          expect(win).toBe(false)
          break

        case BoardCondition.WonX:
          expect((win || null)?.player).toBe(FilledCellState.X)
          break

        case BoardCondition.WonO:
          expect((win || null)?.player).toBe(FilledCellState.O)
          break
      }
    },
  )
})
