import { create } from "zustand";
import { createChordPlaybackStore } from "./MeasureStore";
import * as Tone from "tone";

export type ArrangementStoreType = {
  numMeasures: number;
  setNumMeasures: (numMeasures: number) => void;

  widthMeasure: number;
  setWidthMeasure: (widthMeasure: number) => void;

  widthComposition: number;
  setWidthComposition: (widthComposition: number) => void;

  loop: boolean;
  setLoop: (loop: boolean) => void;

  loopLength: number;
  setLoopLength: (loopLength: number) => void;

  bpm: number;
  setBpm: (bpm: number) => void;

  allPlaying: boolean;
  setAllPlaying: (allPlaying: boolean) => void;

  currentPart: Tone.Part | null;
  setCurrentPart: (currentPart: Tone.Part | null) => void;

  stores: { id: number; store: ReturnType<typeof createChordPlaybackStore> }[];
  setStores: (
    stores: { id: number; store: ReturnType<typeof createChordPlaybackStore> }[]
  ) => void;
  createStore: () => void;
  removeStore: (id: number) => void;
};

export const createArrangementStore = () => {
  return create<ArrangementStoreType>((set) => ({
    numMeasures: 5,
    setNumMeasures: (numMeasures) =>
      set((state) => {
        if (numMeasures < 1) return state; // Return current state if invalid
        // Automatically update widthComposition when numMeasures changes
        const widthComposition = state.widthMeasure * numMeasures;
        return { numMeasures, widthComposition }; // Update widthComposition as well
      }),

    widthMeasure: 8,
    setWidthMeasure: (widthMeasure) =>
      set((state) => {
        // Automatically update widthComposition when widthMeasure changes
        const widthComposition = widthMeasure * state.numMeasures;
        return { widthMeasure, widthComposition }; // Update widthComposition based on widthMeasure
      }),

    widthComposition: 5 * 8,
    setWidthComposition: (widthComposition) => set({ widthComposition }),

    loop: false,
    setLoop: (loop) => set({ loop }),

    loopLength: 5 * 8,
    setLoopLength: (loopLength) => set({ loopLength }),

    bpm: 120,
    setBpm: (bpm) => set({ bpm }),

    allPlaying: false,
    setAllPlaying: (allPlaying) => set({ allPlaying }),

    currentPart: null,
    setCurrentPart: (currentPart) => set({ currentPart }),

    stores: [{ id: 1, store: createChordPlaybackStore() }],
    setStores: (
      stores: {
        id: number;
        store: ReturnType<typeof createChordPlaybackStore>;
      }[]
    ) => set({ stores }),
    createStore: () => {
      console.log("Creating new store...");
      set((state) => {
        const newId =
          state.stores.length > 0
            ? Math.max(...state.stores.map((s) => s.id)) + 1
            : 1;
        console.log("newId", newId);
        const newStore = createChordPlaybackStore();
        console.log("newStore", newStore);
        return { stores: [...state.stores, { id: newId, store: newStore }] };
      });
    },
    removeStore: (id: number) => {
      // The removeStore function
      set((state) => ({
        stores: state.stores
          .filter((store) => store.id !== id)
          .map((store) => ({
            ...store,
            //id: store.id > id ? store.id - 1 : store.id,
          })),
      }));
    },
  }));
};
