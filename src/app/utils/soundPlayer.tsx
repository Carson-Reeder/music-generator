"use client";
import * as Tone from "tone";

const makeSynth = async () => {
  const synth = new Tone.PolySynth().toDestination(); 
  return synth;
};

export const playChord = async (notes: string[]) => {
  
  const synth = await makeSynth();
  await Tone.start();
  synth.triggerAttackRelease(notes, "4n");
};

export const playChordProgression = async (chordNotes: string[][], bpm: number, chordLength: number[], chordStartPosition: number[], chordTimingBeat: number[]) => {

  const synth = await makeSynth();
  await Tone.start(); // Ensure the audio context is running

  Tone.getTransport().stop(); // Stop the transport if it's already running
  Tone.getTransport().cancel(); // Clear all scheduled events
  Tone.getTransport().position = "0:0"; // Reset the position to the start

  const progression = await createProgression(chordNotes, chordLength, chordTimingBeat, chordStartPosition);  
  console.log(progression);
  const part = new Tone.Part((time, chord) => {
    synth.triggerAttackRelease(chord.notes, chord.duration, time);
  }, progression).start(0);

  Tone.getTransport().bpm.value = bpm; // Set tempo
  Tone.getTransport().start(); // Start the transport
  console.log('bpm', bpm);
  console.log('chordNotes', chordNotes);
  console.log('chordLength', chordLength);
  console.log('chordStartPosition', chordStartPosition);
  console.log('chordTimingBeat', chordTimingBeat);
};


const createProgression = async (chordNotes: string[][], chordLength: number[], chordTimingBeat: number[], chordStartPosition: number[]) => {
  
  return chordNotes.map((chord: any, index: any) => ({
    time: `${chordStartPosition[index]}:${chordTimingBeat[index]}`,
    notes: chord,
    duration: `${chordLength[index]}m`,
  }));
};