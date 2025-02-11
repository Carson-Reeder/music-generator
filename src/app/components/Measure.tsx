"use client";
import React, { useState, useEffect, useRef } from 'react';
import interact from "interactjs";
import { UseBoundStore, StoreApi } from 'zustand';
import { MeasureStoreType } from "../stores/MeasureStore";
import { flushSync } from 'react-dom';
import { off } from 'process';
import { playChord, playChordProgression } from '../utils/soundPlayer';
import { ArrangementStoreType, createArrangementStore } from '../stores/ArrangementStore';
import MeasureBackground from './MeasureBackground';
import MeasureLines from './MeasureLines';
import Chord from './Chord';

type MeasureProps = {
    measureStore: UseBoundStore<StoreApi<MeasureStoreType>>;
    compositionId: number;
    arrangementStore: UseBoundStore<StoreApi<ArrangementStoreType>>;
  };

export default function Measure ({measureStore, compositionId, arrangementStore}: MeasureProps) {
    const { setChordTiming, setChordLength, setChordStartPosition
    } = measureStore();
    const { widthComposition, numMeasures, setNumMeasures, widthMeasure, setWidthMeasure,loop, setLoop, loopLength, setLoopLength, bpm, setBpm 
    } = arrangementStore();
    const chords = measureStore((state) => state.chords);
  
    return (
            // Render measure container
            <div className="measure-container"
                style={{
                    width: `${widthComposition}rem`,
                    height: '4.5rem',
                    position: 'absolute',
                    //outline: '0.25rem solid #1E291E',
                    borderRadius: '0.2rem',
                    zIndex: 3,
                    //display: 'flex',
                    alignItems: 'center',
                    boxShadow: '0rem 0rem .25rem .2rem rgba(93, 148, 125, 0.57)'
                    
                }}
            >
                <MeasureBackground numMeasures={numMeasures} />
                <MeasureLines numMeasures={numMeasures} />
                {/* Render chords */}
                {chords.map((chord) => (
                    <Chord key={chord.id} chord={chord} compositionId={compositionId} measureStore={measureStore} arrangementStore={arrangementStore} />
                ))} 
            </div>
    )
}