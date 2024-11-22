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
                    <button onClick={() => playChord(chord.notes)}>
                      Play Chord {index + 1}
                    </button>
    
                    {/* Input box for chord length */}
                    <input
                      type="number"
                      value={chord.length || 0} // Default to 0 if undefined
                      onChange={(e) => handleChordLengthChange(chord.id,e.target.value)}
                      placeholder={`Length for Chord ${index + 1}`}
                      min="1"
                    />
    
                    {/* Input box for chord timing measure */}
                    <input
                      type="number"
                      value={chord.timingMeasure || 0} // Default to 0 if undefined
                      onChange={(e) => handleChordTiming(chord.id,e.target.value)}
                      placeholder={`Timing for Chord ${index + 1}`}
                      min="0"
                    /> 
                  </div>
                ))}
    
                <button onClick={() => {
                  playChordProgression(preprocessed.notes,bpm,preprocessed.lengths, preprocessed.timings)
                }
                }>
    
                  Play Chord Progression
                </button>
                <input
                  type="number"
                  value={bpm}
                  onChange={(e) => setBpm(parseInt(e.target.value))}
                  min="50"
                  max="300"
                />
              </>
            ) : (
              <p>No chords to play yet.</p>
            )}
          </div>
        </div>
        
      );

}