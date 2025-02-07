
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
    const [selectedChordId, setSelectedChordId] = useState<string | null>(null); // Track last clicked chord
    const [activeChordId, setActiveChordId] = useState<string | null>(null); // Track chord being dragged
    const [stores, setStores] = useState<{ id: number; store: ReturnType<typeof createChordPlaybackStore> }[]>([
        { id: 1, store: createChordPlaybackStore() }
      ]);

    const addNumMeasure = () => {
        setNumMeasures(numMeasures + 1);
    }
    const removeNumMeasure = () => {
        setNumMeasures(numMeasures - 1);
    }

    const addWidthMeasure = () => {
        setWidthMeasure(widthMeasure + 1);
    }
    const removeWidthMeasure = () => {
        setWidthMeasure(widthMeasure - 1);
    }
     
     
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
            <label>
                {numMeasures}
            </label>
            
            
            {/* Render fixedComposition components */}
            <div className='pl-6 pt-6 pb-6 m-3 pr-6'
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
                            <div className='flex'>
                            <div className='pt-1'>
                                <label className='ml-2 mr-2 text-grey items-center pr-2 pl-2 pb-1 m-2 rounded-sm' 
                                style={{ 
                                    backgroundColor: 'rgba(1, 255, 158, 0.01)',
                                    //outline: '0.1rem solid #1E291E', 
                                    borderRadius: '0.5rem',
                                    boxShadow: '0rem 0rem .25rem .2rem rgba(93, 148, 125, 0.57)',
                                    width: '{widthComposition}rem',
                                    position: 'relative',
                                    zIndex: 1,
                                    fontWeight: '500',
                                    color: 'rgb(20, 78, 66)',
                                    height: '2rem',
                                
                                    
                                }}>Measure {id}</label>
                                
                            </div>
                            <div>
                            
                            
                            <button onClick={addNumMeasure} className='' style={{ 
                                    backgroundColor: 'rgba(1, 255, 158, 0.12)',
                                    borderRadius: '0.5rem',
                                    width: '3.5rem',
                                    marginLeft: '0.25rem',
                                    height: '2rem',
                                    boxShadow: '0rem 0rem .25rem .2rem rgba(93, 148, 125, 0.8)',
                                }}
                            >+ 
                            </button>
                            <button onClick={removeNumMeasure} className='h-8' style={{ backgroundColor: 'rgba(1, 255, 158, 0.12)',
                                    borderRadius: '0.5rem',
                                    width: '3.5rem',
                                    marginLeft: '0.5rem',
                                    boxShadow: '0rem 0rem .25rem .2rem rgba(93, 148, 125, 0.8)',
                                }}
                            >- 
                            </button>
                            
                            {/* Set width of measures */}
                            
                            <button onClick={addWidthMeasure} className='h-8 ml-10' style={{ backgroundColor: 'rgba(1, 255, 158, 0.12)',
                                    borderRadius: '0.5rem',
                                    width: '4rem',
                                    boxShadow: '0rem 0rem .25rem .2rem rgba(93, 148, 125, 0.8)',
                                }}
                            >+ 
                            </button>
                            <button onClick={removeWidthMeasure} className='h-8 ml-4' style={{ backgroundColor: 'rgba(1, 255, 158, 0.12)',
                                    borderRadius: '0.5rem',
                                    width: '4rem',
                                    boxShadow: '0rem 0rem .25rem .2rem rgba(93, 148, 125, 0.8)',
                                }}
                            >- 
                            </button>
                            </div>
                            </div>
                            <div className='p-2 pt-2'>
                            <MeasureToolbar measureStore={store} arrangementStore={arrangementStore} compositionId={id} />
                            </div>
                            {/* Pass in the corresponding store for each Composition */}
                            <div className='p-2 pt-2' style={{ overflowX: 'auto', overflowY: 'visible'}}>
                            <Measure measureStore={store} arrangementStore={arrangementStore} compositionId={id} />
                            </div>
                            </div>
                            {/* Remove Composition button */}
                            <div className='mt-2 ml-1 pl-1'>
                            {stores.length !== 1 &&(
                            <button className='mr-4 items-center p-1 rounded-sm'   
                                style={{ 
                                    backgroundColor: 'rgba(203, 22, 100, 0.32)',
                                    //outline: '0.1rem solid #1E291E', 
                                    borderRadius: '0.5rem',
                                    boxShadow: '0rem 0rem .25rem .2rem rgba(101, 30, 58, 0.52)',
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