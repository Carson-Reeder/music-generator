"use client";
import * as Tone from "tone";
let activeSynths: { synth: Tone.PolySynth | Tone.Sampler, notes: string[] }[] = [];
import { MeasureStoreType } from "../stores/MeasureStore";
import { ArrangementStoreType } from "../stores/ArrangementStore";
import { StoreApi, UseBoundStore } from "zustand";

type PlayMeasureProps = {
  measureStore: UseBoundStore<StoreApi<MeasureStoreType>>;
  arrangementStore: UseBoundStore<StoreApi<ArrangementStoreType>>;
  measureId: number;
}

type PlayAllMeasuresProps = {
  measureStore: UseBoundStore<StoreApi<MeasureStoreType>>;
  arrangementStore: UseBoundStore<StoreApi<ArrangementStoreType>>;
}
const gainNode = new Tone.Gain(0.5);
const sampler = new Tone.Sampler({
    urls: {
        A4: "saxophone/A4.mp3",
        A5: "saxophone/A5.mp3",
    },
    baseUrl: "Instruments/",
    onload: () => {
        sampler.triggerAttackRelease(["C4", "E3", "G2", "B1"], 0.25, 0, 0.25); // Play a chord to test the sampler
    }
}).connect(gainNode).toDestination();




export const playChord = async (notes: string[]) => {
  // Stop any currently playing notes
  activeSynths.forEach(({ synth, notes }) => synth.triggerRelease(notes));  // Stop all active synths
  activeSynths = [];  // Reset the array of active synths

  const synth = sampler; // Create a new synth
  await Tone.start(); // Start the Tone.js context if not already started

  // Trigger the new chord
  synth.triggerAttackRelease(notes, "4n");

  // Store the new synth in the activeSynths array
  activeSynths.push({ synth, notes });
};

export const playChordProgression = async (chordNotes: string[][], bpm: number, chordLength: number[], chordStartPosition: number[], chordTimingBeat: number[]) => {
  activeSynths.forEach(({ synth, notes }) => synth.triggerRelease(notes));  // Stop all active synths
  activeSynths = [];  // Reset the array of active synths
  const synth = sampler;
  //await Tone.start(); // Ensure the audio context is running

  Tone.getTransport().stop(); // Stop the transport if it's already running
  Tone.getTransport().cancel(); // Clear all scheduled events
  Tone.getTransport().position = "0:0"; // Reset the position to the start
  Tone.getTransport().bpm.value = bpm; // Set tempo
  const progression = await createProgression(chordNotes, chordLength, chordTimingBeat, chordStartPosition);  
  console.log(progression);
  let fart = new Tone.Part((time, chord) => {
    synth.triggerAttackRelease(chord.notes, chord.duration, time);
  }, progression).start(); 
  console.log(chordStartPosition);
  console.log(chordLength);
  console.log(chordTimingBeat);
  
  Tone.getTransport().start(); // Start the transport
}
export const playMeasure = async (measureStore: UseBoundStore<StoreApi<MeasureStoreType>>, arrangementStore: UseBoundStore<StoreApi<ArrangementStoreType>>, measureId: number) => {
  const { chords, bpm } = measureStore.getState();
  const { numMeasures, widthMeasure, loop, loopLength } = arrangementStore.getState();
  console.log('chords', chords);
  console.log('bpm', bpm);
  console.log('numMeasures', numMeasures);
  console.log('widthMeasure', widthMeasure);
  console.log('loop', loop);
  console.log('loopLength', loopLength);
  playChordProgression(
    chords.map((c) => c.notes),
    bpm,
    chords.map((c) => c.length),
    chords.map((c) => c.startPosition),
    chords.map((c) => c.chordTimingBeat)
  );
}

const createProgression = async (chordNotes: string[][], chordLength: number[], chordTimingBeat: number[], chordStartPosition: number[]) => {
  console.log('chordNotes',chordNotes);
  return chordNotes.map((chord: any, index: any) => ({
    time: `${chordStartPosition[index]}:${chordTimingBeat[index]}`,
    notes: chord,
    duration: Tone.Time("1m").toSeconds() * chordLength[index],
  }));
};

export const playAllMeasures = async ( 
  arrangementStore: UseBoundStore<StoreApi<ArrangementStoreType>>
) => {
  const { stores } = arrangementStore.getState(); // Retrieve all stored measures from arrangementStore
  
  if (!stores || stores.length === 0) {
    console.log("No measures to play.");
    return;
  }

  let allChords: string[][] = [];
  let allLengths: number[] = [];
  let allStartPositions: number[] = [];
  let allTimings: number[] = [];

  // Loop through all measures and collect chord data
  stores.forEach((measure) => {
    const state = measure.store.getState();
    allChords = [...allChords, ...state.chords.map((c) => c.notes)];
    allLengths = [...allLengths, ...state.chords.map((c) => c.length)];
    allStartPositions = [...allStartPositions, ...state.chords.map((c) => c.startPosition)];
    allTimings = [...allTimings, ...state.chords.map((c) => c.chordTimingBeat)];
  });

  // Play all measures sequentially
  playChordProgression(allChords, 120, allLengths, allStartPositions, allTimings);
};