import { create } from 'zustand';

// define Chord object
type Chord = {
    id: string;
    notes: string[];
    startPosition: number;
    length: number;
    timingMeasure: number

}

// define variables and functions of store
type ChordPlaybackStore = {

    // chords contains array of Chord objects
    chords: Chord[];
    setChords: (chords: Chord[]) => void;
    preprocessed: any;

    bpm: number;
    setBpm: (bpm: number) => void;

    setChordNotes: (id: string, notes: string[]) => void;
    setChordTiming: (id: string, timingMeasure: number) => void;
    setChordLength: (id: string, length: number) => void;
    setChordStartPosition: (id: string, startPosition: number) => void;

};

// define chords that appear upon page load
const initialChords: Chord[] = [
    { id: '1', notes: ['C4', 'E4', 'G4'], startPosition: 0, length: 1, timingMeasure: 0 },
    { id: '2', notes: ['D4', 'F4', 'A4'], startPosition: 1, length: 1, timingMeasure: 1 },
    { id: '3', notes: ['G3', 'B3', 'D4', 'F4'], startPosition: 2, length: 1, timingMeasure: 2 },
    { id: '4', notes: ['F4', 'A4', 'C5'], startPosition: 3, length: 1, timingMeasure: 3 },
  ];

// create store
export const useChordPlaybackStore = create<ChordPlaybackStore>((set) => ({

    chords: initialChords,
    preprocessed: {
        notes: initialChords.map((chord) => chord.notes),
        lengths: initialChords.map((chord) => chord.length),
        timings: initialChords.map((chord) => chord.timingMeasure),
        position: initialChords.map((chord) => chord.startPosition),
      },
    setChords: (chords) =>
    set({
        chords,
        preprocessed: {
        notes: chords.map((chord) => chord.notes),
        lengths: chords.map((chord) => chord.length),
        timings: chords.map((chord) => chord.timingMeasure),
        position: chords.map((chord) => chord.startPosition),
        },
    }),
    bpm: 120,
    setBpm: (bpm: number) => set({ bpm }),

    setChordNotes: (id: string, notes: string[]) =>
        set((state) => {
            const updatedChords = state.chords.map((chord) =>
                chord.id === id ? { ...chord, notes } : chord
            );
        return {
            chords: updatedChords,
            preprocessed: {
                notes: updatedChords.map((chord) => chord.notes),
                lengths: updatedChords.map((chord) => chord.length),
                timings: updatedChords.map((chord) => chord.timingMeasure),
                position: updatedChords.map((chord) => chord.startPosition),
            },
        };
        }),

    setChordTiming: (id: string, timingMeasure: number) =>
        set((state) => {
            const updatedChords = state.chords.map((chord) =>
                chord.id === id ? { ...chord, timingMeasure } : chord
            );
        
            return {
                chords: updatedChords,
                preprocessed: {
                    notes: updatedChords.map((chord) => chord.notes),
                    lengths: updatedChords.map((chord) => chord.length),
                    timings: updatedChords.map((chord) => chord.timingMeasure),
                    position: updatedChords.map((chord) => chord.startPosition),
                },
            }; 
        }),

    setChordLength: (id: string, length: number) =>
        set((state) => {
            const updatedChords = state.chords.map((chord) =>
                chord.id === id ? { ...chord, length } : chord
            );
        
            return {
                chords: updatedChords,
                preprocessed: {
                    notes: updatedChords.map((chord) => chord.notes),
                    lengths: updatedChords.map((chord) => chord.length),
                    timings: updatedChords.map((chord) => chord.timingMeasure),
                    position: updatedChords.map((chord) => chord.startPosition),
                },
            }; 
        }),

        setChordStartPosition: (id: string, startPosition: number) =>
            set((state) => {
                const updatedChords = state.chords.map((chord) =>
                    chord.id === id ? { ...chord, startPosition } : chord
                );
        
                return {
                    chords: updatedChords,
                    preprocessed: {
                        notes: updatedChords.map((chord) => chord.notes),
                        lengths: updatedChords.map((chord) => chord.length),
                        timings: updatedChords.map((chord) => chord.timingMeasure),
                        position: updatedChords.map((chord) => chord.startPosition),
                    },
                };
            }),
}));