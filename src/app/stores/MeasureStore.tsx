import { create } from "zustand";
import { Instrument } from "./InstrumentStore";

// define default chords for array
const initialChords: ChordType[] = [
  {
    id: "1",
    notes: ["C4", "E4", "G4"],
    startPosition: 0,
    length: 1,
    chordTimingBeat: 0,
  },
  {
    id: "2",
    notes: ["D4", "F4", "A4"],
    startPosition: 1,
    length: 1,
    chordTimingBeat: 0,
  },
  {
    id: "3",
    notes: ["G3", "B3", "D4"],
    startPosition: 2,
    length: 0.75,
    chordTimingBeat: 0,
  },
  {
    id: "4",
    notes: ["F4", "A4", "C5"],
    startPosition: 2,
    length: 1,
    chordTimingBeat: 3,
  },
];
const initialInstrument: Instrument = {
  id: "1",
  category: "brass",
  knownNotes: ["A1", "C2", "C4"],
  name: "french-horn",
};

export type ChordType = {
  id: string;
  notes: string[];
  startPosition: number;
  length: number;
  chordTimingBeat: number;
};

export type MeasureStoreType = {
  id: number;
  chords: ChordType[];
  setChords: (chords: ChordType[]) => void;
  bpm: number;
  setBpm: (bpm: number) => void;
  instrument: Instrument;
  setInstrument: (instrument: Instrument) => void;
  selectedInstrumentCategory: string;
  setSelectedInstrumentCategory: (selectedInstrumentCategory: string) => void;
  selectedInstrument: string;
  setSelectedInstrument: (selectedInstrument: string) => void;
  isInstrumentClicked: boolean;
  setIsInstrumentClicked: (isInstrumentClicked: boolean) => void;
  isPlaying: boolean;
  setIsPlaying: (isPlaying: boolean) => void;
  measureProgress: any | null;
  setMeasureProgress: (measureProgress: any) => void;
  currentPart: any;
  setCurrentPart: (currentPart: any) => void;

  setChordNotes: (id: string, notes: string[]) => void;
  setChordTiming: (id: string, chordTimingBeat: number) => void;
  setChordLength: (id: string, length: number) => void;
  setChordStartPosition: (id: string, startPosition: number) => void;
};

// create store instance
export const createChordPlaybackStore = (id: number) => {
  return create<MeasureStoreType>((set) => ({
    id,
    chords: initialChords,
    setChords: (chords) =>
      set((state) => ({
        chords,
      })),

    bpm: 120,
    setBpm: (bpm: number) => set({ bpm }),

    instrument: initialInstrument,
    setInstrument: (instrument: Instrument) => {
      set({ instrument });
    },

    selectedInstrumentCategory: "brass",
    setSelectedInstrumentCategory: (selectedInstrumentCategory: string) => {
      set({ selectedInstrumentCategory });
    },

    selectedInstrument: "french-horn",
    setSelectedInstrument: (selectedInstrument: string) => {
      set({ selectedInstrument });
    },

    isPlaying: false,
    setIsPlaying: (isPlaying: boolean) => set({ isPlaying: isPlaying }),

    measureProgress: null,
    setMeasureProgress: (measureProgress: any) => set({ measureProgress }),

    currentPart: null,
    setCurrentPart: (currentPart: any) => set({ currentPart }),

    isInstrumentClicked: true,
    setIsInstrumentClicked: (isInstrumentClicked: boolean) =>
      set({ isInstrumentClicked }),

    setChordNotes: (id: string, notes: string[]) =>
      set((state) => {
        const updatedChords = state.chords.map((chord) =>
          chord.id === id ? { ...chord, notes } : chord
        );
        return {
          chords: updatedChords,
        };
      }),
    setChordTiming: (id: string, chordTimingBeat: number) =>
      set((state) => {
        const updatedChords = state.chords.map((chord) =>
          chord.id === id ? { ...chord, chordTimingBeat } : chord
        );
        return {
          chords: updatedChords,
        };
      }),
    setChordLength: (id: string, length: number) =>
      set((state) => {
        const updatedChords = state.chords.map((chord) =>
          chord.id === id ? { ...chord, length } : chord
        );
        return {
          chords: updatedChords,
        };
      }),
    setChordStartPosition: (id: string, startPosition: number) =>
      set((state) => {
        const updatedChords = state.chords.map((chord) =>
          chord.id === id ? { ...chord, startPosition } : chord
        );
        return {
          chords: updatedChords,
        };
      }),
  }));
};
