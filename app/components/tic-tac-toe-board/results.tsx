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

  return (
    <div className={className} role="dialog" aria-labelledby="results-title">
      <div className="absolute inset-0 bg-black opacity-50" />

      <div id="results-title">Game Over: {win.player} wins</div>
      {!conceded && (
        <div className="absolute flex gap-2">
          <button className="bg-white" onClick={() => setConceded(true)}>Concede</button>
          <button className="bg-white" onClick={() => goDeeper()}>Go Deeper</button>
        </div>
      )}
    </div>
  )
}
