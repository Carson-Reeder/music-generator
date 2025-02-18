import { MeasureStoreType } from "../stores/MeasureStore"
import { UseBoundStore, StoreApi } from "zustand"
import { useEffect, useState } from "react";

type InstrumentData = {
    id: number;
    name: string;
    samples: string[];
    knownNotes: [string, string];
};


type ShowInstrumentProps = {
    measureStore: UseBoundStore<StoreApi<MeasureStoreType>>;
}
export default function ShowInstruments({ measureStore }: ShowInstrumentProps) {
    const [instruments, setInstruments] = useState<InstrumentData[]>([]);
    const { setInstrument } = measureStore();

    useEffect(() => {
        fetch("/api/instruments")
            .then((res) => res.json())
            .then((data) => setInstruments(data))
            .catch((err) => console.error("Error loading instruments:", err));
    }, []);

    if (measureStore().isInstrumentClicked) {

        return (
            <div className='measure-display-parent'>
                    {instruments.map((instrument) => (       
                        <button key={instrument.id} className='measure-display-child' onClick={() => setInstrument(String(instrument.id))}>
                            {instrument.name}
                        </button>
                    ))}
                    
            </div>
        );
    }   
};


