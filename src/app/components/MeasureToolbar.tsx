import { UseBoundStore, StoreApi } from 'zustand';
import { MeasureStoreType } from "../stores/MeasureStore";
import { ArrangementStoreType } from "../stores/ArrangementStore";
import { playMeasure } from "../utils/soundPlayer";

type MeasureToolbarProps = {
    measureStore: UseBoundStore<StoreApi<MeasureStoreType>>;
    arrangementStore: UseBoundStore<StoreApi<ArrangementStoreType>>;
    compositionId: number;
}
export default function MeasureToolbar ({ measureStore, arrangementStore, compositionId }: MeasureToolbarProps) {
    const { chords, setChordTiming, setChordLength, setChordStartPosition
    } = measureStore();
    const { numMeasures, setNumMeasures, widthMeasure, setWidthMeasure,loop, setLoop, loopLength, setLoopLength, bpm, setBpm 
    } = arrangementStore();
    return(
        <div className='flex bg-gray-200 m-5 p-0 border h-8'
            style={{
                borderRadius: '0.5rem',
                overflow: 'hidden',
                zIndex: 0,
                position: 'relative',
                boxShadow: '0rem 0rem .25rem .2rem rgba(93, 148, 125, 0.57)'
            }}>
            <button className='bg-gray-300 w-16 pl-0 border border-black'>
                + Note
            </button>
            <button className='bg-gray-300 w-32 pl-0 border border-black'
                onClick={() => playMeasure(measureStore, arrangementStore, compositionId)}>
                Play/Pause
            </button>
            <button className='bg-gray-300 w-32 pl-0 border border-black'>
                Instrument
            </button>

        </div>
    )
}