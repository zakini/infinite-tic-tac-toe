'use client'

import { Fragment } from 'react'
import Board from './board'
import Results from './results'
import TurnIndicator from './turn-indicator'
import ZoomControl from './zoom-control'

const DevTools = process.env.NODE_ENV === 'development'
  ? await import('@/components/dev-tools').then(m => m.default)
  : Fragment

export default function TicTacToeBoard() {
  return (
    <>
      <div className="relative">
        <div className="flex justify-between text-right">
          <TurnIndicator />
          <ZoomControl />
        </div>
        <Board />
        <Results className="absolute inset-0 z-10" />
      </div>
      <DevTools />
    </>
  )
}
