"use client";
import * as Tone from "tone";

const makeSynth = async () => {
  const synth = new Tone.PolySynth().toDestination(); 
  return synth;
};

export const playChord = async (notes: string[]) => {
  if (typeof window === "undefined") {
    console.log("test");
  }
  const synth = await makeSynth();
  await Tone.start();
  synth.triggerAttackRelease(notes, "4n");
};

export const playChordProgression = async (chordNotes: string[][], bpm: number, chordLength: number[], chordTimingMeasure: number[]) => {
  if (typeof window === "undefined") {
    console.log("test");
  }
  const synth = await makeSynth();
  await Tone.start(); // Ensure the audio context is running

  Tone.Transport.stop(); // Stop the transport if it's already running
  Tone.Transport.cancel(); // Clear all scheduled events
  Tone.Transport.position = "0:0"; // Reset the position to the start

  const progression = await createProgression(chordNotes, chordLength, chordTimingMeasure);  

  const part = new Tone.Part((time, chord) => {
    synth.triggerAttackRelease(chord.notes, chord.duration, time);
  }, progression).start(0);

  Tone.Transport.bpm.value = bpm; // Set tempo
  Tone.Transport.start(); // Start the transport
};


const createProgression = async (chordNotes: string[][], chordLength: number[], chordTimingMeasure: number[]) => {
  if (typeof window === "undefined") {
    console.log("test");
  }
  return chordNotes.map((chord: any, index: any) => ({
    time: `${chordTimingMeasure[index]}:0`,
    notes: chord,
    duration: `${chordLength[index]}n`,
  }))
};