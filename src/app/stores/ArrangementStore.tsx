import {create } from 'zustand';

export type ArrangementStoreType = {
    numMeasures: number;
    setNumMeasures: (numMeasures: number) => void;

    widthMeasure: number;
    setWidthMeasure: (widthMeasure: number) => void;

    loop: boolean;
    setLoop: (loop: boolean) => void;

    loopLength: number;
    setLoopLength: (loopLength: number) => void;

    bpm: number;
    setBpm: (bpm: number) => void;
}

export const createArrangementStore = () => {
    return create<ArrangementStoreType>((set) => ({
        numMeasures: 5,
        setNumMeasures: (numMeasures) => set({ numMeasures }),

        widthMeasure: 8,
        setWidthMeasure: (widthMeasure) => set({ widthMeasure }),

        loop: false,
        setLoop: (loop) => set({ loop }),

        loopLength: 5*8,
        setLoopLength: (loopLength) => set({ loopLength }),

        bpm: 120,
        setBpm: (bpm) => set({ bpm }),
    }));
}

