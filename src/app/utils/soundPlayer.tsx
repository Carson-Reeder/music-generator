"use client";
import * as Tone from "tone";

import { MeasureStoreType } from "../stores/MeasureStore";
import { ArrangementStoreType } from "../stores/ArrangementStore";
import { StoreApi, UseBoundStore } from "zustand";
import { useInstrumentStore } from "../stores/InstrumentStore";
import { useState } from "react";
// Store all instruments in a cache to avoid reloading them
let loadedInstruments: { [id: string]: Tone.Sampler } = {};

type loadInstrumentProps = {
  measureStore: UseBoundStore<StoreApi<MeasureStoreType>>;
};

type playNotesProps = {
  notes: string[];
  measureStore: UseBoundStore<StoreApi<MeasureStoreType>>;
};

type PlayNotesProgressionProps = {
  measureStore: UseBoundStore<StoreApi<MeasureStoreType>>;
  arrangementStore: UseBoundStore<StoreApi<ArrangementStoreType>>;
};

const createProgression = async (
  chordNotes: string[][],
  chordLength: number[],
  chordTimingBeat: number[],
  chordStartPosition: number[]
) => {
  return chordNotes.map((chord: any, index: any) => ({
    time: `${chordStartPosition[index]}:${chordTimingBeat[index]}`,
    notes: chord,
    duration: Tone.Time("1m").toSeconds() * chordLength[index],
  }));
};

export const loadInstrument = async ({ measureStore }: loadInstrumentProps) => {
  const { instrument } = measureStore.getState();
  const { instruments } = useInstrumentStore.getState();

  // Find the selected instrument data.
  const selectedInstrument = instruments.find(
    (inst: any) => inst.id === instrument.id
  );
  if (!selectedInstrument) {
    console.error("Selected instrument not found");
    return;
  }
  console.log("Selected instrument:", selectedInstrument);

  // If we don't have the sampler cached, create it.
  if (!loadedInstruments[instrument.id]) {
    const compressor = new Tone.Compressor(-40, 4).toDestination();

    var sampler = new Tone.Sampler({
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
      attack: 0.5,
    });

    sampler.connect(compressor);
    loadedInstruments[instrument.id] = sampler;
    console.log("Loaded new sampler for instrument:", instrument.id);
  } else {
    console.log("Using cached sampler for instrument:", instrument.id);
  }

  await Tone.loaded();
  //sampler.triggerAttackRelease("C4", 0.5, Tone.now() * 1.01, 0.25);
};

// Can be used to play one note or multiple notes at the same time
export const playNotes = async ({ notes, measureStore }: playNotesProps) => {
  const { instrument } = measureStore.getState();
  await loadInstrument({ measureStore });
  const sampler = loadedInstruments[instrument.id];

  if (!sampler) console.error("Sampler not loaded");
  if (!notes) console.error("No notes to play");
  if (Tone.context.state !== "running") await Tone.start();

  notes.forEach((note) => {
    sampler.triggerAttackRelease(note, "4n", Tone.now() * 1.0);
    console.log(Tone.now());
  });
};

// Can be used to schedule a progression of notes to be played
export const playNotesProgression = async ({
  measureStore,
  arrangementStore,
}: PlayNotesProgressionProps) => {
  Tone.getTransport().stop();
  Tone.getTransport().cancel();

  const { instrument } = measureStore.getState();
  await loadInstrument({ measureStore });
  const sampler = loadedInstruments[instrument.id];

  if (!sampler) console.error("Sampler not loaded");
  if (Tone.context.state !== "running") await Tone.start();

  const { chords } = measureStore.getState();
  const { bpm, loop, loopLength } = arrangementStore.getState();

  Tone.getTransport().bpm.value = bpm;
  Tone.getTransport().loop = loop;
  Tone.getTransport().loopEnd = "{numMeasures}m";
  Tone.getTransport().loopStart = "0m";

  // Create progression so that a single array can be passed into Tone.Part
  const progression = await createProgression(
    chords.map((c) => c.notes), // Contains notes
    chords.map((c) => c.length), // Contains note lengths
    chords.map((c) => c.chordTimingBeat), // Contains note timings
    chords.map((c) => c.startPosition) // Contains note start positions
  );

  let part = new Tone.Part((time, chord) => {
    chord.notes.forEach((note: any) => {
      sampler.triggerAttackRelease(note, chord.duration, time);
    });
  }, progression).start();
  Tone.getTransport().start("+0.05");
};

export const playAllMeasures = async (
  arrangementStore: UseBoundStore<StoreApi<ArrangementStoreType>>
) => {
  const { stores } = arrangementStore.getState();

  if (!stores || stores.length === 0) {
    console.log("No measures to play.");
    return;
  }

  Tone.getTransport().cancel();
  Tone.getTransport().stop();

  // Load all instruments before playing
  await Promise.all(
    stores.map((measure) => loadInstrument({ measureStore: measure.store }))
  );

  let parts: Tone.Part[] = [];

  // Iterate over each measure to create its own Tone.Part
  for (const measure of stores) {
    const { chords } = measure.store.getState();
    const { instrument } = measure.store.getState();
    const sampler = loadedInstruments[instrument.id];

    if (!sampler) {
      console.error("Sampler not loaded for measure", measure);
      continue;
    }

    // Build progression for this measure
    const progression = await createProgression(
      chords.map((c) => c.notes),
      chords.map((c) => c.length),
      chords.map((c) => c.chordTimingBeat),
      chords.map((c) => c.startPosition)
    );

    // Create and store a Tone.Part for this measure
    const part = new Tone.Part((time, chord) => {
      chord.notes.forEach((note: string) => {
        sampler.triggerAttackRelease(note, chord.duration, time);
      });
    }, progression).start();

    parts.push(part);
  }

  // Start playback with slight delay to ensure timing consistency
  Tone.getTransport().start("+0.05");
};
