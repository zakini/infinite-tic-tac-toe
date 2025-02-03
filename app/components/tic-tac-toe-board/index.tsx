'use client'

import Results from './results'
import Board from './board'
import TurnIndicator from './turn-indicator'

export default function TicTacToeBoard() {
  return (
    <div className="relative">
      <TurnIndicator />
      <Board />
      <Results className="absolute inset-0" />
    </div>
  )
}
