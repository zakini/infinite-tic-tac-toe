'use client'

import { findWin } from './utils'
import useGameStore from './store'
import Results from './results'
import Board from './board'

export default function TicTacToeBoard() {
  const boardState = useGameStore(state => state.boardState)
  const win = findWin(boardState)

  return (
    <div className="relative">
      <Board />

      <Results win={win} className="absolute inset-0" />
    </div>
  )
}
