'use client'

import Results from './results'
import Board from './board'
import TurnIndicator from './turn-indicator'
import { Fragment } from 'react'

const DevTools = process.env.NODE_ENV === 'development'
  ? await import('./dev-tools').then(m => m.default)
  : Fragment

export default function TicTacToeBoard() {
  return (
    <div className="relative">
      <TurnIndicator />
      <Board />
      <Results className="absolute inset-0" />
      <DevTools />
    </div>
  )
}
