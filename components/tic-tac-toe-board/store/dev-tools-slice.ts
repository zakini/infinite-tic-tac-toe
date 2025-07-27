import { type StateCreator } from 'zustand'
import {
  assertIsBoardState, BoardCondition, type BoardState, FilledCellState, type SingleLevelBoardState,
} from '../types'
import { type CoreSlice } from './core-slice'
import allPossibleSingleLevelBoardStates from './states.json'
import useGameStore from '.'

type SliceStateCreator<T, U> = StateCreator<U & T, [], [], T>

const randomElement = <T>(arr: readonly T[]): T => arr[Math.floor(Math.random() * arr.length)]

const generateSingleLevelBoardForCondition = (condition: BoardCondition): SingleLevelBoardState => {
  const statesForCondition = allPossibleSingleLevelBoardStates[condition]
  const state = randomElement(statesForCondition)
  assertIsBoardState(state)
  return state
}

const homogenousConditions = [BoardCondition.Empty, BoardCondition.Drawn] as const
const nullConditions = [
  BoardCondition.Empty,
  BoardCondition.InProgress,
  BoardCondition.Drawn,
] as const

const generateBoardForCondition = (condition: BoardCondition, depth: number): BoardState => {
  if (depth < 1) throw new Error('Depth must be 1 or greater')

  if (depth === 1) return generateSingleLevelBoardForCondition(condition)

  let board
  if (homogenousConditions.includes(condition)) {
    // All the sub-boards will have the exact same condition
    board = Array.from(Array(9)).map(() => generateBoardForCondition(condition, depth - 1))
  } else {
    // Generate a board for this level, and replace each of its cells with a sub-board with the
    // appropriate result
    const baseBoard = generateSingleLevelBoardForCondition(condition)

    const maxDrawnBoards = condition === BoardCondition.InProgress
      ? baseBoard.filter(c => c === null).length - 1
      : Infinity
    let totalDrawnBoards = 0

    board = baseBoard.map((c) => {
      switch (c) {
        case FilledCellState.X:
          return generateBoardForCondition(BoardCondition.WonX, depth - 1)
        case FilledCellState.O:
          return generateBoardForCondition(BoardCondition.WonO, depth - 1)
        case null:
          let subCondition = randomElement(nullConditions)

          // We're generating an in-progress board, but we're about to cause a draw instead. Force
          // the sub-condition to not be drawn to avoid that
          // It's more likely than you might think
          if (totalDrawnBoards === maxDrawnBoards && subCondition === BoardCondition.Drawn) {
            subCondition = randomElement([BoardCondition.Empty, BoardCondition.InProgress])
          }

          if (subCondition === BoardCondition.Drawn) totalDrawnBoards++

          return generateBoardForCondition(subCondition, depth - 1)
      }
    })
  }

  assertIsBoardState(board)
  return board
}

export type DevToolsSlice = {
  forceBoardCondition: (condition: BoardCondition, depth: number) => void
}

const createDevToolsSlice: SliceStateCreator<DevToolsSlice, CoreSlice> = set => ({
  forceBoardCondition: (condition: BoardCondition, depth: number) => set({
    ...useGameStore.getInitialState(),
    boardState: generateBoardForCondition(condition, depth),
    // TODO figure out correct value for nextPlayer based on the generated board
  }),
})

export default createDevToolsSlice
