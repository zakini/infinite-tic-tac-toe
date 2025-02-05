import { render, screen } from '@testing-library/react'
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

  it('is non-interactive when conceded', async () => {
    render(<TicTacToeBoard />)
    await performWin()

    await userEvent.click(screen.getByText(/concede/i))

    expect(screen.getByRole('dialog')).not.toContainHTML('button')
  })

  it('can go deeper', async () => {
    render(<TicTacToeBoard />)
    const cells = screen.getAllByRole('button')
    expect(cells.length).toBe(9)

    await performWin()

    for (const cell of cells.slice(0, 3)) {
      expect(cell).toHaveClass('bg-green-500')
    }

    for (const cell of cells.slice(3)) {
      expect(cell).not.toHaveClass('bg-green-500')
    }

    await userEvent.click(screen.getByText(/go deeper/i))
    // 8 cells at top level, 9 in a nested board
    expect(screen.getAllByRole('button').length).toBe(8 + 9)
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
    // 8 cells at top level, 9 in a nested board
    cells = screen.getAllByRole('button')
    expect(screen.getAllByRole('button').length).toBe(8 + 9)

    for (const cell of cells) {
      // All cells should be empty
      expect(cell.textContent).toBe('')
    }
  })
})
