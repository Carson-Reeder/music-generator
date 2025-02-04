"use client";
import * as Tone from "tone";
let activeSynths: { synth: Tone.PolySynth, notes: string[] }[] = [];

const makeSynth = async () => {
  const synth = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: "sine" },
    envelope: { release: 0.5 },
    
    
  }).toDestination(); 
  return synth;
};

export const playChord = async (notes: string[]) => {
  // Stop any currently playing notes
  activeSynths.forEach(({ synth, notes }) => synth.triggerRelease(notes));  // Stop all active synths
  activeSynths = [];  // Reset the array of active synths

  const synth = await makeSynth(); // Create a new synth
  await Tone.start(); // Start the Tone.js context if not already started

  // Trigger the new chord
  synth.triggerAttackRelease(notes, "4n");

  // Store the new synth in the activeSynths array
  activeSynths.push({ synth, notes });
};

export const playChordProgression = async (chordNotes: string[][], bpm: number, chordLength: number[], chordStartPosition: number[], chordTimingBeat: number[]) => {
  activeSynths.forEach(({ synth, notes }) => synth.triggerRelease(notes));  // Stop all active synths
  activeSynths = [];  // Reset the array of active synths
  const synth = await makeSynth();
  //await Tone.start(); // Ensure the audio context is running

  Tone.getTransport().stop(); // Stop the transport if it's already running
  Tone.getTransport().cancel(); // Clear all scheduled events
  Tone.getTransport().position = "0:0"; // Reset the position to the start
  Tone.getTransport().bpm.value = bpm; // Set tempo
  const progression = await createProgression(chordNotes, chordLength, chordTimingBeat, chordStartPosition);  
  console.log(progression);
  const part = new Tone.Part((time, chord) => {
    synth.triggerAttackRelease(chord.notes, chord.duration, time);
  }, progression).start(); 
  console.log(chordStartPosition);
  console.log(chordLength);
  console.log(chordTimingBeat);
  
  Tone.getTransport().start(); // Start the transport
}

const createProgression = async (chordNotes: string[][], chordLength: number[], chordTimingBeat: number[], chordStartPosition: number[]) => {
  console.log('chordNotes',chordNotes);
  return chordNotes.map((chord: any, index: any) => ({
    time: `${chordStartPosition[index]}:${chordTimingBeat[index]}`,
    notes: chord,
    duration: Tone.Time("1m").toSeconds() * chordLength[index],
  }));
};