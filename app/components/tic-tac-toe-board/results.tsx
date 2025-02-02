import { useState } from 'react'
import useGameStore from './store'
import { Win } from './types'

type Props = {
  win: Win | null
  className?: string
}

export default function Results({ win, className = 'relative' }: Props) {
  const [conceded, setConceded] = useState(false)
  const goDeeper = useGameStore(state => state.goDeeper)

  if (!win) return null

  if (conceded) {
    return (
      <div className={className}>
        <div className="absolute inset-0 bg-black opacity-50" />

        <span>Game Over: {win.player} wins</span>
      </div>
    )
  }

  return (
    <div className={className}>
      <div className="absolute inset-0 bg-black opacity-50" />
      <div className="absolute flex gap-2">
        <button className="bg-white" onClick={() => setConceded(true)}>Concede</button>
        <button className="bg-white" onClick={() => goDeeper()}>Go Deeper</button>
      </div>
    </div>
  )
}
