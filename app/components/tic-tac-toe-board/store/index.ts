import { create } from 'zustand'
import createCoreSlice, { CoreSlice } from './core-slice'

// We have to specify the type of this store when using the slices pattern
// See: https://github.com/pmndrs/zustand/issues/508#issuecomment-885469427
const useGameStore = create<CoreSlice>((...args) => ({
  ...createCoreSlice(...args),
}))

export default useGameStore
