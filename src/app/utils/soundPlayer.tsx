"use client";
import * as Tone from "tone";
let activeSynths: { sampler: Tone.Sampler; notes: string[] }[] = [];
import { MeasureStoreType } from "../stores/MeasureStore";
import { ArrangementStoreType } from "../stores/ArrangementStore";
import { StoreApi, UseBoundStore } from "zustand";
import { useInstrumentStore } from "../stores/InstrumentStore";
import { useState } from "react";

type loadInstrumentProps = {
  measureStore: UseBoundStore<StoreApi<MeasureStoreType>>;
};

type playChordsProps = {
  notes: string[];
  measureStore: UseBoundStore<StoreApi<MeasureStoreType>>;
};

type PlayAllMeasuresProps = {
  measureStore: UseBoundStore<StoreApi<MeasureStoreType>>;
  arrangementStore: UseBoundStore<StoreApi<ArrangementStoreType>>;
};

// Store all instruments in a cache to avoid reloading them
let loadedInstruments: { [id: string]: Tone.Sampler } = {};

export const loadInstrument = async ({ measureStore }: loadInstrumentProps) => {
  // Ensure the audio context is running.
  await Tone.start();

  const { instrument } = measureStore.getState();
  const { instruments } = useInstrumentStore.getState();
  console.log("instrument", instrument);
  console.log("instruments", instruments);

  // Find the selected instrument data.
  const selectedInstrument = instruments.find(
    (inst: any) => inst.id === instrument.id
  );
  if (!selectedInstrument) {
    console.error("Selected instrument not found");
    return;
  }
  console.log("Selected instrument:", selectedInstrument);

  let sampler: Tone.Sampler;

  // If we don't have the sampler cached, create it.
  if (!loadedInstruments[instrument.id]) {
    sampler = new Tone.Sampler({
      urls: {
        [selectedInstrument
          .knownNotes[0]]: `${selectedInstrument.category}/${selectedInstrument.name}/${selectedInstrument.knownNotes[0]}.mp3`,
        [selectedInstrument
          .knownNotes[1]]: `${selectedInstrument.category}/${selectedInstrument.name}/${selectedInstrument.knownNotes[1]}.mp3`,
        [selectedInstrument
          .knownNotes[2]]: `${selectedInstrument.category}/${selectedInstrument.name}/${selectedInstrument.knownNotes[2]}.mp3`,
      },
      baseUrl: "Instruments/",
      onerror: (error) => {
        console.error("Sampler error:", error);
      },
      onload: () => {},
    }).toDestination();
    loadedInstruments[instrument.id] = sampler;
    console.log("Loaded new sampler for instrument:", instrument.id);
  } else {
    sampler = loadedInstruments[instrument.id];
    console.log("Using cached sampler for instrument:", instrument.id);
  }
  await Tone.loaded();
  sampler.triggerAttackRelease("C4", 0.5, Tone.now(), 0.25);
};

export const playChord = async ({ notes, measureStore }: playChordsProps) => {
  // Stop any currently playing notes
  activeSynths.forEach(({ sampler, notes }) => sampler.triggerRelease(notes)); // Stop all active synths
  activeSynths = []; // Reset the array of active synths
  const { instrument } = measureStore.getState();
  await loadInstrument({ measureStore }); // Load the instrument if not already loaded
  const sampler = loadedInstruments[instrument.id]; // Create a new synth
  await Tone.start(); // Start the Tone.js context if not already started
  await Tone.loaded(); // Ensure all samples are loaded
  // Trigger the new chord
  sampler.triggerAttackRelease(notes, "4n");

  // Store the new synth in the activeSynths array
  activeSynths.push({ sampler, notes });
};

export const playChordProgression = async (
  chordNotes: string[][],
  bpm: number,
  chordLength: number[],
  chordStartPosition: number[],
  chordTimingBeat: number[]
) => {
  activeSynths.forEach(({ synth, notes }) => synth.triggerRelease(notes)); // Stop all active synths
  activeSynths = []; // Reset the array of active synths
  const synth = sampler;
  //await Tone.start(); // Ensure the audio context is running

  Tone.getTransport().stop(); // Stop the transport if it's already running
  Tone.getTransport().cancel(); // Clear all scheduled events
  Tone.getTransport().position = "0:0"; // Reset the position to the start
  Tone.getTransport().bpm.value = bpm; // Set tempo
  const progression = await createProgression(
    chordNotes,
    chordLength,
    chordTimingBeat,
    chordStartPosition
  );
  console.log(progression);
  let fart = new Tone.Part((time, chord) => {
    synth.triggerAttackRelease(chord.notes, chord.duration, time);
  }, progression).start();
  console.log(chordStartPosition);
  console.log(chordLength);
  console.log(chordTimingBeat);

  Tone.getTransport().start(); // Start the transport
};
export const playMeasure = async (
  measureStore: UseBoundStore<StoreApi<MeasureStoreType>>,
  arrangementStore: UseBoundStore<StoreApi<ArrangementStoreType>>,
  measureId: number
) => {
  const { chords, bpm } = measureStore.getState();
  const { numMeasures, widthMeasure, loop, loopLength } =
    arrangementStore.getState();
  console.log("chords", chords);
  console.log("bpm", bpm);
  console.log("numMeasures", numMeasures);
  console.log("widthMeasure", widthMeasure);
  console.log("loop", loop);
  console.log("loopLength", loopLength);
  playChordProgression(
    chords.map((c) => c.notes),
    bpm,
    chords.map((c) => c.length),
    chords.map((c) => c.startPosition),
    chords.map((c) => c.chordTimingBeat)
  );
};

const createProgression = async (
  chordNotes: string[][],
  chordLength: number[],
  chordTimingBeat: number[],
  chordStartPosition: number[]
) => {
  console.log("chordNotes", chordNotes);
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
    allStartPositions = [
      ...allStartPositions,
      ...state.chords.map((c) => c.startPosition),
    ];
    allTimings = [...allTimings, ...state.chords.map((c) => c.chordTimingBeat)];
  });

  // Play all measures sequentially
  playChordProgression(
    allChords,
    120,
    allLengths,
    allStartPositions,
    allTimings
  );
};
