
import React, { useState, useEffect } from "react";
import { UseBoundStore, StoreApi } from "zustand";
import { ArrangementStoreType, createArrangementStore } from "../stores/ArrangementStore";
import { createChordPlaybackStore } from "../stores/MeasureStore";
import Measure from "./Measure";
import PlayChord from "./PlayChords";
import MeasureToolbar from "./MeasureToolbar";
import AddMeasureLength from "./AddMeasureLength";
import RemoveMeasureLength from "./RemoveMeasureLength";
import AddWidthMeasure from "./AddWidthMeasure";
import RemoveWidthMeasure from "./RemoveWidthMeasure";
import MeasureLabel from "./MeasureLabel";

type arrangementProps = {
    arrangementStore: UseBoundStore<StoreApi<ArrangementStoreType>>;
    arrangementId: number;
};

export default function Arrangement({ arrangementStore, arrangementId }: arrangementProps) {
    const { numMeasures, setNumMeasures, widthMeasure, setWidthMeasure, stores, createStore, removeStore } = arrangementStore();
    const [selectedChordId, setSelectedChordId] = useState<string | null>(null); // Track last clicked chord
    const [activeChordId, setActiveChordId] = useState<string | null>(null); // Track chord being dragged
    
    const addComposition = () => {
        createStore();
    };
    const removeComposition = (targetId: number) => {
        removeStore(targetId);
    };

    return (
        <div>
            <h1 className='ml-6 pb-1'>Arrangement:</h1>
            {/* Set number of measures */}
            <label>
                {numMeasures}
            </label>
            
            
            {/* Render fixedComposition components */}
            <div className='arrangement-container pl-6 pt-6 pb-6 m-3 pr-6'
                style={{ backgroundColor: 'rgba(93, 148, 125, 0.36)',
                    //border: '0.1rem solid #1E291E', 
                    borderRadius: '0.5rem',
                    boxShadow: '0rem 0rem .25rem .1rem rgba(93, 148, 125, 0.8)',
                }}>    
                
                {stores.map(({ id, store }) => (
                    <div key={id}>

                        <div className='flex pl-2 pr-2'>
                            <MeasureLabel compositionId={id} />
                            <AddMeasureLength arrangementStore={arrangementStore} />
                            <RemoveMeasureLength arrangementStore={arrangementStore} />
                            <AddWidthMeasure arrangementStore={arrangementStore} />
                            <RemoveWidthMeasure arrangementStore={arrangementStore} />
                        </div>
                            
                        <div className='pl-2 pr-2' >
                            <MeasureToolbar measureStore={store} arrangementStore={arrangementStore} compositionId={id} />
                        </div>
                        {/* Pass in the corresponding store for each Composition */}
                        <div className='ml-2 mr-2' style={{ overflowX: 'auto', overflowY: 'visible' }}>
                            <Measure measureStore={store} arrangementStore={arrangementStore} compositionId={id} />
                        </div>
                            {/* Remove Composition button */}
                            <div className='mt-2'>
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
                ))}
                  
            </div>
        </div>
    );
}