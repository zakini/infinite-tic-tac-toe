import '@testing-library/jest-dom/vitest' // Set up DOM matchers
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'
import useGameStore from './app/components/tic-tac-toe-board/store'

afterEach(() => {
  // Clean up any rendered components
  cleanup()

  // Clear out zustand store
  useGameStore.setState(useGameStore.getInitialState())
})
