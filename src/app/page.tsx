"use client";

import React from "react";
import { useState } from "react";
import { getChords } from "./utils/fetchChords";
import { useChordPlaybackStore } from "./stores/chordPlaybackStore";
import { playChord, playChordProgression } from "./utils/soundPlayer"
import { get } from "http";

export default function MyPage() {
  const [scale, setScale] = useState("C major 4");
  const [responseText, setResponseText] = useState("Chord 1: C4, E4, G4 (C major)\nChord 2: D4, F4, A4 (D minor)\nChord 3: G3, B3, D4, F4 (G7)\nChord 4: F4, A4, C5 (F major)");
  const [loading, setLoading] = useState(false);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [chordNotes, setChordNotes] = useState<string[][]>([]);
  const [soundPlayer, setSoundPlayer] = useState<any>(null);
  const [startup, setStartup] = useState(true);
  
  // get functions and vars from chordPlaybackStore
  const chords = useChordPlaybackStore((state) => state.chords); // Reactively subscribes to chords
  const setChords = useChordPlaybackStore((state) => state.setChords);
  const bpm = useChordPlaybackStore((state) => state.bpm);
  const setBpm = useChordPlaybackStore((state) => state.setBpm);
  const chordStartPosition = useChordPlaybackStore((state) => state.chordStartPosition);
  const setchordStartPosition = useChordPlaybackStore((state) => state.setChordStartPosition);
  const chordLength = useChordPlaybackStore((state) => state.chordLength);
  const setChordLength = useChordPlaybackStore((state) => state.setChordLength);
  const chordTimingMeasure = useChordPlaybackStore((state) => state.chordTimingMeasure);
  const setChordTimingMeasure = useChordPlaybackStore((state) => state.setChordTimingMeasure);
  const resetChordTimingMeasure = useChordPlaybackStore((state) => state.resetChordTimingMeasure);
  const resetChordLength = useChordPlaybackStore((state) => state.resetChordLength);

  const handleChords = async () => {  
    setLoading(true);
    if (startup) {
    setResponseText("Chords are being generated...");
    setStartup(false);
    
    }
    resetChordTimingMeasure();
    resetChordLength();
    const result = await getChords(scale, threadId);
    if (result) {
      const {parsedChords, parsedId, parsedMessage} = result;
      setChords(parsedChords);
      setThreadId(parsedId);
      setResponseText(parsedMessage);
      setLoading(false);
      
    }
  };

  return (
    <div>
      <h1>OpenAI Chord Generator</h1>
      <textarea
        value={scale}
        onChange={(e) => setScale(e.target.value)}
        placeholder="Enter the scale here"
        rows={2}
        cols={50}
      />
      <input
        type="number"
        value={bpm}
        onChange={(e) => setBpm(parseInt(e.target.value))}
        min="50"
        max="300"
      />
      <button onClick={handleChords} disabled={loading}>
        {loading ? "Generating Chords..." : "Generate Chords"}
      </button>

      <div>
        <h2>View Chords:</h2>
        <div>
          {responseText && (
            <pre>{typeof responseText === "string" ? responseText : JSON.stringify(responseText, null, 2)}</pre>
          )}
        </div>
      </div>

      <div>
        <h2>Play Chords:</h2>
        {chords.length > 0 ? (
          <>
            {chords.map((chord, index) => (
              <div key={index}>
                {/* Button to play the chord */}
                <button onClick={() => playChord(chord)}>
                  Play Chord {index + 1}
                </button>

                {/* Input box for chord length */}
                <input
                  type="number"
                  value={chordLength[index] || 0} // Default to 0 if undefined
                  onChange={(e) => setChordLength(index, parseInt(e.target.value))}
                  placeholder={`Length for Chord ${index + 1}`}
                  min="1"
                />

                {/* Input box for chord timing measure */}
                <input
                  type="number"
                  value={chordTimingMeasure[index] || 0} // Default to 0 if undefined
                  onChange={(e) => setChordTimingMeasure(index, parseInt(e.target.value))}
                  placeholder={`Timing for Chord ${index + 1}`}
                  min="0"
                /> 
              </div>
            ))}
            <button onClick={() => playChordProgression(chords, bpm, chordLength, chordTimingMeasure)}>
              Play Chord Progression
            </button>
          </>
        ) : (
          <p>No chords to play yet.</p>
        )}
      </div>
      <div>
        <h2>Drag and Drop</h2>
      </div>
    </div>
  );
}