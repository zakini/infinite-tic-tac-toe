import { beforeEach, describe, expect, it } from 'vitest'
import useGameStore from './store'
import { BoardState, FilledCellState } from './types'

const X = FilledCellState.X
const O = FilledCellState.O
const _ = null

describe('game store', () => {
  beforeEach(() => {
    useGameStore.setState(useGameStore.getInitialState())
  })

  it('can take turn in top level board', () => {
    const takeTurn = useGameStore.getState().takeTurn

    const expectedBoardState: BoardState = [
      _, _, _,
      _, _, _,
      _, _, X,
    ]
    takeTurn([8])

    expect(useGameStore.getState().boardState).toStrictEqual(expectedBoardState)
    expect(useGameStore.getState().turn).toBe(FilledCellState.O)
  })

  it('can take turn in nested board', () => {
    useGameStore.setState({
      boardState: [
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
        [
          _, _, _,
          _, _, _,
          _, _, _,
        ],
      ],
    })
    const takeTurn = useGameStore.getState().takeTurn

    const expectedBoardState: BoardState = [
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
      [
        _, _, _,
        X, _, _,
        _, _, _,
      ],
    ]
    takeTurn([8, 3])

    expect(useGameStore.getState().boardState).toStrictEqual(expectedBoardState)
    expect(useGameStore.getState().turn).toBe(FilledCellState.O)
  })

  it('can go deeper', () => {
    useGameStore.setState({
      boardState: [
        O, X, O,
        O, X, X,
        X, O, X,
      ],
    })
    const goDeeper = useGameStore.getState().goDeeper

    const expectedBoardState: BoardState = [
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
      [
        O, X, O,
        O, X, X,
        X, O, X,
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
    goDeeper()

    expect(useGameStore.getState().boardState).toStrictEqual(expectedBoardState)
  })

  it('can clear the board', () => {
    useGameStore.setState({
      boardState: [
        O, X, O,
        O, X, X,
        X, O, X,
      ],
    })
    const clearBoard = useGameStore.getState().clearBoard

    const expectedBoardState: BoardState = [
      _, _, _,
      _, _, _,
      _, _, _,
    ]
    clearBoard()

    expect(useGameStore.getState().boardState).toStrictEqual(expectedBoardState)
  })

  it('can clear a nested board', () => {
    useGameStore.setState({
      boardState: [
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
        [
          O, X, O,
          O, X, X,
          X, O, X,
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
      ],
    })
    const clearBoard = useGameStore.getState().clearBoard

    const expectedBoardState: BoardState = [
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
      [
        _, _, _,
        _, _, _,
        _, _, _,
      ],
    ]
    clearBoard()

    expect(useGameStore.getState().boardState).toStrictEqual(expectedBoardState)
  })
})
