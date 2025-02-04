"use client";
import React, { useState, useEffect, useRef } from 'react';
import interact from "interactjs";
import { UseBoundStore, StoreApi } from 'zustand';
import { ChordPlaybackStore } from "../stores/chordPlaybackStore";
import { flushSync } from 'react-dom';
import { off } from 'process';
import { playChord, playChordProgression } from '../utils/soundPlayer';
import { ArrangementStoreType, createArrangementStore } from '../stores/ArrangementStore';

type FixedCompositionProps = {
    useStore: UseBoundStore<StoreApi<ChordPlaybackStore>>; // Store instance
    compositionId: number; // Composition ID
    arrangementStore: UseBoundStore<StoreApi<ArrangementStoreType>>;
  };

export default function fixedComposition ({useStore, compositionId, arrangementStore}: FixedCompositionProps) {
    const { chords, setChords, 
        setChordNotes, setChordTiming, 
        setChordLength, setChordStartPosition
    } = useStore();
    const { numMeasures, setNumMeasures, 
        widthMeasure, setWidthMeasure,
        loop, setLoop, 
        loopLength, setLoopLength, 
        bpm, setBpm 
    } = arrangementStore();

    //const [numMeasures, setNumMeasures] = useState(5);
    //const [widthMeasure, setWidthMeasure] = useState<number>(10);
    const [widthComposition, setWidthComposition] = useState(widthMeasure * numMeasures);
    const [selectedChordId, setSelectedChordId] = useState<string | null>(null); // Track last clicked chord
    const [activeChordId, setActiveChordId] = useState<string | null>(null); // Track chord being dragged

    const clickThreshold = 200; // Set the threshold for long vs. short clicks (500ms)
    const mouseDownTimeRef = useRef<number>(0);

  function handleChordClick(id: string) {
    setSelectedChordId(id); 
    setActiveChordId(id);
    // track length of click for playChord
    mouseDownTimeRef.current = Date.now();
  }

  function handleChordMouseUp(notes: string[]) {
    // track length of click for playChord
    const mouseUp = Date.now();
    const clickDuration = mouseUp - mouseDownTimeRef.current;
    // play the chord if the click was fast enough
    if (clickDuration < clickThreshold) {
      playChord(notes); 
    }
    
    setActiveChordId(null); // Reset active chord (e.g. border returns to normal)
  }
    function roundToPrecision(value: number, precision = 8) {
        return Math.round(value * 10 ** precision) / 10 ** precision;
    }

    useEffect(() => {
        setWidthComposition(widthMeasure * numMeasures);
    }, [numMeasures])
    useEffect(() => {
        setWidthComposition(widthMeasure * numMeasures);
    }, [widthMeasure])

    const pxToRem = (px: number) => px / parseFloat(getComputedStyle(document.documentElement).fontSize);
    const remToPx = (rem: number) => rem * parseFloat(getComputedStyle(document.documentElement).fontSize);

    const relativeXtoChordPosition = (id: string, relativeX: number) => {
        const relativeXRem = pxToRem(relativeX); // Convert px to rem
        const store = useStore.getState();
    
        let indexMeasureRaw = relativeXRem / widthMeasure;
        let indexMeasure = Math.floor(indexMeasureRaw);
        let indexBeatRaw = (4 * ((relativeXRem % widthMeasure) / widthMeasure));
        let indexBeat = Math.round((indexBeatRaw) * 2) / 2;
    
        if (indexBeat >= 4) {
            indexBeat = indexBeat - 4;
            indexMeasure += 1;
        }
        console.log('indexMeasure', indexMeasure);
        console.log('indexBeat', indexBeat);
        //setChordStartPosition(id, indexMeasure);
        //setChordTiming(id, indexBeat);
        store.setChordStartPosition(id, indexMeasure);
        store.setChordTiming(id, indexBeat);
    }
 
    useEffect(() => {
        // Use a unique selector for this composition by including the compositionId
        interact(`.draggable-${compositionId}`)
          .draggable({
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
                const parentRect = event.target.parentNode.getBoundingClientRect();
                const targetRect = event.target.getBoundingClientRect();
                const relativeX = targetRect.left - parentRect.left;
                relativeXtoChordPosition(id, relativeX);
      
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
                const id = event.target.getAttribute('data-id');
                const chord = chords.find((chord) => chord.id === id);
                if (!chord) return;
      
                const remWidth = pxToRem(event.rect.width);
                const newLength = Math.round(remWidth / widthMeasure * 8) / 8;
                setChordLength(id, newLength);
              },
              end(event) {
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
    
    function dragMoveListener (event: any) {
    var target = event.target;
    // keep the dragged position in the data-x/data-y attributes
    var x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
    var y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;
  
    // translate the element
    target.style.transform = 'translate(' + x + 'px, ' + y + 'px)';
  
    // update the posiion attributes
    target.setAttribute('data-x', x);
    target.setAttribute('data-y', y);
    }
    
    return (
        <div>
            <div className='flex'>
            <div>
                <label className='ml-5 mr-2 items-center pr-1 pl-1 pb-1 rounded-sm' style={{ backgroundColor: 'rgba(1, 255, 158, 0.12)',
                    outline: '0.1rem solid #1E291E', borderRadius: '0.5rem'
                 }}>Composition {compositionId}</label>
            </div>
            
            
            </div>
        <div
            className="measure-container bg-gray-300 ml-4 mr-4"
            style={{
                width: `${widthComposition}rem`,
                height: '7rem',
                marginTop: '0px',
                marginLeft: '1rem',
                position: 'relative',
                outline: '0.25rem solid #1E291E',
                borderRadius: '0.5rem',
                display: 'flex',
                //overflow: 'hidden',
                zIndex: 4,
            }}
        >
            {/* Insert alternating measure backgrounds */}
            {Array.from({ length: numMeasures }).map((_, measureIndex) => (
            <div
                key={`measure-bg-${measureIndex}`}
                className='rounded-md'
                style={{
                position: 'absolute',
                left: `${(measureIndex * 100) / numMeasures}%`,
                width: `${100 / numMeasures}%`,
                height: '100%',
                backgroundColor: measureIndex % 2 === 0 ? 'rgba(4, 150, 94, 0.4)' : 'rgba(1, 255, 158, 0.12)', 
                zIndex: 0, 
                }}
            />
            ))}
            
            {Array.from({ length: numMeasures * 8 }, (_, i) => {
                    if (i === 0) return null;
                    const isEndOfMeasure = i % 8 === 0; // 8th line
                    const isMiddleOfMeasure = i % 8 === 4; // 4th line
                    const lineWidth = isEndOfMeasure ? 6 : isMiddleOfMeasure ? 2 : 1; // Set line width

                    return (
                        <div
                            key={i}
                            style={{
                                position: 'absolute',
                                left: `${(i * 100) / (numMeasures * 8)}%`,
                                top: 0,
                                bottom: 0,
                                width: `${lineWidth}px`,
                                height: '100%',
                                background: isEndOfMeasure ? '#1E291E' : isMiddleOfMeasure ? '#1A1A1A' : '#2F2F2F',
                                transform: 'translateX(-50%)', // Center the line
                                zIndex: 2,
                            }}
                        />
                    );
                })}
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
                            height: '7rem',
                            border: '.15rem solid rgb(150, 227, 178)',
                            boxShadow: activeChordId === chord.id 
                                ? '0rem 0rem .6rem .2rem black' 
                                : 'none', 
                            boxSizing: 'border-box',
                            textAlign: 'center',
                            lineHeight: '100px',
                            userSelect: 'none',
                            backgroundColor: 'rgba(78, 155, 122, 0.98)',
                            outline: activeChordId === chord.id ? '0.1rem solid white' : '0.085rem solid black',
                            outlineOffset: '-0.085rem',
                            cursor: 'move',
                            opacity: activeChordId ? (activeChordId === chord.id ? 0.75 : 0.9) : 1, 
                            zIndex: selectedChordId === chord.id ? 4 : 3,
                        }}
                    >   
                        <div>
                            {chord.id}
                        </div>
                    </div>
                ))}
    
        </div>
        </div>
        
    )
}