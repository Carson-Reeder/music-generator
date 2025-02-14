import React, { useState, useEffect, useRef } from "react";
import { UseBoundStore, StoreApi } from "zustand";
import { ArrangementStoreType, createArrangementStore } from "../stores/ArrangementStore";
import { createChordPlaybackStore } from "../stores/MeasureStore";
import { playAllMeasures } from "../utils/soundPlayer";
import Measure from "./Measure";
import PlayChord from "./PlayChords";
import MeasureToolbar from "./MeasureToolbar";
import AddMeasureLength from "./AddMeasureLength";
import RemoveMeasureLength from "./RemoveMeasureLength";
import AddWidthMeasure from "./AddWidthMeasure";
import RemoveWidthMeasure from "./RemoveWidthMeasure";
import MeasureLabel from "./MeasureLabel";
import RemoveMeasure from "./RemoveMeasure";
import AddMeasure from "./AddMeasure";

type arrangementProps = {
    arrangementStore: UseBoundStore<StoreApi<ArrangementStoreType>>;
    arrangementId: number;
};

export default function Arrangement({ arrangementStore, arrangementId }: arrangementProps) {
    const { numMeasures, setNumMeasures, widthMeasure, setWidthMeasure, stores, createStore, removeStore } = arrangementStore();
    const [selectedChordId, setSelectedChordId] = useState<string | null>(null); // Track last clicked chord
    const [activeChordId, setActiveChordId] = useState<string | null>(null); // Track chord being dragged

    
    

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
                <button className='m-4'
                    onClick={() => playAllMeasures(arrangementStore)}>
                    Play All Measures
                </button>    
                
                {stores.map(({ id, store }) => (
                    <div key={id}>
                        {!store().isInstrumentClicked && (
                        <div className='measure-label-parent'>
                            <div className='measure-label-child'>
                                <MeasureLabel compositionId={id} />
                            </div>
                            <div className='measure-label-child'>
                                <AddMeasureLength arrangementStore={arrangementStore} />
                                <RemoveMeasureLength arrangementStore={arrangementStore} />
                            </div>
                            <div className='measure-label-child'>
                                <AddWidthMeasure arrangementStore={arrangementStore} />
                                <RemoveWidthMeasure arrangementStore={arrangementStore} />
                            </div>
                        </div>
                        )}
                        {/* Measure Toolbar */}
                        <div className='pl-2 pr-2' >
                            <MeasureToolbar measureStore={store} arrangementStore={arrangementStore} compositionId={id} />
                        </div>
                        {/* Measure */}
                        <div className='ml-2 mr-2 measure' style={{ overflowX: 'auto', overflowY: 'visible' }}>
                            <Measure measureStore={store} arrangementStore={arrangementStore} compositionId={id} />
                        </div>
                        {/* Add or Remove Measures */}
                        <div className='mt-2 mb-2 flex flex-wrap'
                            style={{marginLeft: '0.5rem'

                            }}>
                            <RemoveMeasure arrangementStore={arrangementStore} measureId={id} />             
                            <AddMeasure arrangementStore={arrangementStore} measureId={id} />               
                        </div>
                    </div>
                ))}
                  
            </div>
        </div>
    );
}