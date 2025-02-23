"use client";
import * as Tone from "tone";

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
// Keep track of active samplers
let lastNotesPlayed: string[] = [];
let activeSynths: { sampler: Tone.Sampler; lastNotesPlayed: string[] }[] = [];

function cancelActiveNotes(notes: string[], sampler: Tone.Sampler) {
  if (activeSynths.length === 0) {
    lastNotesPlayed = notes;
    return;
  }
  activeSynths.forEach(({ sampler, lastNotesPlayed }) =>
    sampler.triggerRelease(lastNotesPlayed)
  );
  lastNotesPlayed = notes;
  activeSynths.push({ sampler: sampler, lastNotesPlayed });
}

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
    const compressor = new Tone.Compressor(-40, 4).toDestination();

    sampler = new Tone.Sampler({
      urls: {
        ...selectedInstrument.knownNotes.reduce(
          (acc, note) => ({
            ...acc,
            [note]: `${selectedInstrument.category}/${selectedInstrument.name}/${note}.mp3`,
          }),
          {}
        ),
      },
      baseUrl: "Instruments/",
      onerror: (error) => {
        console.error("Sampler error:", error);
      },
      onload: () => {},
      attack: 0.05, // Smooth fade-out
    });

    // Connect the sampler to the filter before sending it to the destination
    sampler.connect(compressor);

    loadedInstruments[instrument.id] = sampler;
    console.log("Loaded new sampler for instrument:", instrument.id);
  } else {
    sampler = loadedInstruments[instrument.id];
    console.log("Using cached sampler for instrument:", instrument.id);
  }

  await Tone.loaded();
  sampler.triggerAttackRelease("C4", 0.5, Tone.now() * 1.01, 0.25);
};

export const playChord = async ({ notes, measureStore }: playChordsProps) => {
  const { instrument } = measureStore.getState();
  const sampler = loadedInstruments[instrument.id];
  cancelActiveNotes(notes, sampler);

  await Tone.start();
  await Tone.loaded();

  notes.forEach((note) => {
    const detune = Math.random() * 0.5 - 0.25; // Slight detuning
    sampler.triggerAttackRelease(
      Tone.Frequency(note).transpose(detune).toFrequency(),
      "4n",
      Tone.now(),
      Math.random() * 0.2 + 0.8 // Slight velocity variation
    );
  });
};

export const playChordProgression = async (
  chordNotes: string[][],
  bpm: number,
  chordLength: number[],
  chordStartPosition: number[],
  chordTimingBeat: number[],
  measureStore: UseBoundStore<StoreApi<MeasureStoreType>>
) => {
  const { instrument } = measureStore.getState();
  const sampler = loadedInstruments[instrument.id];

  Tone.getTransport().stop();
  Tone.getTransport().cancel();
  Tone.getTransport().position = "0:0";
  Tone.getTransport().bpm.value = bpm;

  const progression = await createProgression(
    chordNotes,
    chordLength,
    chordTimingBeat,
    chordStartPosition
  );

  let part = new Tone.Part((time, chord) => {
    chord.notes.forEach((note: any) => {
      const detune = Math.random() * 0.05 - 0.025; // Slight detuning
      sampler.triggerAttackRelease(
        Tone.Frequency(note).transpose(detune).toFrequency(),
        chord.duration,
        time,
        Math.random() * 0.2 + 0.8 // Slight velocity variation
      );
    });
  }, progression).start();

  Tone.getTransport().start("+0.05");
};
export const playMeasure = async (
  measureStore: UseBoundStore<StoreApi<MeasureStoreType>>,
  arrangementStore: UseBoundStore<StoreApi<ArrangementStoreType>>,
  measureId: number
) => {
  const { chords, bpm } = measureStore.getState();
  const { numMeasures, widthMeasure, loop, loopLength } =
    arrangementStore.getState();
  playChordProgression(
    chords.map((c) => c.notes),
    bpm,
    chords.map((c) => c.length),
    chords.map((c) => c.startPosition),
    chords.map((c) => c.chordTimingBeat),
    measureStore
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
  const { stores } = arrangementStore.getState();

  if (!stores || stores.length === 0) {
    console.log("No measures to play.");
    return;
  }

  let allChords: string[][] = [];
  let allLengths: number[] = [];
  let allStartPositions: number[] = [];
  let allTimings: number[] = [];
  let measureStores: UseBoundStore<StoreApi<MeasureStoreType>>[] = [];

  for (const measure of stores) {
    const state = measure.store.getState();

    // Load instrument if needed
    await loadInstrument({ measureStore: measure.store });

    allChords.push(...state.chords.map((c) => c.notes));
    allLengths.push(...state.chords.map((c) => c.length));
    allStartPositions.push(...state.chords.map((c) => c.startPosition));
    allTimings.push(...state.chords.map((c) => c.chordTimingBeat));
    measureStores.push(measure.store);
  }

  // Play all measures sequentially
  for (const measureStore of measureStores) {
    await playChordProgression(
      allChords,
      120,
      allLengths,
      allStartPositions,
      allTimings,
      measureStore
    );
  }
};
