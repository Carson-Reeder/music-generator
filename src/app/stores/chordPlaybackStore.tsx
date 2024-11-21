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
    resetChordLength: () => void;

    chordTimingMeasure: number[];
    setChordTimingMeasure: (index: number, value: number) => void;
    resetChordTimingMeasure: () => void;

};

export const useChordPlaybackStore = create<ChordPlaybackStore>((set) => ({

    chords: [['C4','E4','G4'],['D4','F4','A4'],['G3','B3','D4','F4'],['F4','A4','C5']],
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

    chordLength: [1,1,1,1,1,1,1],
    setChordLength: (index, value) =>
        set((state) => {
            const updated = [...state.chordLength];
            updated[index] = value;
            return { chordLength: updated };
        }
    ),
    resetChordLength: () =>
        set({ chordLength: [1,1,1,1,1,1,1]}),

    chordTimingMeasure: [0,1,2,3,4,5,6],
    setChordTimingMeasure: (index, value) =>
        set((state) => {
            const updated = [...state.chordTimingMeasure];
            updated[index] = value;
            return { chordTimingMeasure: updated };
        }
    ), 
    resetChordTimingMeasure: () => 
        set({ chordTimingMeasure: [0,1,2,3,4,5,6]}),
}));
