"use client";
import React, { useRef, useState, useEffect } from "react";
import interact from "interactjs";
import { UseBoundStore, StoreApi } from "zustand";
import { MeasureStoreType } from "../../../stores/MeasureStore";
import { ArrangementStoreType } from "../../../stores/ArrangementStore";
import { playNotes } from "../../../utils/soundPlayer";
import * as Tone from "tone";
import { playMeasure } from "../../../utils/soundPlayer";
import { loadInstrument } from "../../../utils/soundPlayer";

type ChordProps = {
  chord: any;
  compositionId: string;
  measureStore: UseBoundStore<StoreApi<MeasureStoreType>>;
  arrangementStore: UseBoundStore<StoreApi<ArrangementStoreType>>;
};

export default function Chord({
  chord,
  compositionId,
  measureStore,
  arrangementStore,
}: ChordProps) {
  const [activeChordId, setActiveChordId] = useState<string | null>(null);
  const [selectedChordId, setSelectedChordId] = useState<string | null>(null);
  const mouseDownTimeRef = useRef<number>(0);
  const clickThreshold = 200;
  const {
    chords,
    setChordLength,
    setChordStartPosition,
    measureProgress,
    setMeasureProgress,
    isPlaying,
    instrument,
  } = measureStore();
  const {
    numMeasures,
    setNumMeasures,
    widthMeasure,
    setWidthMeasure,
    loop,
    setLoop,
    loopLength,
    setLoopLength,
    bpm,
    setBpm,
    snapDivision,
    allPlaying,
  } = arrangementStore();

  useEffect(() => {
    if (Tone.getTransport().state === "stopped") return;
    if (!isPlaying) return;
    const handleChordChange = async () => {
      const transportState = Tone.getTransport().state;
      Tone.getTransport().pause();

      const progress = Tone.getTransport().position;
      setMeasureProgress(progress);

      if (!allPlaying) {
        playMeasure({
          measureStore,
          arrangementStore,
          compositionId,
          transportState,
          reason: "measureUpdate",
        });
      }
    };
    handleChordChange();
  }, [chord, instrument, numMeasures]);

  // Conversions
  const pxToRem = (px: number) =>
    px / parseFloat(getComputedStyle(document.documentElement).fontSize);
  const remToPx = (rem: number) =>
    rem * parseFloat(getComputedStyle(document.documentElement).fontSize);
  // Convert chord position in parent element to a unified decimal startPosition
  const relativeXtoChordPosition = (id: string, relativeX: number) => {
    const relativeXRem = pxToRem(relativeX); // Convert px to rem
    // Snap to snapDivision increments (e.g. 8 = 1/8th of a measure)
    const rawPosition = relativeXRem / widthMeasure;
    const snappedPosition = Math.round(rawPosition * snapDivision) / snapDivision;
    setChordStartPosition(id, snappedPosition);
  };

  // Used for showing selected chord
  function handleChordClick(id: string) {
    setActiveChordId(id);
    mouseDownTimeRef.current = Date.now();
  }
  function handleChordMouseUp(notes: string[]) {
    const clickDuration = Date.now() - mouseDownTimeRef.current;
    if (clickDuration < clickThreshold) playNotes({ notes, measureStore });
    setActiveChordId(null);
  }
  // *FIX-sometimes shrinks chord too small when 2 chords occupy last measure* Ensure chords are within the bounds of the composition
  useEffect(() => {
    chords.forEach((chord) => {
      // 1. Handle start position exceeding numMeasures
      if (chord.startPosition >= numMeasures) {
        setChordStartPosition(chord.id, numMeasures - (1 / snapDivision));
      }

      // 2. Calculate the end position of the chord
      const chordEnd = chord.startPosition + chord.length;

      // 3. Check if the chord extends beyond the last measure
      if (chordEnd > numMeasures) {
        const newLength = numMeasures - chord.startPosition;
        if (newLength < (1 / snapDivision)) {
          setChordLength(chord.id, 1 / snapDivision);
          return;
        }
        setChordLength(chord.id, newLength);
      }
    });
  }, [numMeasures, chords, setChordLength, setChordStartPosition, snapDivision]);

  // Deselect chord if mouseUp occurs outside of the measure container
  useEffect(() => {
    const handleMouseUp = (event: any) => {
      const measureContainer = document.querySelector(".measure-container");

      if (!measureContainer?.contains(event.target)) {
        setActiveChordId(null); // Deselect chord if mouseUp occurs outside
      }
    };

    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  // Dragging and resizing chords
  useEffect(() => {
    // Use a unique selector for this composition by including the compositionId
    interact(`.draggable-${compositionId}`)
      .draggable({
        inertia: true,
        autoScroll: true,
        allowFrom: "*",
        modifiers: [
          interact.modifiers.restrictRect({
            restriction: "parent",
            endOnly: true,
          }),
          interact.modifiers.snap({
            targets: [
              (x, y) => {
                const parent = document.querySelector(".measure-container");
                if (!parent) return { x: 0, y: 0 };
                const parentRect = parent.getBoundingClientRect();
                return {
                  // Snap to snapDivision increments of a measure
                  x:
                    Math.round(
                      (x - parentRect.left) / (remToPx(widthMeasure) / snapDivision)
                    ) *
                      (remToPx(widthMeasure) / snapDivision) +
                    parentRect.left,
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
            const id = event.target.getAttribute("data-id");
            // Calculate rem distance of chord from far left of measure container
            const parentRect = event.target.parentNode.getBoundingClientRect();
            const targetRect = event.target.getBoundingClientRect();
            const relativeX = targetRect.left - parentRect.left;
            relativeXtoChordPosition(id, relativeX);
            // Reset position (chords jump around without this)
            event.target.style.transform = "none";
            event.target.setAttribute("data-x", "0");
            event.target.setAttribute("data-y", "0");
          },
        },
      })
      .resizable({
        edges: { right: true },
        modifiers: [
          interact.modifiers.restrictEdges({
            outer: "parent",
          }),
          interact.modifiers.restrictSize({
            min: { width: remToPx(0.5), height: 0 },
          }),
        ],
        listeners: {
          move(event) {
            // set new chord Length
            const id = event.target.getAttribute("data-id");
            const chord = chords.find((chord) => chord.id === id);
            if (!chord) return;
            const remWidth = pxToRem(event.rect.width);
            const newLength = Math.round((remWidth / widthMeasure) * snapDivision) / snapDivision;
            if (newLength < (1 / snapDivision)) return; // Prevent too-small lengths
            if (chord.length === newLength) return; // Prevent unnecessary updates
            setChordLength(id, newLength);
          },
        },
      });
  }, [chords, widthMeasure, compositionId, snapDivision]);
  // Boilerplate interact.js function for dragging chords
  function dragMoveListener(event: any) {
    var target = event.target;
    var x = (parseFloat(target.getAttribute("data-x")) || 0) + event.dx;
    var y = (parseFloat(target.getAttribute("data-y")) || 0) + event.dy;
    target.style.transform = "translate(" + x + "px, " + y + "px)";
    target.setAttribute("data-x", x);
    target.setAttribute("data-y", y);
    event.preventDefault();
  }

  return (
    <div
      key={chord.id}
      className={`draggable draggable-${compositionId} rounded-md`}
      data-id={chord.id}
      onMouseDown={() => handleChordClick(chord.id)}
      onMouseUp={() => handleChordMouseUp(chord.notes)}
      style={{
        top: "0rem",
        position: "absolute",
        left: `${chord.startPosition * widthMeasure}rem`,
        width: `${chord.length * widthMeasure}rem`,
        height: "100%",
        border: "0.15rem solid rgba(1, 106, 66, 0.64)",
        borderRadius: "0.5rem",
        boxShadow:
          activeChordId === chord.id ? "0rem 0rem .6rem .2rem black" : "none",
        boxSizing: "border-box",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        userSelect: "none",
        backgroundColor: "rgb(99, 174, 134)",
        outline:
          activeChordId === chord.id
            ? "0.1rem solid white"
            : "0.1rem solid#1E291E",
        outlineOffset: "-0.1rem",
        cursor: "move",
        opacity: activeChordId ? (activeChordId === chord.id ? 0.75 : 0.9) : 1,
        zIndex: selectedChordId === chord.id ? 5 : 4,
      }}
    >
      {chord.id}
    </div>
  );
}
