import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Results from './results'
import { FilledCellState, Win } from './types'

describe('results overlay', () => {
  it('is invisible when no win', () => {
    const win = null
    render(<Results win={win} />)

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('has text and buttons', () => {
    const win: Win = {
      cells: [0, 1, 2],
      player: FilledCellState.X,
    }
    render(<Results win={win} />)

    expect(screen.getByRole('dialog')).toHaveTextContent(/game over/i)
    expect(screen.getByText(/concede/i).closest('button')).toBeInTheDocument()
    expect(screen.getByText(/go deeper/i).closest('button')).toBeInTheDocument()
  })

  it('is non-interactive when conceded', async () => {
    const win: Win = {
      cells: [0, 1, 2],
      player: FilledCellState.X,
    }
    render(<Results win={win} />)

    await userEvent.click(screen.getByText(/concede/i))

    expect(screen.getByRole('dialog')).not.toContainHTML('button')
  })
})
