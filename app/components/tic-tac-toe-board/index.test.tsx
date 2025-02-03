import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import TicTacToeBoard from '.'
import userEvent from '@testing-library/user-event'

describe('game board', () => {
  const getCells = () => {
    const cells = screen.getAllByRole('button')
    expect(cells.length).toBe(9)
    return cells
  }

  const performWin = async () => {
    const cells = getCells()

    // X clicks each cell in the top row, O clicks elsewhere
    await userEvent.click(cells[0])
    await userEvent.click(cells[3])
    await userEvent.click(cells[1])
    await userEvent.click(cells[4])
    await userEvent.click(cells[2])
  }

  it('has text and buttons on game over', async () => {
    render(<TicTacToeBoard />)
    await performWin()

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
    const cells = getCells()

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
})
