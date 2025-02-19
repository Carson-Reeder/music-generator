import { create } from "zustand";
type Instrument = {
  id: string;
  category: string;
  name: string;
  knownNotes: string[];
};

export type InstrumentStoreType = {
  instruments: Instrument[];
  setInstruments: (instruments: Instrument[]) => void;
};

export const useInstrumentStore = create<InstrumentStoreType>((set: any) => ({
  instruments: [],
  setInstruments: (instruments: Instrument[]) => {
    set({ instruments }), console.log("Instruments set in store:", instruments);
  },
}));
