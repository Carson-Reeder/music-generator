"use client";
import { UseBoundStore, StoreApi } from "zustand";
import { ArrangementStoreType } from "../../stores/ArrangementStore";
import { MeasureStoreType } from "../../stores/MeasureStore";
import { useState } from "react";

type ShowNotesProps = {
  compositionId: number;
  measureStore: UseBoundStore<StoreApi<MeasureStoreType>>;
  arrangementStore: UseBoundStore<StoreApi<ArrangementStoreType>>;
};

import { ChordType } from "../../stores/MeasureStore";

export default function ShowNotes({
  compositionId,
  measureStore,
  arrangementStore,
}: ShowNotesProps) {
  const { chords, setChordNotes } = measureStore();
  console.log("chords", chords);
  console.log("rerender");

  const notes = [
    "C",
    "C#",
    "D",
    "D#",
    "E",
    "F",
    "F#",
    "G",
    "G#",
    "A",
    "A#",
    "B",
  ];
  const octaves = ["1", "2", "3", "4", "5", "6", "7", "8"];

  // State for selected note
  const [selectedNotes, setSelectedNotes] = useState<{
    [key: string]: string | null;
  }>({});
  const [selectedOctaves, setSelectedOctaves] = useState<{
    [key: string]: string | null;
  }>({});
  const [activeInput, setActiveInput] = useState<{ id: string; itr: number }[]>(
    []
  );
  const [activeNote, setActiveNote] = useState<string>("C4");
  const [selectedNote, setSelectedNote] = useState<string>("4");
  const [selectedOctave, setSelectedOctave] = useState<string | null>(null);

  const handleNoteClick = (note: string) => {
    console.log("note", note);
    console.log("activeInput", activeInput);

    if (activeInput.length === 0) return;
    console.log(activeNote);
    const parsedNote = parseNote(note);
    console.log("parsedNote", parsedNote);
    const parsedOctave = parseOctave(selectedNote);
    console.log("parsedOctave", parsedOctave);
    const fullNote = `${parsedNote}${parsedOctave}`; // Combine note and octave
    console.log("fullNote", fullNote);

    // Find the active chord
    const activeChord = chords.find((chord) => chord.id === activeInput[0].id);
    if (!activeChord) return;

    // Create a new notes array with the updated note
    const updatedNotes = [...activeChord.notes];
    updatedNotes[activeInput[0].itr] = fullNote; // Update with combined note + octave

    // Call setChordNotes to update state
    setChordNotes(activeChord.id, updatedNotes);
  };
  const parsedNote = (note: string) => {
    return note.slice(0, -1); // Removes the last character (octave number)
  };
  // Function to extract note name (handling sharps correctly)
  const parseNote = (note: string) => {
    if (!note) return null;
    return note.length > 1 && note[1] === "#" ? note.slice(0, 2) : note[0];
  };

  const parseOctave = (note: string) => {
    return note.at(-1); // Gets only the last character (octave number)
  };

  // Function to determine background color for the **specific selected note**
  const getNoteBackground = (note: string) => {
    return activeNote && parseNote(note) === activeNote
      ? "bg-yellow-300"
      : "bg-white";
  };

  return (
    <div
      className="measure-display-parent"
      style={{ border: "1px solid green" }}
    >
      <div
        style={{
          overflow: "scroll",
          display: "flex",
          flexShrink: 0,
          flexDirection: "row",
          scrollbarWidth: "thin",
          boxShadow: "0rem 0rem .25rem .2rem rgba(93, 148, 125, 0.57)",
          height: `40%`,
          flexWrap: "nowrap",
        }}
      >
        {chords.map((chord) => (
          <div className="measure-display-child pr-1" key={chord.id}>
            {chord.notes.map((note, itr) => {
              const noteKey = `${chord.id}-${note}`;
              const finalValue =
                selectedNotes[noteKey] || selectedOctaves[noteKey] || "";
              const noteBackground = getNoteBackground(note);

              return (
                <input
                  key={`${chord.id}-${itr}`}
                  className={`note-input `}
                  value={finalValue}
                  readOnly
                  placeholder={note}
                  onFocus={() => setActiveInput([{ id: chord.id, itr }])}
                  onClick={() => setSelectedNote(note)}
                />
              );
            })}
          </div>
        ))}
      </div>

      {/* Notes Section */}
      <div
        style={{
          width: "100%",
          height: `40%`,
          border: "2px solid red",
          display: "flex",
        }}
      >
        {notes.map((note) => (
          <div
            className={`note-container ${getNoteBackground(note)}`}
            key={note}
            onClick={() => {
              handleNoteClick(note);
            }}
          >
            {note}
          </div>
        ))}
      </div>

      {/* Octaves Section */}
      <div
        style={{
          width: "100%",
          height: `20%`,
          border: "2px solid red",
          display: "flex",
        }}
      >
        {octaves.map((octave) => (
          <div className="note-container" key={octave} onClick={() => {}}>
            {octave}
          </div>
        ))}
      </div>

      <style jsx>{`
        .measure-display-child {
          display: flex;
          max-width: 30%;
          min-width: 20%;
          height: 100%;
        }
        .note-container {
          border: 1px solid blue;
          height: 100%;
          width: calc(100% / 12);
          display: flex;
          justify-content: center;
          align-items: center;
          cursor: pointer;
        }
        .note-input {
          padding: 0.25rem;
          min-width: 1rem;
          max-width: 3rem;
          text-align: center;
          border-radius: 5px;
          cursor: pointer;
          z-index: 1;
        }
        .bg-yellow-300 {
          background-color: yellow;
        }
        .bg-white {
          background-color: white;
        }
      `}</style>
    </div>
  );
}
