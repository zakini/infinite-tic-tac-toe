import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import TicTacToeBoard from '.'
import userEvent from '@testing-library/user-event'

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
