import { create } from 'zustand';

type ChordPlaybackStore = {

    chords: string[][];
    setChords: (chords: string[][]) => void;

    bpm: number;
    setBpm: (bpm: number) => void;

    chordStartPosition: number[];
    setChordStartPosition: (index: number, value: number) => void;

    chordLength: number[];
    setChordLength: (index: number, value: number) => void;

    chordTimingMeasure: number[];
    setChordTimingMeasure: (index: number, value: number) => void;
};

export const useChordPlaybackStore = create<ChordPlaybackStore>((set) => ({

    chords: [],
    setChords: (chords: string[][]) => set({ chords }),

    bpm: 120,
    setBpm: (bpm: number) => set({ bpm }),    

    chordStartPosition: [0],
    setChordStartPosition: (index: number, value: number) => 
        set((state) => {
            const updated = [...state.chordStartPosition];
            updated[index] = value;
            return { chordStartPosition: updated };
        }

    ),   

    chordLength: [1,1,1,1,1,1],
    setChordLength: (index, value) =>
        set((state) => {
            const updated = [...state.chordLength];
            updated[index] = value;
            return { chordLength: updated };
        }
    ),

    chordTimingMeasure: [0,1,2,3,4,5],
    setChordTimingMeasure: (index, value) =>
        set((state) => {
            const updated = [...state.chordLength];
            updated[index] = value;
            return { chordLength: updated };
        }
    ),    
}));
