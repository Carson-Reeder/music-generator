import React, { useState, useEffect } from 'react';
import interact from "interactjs";

export default function Composition () {

    interface Chord {
    id: string;
    name: string;
    start: number; // Start position in the measure (fractional, e.g., 0 to 1)
    duration: number; // Duration as a fraction of the measure
    }

    
        const [bars, setBars] = useState(4); // Default number of bars
        const [chords, setChords] = useState<Chord[]>([
            { id: '1', name: 'Chord 1', start: 0, duration: 0.25 },
            { id: '2', name: 'Chord 2', start: 0.5, duration: 0.25 },
            { id: '3', name: 'Chord 3', start: 0.75, duration: 0.25 },
        ]);

        const measureWidth = 800; // Total measure width in pixels
        const barWidth = measureWidth / bars; // Width of each bar in pixels

        const updateChordPosition = (id: string, newStart: number, newDuration: number) => {
            const updatedChords = chords.map((chord) =>
                chord.id === id
                    ? { ...chord, start: newStart, duration: newDuration }
                    : chord
            );
            setChords(updatedChords);
        };


    interact('.draggable')
        .draggable({
            modifiers: [
                interact.modifiers.restrictRect({
                    restriction: 'parent',
                    endOnly: true,
                })
            ],
            listeners: {
                move: dragMoveListener,

                end(event) {

                    const parentRect = event.target.parentNode.getBoundingClientRect();
                    const targetRect = event.target.getBoundingClientRect();
                    const relativeX = targetRect.left - parentRect.left;
                
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

                    const deltaX = event.deltaRect.width / measureWidth; // Fractional change
                    const newDuration = Math.max(0.01, chord.duration + deltaX);

                    updateChordPosition(id, chord.start, newDuration);
                },
            },
            modifiers: [
                interact.modifiers.restrictEdges({outer: 'parent'})
            ],
        });

    
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
                className="measure-container"
                style={{
                    width: `${measureWidth}px`,
                    height: '100px',
                    position: 'relative',
                    border: '1px solid black',
                    display: 'flex',
                    background: '#f0f0f0',
                }}
            >
                {/* Render bar lines */}
                {Array.from({ length: bars }, (_, i) => (
                    <div
                        key={i}
                        style={{
                            position: 'absolute',
                            left: `${(i * 100) / bars}%`,
                            top: 0,
                            bottom: 0,
                            width: '1px',
                            background: '#ccc',
                        }}
                    />
                ))}

                {/* Render chords */}
                {chords.map((chord) => (
                    <div
                        key={chord.id}
                        className="draggable"
                        data-id={chord.id}
                        style={{
                            position: 'absolute',
                            left: `${chord.start * 100}%`,
                            width: `${chord.duration * 100}%`,
                            height: '100%',
                            backgroundColor: '#87ceeb',
                            border: '1px solid #000',
                            boxSizing: 'border-box',
                            textAlign: 'center',
                            lineHeight: '100px',
                            userSelect: 'none',
                            cursor: 'move',
                        }}
                    >   <div>
                        {chord.name}
                        <p>chord position</p>
                        {chord.start}
                        <p>chord length</p>
                        {chord.duration}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

}

function dragMoveListener (event: any) {
    var target = event.target
    // keep the dragged position in the data-x/data-y attributes
    var x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx
    var y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy
  
    // translate the element
    target.style.transform = 'translate(' + x + 'px, ' + y + 'px)'
  
    // update the posiion attributes
    target.setAttribute('data-x', x)
    target.setAttribute('data-y', y)
  }


//window.dragMoveListener = dragMoveListener

