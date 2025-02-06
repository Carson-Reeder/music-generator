"use client";
import React from "react";
import * as Tone from "tone";
import { UseBoundStore, StoreApi } from "zustand";
import { MeasureStoreType } from "../stores/MeasureStore";
import { playChord, playChordProgression } from "../utils/soundPlayer";

type PlayChordsProps = {
  // 
  useStore: UseBoundStore<StoreApi<MeasureStoreType>>; 
  compositionId: number; 
};

export default function PlayChords({ useStore, compositionId }: PlayChordsProps) {
  // Initialize Zustand state from the provided store
  const { chords, bpm, setBpm } = useStore();

  return (
    <div className='ml-6'>
      <h2>Play Chords (Composition {compositionId}):</h2>
      <div className="flex">
      {chords.length > 0 ? (
        <>
          {chords.map((chord, index) => (
            <div key={index}>
              {/* Button to play the chord */}
              <button
                className="play-button border-2 border-black rounded-md w-32 pl-1 ml-4"
                style={{ backgroundColor: "rgba(4, 150, 94, 0.4)" }}
                onClick={() => playChord(chord.notes)}
              >
                Play Chord {index + 1}
              </button>
            </div>
          ))}

          {/* Play Chord Progression */}
          <div>
            <button
              className="play-button border-2 border-black rounded-md max-w-32 pl-1 ml-4"
              style={{ backgroundColor: "rgba(4, 150, 94, 0.4)" }}
              onClick={() =>
                playChordProgression(
                  chords.map((c) => c.notes),
                  bpm,
                  chords.map((c) => c.length),
                  chords.map((c) => c.startPosition),
                  chords.map((c) => c.chordTimingBeat)
                )
              }
            >
              Play Chord Progression
            </button>
            </div>

            {/* BPM Control */}
            <div className="ml-4 pl-1">
            <div className="pr-0 flex flex-wrap rounded-md border-2 border-black max-w-16" style={{ backgroundColor: "rgba(4, 150, 94, 0.4)" }}>
              <label className="pl-3.5">BPM</label>
              <input
                className="border border-black rounded-md max-w-16 p-0 pl-3.5 bg-gray-400"
                type="number"
                value={bpm}
                onChange={(e) => setBpm(parseInt(e.target.value))}
                min="50"
                max="300"
              />
            </div>
            </div>
          
        </>
      ) : (
        <p>No chords to play yet.</p>
      )}
      </div>
    </div>
  );
}