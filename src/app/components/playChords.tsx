import React from 'react'
import { useChordPlaybackStore } from '../stores/chordPlaybackStore'
import { playChord, playChordProgression } from '../utils/soundPlayer'

export default function PlayChords() {

    const { chords, setChords, preprocessed, 
        bpm, setBpm, setChordNotes, setChordTiming, 
        setChordLength, setChordStartPosition
    } = useChordPlaybackStore()

    const handleChordLengthChange = (id: string, value: string) => {
        const newValue = parseInt(value)
        setChordLength(id,newValue);
    }

    const handleChordTiming = (id: string, value: string) => {
        const newValue = parseInt(value)
        setChordTiming(id,newValue)
    }
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
                      className="border border-black rounded-md w-32 pl-1"
                      onClick={() => playChord(chord.notes)}>
                      Play Chord {index + 1}
                    </button>
                  </div>
                ))}
                <div className="flex">
                <button 
                  className="border border-black rounded-md max-w-32 pl-1"
                  onClick={() => {
                  playChordProgression(preprocessed.notes,bpm,preprocessed.lengths, preprocessed.position, preprocessed.beat);
                }
                }>
    
                  Play Chord Progression
                </button>
                <div className="pr-0 flex flex-wrap rounded-md border border-black max-w-16 bg-red-400">
                <label className="pl-3.5">
                  BPM
                </label>
                <input
                  className="border border-black rounded-md max-w-16 p-0 pl-3.5 bg-red-340"
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