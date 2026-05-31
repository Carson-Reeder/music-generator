"use client";
import { UseBoundStore, StoreApi } from "zustand";
import { useState, useEffect } from "react";
import { useInstrumentStore } from "../../stores/InstrumentStore";
import { ArrangementStoreType } from "../../stores/ArrangementStore";
import { generateArrangement } from "../../utils/fetchChords";
import { arrangementStore } from "../../stores/ArrangementStore";

export default function Header() {
  const [scale, setScale] = useState("C major");
  const [chordCount, setChordCount] = useState<number>(4);
  const [responseText, setResponseText] = useState(
    "Chord 1: C4, E4, G4 (C major)\nChord 2: D4, F4, A4 (D minor)\nChord 3: G3, B3, D4, F4 (G7)\nChord 4: F4, A4, C5 (F major)"
  );
  const [loading, setLoading] = useState(false);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [chordSelected, setChordSelected] = useState<number>(1);
  const stores = arrangementStore.getState().stores;
  const bpm = arrangementStore((state) => state.bpm);
  const setBpm = arrangementStore((state) => state.setBpm);
  const snapDivision = arrangementStore((state) => state.snapDivision);
  const setSnapDivision = arrangementStore((state) => state.setSnapDivision);
  const numMeasures = arrangementStore((state) => state.numMeasures);

  const handleGenerateSelected = async () => {
    setLoading(true);
    setResponseText(`Generating selected track...`);

    const currentStore = stores[chordSelected - 1].store.getState();
    const tracksToGenerate = [{
      trackIndex: chordSelected - 1,
      trackType: currentStore.trackType,
      instrument: currentStore.instrument.name,
      chordCount: chordCount
    }];

    // Pass ALL tracks as context (including their full chord data)
    // so the AI can see the complete song state
    const contextTracks = stores
      .filter((_, index) => index !== chordSelected - 1)
      .map((storeObj, index) => {
        const state = storeObj.store.getState();
        return {
          trackIndex: index >= chordSelected - 1 ? index + 1 : index,
          trackType: state.trackType,
          instrument: state.instrument.name,
          chords: state.chords
        };
      });

    const result = await generateArrangement(scale, bpm, tracksToGenerate, contextTracks, threadId, numMeasures);
    if (result) {
      const { parsedArrangement, parsedId, parsedMessage } = result;
      if (parsedArrangement && parsedArrangement.tracks) {
        parsedArrangement.tracks.forEach((t: any) => {
          if (stores[t.trackIndex]) {
            stores[t.trackIndex].store.setState({ chords: t.chords });
          }
        });
      }
      setThreadId(parsedId);
      setResponseText(parsedMessage);
    }
    setLoading(false);
  };

  const handleGenerateAll = async () => {
    setLoading(true);
    setResponseText(`Generating Full Arrangement (this may take 10-15 seconds)...`);

    const tracksToGenerate = stores.map((storeObj, index) => {
      const state = storeObj.store.getState();
      return {
        trackIndex: index,
        trackType: state.trackType,
        instrument: state.instrument.name,
        chordCount: chordCount
      };
    });

    // Even for "generate all", pass the current song state as context
    // so the AI can see what instruments/types are set up and what
    // the existing arrangement looks like before it overwrites
    const contextTracks: any[] = [];

    const result = await generateArrangement(scale, bpm, tracksToGenerate, contextTracks, threadId, numMeasures);
    if (result) {
      const { parsedArrangement, parsedId, parsedMessage } = result;
      if (parsedArrangement && parsedArrangement.tracks) {
        parsedArrangement.tracks.forEach((t: any) => {
          if (stores[t.trackIndex]) {
            stores[t.trackIndex].store.setState({ chords: t.chords });
          }
        });
      }
      setThreadId(parsedId);
      setResponseText(parsedMessage);
    }
    setLoading(false);
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
        <div id="chord-input" className="flex flex-col justify-center">
          <input
            className="m-3 mb-1 pl-2 h-10 rounded-md block bg-white-500 p-4"
            value={scale}
            onChange={(e) => setScale(e.target.value)}
            placeholder="Enter scale (e.g. C major)"
            style={{
              backgroundColor: "rgba(191, 232, 217, 0.4)",
            }}
          />
          <div className="mx-3 flex items-center justify-between">
            <div className="flex items-center">
              <label className="text-sm mr-2 font-semibold">Chords:</label>
              <input
                type="number"
                className="h-8 w-16 rounded-md pl-2"
                value={chordCount}
                onChange={(e) => setChordCount(e.target.valueAsNumber)}
                style={{ backgroundColor: "rgba(191, 232, 217, 0.4)" }}
              />
            </div>
            <div className="flex items-center ml-2">
              <label className="text-sm mr-2 font-semibold">BPM:</label>
              <input
                type="number"
                className="h-8 w-16 rounded-md pl-2"
                value={bpm}
                onChange={(e) => setBpm(e.target.valueAsNumber)}
                style={{ backgroundColor: "rgba(191, 232, 217, 0.4)" }}
              />
            </div>
            <div className="flex items-center ml-2">
              <label className="text-sm mr-2 font-semibold">Snap:</label>
              <select
                className="h-8 rounded-md pl-1"
                value={snapDivision}
                onChange={(e) => setSnapDivision(Number(e.target.value))}
                style={{ backgroundColor: "rgba(191, 232, 217, 0.4)" }}
              >
                <option value={1}>1 (whole)</option>
                <option value={2}>1/2</option>
                <option value={4}>1/4</option>
                <option value={8}>1/8</option>
                <option value={16}>1/16</option>
              </select>
            </div>
          </div>
        </div>
        {/* Generate Actions */}
        <div className="flex flex-col m-2 gap-2">
          <button
            className="border border-black rounded-md w-full bg-blue-400 p-2 text-sm font-semibold hover:bg-blue-300"
            onClick={handleGenerateAll}
            disabled={loading}
          >
            {loading ? "Generating..." : "Generate Full Arrangement"}
          </button>
          <button
            className="border border-black rounded-md w-full bg-green-500 p-2 text-sm font-semibold hover:bg-green-400"
            onClick={handleGenerateSelected}
            disabled={loading}
          >
            {loading ? "Generating..." : "Generate Selected Track"}
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
