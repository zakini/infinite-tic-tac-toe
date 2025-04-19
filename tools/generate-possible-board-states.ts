/* eslint-disable no-console */

/**
 * This script generates all possible board states, groups them by condition and stores the result
 * into a JSON file. This file is then used by this app's dev tools to put the game into a
 * particular state
 */

import {
  BoardCondition, FilledCellState, SingleLevelBoardState,
} from '@/app/components/tic-tac-toe-board/types'
import { findWin, initialiseBoardState } from '@/app/components/tic-tac-toe-board/utils'
import fs from 'fs/promises'
import path from 'path'

/**
 * Find the next board state permutation after the given one
 *
 * Cell states 'increment' in this order: empty, X, O
 */
const permute = (current: SingleLevelBoardState): SingleLevelBoardState => {
  const next = structuredClone(current)

  for (const [i, cell] of current.entries()) {
    if (cell === null) {
      next[i] = FilledCellState.X
      return next
    }

    if (cell === FilledCellState.X) {
      next[i] = FilledCellState.O
      return next
    }

    // if cell === FilledCellState.O
    next[i] = null
    // continue
  }

  // current board is filled with O, no next permutation
  throw new Error('No permutation possible')
}

const isPossibleBoardState = (state: SingleLevelBoardState): boolean => {
  // X plays first, then O, etc.
  // X and O should have equal numbers of moves, or X should have 1 more
  const xCount = state.filter(c => c === FilledCellState.X).length
  const oCount = state.filter(c => c === FilledCellState.O).length
  if (xCount === oCount || xCount === (oCount + 1)) return true

  return false
}

const getCondition = (state: SingleLevelBoardState): BoardCondition => {
  const win = findWin(state)

  if (win === false) return BoardCondition.Drawn
  if (win !== null) {
    if (win.player === FilledCellState.X) return BoardCondition.WonX
    return BoardCondition.WonO
  }
  if (state.filter(c => c === null).length === 9) return BoardCondition.Empty
  return BoardCondition.InProgress
}

console.info('Generating board states...')
const allStates = [initialiseBoardState()]

while (true) {
  try {
    allStates.push(permute(allStates[allStates.length - 1]))
  } catch {
    break
  }
}

const validStates = allStates.filter(isPossibleBoardState)
const groupedStates = validStates.reduce(
  (acc, state) => {
    const condition = getCondition(state)
    acc[condition].push(state)
    return acc
  },
  {
    Empty: [],
    InProgress: [],
    Drawn: [],
    WonX: [],
    WonO: [],
  } as Record<keyof typeof BoardCondition, SingleLevelBoardState[]>,
)

console.info('Writing to file...')
await fs.writeFile(
  path.join(import.meta.dirname, '../app/components/tic-tac-toe-board/store/states.json'),
  JSON.stringify(groupedStates, null, 2),
)

console.info('Done')
