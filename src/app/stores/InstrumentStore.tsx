import { create } from "zustand";
export type Instrument = {
  id: string;
  category: string;
  name: string;
  knownNotes: string[];
};

export type InstrumentStoreType = {
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
  instruments: Instrument[];
  setInstruments: (instruments: Instrument[]) => void;
  categories: string[];
  setCategories: (categories: string[]) => void;
};

export const useInstrumentStore = create<InstrumentStoreType>((set: any) => ({
  isLoading: true,
  setIsLoading: (isLoading: boolean) => {
    set({ isLoading }), console.log("isLoading set in store:", isLoading);
  },
  instruments: [],
  setInstruments: (instruments: Instrument[]) => {
    set({ instruments }), console.log("Instruments set in store:", instruments);
  },
  categories: [],
  setCategories: (categories: string[]) => {
    set({ categories }), console.log("Categories set in store:", categories);
  },
}));
