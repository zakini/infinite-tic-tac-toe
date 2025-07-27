import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import useGameStore from './store'
import { type BoardState, FilledCellState } from './types'
import TicTacToeBoard from '.'

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
/** All blank 3 level board */
const _3b: BoardState = [
  _2b, _2b, _2b,
  _2b, _2b, _2b,
  _2b, _2b, _2b,
] as const
/** 1 level board with some moves made */
const p1b: BoardState = [
  _, _, O,
  _, X, _,
  _, _, _,
] as const
/** 2 level board with some moves made at the deepest level */
const p2b: BoardState = [
  p1b, _1b, _1b,
  _1b, _1b, _1b,
  _1b, _1b, _1b,
] as const
/** 3 level board with some moves made at the deepest level */
const p3b: BoardState = [
  p2b, _2b, _2b,
  _2b, _2b, _2b,
  _2b, _2b, _2b,
] as const
/** 4 level board with some moves made at the deepest level */
const p4b: BoardState = [
  p3b, _3b, _3b,
  _3b, _3b, _3b,
  _3b, _3b, _3b,
] as const
/** 1 level board won by X */
const x1b: BoardState = [
  X, X, X,
  O, O, _,
  _, _, _,
] as const
/** 2 level board won by X */
const x2b: BoardState = [
  x1b, x1b, x1b,
  _1b, _1b, _1b,
  _1b, _1b, _1b,
] as const
/** 1 level drawn board */
const d1b: BoardState = [
  X, X, O,
  O, O, X,
  X, O, X,
] as const

