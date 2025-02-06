
import React, { useState, useEffect } from "react";
import { UseBoundStore, StoreApi } from "zustand";
import { ArrangementStoreType, createArrangementStore } from "../stores/ArrangementStore";
import { createChordPlaybackStore } from "../stores/MeasureStore";
import Measure from "./Measure";
import PlayChord from "./PlayChords";
import MeasureToolbar from "./MeasureToolbar";

type arrangementProps = {
    arrangementStore: UseBoundStore<StoreApi<ArrangementStoreType>>;
    arrangementId: number;
};

export default function Arrangement({ arrangementStore, arrangementId }: arrangementProps) {
    const { numMeasures, setNumMeasures, widthMeasure, setWidthMeasure, loop, setLoop, loopLength, setLoopLength, bpm, setBpm } = arrangementStore();
    const [stores, setStores] = useState<{ id: number; store: ReturnType<typeof createChordPlaybackStore> }[]>([
        { id: 1, store: createChordPlaybackStore() }
      ]);
    
    const addComposition = () => {
        setStores([...stores, { id: stores.length + 1, store: createChordPlaybackStore() }]);
    };
    const removeComposition = (targetId: number) => {
        const removeComp = stores.filter(({ id }) => id !== targetId);
        const updated = removeComp.map((comp) =>
          comp.id > targetId
            ? { ...comp, id: comp.id - 1 }
            : comp
        );
        setStores(updated);
      };
    

    return (
        <div>
            <h1 className='ml-6 pb-1'>Arrangement:</h1>
            {/* Set number of measures */}
            <div className='h-8 w-44 ml-10' style={{ backgroundColor: 'rgba(1, 255, 158, 0.12)',
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
            <div className='h-8 w-44 ml-10' style={{ backgroundColor: 'rgba(1, 255, 158, 0.12)',
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
            <div className='pl-4 pt-6 pb-6 m-3 pr-8'
                style={{ backgroundColor: 'rgba(93, 148, 125, 0.36)',
                    //border: '0.1rem solid #1E291E', 
                    borderRadius: '0.5rem',
                    boxShadow: '0rem 0rem .25rem .1rem rgba(93, 148, 125, 0.8)',
                }}>    
                {stores.map(({ id, store }) => (
                    <div key={id}>
                        <div className="mb-6">
                            <div>
                            {/* Composition label */}
                            <div className='pt-1'>
                                <label className='ml-5 mr-2 text-grey items-center pr-2 pl-2 pb-1 m-2 rounded-sm' 
                                style={{ 
                                    backgroundColor: 'rgba(1, 255, 158, 0.01)',
                                    //outline: '0.1rem solid #1E291E', 
                                    borderRadius: '0.5rem',
                                    boxShadow: '0rem 0rem .25rem .2rem rgba(93, 148, 125, 0.57)',
                                    width: '{widthComposition}rem',
                                    position: 'relative',
                                    zIndex: 1,
                                    fontWeight: '500',
                                    color: 'rgb(20, 78, 66)'
                                
                                    
                                }}>Measure {id}</label>
                                
                            </div>
                            <div className='p-0 m-0'>
                            <MeasureToolbar measureStore={store} arrangementStore={arrangementStore} compositionId={id} />
                            </div>
                            {/* Pass in the corresponding store for each Composition */}
                            <div style={{ overflowX: 'auto', overflowY: 'visible'}}>
                            <Measure measureStore={store} arrangementStore={arrangementStore} compositionId={id} />
                            </div>
                            </div>
                            {/* Remove Composition button */}
                            <div className='mt-2 ml-4'>
                            {stores.length !== 1 &&(
                            <button className='mr-4 items-center p-1 rounded-sm'   
                                style={{ 
                                    backgroundColor: 'rgba(203, 22, 100, 0.32)',
                                    outline: '0.1rem solid #1E291E', 
                                    borderRadius: '0.5rem',
                                    boxShadow: '0rem 0rem .25rem .2rem rgba(183, 111, 140, 0.52)',
                                }} 
                                onClick={() => removeComposition(id)}>Delete
                            </button>
                            )}              
                            {/* Add Composition button */}
                            {id === stores[stores.length-1].id && (
                                <button className='ml-0 items-center p-1 pr-2 pl-2 rounded-sm' 
                                    style={{ 
                                        backgroundColor: 'rgba(1, 255, 158, 0.12)',
                                        //outline: '0.1rem solid #1E291E', 
                                        borderRadius: '0.5rem',
                                        boxShadow: '0rem 0rem .25rem .2rem rgba(93, 148, 125, 0.8)',
                                    }} 
                                    onClick={addComposition}>Add New Composition
                                    
                                </button> 
                            )}               
                            </div>
                        </div>
                    </div>
                ))}
                  
            </div>
        </div>
    );

}