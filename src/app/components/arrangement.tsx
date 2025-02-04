
import React, { useState, useEffect } from "react";
import { UseBoundStore, StoreApi } from "zustand";
import { ArrangementStoreType, createArrangementStore } from "../stores/ArrangementStore";
import { createChordPlaybackStore } from "../stores/chordPlaybackStore";
import FixedComposition from "./fixedcomposition";
import PlayChord from "./playChords";

type arrangementProps = {
    useStore: UseBoundStore<StoreApi<ArrangementStoreType>>;
    arrangementId: number;
};

export default function Arrangement({ useStore, arrangementId }: arrangementProps) {
    const { numMeasures, setNumMeasures, widthMeasure, setWidthMeasure, loop, setLoop, loopLength, setLoopLength, bpm, setBpm } = useStore();
    const [stores, setStores] = useState<{ id: number; store: ReturnType<typeof createChordPlaybackStore> }[]>([
        { id: 1, store: createChordPlaybackStore() }
      ]);
    
    const addComposition = () => {
        setStores([...stores, { id: stores.length + 1, store: createChordPlaybackStore() }]);
    };
    const removeComposition = (id: number) => {
        setStores(stores.filter((comp) => comp.id !== id));
    };

    return (
        <div>
            <h1>Arrangement</h1>
            {/* Set number of measures */}
            <div className='h-8 w-44' style={{ backgroundColor: 'rgba(1, 255, 158, 0.12)',
                    outline: '0.1rem solid #1E291E', borderRadius: '0.5rem'
                }}
            >
                <label>Num Measures: </label>
                <input
                    type="number"
                    value={numMeasures}
                    min={1}
                    max={50}
                    className = "appearance-none bg-gray-300 text-center text-center w-6 p-0"
                    onChange={(e) => {
                        setNumMeasures(e.target.valueAsNumber);
                    }}
                />
            </div>
            {/* Set width of measures */}
            <div className='h-8 w-44' style={{ backgroundColor: 'rgba(1, 255, 158, 0.12)',
                    outline: '0.1rem solid #1E291E', borderRadius: '0.5rem'
                }}
            >
                <div className='pl-3 pt-1'>
                    <label>Width Measures: </label>
                    <input
                        type="number"
                        value={widthMeasure}
                        min={2}
                        max={50}
                        className = "appearance-none bg-gray-300 text-center text-center w-6 p-0"
                        onChange={(e) => {
                            setWidthMeasure(e.target.valueAsNumber);
                        }}
                />
                </div>
            </div>
            {/* Render fixedComposition components */}
            <div>    
                {stores.map(({ id, store }) => (
                    <div key={id}>
                        <div style={{margin: "10px", padding: "10px" }}>
                            {/* Pass in the corresponding store for each Composition */}
                            <FixedComposition useStore={store} arrangementStore={useStore} compositionId={id} />
                            {/* Remove Composition button */}
                            <button className='ml-5 mr-2 items-center pr-1 pl-1 pt-1 rounded-sm mb-8'   
                                style={{ 
                                    backgroundColor: 'rgba(1, 255, 158, 0.12)',
                                    outline: '0.1rem solid #1E291E', 
                                    borderRadius: '0.5rem'
                                }} 
                                onClick={() => removeComposition(id)}>Delete
                            </button>
                            {/* Add Composition button */}
                            <button className='ml-5 mr-2 items-center pr-1 pl-1 pb-1 rounded-sm mb-8' 
                                style={{ 
                                    backgroundColor: 'rgba(1, 255, 158, 0.12)',
                                    outline: '0.1rem solid #1E291E', 
                                    borderRadius: '0.5rem'
                                }} 
                                onClick={addComposition}>Add New Composition
                            </button> 
                        </div>
                    </div>
                ))}
                  
            </div>
        </div>
    );

}