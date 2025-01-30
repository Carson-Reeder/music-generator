import React, { useState, useEffect, use } from 'react';
import interact from "interactjs";
import { useChordPlaybackStore } from "../stores/chordPlaybackStore";
import { flushSync } from 'react-dom';
export default function fixedComposition () {
    const { chords, setChords, 
            bpm, setBpm, setChordNotes, setChordTiming, 
            setChordLength, setChordStartPosition, setBoxStartPosition
        } = useChordPlaybackStore()

    const [numMeasures, setNumMeasures] = useState(5);
    const [widthComposition, setWidthComposition] = useState(70);
    const [widthMeasure, setWidthMeasure] = useState(widthComposition / numMeasures);
    const [selectedChordId, setSelectedChordId] = useState<string | null>(null); // Track last clicked chord
    const [activeChordId, setActiveChordId] = useState<string | null>(null); // Track chord being dragged

    const handleChordClick = (id: string) => {
        setSelectedChordId(id); // Update selected chord
        setActiveChordId(id);
    };
    const handleChordMouseUp = () => {
        setActiveChordId(null); // Reset active chord (border returns to normal)
    };

    useEffect(() => {
        setWidthMeasure(widthComposition / numMeasures);
    }, [numMeasures, widthComposition])

    const pxToRem = (px: number) => px / parseFloat(getComputedStyle(document.documentElement).fontSize);
    const remToPx = (rem: number) => rem * parseFloat(getComputedStyle(document.documentElement).fontSize);

    const relativeXtoChordPosition = (id: string, relativeX: number) => {
        const relativeXRem = pxToRem(relativeX); // Convert px to rem
    
        let indexMeasureRaw = relativeXRem / widthMeasure;
        let indexMeasure = Math.floor(indexMeasureRaw);
        let indexBeatRaw = (4 * ((relativeXRem % widthMeasure) / widthMeasure));
        let indexBeat = Math.round((indexBeatRaw) * 2) / 2;
    
        if (indexBeat >= 4) {
            indexBeat = 0;
        }
    
        setChordStartPosition(id, indexMeasure);
        setChordTiming(id, indexBeat);
    }
 
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
                            (x,y) => {
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
                        relativePoints: [{ x: 0, y: 0 }], // Ensure relative snapping within container
                    }), 
                ],   
                listeners: {
                    move: dragMoveListener,

                    end(event) {
                        const id = event.target.getAttribute('data-id');
                        const parentRect = event.target.parentNode.getBoundingClientRect();
                        const targetRect = event.target.getBoundingClientRect();
                        const relativeX = targetRect.left - parentRect.left;
                        
                        relativeXtoChordPosition(id,relativeX);

                        event.target.style.transform = "none";
                        event.target.setAttribute("data-x", "0");
                        event.target.setAttribute("data-y", "0");
                    }
                },
            })
    }, [chords, widthMeasure])
    
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
            <div style={{ marginBottom: '20px' }}>
                <label>Measures: </label>
                <input
                    type="number"
                    value={numMeasures}
                    onChange={(e) => {
                        const newBars = Math.max(1, parseInt(e.target.value, 10));
                        setNumMeasures(newBars);
                    }}
                />
            </div>
            <div style={{ marginBottom: '20px' }}>
                <label>Composition Length: </label>
                <input
                    type="number"
                    value={widthComposition}
                    onChange={(e) => {
                        const newBars = Math.max(1, parseInt(e.target.value, 10));
                        setWidthComposition(newBars);
                    }}
                />
            </div>
        <div
            className="measure-container rounded-md bg-gray-300 ml-4 mr-4 mb-6"
            style={{
                width: `${widthComposition}rem`,
                height: '7rem',
                marginTop: '.5rem',
                marginLeft: '1rem',
                position: 'relative',
                outline: '0.3rem solid black',
                display: 'flex',
                overflow: 'hidden',
                zIndex: 4,
            }}
        >
            
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
                                background: isEndOfMeasure ? '#000' : isMiddleOfMeasure ? '#4a4a4a' : '#787878',
                                transform: 'translateX(-50%)', // Center the line
                                zIndex: 2,
                            }}
                        />
                    );
                })}
                {chords.map((chord) => (
                    <div
                        key={chord.id}
                        className="draggable rounded-md bg-purple-blue-gradient"
                        data-id={chord.id}
                        onMouseDown={() => handleChordClick(chord.id)}
                        onMouseUp={handleChordMouseUp}
                        style={{
                            position: 'absolute',
                            left: `${((chord.startPosition * widthMeasure) + ((chord.chordTimingBeat/4)*widthMeasure))}rem`,
                            width: `${(chord.length * widthMeasure)}rem`,
                            height: '7rem',
                            //border: activeChordId === chord.id ? '.2rem solid black' : '.1rem solid black', // ✅ Thicker border only while dragging
                            border: '.125rem solid black',
                            boxShadow: activeChordId === chord.id 
                                ? '0rem 0rem .6rem .2rem black' // ✅ Nice elevated shadow when active
                                : 'none', // ✅ No shadow when not active
                            boxSizing: 'border-box',
                            textAlign: 'center',
                            lineHeight: '100px',
                            userSelect: 'none',
                            cursor: 'move',
                            opacity: activeChordId ? (activeChordId === chord.id ? 0.94 : 0.9) : 1, // ✅ Dim inactive chords only when one is selected
                            zIndex: selectedChordId === chord.id ? 4 : 3,
                            outline: '0.1rem solid black',
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