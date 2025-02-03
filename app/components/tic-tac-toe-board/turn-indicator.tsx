import useGameStore from './store'

export default function TurnIndicator() {
  const turn = useGameStore(state => state.turn)

  return (
    <div>Current player: {turn}</div>
  )
}
