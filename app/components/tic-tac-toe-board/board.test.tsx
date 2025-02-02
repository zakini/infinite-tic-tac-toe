import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import Board from './board'
import userEvent from '@testing-library/user-event'

describe('board core', () => {
  it('allows players to take turns', async () => {
    render(<Board />)

    const cells = screen.getAllByRole('button')
    expect(cells.length).toBe(9)

    await userEvent.click(cells[0])
    expect(cells[0]).toHaveTextContent('X')

    await userEvent.click(cells[1])
    expect(cells[1]).toHaveTextContent('O')
  })

  it('doesn\'t allow players to click used cells', async () => {
    render(<Board />)

    const cells = screen.getAllByRole('button')
    expect(cells.length).toBe(9)

    await userEvent.click(cells[0])
    expect(cells[0]).toHaveTextContent('X')

    // Click the same cell, nothing happens
    await userEvent.click(cells[0])
    expect(cells[0]).toHaveTextContent('X')

    // O still gets their turn
    await userEvent.click(cells[1])
    expect(cells[1]).toHaveTextContent('O')
  })
})
