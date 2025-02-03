'use client'

import Results from './results'
import Board from './board'

export default function TicTacToeBoard() {
  return (
    <div className="relative">
      <Board />
      <Results className="absolute inset-0" />
    </div>
  )
}
