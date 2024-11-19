"use client";

import { useState } from "react";
import { getChords } from "./utils/fetchChords";
import { get } from "http";

export default function MyPage() {
  const [scale, setScale] = useState("C major 4");
  const [responseText, setResponseText] = useState("Click to generate some chords!");
  const [loading, setLoading] = useState(false);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [chordNotes, setChordNotes] = useState<string[][]>([]);
  const [soundPlayer, setSoundPlayer] = useState<any>(null);
  const [startup, setStartup] = useState(true);
  const [bpm, setBpm] = useState(120);
  const [chordLength, setChordLength] = useState<any>([8,8,8,8,8,8]);
  

  const setChords = async () => {  
    setLoading(true);
    if (startup) {
    setResponseText("Chords are being generated...");
    setStartup(false);
    }
    const result = await getChords(scale, threadId);
    if (result) {
      const {parsedChords, parsedId, parsedMessage} = result;
      setChordNotes(parsedChords);
      setThreadId(parsedId);
      setResponseText(parsedMessage);
      setLoading(false);
      setSoundPlayer(await import("./utils/soundPlayer"));
    }
  };

  const handleChordLengthChange = (index: number, value: number) => {
    // Update the chord length at the specified index
    setChordLength((prev: any) => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
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
      <button onClick={setChords} disabled={loading}>
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
        {chordNotes.length > 0 ? (
          <>
            {chordNotes.map((chord, index) => (
              <div key={index}>
                {/* Button to play the chord */}
                <button onClick={() => soundPlayer.playChord(chord)}>
                  Play Chord {index + 1}
                </button>

                {/* Input box for chord length */}
                <input
                  type="number"
                  value={chordLength[index] || 0} // Default to 0 if undefined
                  onChange={(e) => handleChordLengthChange(index, parseInt(e.target.value))}
                  placeholder={`Length for Chord ${index + 1}`}
                  min="0"
                />
              </div>
            ))}
            <button onClick={() => soundPlayer.playChordProgression(chordNotes, bpm, chordLength)}>
              Play Chord Progression
            </button>
          </>
        ) : (
          <p>No chords to play yet.</p>
        )}
      </div>
    </div>
  );
}