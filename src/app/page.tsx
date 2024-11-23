"use client";

import React from "react";
import { useState } from "react";
import '../../globals.css';
import Composition from "./components/composition";
import PlayChord from "./components/playChords";
import { getChords } from "./utils/fetchChords";
import { useChordPlaybackStore } from "./stores/chordPlaybackStore";
import { playChord, playChordProgression } from "./utils/soundPlayer"
import { get } from "http";

export default function MyPage() {
  const [scale, setScale] = useState("C major 4");
  const [responseText, setResponseText] = useState("Chord 1: C4, E4, G4 (C major)\nChord 2: D4, F4, A4 (D minor)\nChord 3: G3, B3, D4, F4 (G7)\nChord 4: F4, A4, C5 (F major)");
  const [loading, setLoading] = useState(false);
  const [threadId, setThreadId] = useState<string | null>(null);
  
  // Zustand state
  const setChords = useChordPlaybackStore((state) => state.setChords);

  const handleChords = async () => {  
    setLoading(true);
    
    const temp = responseText;
    setResponseText(`Chords are being generated...\n\n${temp}`);
    
    const result = await getChords(scale, threadId);
    if (result) {
      const {transformedChords, parsedId, parsedMessage} = result;
      setChords(transformedChords);
      setThreadId(parsedId);
      setResponseText(parsedMessage);
      setLoading(false);
      
    }
  };

  return (
    <div>
        <div id="header" className="bg-blue-500 text-red border border-red  h-32 flex flex-col sm:flex-row">
          <h1>OpenAI Chord Generator</h1>
            <div id="chord-input" className="">
            <textarea
              className="m-3 pl-2 pt-1.5 h-10 rounded-md block w-full sm:w-1/2 bg-white-500 p-4"
              value={scale}
              onChange={(e) => setScale(e.target.value)}
              placeholder="Enter the scale here"
              rows={2}
              cols={50}
            />
            </div>
          <div>
            <button className="border border-black rounded-md m-3 mt-0 max-w-md sm:w-1/2 bg-green-500 p-4"
              onClick={handleChords} disabled={loading}>
              {loading ? "Generating Chords..." : "Generate Chords"}
            </button>
          </div>
      </div>

    <div>
        <h2>View Chords:</h2>
        <div>
          {responseText && (
            <pre>{typeof responseText === "string" ? responseText : JSON.stringify(responseText, null, 2)}</pre>
          )}
        </div>
    </div>
    <div>
      <PlayChord/>
    </div>
    <div>
      <h2>Drag and Drop</h2>
      <Composition />
    </div>
    </div>
  );
}