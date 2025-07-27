import useGameStore from './store'

export default function TurnIndicator() {
  const nextPlayer = useGameStore(state => state.nextPlayer)

  return (
    <div>Current player: {nextPlayer}</div>
  )
}
