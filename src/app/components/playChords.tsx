"use client";
import React from 'react'
import { useChordPlaybackStore } from '../stores/chordPlaybackStore'
import { playChord, playChordProgression } from '../utils/soundPlayer'

export default function PlayChords() {

    const { chords, setChords,
        bpm, setBpm, setChordNotes, setChordTiming, 
        setChordLength, setChordStartPosition
    } = useChordPlaybackStore()

    return (
        <div>
          <div>
            <h2>Play Chords:</h2>
            {chords.length > 0 ? (
              <>
                {chords.map((chord, index) => (
                  <div key={index}>
                    {/* Button to play the chord */}
                    <button 
                      className="border-2 border-black rounded-md w-32 pl-1 bg-red-400 ml-4 mb-1"
                      onClick={() => playChord(chord.notes)}>
                      Play Chord {index + 1}
                    </button>
                  </div>
                ))}
                <div className="flex">
                <button 
                  className="border-2 border-black rounded-md max-w-32 pl-1 bg-red-400 ml-4 mb-1 mr-1"
                  onClick={() => {
                  playChordProgression(chords.map((c) => c.notes),bpm,chords.map((c) => c.length), chords.map((c) => c.startPosition), chords.map((c) => c.chordTimingBeat));
                }
                }>
    
                  Play Chord Progression
                </button>
                <div className="pr-0 flex flex-wrap rounded-md border-2 border-black max-w-16 bg-red-400">
                <label className="pl-3.5">
                  BPM
                </label>
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