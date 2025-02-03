"use client";

import React, { useState } from "react";
import '../../globals.css';
import FixedComposition from "./components/fixedcomposition";
import PlayChord from "./components/playChords";
import { getChords } from "./utils/fetchChords";
import { createChordPlaybackStore } from "./stores/chordPlaybackStore";
import { playChord, playChordProgression } from "./utils/soundPlayer";

export default function MyPage() {
  const [scale, setScale] = useState("C major 4");
  const [responseText, setResponseText] = useState("Chord 1: C4, E4, G4 (C major)\nChord 2: D4, F4, A4 (D minor)\nChord 3: G3, B3, D4, F4 (G7)\nChord 4: F4, A4, C5 (F major)");
  const [loading, setLoading] = useState(false);
  const [threadId, setThreadId] = useState<string | null>(null);

  // Stores multiple independent compositions
  const [stores, setStores] = useState<{ id: number; store: ReturnType<typeof createChordPlaybackStore> }[]>([
    { id: 1, store: createChordPlaybackStore() }
  ]);

  // Handles updating chords in the first store
  const handleChords = async () => {  
    setLoading(true);
    
    const temp = responseText;
    setResponseText(`Chords are being generated...\n\n${temp}`);

    const result = await getChords(scale, threadId, stores[0].store.getState().chords); // Use first store
    if (result) {
      const { transformedChords, parsedId, parsedMessage } = result;

      // Update chords in the first composition
      stores[0].store.setState({ chords: transformedChords });

      setThreadId(parsedId);
      setResponseText(parsedMessage);
      setLoading(false);
    }
  };

  // Adds a new independent composition with its own Zustand store
  const addComposition = () => {
    setStores([...stores, { id: stores.length + 1, store: createChordPlaybackStore() }]);
  };

  // Removes a composition
  const removeComposition = (id: number) => {
    setStores(stores.filter((comp) => comp.id !== id));
  };

  return (
    <div>
      {/* Header */}
      <div id="header" className="bg-blue-500 text-red border border-red h-32 flex flex-col sm:flex-row">
        <h1>OpenAI Chord Generator</h1>
        <div id="chord-input">
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

      {/* Chords Display */}
      <div>
        <h2>View Chords:</h2>
        <div>
          {responseText && (
            <pre>{typeof responseText === "string" ? responseText : JSON.stringify(responseText, null, 2)}</pre>
          )}
        </div>
      </div>

      {/* Play Chords */}
      <div>
        <h2>Play Chords</h2>
        
        {stores.map(({ id, store }) => (
          <PlayChord key={id} useStore={store} compositionId={id} />
        ))} 
      </div>

      {/* Fixed Composition Drag & Drop */}
      <div>
        <h2>Drag and Drop</h2>
        <div>
          <h1>Multiple Compositions</h1>
          {stores.map(({ id, store }) => (
            <div key={id} style={{ border: "1px solid black", margin: "10px", padding: "10px" }}>
              <FixedComposition useStore={store} compositionId={id} />
              <button onClick={() => removeComposition(id)}>Delete</button>
            </div>
          ))}
          <button onClick={addComposition}>Add New Composition</button>
        </div>
      </div>
    </div>
  );
}