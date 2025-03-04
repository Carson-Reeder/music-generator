"use client";
import { UseBoundStore, StoreApi } from "zustand";
import { useState, useEffect } from "react";
import { useInstrumentStore } from "../../stores/InstrumentStore";
import { ArrangementStoreType } from "../../stores/ArrangementStore";
import { getChords } from "../../utils/fetchChords";
import { arrangementStore } from "../../stores/ArrangementStore";

export default function Header() {
  const [scale, setScale] = useState("C major 4");
  const [responseText, setResponseText] = useState(
    "Chord 1: C4, E4, G4 (C major)\nChord 2: D4, F4, A4 (D minor)\nChord 3: G3, B3, D4, F4 (G7)\nChord 4: F4, A4, C5 (F major)"
  );
  const [loading, setLoading] = useState(false);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [chordSelected, setChordSelected] = useState<number>(1);
  const { setInstruments } = useInstrumentStore();
  const stores = arrangementStore.getState().stores;

  const handleChords = async () => {
    setLoading(true);
    setResponseText(`Chords are being generated...\n\n${responseText}`);

    // call api, passing in scale, threadId, and chords derived from current store
    const result = await getChords(
      scale,
      threadId,
      stores[chordSelected - 1].store.getState().chords
    );
    if (result) {
      const { transformedChords, parsedId, parsedMessage } = result;

      // Update chords in the first composition
      stores[chordSelected - 1].store.setState({ chords: transformedChords });
      console.log("stores", stores);
      setThreadId(parsedId);
      setResponseText(parsedMessage);
      setLoading(false);
    }
  };

  return (
    <div style={{ minWidth: "320px" }}>
      {/* Header */}
      <div
        id="header"
        className="border items-center border-black rounded-lg h-32 flex flex-col sm:flex-row"
        style={{ backgroundColor: "rgba(78, 155, 122, 0.98)" }}
      >
        <h1
          className="m-4 p-2 border border-black rounded-md"
          style={{
            backgroundColor: "rgba(191, 232, 217, 0.4)",
          }}
        >
          OpenAI Chord Generator
        </h1>
        {/* Chord Input */}
        <div id="chord-input">
          <textarea
            className="m-3 pl-2 pt-1.5 h-10 rounded-md block w-full sm:w-1/2 bg-white-500 p-4"
            value={scale}
            onChange={(e) => setScale(e.target.value)}
            placeholder="Enter the scale here"
            rows={2}
            cols={50}
            style={{
              backgroundColor: "rgba(191, 232, 217, 0.4)",
            }}
          />
        </div>
        {/* Generate Chords */}
        <div>
          <button
            className="border border-black rounded-md m-3 mt-0 max-w-md sm:w-1/2 bg-green-500 p-4"
            onClick={handleChords}
            disabled={loading}
          >
            {loading ? "Generating Chords..." : "Generate Chords"}
          </button>
        </div>
        {/* Chord Selection (chord to generate) */}
        <div>
          <label>Composition to generate: </label>
          <input
            type="number"
            value={chordSelected}
            onChange={(e) => {
              setChordSelected(e.target.valueAsNumber);
            }}
          />
        </div>
      </div>
      {/* Chords Display */}
      <div className="ml-6">
        <h2>View Chords:</h2>
        <div className="ml-4">
          {responseText && (
            <pre>
              {typeof responseText === "string"
                ? responseText
                : JSON.stringify(responseText, null, 2)}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}
