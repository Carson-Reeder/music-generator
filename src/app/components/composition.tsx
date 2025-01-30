import React, { useState, useEffect } from 'react';
import interact from "interactjs";
import { useChordPlaybackStore } from "../stores/chordPlaybackStore";

export default function Composition () {
    const { chords, setChords, 
        bpm, setBpm, setChordNotes, setChordTiming, 
        setChordLength, setChordStartPosition, setBoxStartPosition
    } = useChordPlaybackStore()

    /*interface Chord {
    id: string;
    name: string;
    start: number; // Start position in the measure (fractional, e.g., 0 to 1)
    duration: number; // Duration as a fraction of the measure
    }*/

    
    const [bars, setBars] = useState(4); // Default number of bars
    /*const [chords, setChords] = useState<Chord[]>([
        { id: '1', name: 'Chord 1', start: 0, duration: 0.25 },
        { id: '2', name: 'Chord 2', start: 0.5, duration: 0.25 },
        { id: '3', name: 'Chord 3', start: 0.75, duration: 0.25 },
    ]);*/

    const measureWidth = 1000; // Total measure width in pixels
    const barWidth = measureWidth / bars; // Width of each bar in pixels

    const updateChordPosition = (id: string, newStart: number, newDuration: number) => {
        const updatedChords = chords.map((chord) =>
            chord.id === id
                ? { ...chord, boxStartPosition: newStart, boxLength: newDuration }
                : chord
        );
        setChords(updatedChords);
    };
    function roundToPrecision(value: number, precision = 8) {
        return Math.round(value * 10 ** precision) / 10 ** precision;
    }

    const relativeXtoChordPosition = (id: string,relativeX: number) => {
        const barIndex = Math.floor((relativeX * bars) / measureWidth);
        const beatIndex = 4*((relativeX / (measureWidth / bars)) % 1);
        const duration = 1 / bars;
        const boxpos = relativeX / measureWidth;
        console.log('relativeX', relativeX);
        console.log('realtivex/width', relativeX / measureWidth);
        setBoxStartPosition(id, boxpos);
        setChordStartPosition(id, barIndex);
        setChordTiming(id, beatIndex);
        console.log('id',id);
        console.log('barIndex', barIndex);
        console.log('beatIndex', beatIndex);
        
        //return { start, duration };
    }

    const boxLengthtoChordLength = (id: string, newDuration: number) => {
        const adjustedDuration = newDuration * bars;
        console.log('adjustedDuration', adjustedDuration);
        console.log('id', id);
        setChordLength(id, adjustedDuration);
    }
/*
    useEffect(() => {
    interact('.draggable')
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
                            if (!parent) {
                                console.warn('Parent element not found');
                                return; // Exit early if the parent is not found
                            }
                            const parentRect = parent.getBoundingClientRect();
                
                            return {
                                x: Math.round((x - parentRect.left) / (barWidth / 8)) * (barWidth / 8) + parentRect.left,
                                y,
                            };
                        },
                    ],
                    range: Infinity,
                    relativePoints: [{ x: 0, y: 0 }], // Ensure relative snapping within container
                }),
            ],
            
            listeners: {
                move: dragMoveListener,

                end(event) {
                    const id = event.target.getAttribute('data-id')!;
                    const chord = chords.find((c) => c.id === id);
                    const parentRect = event.target.parentNode.getBoundingClientRect();
                    const targetRect = event.target.getBoundingClientRect();
                    const relativeX = targetRect.left - parentRect.left;
                    relativeXtoChordPosition(id,relativeX);
                    //updateChordPosition(id, relativeX , event.target.offsetWidth / measureWidth);
                }
            }
        })
        .resizable({
            edges: { right: true },
            listeners: {
                move(event) {
                    const target = event.target;
                    const id = target.getAttribute('data-id')!;
                    const chord = chords.find((c) => c.id === id);
                    if (!chord) return;
            
                    // Snap the change in width to the grid
                    const snapToGrid = barWidth / 8;
                    const deltaX = Math.round(event.deltaRect.width / snapToGrid) * snapToGrid / measureWidth;
            
                    const newDuration = roundToPrecision(Math.max(0.03125, chord.boxLength + deltaX));
                    boxLengthtoChordLength(id, newDuration);
                    updateChordPosition(id, chord.boxStartPosition, newDuration);
                },
                end(event) {
                    const target = event.target;
                    const id = target.getAttribute('data-id')!;
                    const chord = chords.find((c) => c.id === id);
                    if (!chord) return;

                    // Snap the change in width to the grid
                    const snapToGrid = barWidth / 8;
                    const deltaX = Math.round(event.deltaRect.width / snapToGrid) * snapToGrid / measureWidth;
            
                    const newDuration = roundToPrecision(Math.max(0.03125, chord.boxLength + deltaX));
                    boxLengthtoChordLength(id, newDuration);
                },
            },
            modifiers: [
                interact.modifiers.restrictEdges({outer: 'parent'}),
                interact.modifiers.snap({
                    targets: [
                        interact.createSnapGrid({ x: barWidth/8, y: 1 }),
                    ],
                    range: Infinity,
                    relativePoints: [{ x: 0, y: 0 }],
                }),
            ],
        });
    }, [chords] [bars]);
    */

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
            {/* Controls for changing the number of bars */}
            <div style={{ marginBottom: '20px' }}>
                <label>Bars: </label>
                <input
                    type="number"
                    value={bars}
                    onChange={(e) => {
                        const newBars = Math.max(1, parseInt(e.target.value, 10));
                        setBars(newBars);
                    }}
                />
            </div>

            {/* Measure container */}
            <div
                className="measure-container rounded-md bg-gray-300 ml-4 mr-4 mb-6"
                style={{
                    width: `${measureWidth}px`,
                    height: '7rem',
                    position: 'relative',
                    outline: '0.3rem solid black',
                    display: 'flex',
                    overflow: 'hidden',
                    zIndex: 4,
                }}
            >   
                {/* Render bar lines */}
                {Array.from({ length: bars * 8 }, (_, i) => {
                    if (i === 0) return null;
                    const isEndOfMeasure = i % 8 === 0; // 8th line
                    const isMiddleOfMeasure = i % 8 === 4; // 4th line
                    const lineWidth = isEndOfMeasure ? 6 : isMiddleOfMeasure ? 2 : 1; // Set line width

                    return (
                        <div
                            key={i}
                            style={{
                                position: 'absolute',
                                left: `${(i * 100) / (bars * 8)}%`,
                                top: 0,
                                bottom: 0,
                                width: `${lineWidth}px`,
                                background: isEndOfMeasure ? '#000' : isMiddleOfMeasure ? '#4a4a4a' : '#787878',
                                transform: 'translateX(-50%)', // Center the line
                                zIndex: 2,
                            }}
                        />
                    );
                })}

                {/* Render chords */}
                {chords.map((chord) => (
                    <div
                        key={chord.id}
                        className="draggable border-4 border-black rounded-md bg-purple-blue-gradient"
                        data-id={chord.id}
                        style={{
                            position: 'absolute',
                            left: `${chord.boxStartPosition * 100}%`,
                            width: `${chord.boxLength * 100}%`,
                            height: '7rem',
                            backgroundColor: '#87ceeb',
                            border: '0px solid #000',
                            boxSizing: 'border-box',
                            textAlign: 'center',
                            lineHeight: '100px',
                            userSelect: 'none',
                            cursor: 'move',
                            zIndex: 3,
                            outline: '0.1rem solid black',
                        }}
                    >   
                        <div>
                            {chord.id}
                        </div>
                    </div>
                ))}
            </div>


            {/* Measure container */}
            <div
                className="measure-container rounded-lg bg-gray-300 ml-4"
                style={{
                    width: `${measureWidth}px`,
                    height: '7rem',
                    position: 'relative',
                    outline: '0.25rem solid black',
                    display: 'flex',
                    overflow: 'hidden',
                    zIndex: 4,
                }}
            >   
                {/* Render bar lines */}
                {Array.from({ length: bars * 8 }, (_, i) => {
                    if (i === 0) return null;
                    const isEndOfMeasure = i % 8 === 0; // 8th line
                    const isMiddleOfMeasure = i % 8 === 4; // 4th line
                    const lineWidth = isEndOfMeasure ? 3 : isMiddleOfMeasure ? 2 : 1; // Set line width

                    return (
                        <div
                            key={i}
                            style={{
                                position: 'absolute',
                                left: `${(i * 100) / (bars * 8)}%`,
                                top: 0,
                                bottom: 0,
                                width: `${lineWidth}px`,
                                background: isEndOfMeasure ? '#000' : isMiddleOfMeasure ? '#4a4a4a' : '#787878',
                                transform: 'translateX(-50%)', // Center the line
                                zIndex: 2,
                            }}
                        />
                    );
                })}

                {/*}
                {chords.map((chord) => (
                    <div
                        key={chord.id}
                        className="draggable border-4 border-black rounded-md bg-purple-blue-gradient"
                        data-id={chord.id}
                        style={{
                            position: 'absolute',
                            left: `${chord.boxStartPosition * 100}%`,
                            width: `${chord.boxLength * 100}%`,
                            height: '7rem',
                            backgroundColor: '#87ceeb',
                            border: '0px solid #000',
                            boxSizing: 'border-box',
                            textAlign: 'center',
                            lineHeight: '100px',
                            userSelect: 'none',
                            cursor: 'move',
                            zIndex: 3,
                        }}
                    >   
                        <div>
                            Chord {chord.id}
                        </div>
                    </div>
                ))}*/}
            </div>
        </div>
    );

}



