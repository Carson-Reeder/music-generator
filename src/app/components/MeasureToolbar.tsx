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
        <div className='flex bg-gray-200 mt-5 mb-2 mr-0 border border-0 h-8 p-0'
            style={{
                borderRadius: '0.5rem',
                overflow: 'hidden',
                zIndex: 0,
                position: 'relative',
                boxShadow: '0rem 0rem .25rem .2rem rgba(93, 148, 125, 0.57)',
                backgroundColor: 'transparent',
            }}>
            <button className='bg-gray-300 pl-0 pr-1'
                style={{backgroundColor: 'rgba(1, 255, 158, 0.12)',
                    boxShadow: '0rem 0rem .2rem .1rem rgba(93, 148, 125, 0.57)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: '6rem',
                    
                }}>
                + Note
            </button>
            <button className='bg-gray-300 pl-0'
                style={{backgroundColor: 'rgba(1, 255, 158, 0.12)',
                    boxShadow: '0rem 0rem .2rem .1rem rgba(93, 148, 125, 0.57)',
                    width: '8rem',
                }}
                onClick={() => playMeasure(measureStore, arrangementStore, compositionId)}>
                Play/Pause
            </button>
            <button className='bg-gray-300 pl-0'
                style={{backgroundColor: 'rgba(1, 255, 158, 0.12)',
                    boxShadow: '0rem 0rem .2rem .1rem rgba(93, 148, 125, 0.57)',
                    width: '8rem',
                }}>
                Instrument
            </button>

        </div>
    )
}