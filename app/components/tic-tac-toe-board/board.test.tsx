import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import Board from './board'
import userEvent from '@testing-library/user-event'
import useGameStore from './store'
import { BoardState, FilledCellState } from './types'

const X = FilledCellState.X
const O = FilledCellState.O
const _ = null
/** All blank 1 level board */
const _1b: BoardState = [
  _, _, _,
  _, _, _,
  _, _, _,
] as const
/** 1 level board won by X */
const x1b: BoardState = [
  X, X, X,
  O, O, _,
  _, _, _,
] as const
/** 1 level board won by O */
const o1b: BoardState = [
  X, X, _,
  O, O, O,
  _, _, X,
] as const
/** 1 level drawn board */
const d1b: BoardState = [
  X, X, O,
  O, O, X,
  X, O, X,
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
/** All blank 4 level board */
const _4b: BoardState = [
  _3b, _3b, _3b,
  _3b, _3b, _3b,
  _3b, _3b, _3b,
] as const

describe('board core', () => {
  describe('take turns', () => {
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

  describe('nested cell summaries', () => {
    it('summarises sub-boards won by X', () => {
      useGameStore.setState({
        boardState: [
          _1b, x1b, _1b,
          _1b, _1b, _1b,
          _1b, _1b, _1b,
        ],
      })
      render(<Board />)

      const xSubBoard = screen.getByRole('region', { name: /sub-board won by X/i })
      expect(xSubBoard).toBeInTheDocument()
      const emptySubBoards = screen.getAllByRole('region', { name: /in-progress sub-board/i })
      expect(emptySubBoards.length).toBe(8)
    })

    it('summarises sub-boards won by O', () => {
      useGameStore.setState({
        boardState: [
          _1b, o1b, _1b,
          _1b, _1b, _1b,
          _1b, _1b, _1b,
        ],
      })
      render(<Board />)

      const xSubBoard = screen.getByRole('region', { name: /sub-board won by O/i })
      expect(xSubBoard).toBeInTheDocument()
      const emptySubBoards = screen.getAllByRole('region', { name: /in-progress sub-board/i })
      expect(emptySubBoards.length).toBe(8)
    })

    it('summarises drawn sub-boards', () => {
      useGameStore.setState({
        boardState: [
          _1b, d1b, _1b,
          _1b, _1b, _1b,
          _1b, _1b, _1b,
        ],
      })
      render(<Board />)

      const drawnSubBoard = screen.getByRole('region', { name: /sub-board drawn/i })
      expect(drawnSubBoard).toBeInTheDocument()
      const emptySubBoards = screen.getAllByRole('region', { name: /in-progress sub-board/i })
      expect(emptySubBoards.length).toBe(8)
    })

    it('does not summarise the top level board', () => {
      useGameStore.setState({ boardState: x1b })
      render(<Board />)

      const cells = screen.getAllByRole('button', { name: /cell/i })
      expect(cells.length).toBe(9)
    })
  })

  describe('deep state', () => {
    it('doesn\'t show deep state fully', () => {
      useGameStore.setState({ boardState: _4b })
      render(<Board />)

      const cells = screen.getAllByRole('region', { name: /unknown state/i })
      // Not rendering sub-boards past level 3
      expect(cells.length).toBe(9 ** 3)

      for (const cell of cells) {
        expect(cell.textContent).toBe('?')
      }
    })

    it('shows the cell summary for completed boards at the render boundary', () => {
      /** Mostly all blank 2 level board, but with the top left sub-board completed */
      const p2b: BoardState = [
        x1b, _1b, _1b,
        _1b, _1b, _1b,
        _1b, _1b, _1b,
      ] as const
      /** Mostly all blank 3 level board, but with the top left sub-board completed */
      const p3b: BoardState = [
        p2b, _2b, _2b,
        _2b, _2b, _2b,
        _2b, _2b, _2b,
      ] as const
      useGameStore.setState({
        boardState: [
          p3b, _3b, _3b,
          _3b, _3b, _3b,
          _3b, _3b, _3b,
        ],
      })
      render(<Board />)

      const unknownCells = screen.getAllByRole('region', { name: /unknown state/i })
      // Not rendering sub-boards past level 3
      expect(unknownCells.length).toBe(9 ** 3 - 1)

      for (const cell of unknownCells) {
        expect(cell.textContent).toBe('?')
      }

      const completedCells = screen.getAllByRole('region', { name: /board won by X/i })
      expect(completedCells.length).toBe(1)
    })
  })
})
