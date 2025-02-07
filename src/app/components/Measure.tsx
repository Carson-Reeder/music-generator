"use client";
import React, { useState, useEffect, useRef } from 'react';
import interact from "interactjs";
import { UseBoundStore, StoreApi } from 'zustand';
import { MeasureStoreType } from "../stores/MeasureStore";
import { flushSync } from 'react-dom';
import { off } from 'process';
import { playChord, playChordProgression } from '../utils/soundPlayer';
import { ArrangementStoreType, createArrangementStore } from '../stores/ArrangementStore';

type MeasureProps = {
    measureStore: UseBoundStore<StoreApi<MeasureStoreType>>;
    compositionId: number;
    arrangementStore: UseBoundStore<StoreApi<ArrangementStoreType>>;
  };

export default function Measure ({measureStore, compositionId, arrangementStore}: MeasureProps) {
    const { chords, setChordTiming, setChordLength, setChordStartPosition
    } = measureStore.getState();
    const { numMeasures, setNumMeasures, widthMeasure, setWidthMeasure,loop, setLoop, loopLength, setLoopLength, bpm, setBpm 
    } = arrangementStore();

    const [widthComposition, setWidthComposition] = useState(widthMeasure * numMeasures);
    const [selectedChordId, setSelectedChordId] = useState<string | null>(null); // Track last clicked chord
    const [activeChordId, setActiveChordId] = useState<string | null>(null); // Track chord being dragged

    const clickThreshold = 200; // Set how fast to click for note to play in ms
    const mouseDownTimeRef = useRef<number>(0);
    // Used to determine what note user is clicking on
    function handleChordClick(id: string) {
        setSelectedChordId(id); 
        setActiveChordId(id);
        // Track length of click for playChord
        mouseDownTimeRef.current = Date.now();
    }
    // Used to determine when a user has let go of a note
    function handleChordMouseUp(notes: string[]) {
        // Track length of click for playChord
        const mouseUp = Date.now();
        const clickDuration = mouseUp - mouseDownTimeRef.current;
        // Play the chord if the click was fast enough
        if (clickDuration < clickThreshold) {
        playChord(notes); 
        }
        setActiveChordId(null); // Reset active chord
    }
    // Conversions
    const pxToRem = (px: number) => px / parseFloat(getComputedStyle(document.documentElement).fontSize);
    const remToPx = (rem: number) => rem * parseFloat(getComputedStyle(document.documentElement).fontSize);
    // Convert chord position in parent element to chord indexBeat and indeMeasure
    const relativeXtoChordPosition = (id: string, relativeX: number) => {
        const relativeXRem = pxToRem(relativeX); // Convert px to rem
        // Calculate indexMeasure and indexBeat
        // indexBeat is from 0-4 with 0.5 increments
        // indexMeasure is from 0-numMeasures with 1.0 increments
        let indexMeasure = Math.floor(relativeXRem / widthMeasure);
        let indexBeat = Math.round(((relativeXRem % widthMeasure) / widthMeasure)*8 ) / 2;
        // If indexBeat is 4, that is equal to increase of indexMeasure by 1
        if (indexBeat >= 4) {
            indexBeat = indexBeat - 4;
            indexMeasure += 1;
        }
        // Set new chord positions
        setChordStartPosition(id, indexMeasure);
        setChordTiming(id, indexBeat);
    }
   // Update WidthComp when numMeasures or widthMeasure changes
    useEffect(() => {
        setWidthComposition(widthMeasure * numMeasures);
    }, [numMeasures])
    useEffect(() => {
        setWidthComposition(widthMeasure * numMeasures);
    }, [widthMeasure])
    // Initialize interact.js for draggable and resizable chords
    useEffect(() => {
        // Use a unique selector for this composition by including the compositionId
        interact(`.draggable-${compositionId}`)
          .draggable({
            inertia: true,
            autoScroll: true,
            allowFrom: '*',
            modifiers: [
              interact.modifiers.restrictRect({
                restriction: 'parent',
                endOnly: true,
              }),
              interact.modifiers.snap({
                targets: [
                  (x, y) => {
                    const parent = document.querySelector('.measure-container');
                    if (!parent) return { x: 0, y: 0 };
                    const parentRect = parent.getBoundingClientRect();
                    return {
                        // Snap to 1/8th of a measure
                        x: Math.round((x - parentRect.left) / (remToPx(widthMeasure) / 8)) * (remToPx(widthMeasure) / 8) + parentRect.left,
                        y,
                    };
                  },
                ],
                range: Infinity,
                relativePoints: [{ x: 0, y: 0 }],
              }),
            ],
            listeners: {
              move: dragMoveListener,
              end(event) {
                const id = event.target.getAttribute('data-id');
                // Calculate rem distance of chord from far left of measure container
                const parentRect = event.target.parentNode.getBoundingClientRect();
                const targetRect = event.target.getBoundingClientRect();
                const relativeX = targetRect.left - parentRect.left;
                relativeXtoChordPosition(id, relativeX);
                // Reset position (chords jump around without this)
                event.target.style.transform = "none";
                event.target.setAttribute("data-x", "0");
                event.target.setAttribute("data-y", "0");
              }
            },
          })
          .resizable({
            edges: { right: true },
            listeners: {
              move(event) {
                // set new chord Length
                const id = event.target.getAttribute('data-id');
                const chord = chords.find((chord) => chord.id === id);
                if (!chord) return;
                const remWidth = pxToRem(event.rect.width);
                const newLength = Math.round(remWidth / widthMeasure * 8) / 8;
                setChordLength(id, newLength);
              },
              end(event) {
                // set new chord Length
                const id = event.target.getAttribute('data-id');
                const chord = chords.find((chord) => chord.id === id);
                if (!chord) return;
                const remWidth = pxToRem(event.rect.width);
                const newLength = Math.round(remWidth / widthMeasure * 8) / 8;
                setChordLength(id, newLength);
              }
            },
          });
      }, [chords, widthMeasure, compositionId]);
    // Boilerplate interact.js function for dragging chords
    function dragMoveListener (event: any) {
        var target = event.target;
        var x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
        var y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;
        target.style.transform = 'translate(' + x + 'px, ' + y + 'px)';
        target.setAttribute('data-x', x);
        target.setAttribute('data-y', y);
        event.preventDefault();
    }
    return (
            // Render measure container
            <div className="measure-container"
                style={{
                    width: `${widthComposition}rem`,
                    height: '4.5rem',
                    position: 'relative',
                    //outline: '0.25rem solid #1E291E',
                    borderRadius: '0.2rem',
                    zIndex: 3,
                    display: 'flex',
                    alignItems: 'center',
                    boxShadow: '0rem 0rem .25rem .2rem rgba(93, 148, 125, 0.57)'
                    
                }}
            >
            
                {/* Render alternating measure backgrounds */}
                {Array.from({ length: numMeasures }).map((_, measureIndex) => (
                <div
                    key={`measure-bg-${measureIndex}`}
                    className='rounded-sm'
                    style={{
                    position: 'absolute',
                    left: `${(measureIndex * 100) / numMeasures}%`,
                    width: `${100 / numMeasures}%`,
                    height: '100%',
                    backgroundColor: measureIndex % 2 === 0 ? 'rgba(4, 150, 94, 0.4)' : 'rgba(1, 255, 158, 0.12)', 
                    zIndex: 2, 
                    borderRadius: '0.2rem',
                    }}
                />
                ))}
                {/* Render lines for each beat (1/8 a measure) */}
                {Array.from({ length: numMeasures * 8 }, (_, i) => {
                    if (i === 0) return null;
                    const isEndOfMeasure = i % 8 === 0; // 8th line
                    const isMiddleOfMeasure = i % 8 === 4; // 4th line
                    // Set line width in rem
                    const lineWidth = isEndOfMeasure ? 3 : isMiddleOfMeasure ? 1.5 : 1; 
                    return (
                        <div
                            key={i}
                            style={{
                                position: 'absolute',
                                left: `${(i * 100) / (numMeasures * 8)}%`,
                                top: '50%',
                                bottom: 0,
                                width: `${lineWidth}px`,
                                alignItems: 'center',
                                height: isEndOfMeasure ? '100%' : '100%',
                                background: isEndOfMeasure ? '#1E291E' : isMiddleOfMeasure ? '#1A1A1A' : '#4C5A60',
                                transform: 'translateX(-50%) translateY(-50%)', // Center the line
                                zIndex: 2,
                                borderRadius: '0.5rem',
                            }}  
                        />
                    );
                })}
                {/* Render chords */}
                {chords.map((chord) => (
                    <div
                        key={chord.id}
                        className={`draggable draggable-${compositionId} rounded-md`}
                        data-id={chord.id}
                        onMouseDown={() => handleChordClick(chord.id)}
                        onMouseUp={()=>handleChordMouseUp(chord.notes)}
                        style={{
                            position: 'absolute',
                            left: `${((chord.startPosition * widthMeasure) + ((chord.chordTimingBeat/4)*widthMeasure))}rem`,
                            width: `${(chord.length * widthMeasure)}rem`,
                            height: '100%',
                            border: '0.15rem solid rgba(1, 106, 66, 0.64)',
                            borderRadius: '0.5rem',
                            boxShadow: activeChordId === chord.id 
                                ? '0rem 0rem .6rem .2rem black' 
                                : 'none', 
                            boxSizing: 'border-box',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            userSelect: 'none',
                            backgroundColor: 'rgb(99, 174, 134)',
                            outline: activeChordId === chord.id ? '0.1rem solid white' : '0.1rem solid#1E291E',
                            outlineOffset: '-0.1rem',
                            cursor: 'move',
                            opacity: activeChordId ? (activeChordId === chord.id ? 0.75 : 0.9) : 1, 
                            zIndex: selectedChordId === chord.id ? 5 : 4,
                        }}
                    >   
                        <div className='no-select'>
                            {chord.id}
                        </div>
                    </div>
                ))}
            </div>
    )
}