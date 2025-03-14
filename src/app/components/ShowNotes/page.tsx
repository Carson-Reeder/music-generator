"use client";
import { UseBoundStore, StoreApi } from "zustand";
import { ArrangementStoreType } from "../../stores/ArrangementStore";
import { MeasureStoreType } from "../../stores/MeasureStore";
import { useState } from "react";

type ShowNotesProps = {
  compositionId: string;
  measureStore: UseBoundStore<StoreApi<MeasureStoreType>>;
  arrangementStore: UseBoundStore<StoreApi<ArrangementStoreType>>;
};

function dropdownNotes(itr: number) {
  console.log("itr", itr);
}

export default function ShowNotes({
  compositionId,
  measureStore,
  arrangementStore,
}: ShowNotesProps) {
  const { chords, setChordNotes, removeChord } = measureStore();
  const [chordSelected, setChordSelected] = useState<number | null>(null);
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
  const [activeInput, setActiveInput] = useState<
    { id: string; itr: number }[] | null
  >(null);
  const [activeNote, setActiveNote] = useState<string>("C4");
  const [selectedNote, setSelectedNote] = useState<string | null>(null);
  const [selectedOctave, setSelectedOctave] = useState<string | null>(null);
  const [deleteClicked, setDeleteClicked] = useState<string | null>(null);

  function handleDeleteClick(chordId: string) {
    if (deleteClicked === chordId) {
      removeChord(chordId);
      setDeleteClicked(null);
    } else {
      setDeleteClicked(chordId);
    }
  }

  const handleNoteClick = (note: string) => {
    if (chordSelected === null) return;
    console.log("note", note);
    console.log("activeInput", activeInput);

    if (!activeInput || activeInput.length === 0) return;
    const parsedNote = parseNote(note);
    const parsedOctave = parseOctave(selectedNote);
    const fullNote = `${parsedNote}${parsedOctave}`; // Combine note and octave

    // Find the active chord
    const activeChord = chords.find((chord) => chord.id === activeInput[0].id);
    if (!activeChord) return;

    // Create a new notes array with the updated note
    const updatedNotes = [...activeChord.notes];
    updatedNotes[activeInput[0].itr] = fullNote; // Update with combined note + octave

    // Call setChordNotes to update state
    setChordNotes(activeChord.id, updatedNotes);

    setSelectedNote(fullNote);
  };
  const handleOctaveClick = (octave: string) => {
    if (chordSelected === null) return;
    if (!activeInput || activeInput.length === 0) return;
    const parsedNote = parseNote(selectedNote);
    const parsedOctave = parseOctave(octave);
    const fullNote = `${parsedNote}${parsedOctave}`; // Combine note and octave
    console.log("fullNoteOctave", fullNote);

    // Find the active chord
    const activeChord = chords.find((chord) => chord.id === activeInput[0].id);
    if (!activeChord) return;

    // Create a new notes array with the updated note
    const updatedNotes = [...activeChord.notes];
    updatedNotes[activeInput[0].itr] = fullNote; // Update with combined note + octave

    // Call setChordNotes to update state
    setChordNotes(activeChord.id, updatedNotes);

    setSelectedNote(fullNote);
  };
  // Function to extract note name (handling sharps correctly)
  const parseNote = (note: string | null) => {
    if (!note) return null;
    return note.length > 1 && note[1] === "#" ? note.slice(0, 2) : note[0];
  };

  const parseOctave = (note: string | null) => {
    return note?.at(-1) || "4"; // Gets only the last character (octave number), defaults to '4' if note is null
  };

  const handleChordSelected = (itr: number) => {
    if (chordSelected === itr) {
      setChordSelected(null);
    } else {
      setChordSelected(itr);
      setSelectedNote(null);
      setActiveInput(null);
    }
  };

  const isNoteSelected = (note: string) => {
    if (chordSelected === null) return "";
    if (selectedNote && parseNote(note) === parseNote(selectedNote)) {
      return "selected";
    }
    return "";
  };

  const isOctaveSelected = (octave: string) => {
    if (chordSelected === null) return "";
    if (selectedNote && parseOctave(selectedNote) === octave) {
      return "selected";
    }
    return "";
  };
  const isChordSelected = (itr: number) => {
    if (chordSelected === itr) {
      return "selected";
    }
    return "";
  };
  const isDeleteSelected = (chordId: string) => {
    if (deleteClicked === chordId) {
      return "delete";
    }
    return "";
  };
  const isNoteInputSelected = (chordId: string, inputItr: number) => {
    if (!activeInput || activeInput.length === 0) return "";
    const active = activeInput[0];
    return active.id === chordId && active.itr === inputItr ? "selected" : "";
  };
  if (measureStore.getState().toolBarSelector != "note") return null;

  return (
    <div className="note-container" style={{ border: "1px solid green" }}>
      <div className="note-chords-container">
        {chords.map((chord, itr) => (
          <div key={chord.id}>
            <div className={`chord-button `}>
              <button
                className={`remove-chord ${isDeleteSelected(chord.id)}`}
                onClick={() => {
                  handleDeleteClick(chord.id);
                }}
              >
                X
              </button>
              {deleteClicked !== chord.id ? (
                <button
                  className={`open-chord ${isChordSelected(itr)}`}
                  onClick={() => {
                    handleChordSelected(itr);
                    setDeleteClicked(null);
                  }}
                >
                  Chord {chord.id}
                </button>
              ) : (
                <button
                  className={`open-chord-cancel ${isChordSelected(itr)}`}
                  onClick={() => {
                    setDeleteClicked(null);
                  }}
                >
                  Cancel
                </button>
              )}
            </div>
            {chordSelected === itr && (
              <div className="note-chords">
                {chord.notes.map((note, itr) => {
                  const noteKey = `${chord.id}-${note}`;
                  const finalValue =
                    selectedNotes[noteKey] || selectedOctaves[noteKey] || "";

                  return (
                    <button
                      key={`${chord.id}-${itr}`}
                      className={`note-input ${isNoteInputSelected(
                        chord.id,
                        itr
                      )}`}
                      value={finalValue}
                      onFocus={() => setActiveInput([{ id: chord.id, itr }])}
                      onClick={() => setSelectedNote(note)}
                    >
                      {" "}
                      {note}{" "}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Notes Section */}
      <div className="pick-notes-container">
        {notes.map((note) => (
          <div
            key={note}
            className={`pick-notes ${isNoteSelected(note)}`}
            onClick={() => {
              handleNoteClick(note);
            }}
          >
            {note}
          </div>
        ))}
      </div>

      {/* Octaves Section */}
      <div className="pick-octave-container">
        {octaves.map((octave) => (
          <button
            className={`pick-octave ${isOctaveSelected(octave)}`}
            key={octave}
            onClick={() => {
              handleOctaveClick(octave);
            }}
          >
            {octave}
          </button>
        ))}
      </div>
    </div>
  );
}