describe('game board', () => {
  const performWin = async () => {
    const cells = screen.getAllByRole('button')
    expect(cells.length).toBe(9)

    // XXX
    // OO_
    // ___
    await userEvent.click(cells[0])
    await userEvent.click(cells[3])
    await userEvent.click(cells[1])
    await userEvent.click(cells[4])
    await userEvent.click(cells[2])
  }

  const performDraw = async () => {
    const cells = screen.getAllByRole('button')
    expect(cells.length).toBe(9)

    // OXO
    // OXX
    // XOX
    await userEvent.click(cells[4])
    await userEvent.click(cells[0])
    await userEvent.click(cells[6])
    await userEvent.click(cells[2])
    await userEvent.click(cells[1])
    await userEvent.click(cells[7])
    await userEvent.click(cells[5])
    await userEvent.click(cells[3])
    await userEvent.click(cells[8])
  }

  it('has text and buttons on win', async () => {
    render(<TicTacToeBoard />)
    await performWin()

    expect(screen.getByRole('dialog')).toHaveTextContent(/game over/i)
    expect(screen.getByText(/concede/i).closest('button')).toBeInTheDocument()
    expect(screen.getByText(/go deeper/i).closest('button')).toBeInTheDocument()
  })

  it('has text and buttons on draw', async () => {
    render(<TicTacToeBoard />)
    await performDraw()

    expect(screen.getByRole('dialog')).toHaveTextContent(/game over/i)
    expect(screen.getByText(/concede/i).closest('button')).toBeInTheDocument()
    expect(screen.getByText(/go deeper/i).closest('button')).toBeInTheDocument()
  })

  it('can concede and start a new game', async () => {
    render(<TicTacToeBoard />)
    await performWin()

    await userEvent.click(screen.getByText(/concede/i))
    await userEvent.click(screen.getByText(/new game/i))

    const cells = screen.getAllByRole('button')
    expect(cells.length).toBe(9)

    for (const cell of cells) {
      expect(cell.textContent).toBe('')
    }

    // X always goes first in a game
    expect(screen.getByText(/current player/i).textContent).toContain('X')
  })

  describe('go deeper', () => {
    it('can go deeper', async () => {
      render(<TicTacToeBoard />)
      let cells = screen.getAllByRole('button')
      expect(cells.length).toBe(9)

      await performWin()

      for (const cell of cells.slice(0, 3)) {
        expect(cell).toHaveClass('bg-green-500')
      }

      for (const cell of cells.slice(3)) {
        expect(cell).not.toHaveClass('bg-green-500')
      }

      await userEvent.click(screen.getByText(/go deeper/i))
      // 9 cells, 1 containing the summary of the won board...
      const summary = screen.getByLabelText('sub-board won by X')
      expect(summary.textContent).toBe('X')
      const summaryButtons = within(summary).queryAllByRole('button')
      expect(summaryButtons).toStrictEqual([])
      // ...and the other 8 cells containing 9 cells
      cells = screen.getAllByRole('button')
      expect(cells.length).toBe(9 ** 2 - 9)

      for (let i = 0; i < cells.length; i++) {
        expect(cells[i].textContent).toBe('')
      }

      // performWin() makes X win, O should be next to play
      expect(screen.getByText(/current player/i).textContent).toContain('O')
    })

    it('clears the board when going deeper from a draw', async () => {
      render(<TicTacToeBoard />)
      let cells = screen.getAllByRole('button')
      expect(cells.length).toBe(9)

      await performDraw()

      for (const cell of cells) {
        expect(cell).not.toHaveClass('bg-green-500')
      }

      await userEvent.click(screen.getByText(/go deeper/i))
      // 9 cells, each containing 9 cells
      cells = screen.getAllByRole('button')
      expect(screen.getAllByRole('button').length).toBe(9 ** 2)

      for (const cell of cells) {
        // All cells should be empty
        expect(cell.textContent).toBe('')
      }
    })

    it('doesn\'t allow players to click inactive sub-boards', async () => {
      render(<TicTacToeBoard />)

      await performWin()
      await userEvent.click(screen.getByText(/go deeper/i))

      const boardAndSubBoards = screen.getAllByRole('region')
      expect(boardAndSubBoards.length).toBe(10)
      // The first region is the whole board. The other 9 are the sub-boards within that
      const subBoards = boardAndSubBoards.slice(1)
      const cellsBySubBoard = subBoards.map(b => within(b).queryAllByRole('button'))
      // Click middle left cell of top left board
      await userEvent.click(cellsBySubBoard[0][3])
      expect(cellsBySubBoard[0][3]).toHaveTextContent('O')
      // Attempt to click a cell in the bottom right board
      await userEvent.click(cellsBySubBoard[8][7])
      expect(cellsBySubBoard[8][7].textContent).toBe('')
      // Click a cell in the middle left board
      await userEvent.click(cellsBySubBoard[3][1])
      expect(cellsBySubBoard[3][1]).toHaveTextContent('X')
    })
  })

  describe('zoom', () => {
    it('can zoom into and out of deep state', async () => {
      useGameStore.setState({ boardState: p4b })
      render(<TicTacToeBoard />)

      // 9 buttons at top level, each containing unknown sub-boards
      let buttonCells = screen.getAllByRole('button', { name: /sub-board/i })
      expect(buttonCells.length).toBe(9)
      for (const cell of buttonCells) {
        const unknownCells = within(cell).getAllByRole('region', { name: /unknown state/i })
        expect(unknownCells.length).toBe(9 ** 2)
      }

      // click the top left sub-board
      await userEvent.click(buttonCells[0])

      expect(screen.getByText(/\(0, 0\)/)).toBeInTheDocument()
      // 9 buttons at this level, each containing empty or filled cells
      buttonCells = screen.getAllByRole('button', { name: /sub-board/i })
      expect(buttonCells.length).toBe(9)
      for (const cell of buttonCells) {
        const cells = within(cell)
          .getAllByRole('region', { name: /empty cell|cell taken by [XO]/i })
        expect(cells.length).toBe(9 ** 2)
      }

      await userEvent.click(screen.getByText(/zoom out/i))

      // 9 buttons at top level, each containing unknown sub-boards
      buttonCells = screen.getAllByRole('button', { name: /sub-board/i })
      expect(buttonCells.length).toBe(9)
      for (const cell of buttonCells) {
        const unknownCells = within(cell).getAllByRole('region', { name: /unknown state/i })
        expect(unknownCells.length).toBe(9 ** 2)
      }
    })

    it('cannot zoom into shallow state', () => {
      useGameStore.setState({ boardState: _2b })
      render(<TicTacToeBoard />)

      const buttonCells = screen.queryAllByRole('button', { name: /sub-board/i })
      expect(buttonCells.length).toBe(0)
    })

    it('cannot zoom too far into deep state', async () => {
      useGameStore.setState({ boardState: _3b })
      render(<TicTacToeBoard />)

      // 9 buttons at top level, each containing empty sub-boards
      let buttonCells = screen.getAllByRole('button', { name: /sub-board/i })
      expect(buttonCells.length).toBe(9)
      for (const cell of buttonCells) {
        const unknownCells = within(cell).getAllByRole('region', { name: /empty cell/i })
        expect(unknownCells.length).toBe(9 ** 2)
      }

      // click the top left sub-board
      await userEvent.click(buttonCells[0])

      // no sub-board buttons, just buttons for each empty cell
      buttonCells = screen.getAllByRole('region', { name: /sub-board/i })
      expect(buttonCells.length).toBe(9)
      for (const cell of buttonCells) {
        const unknownCells = within(cell).getAllByRole('button', { name: /empty cell/i })
        expect(unknownCells.length).toBe(9)
      }
    })

    it('cannot zoom into won board', async () => {
      useGameStore.setState({
        boardState: [
          x2b, _2b, _2b,
          _2b, _2b, _2b,
          _2b, _2b, _2b,
        ] as const,
      })
      render(<TicTacToeBoard />)

      // 1 top level sub-board that has been won, the rest all empty cells
      let wonCell = screen.getByLabelText(/sub-board won/i)
      expect(wonCell).toBeInTheDocument()
      let emptyCells = screen.getAllByRole('region', { name: /empty cell/i })
      expect(emptyCells.length).toBe((9 ** 2) * 8)

      await userEvent.click(wonCell)

      // check for same visible board state
      wonCell = screen.getByLabelText(/sub-board won/i)
      expect(wonCell).toBeInTheDocument()
      emptyCells = screen.getAllByRole('region', { name: /empty cell/i })
      expect(emptyCells.length).toBe((9 ** 2) * 8)
    })

    it('cannot zoom out at top level', () => {
      useGameStore.setState({ boardState: _3b })
      render(<TicTacToeBoard />)

      const zoomOutButton = screen.queryByText(/zoom out/i)
      expect(zoomOutButton).not.toBeInTheDocument()
    })

    it('cannot take turn unless at max zoom', async () => {
      useGameStore.setState({ boardState: _3b })
      render(<TicTacToeBoard />)

      let emptyCells = screen.getAllByLabelText(/empty cell/i)
      expect(emptyCells.length).toBe(9 ** 3)

      await userEvent.click(emptyCells[1])

      // turn not taken, zoomed in instead
      emptyCells = screen.getAllByLabelText(/empty cell/i)
      expect(emptyCells.length).toBe(9 ** 2)

      await userEvent.click(emptyCells[1])

      // actually took a turn
      const xCell = screen.getByLabelText(/cell taken by X/i)
      expect(xCell).toBeInTheDocument()
    })

    it('zooms out when visible sub-board is won', async () => {
      /** 1 level board that's almost been won by X */
      const a1b: BoardState = [
        X, X, _,
        O, O, _,
        _, _, _,
      ] as const
      /** 2 level board that's almost been won by X */
      const a2b: BoardState = [
        x1b, x1b, a1b,
        _1b, _1b, _1b,
        _1b, _1b, _1b,
      ] as const

      // set up 3 level board that has a 2 level board that has almost been won
      useGameStore.setState({
        boardState: [
          a2b, _2b, _2b,
          _2b, _2b, _2b,
          _2b, _2b, _2b,
        ] as const,
      })
      render(<TicTacToeBoard />)

      // zoom into the almost won 2 level board
      const subBoards = screen.getAllByRole('button')
      expect(subBoards.length).toBe(9)
      await userEvent.click(subBoards[0])

      // win the almost won 2 level board
      const buttonCells = screen.getAllByRole('button', { name: /cell/i })
      expect(buttonCells.length).toBe(9 * 7)
      await userEvent.click(buttonCells[2])

      // check we zoomed out automatically
      const zoomOutButton = screen.queryByText(/zoom out/i)
      expect(zoomOutButton).not.toBeInTheDocument()

      const wonSubBoard = screen.getByRole('region', { name: /sub-board won/i })
      expect(wonSubBoard).toBeInTheDocument()
      const emptyCells = screen.getAllByRole('region', { name: /empty cell/i })
      expect(emptyCells.length).toBe(9 * 9 * 8)
    })

    it('zooms out when visible sub-board is drawn', async () => {
      /** 1 level board that's almost a draw */
      const a1b: BoardState = [
        X, O, _,
        O, X, X,
        O, X, O,
      ] as const
      /** 2 level board that's almost a draw */
      const a2b: BoardState = [
        d1b, d1b, a1b,
        d1b, d1b, d1b,
        d1b, d1b, d1b,
      ] as const

      // set up 3 level board that has a 2 level board that is almost a draw
      useGameStore.setState({
        boardState: [
          a2b, _2b, _2b,
          _2b, _2b, _2b,
          _2b, _2b, _2b,
        ] as const,
      })
      render(<TicTacToeBoard />)

      // zoom into the almost drawn 2 level board
      const subBoards = screen.getAllByRole('button')
      expect(subBoards.length).toBe(9)
      await userEvent.click(subBoards[0])

      // draw the almost drawn 2 level board
      const buttonCells = screen.getAllByRole('button', { name: /cell/i })
      expect(buttonCells.length).toBe(9)
      await userEvent.click(buttonCells[2])

      // check we zoomed out automatically
      const zoomOutButton = screen.queryByText(/zoom out/i)
      expect(zoomOutButton).not.toBeInTheDocument()

      const drawnSubBoard = screen.getByRole('region', { name: /sub-board drawn/i })
      expect(drawnSubBoard).toBeInTheDocument()
      const emptyCells = screen.getAllByRole('region', { name: /empty cell/i })
      expect(emptyCells.length).toBe(9 * 9 * 8)
    })
  })
})
