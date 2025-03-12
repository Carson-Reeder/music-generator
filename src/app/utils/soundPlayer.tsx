"use client";
import * as Tone from "tone";

import { MeasureStoreType } from "../stores/MeasureStore";
import { ArrangementStoreType } from "../stores/ArrangementStore";
import { StoreApi, UseBoundStore } from "zustand";
import { useInstrumentStore } from "../stores/InstrumentStore";
import { useEffect } from "react";
import { ChordType } from "../stores/MeasureStore";
// Store all instruments in a cache to avoid reloading them
let loadedInstruments: { [id: string]: Tone.Sampler } = {};
let currentMeasureStore: UseBoundStore<StoreApi<MeasureStoreType>> | null =
  null;
let currentPart: Tone.Part | null = null;

type ProgressionType = {
  time: string;
  notes: string[];
  duration: number;
}[];

type loadInstrumentProps = {
  measureStore: UseBoundStore<StoreApi<MeasureStoreType>>;
};

type playNotesProps = {
  notes: string[];
  measureStore: UseBoundStore<StoreApi<MeasureStoreType>>;
};

type PlayMeasureProps = {
  measureStore: UseBoundStore<StoreApi<MeasureStoreType>>;
  arrangementStore: UseBoundStore<StoreApi<ArrangementStoreType>>;
  compositionId: string;
  transportState: string | null;
  reason: string;
};

type CreatePartType = {
  measureStore: UseBoundStore<StoreApi<MeasureStoreType>>;
  progression: ProgressionType;
};
// This function will create an object that contains each note and their timings, this
// object is used by Tonejs and passed into Tone.Part
// Called when: measureStore.getState().chords changes, the user clicks the play/pause
// button
const createProgression = async (chords: ChordType[]) => {
  const chordsArray = chords.map((c) => c.notes);
  const chordLength = chords.map((c) => c.length);
  const chordTimingBeat = chords.map((c) => c.chordTimingBeat);
  const chordStartPosition = chords.map((c) => c.startPosition);
  return chordsArray.map((chord: any, index: any) => ({
    time: `${chordStartPosition[index]}:${chordTimingBeat[index]}`,
    notes: chord,
    duration: Tone.Time("1m").toSeconds() * chordLength[index],
  }));
};
// This function will create a Tone.Part and dispose of the old part
// Called when: a new part needs to be created because of changes to chords
const createPart = async ({ measureStore, progression }: CreatePartType) => {
  const sampler = await loadInstrument({ measureStore });
  if (!sampler) {
    console.error("Sampler not loaded");
    return null;
  }
  if (currentPart) {
    currentPart.dispose();
  }
  await Tone.loaded();
  const part = new Tone.Part((time, chord) => {
    chord.notes.forEach((note: any) => {
      sampler.triggerAttackRelease(note, chord.duration, time);
    });
  }, progression).start(0);
  currentPart = part;
};
// This function will stop the transport, set isPlaying to false
// for all measures and set allPlaying to false.
// Called when: All measures are playing and the user clicks the play/pause button
// on a specific measure.
const handleAllPlaying = async (
  arrangementStore: UseBoundStore<StoreApi<ArrangementStoreType>>
) => {
  const transport = Tone.getTransport();
  const { setAllPlaying, stores } = arrangementStore.getState();
  transport.stop();
  transport.cancel();
  transport.position = "0:0:0";
  if (Array.isArray(stores)) {
    for (const measure of stores) {
      measure.store.setState({ isPlaying: false });
    }
  }
  setAllPlaying(false);
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
    return null;
  }

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
    await Tone.loaded();
  } else {
  }
  return loadedInstruments[instrument.id];
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
  });
};

// Can be used to schedule a progression of notes to be played
export const playMeasure = async ({
  measureStore,
  arrangementStore,
  compositionId,
  transportState,
  reason,
}: PlayMeasureProps) => {
  const transport = Tone.getTransport();
  const { bpm, loop, numMeasures, allPlaying, setAllPlaying, stores } =
    arrangementStore.getState();
  const { chords, instrument, measureProgress } = measureStore.getState();
  let progression: ProgressionType;
  // If all measures are playing, stop them all and set allPlaying/isPlaying
  // to false for all measures
  if (allPlaying) handleAllPlaying(arrangementStore);
  switch (reason) {
    // Function being called from play/pause button
    case "button":
      switch (transport.state) {
        // (KEEP PART) If the transport is started, pause it
        case "started":
          if (measureStore == currentMeasureStore) {
            transport.pause();
          } else {
            // (NEW PART)
            transport.stop();
            playMeasure({
              measureStore,
              arrangementStore,
              compositionId,
              transportState,
              reason: "button",
            });
          }
          return;
        // (KEEP PART) If the transport is paused, start it again
        case "paused":
          if (measureStore == currentMeasureStore) {
            transport.start();
          } else {
            // (NEW PART)
            transport.stop();
            playMeasure({
              measureStore,
              arrangementStore,
              compositionId,
              transportState,
              reason: "button",
            });
          }
          return;
        // (NEW PART) If the transport is stopped, set everything up again
        case "stopped":
          Tone.getTransport().cancel();
          Tone.getTransport().bpm.value = bpm;
          Tone.getTransport().loop = true;
          console.log("numMeasures:", numMeasures);
          Tone.getTransport().loopEnd = `${numMeasures}m`;

          const progression = await createProgression(chords);

          if (arrangementStore.getState().currentPart != null) {
            arrangementStore.getState().currentPart?.dispose();
          }
          await createPart({ measureStore, progression });
          Tone.getTransport().start();
          if (currentMeasureStore) {
            currentMeasureStore.setState({ isPlaying: false });
          }
          measureStore.setState({ isPlaying: true });
          currentMeasureStore = measureStore;
          return;
      }
    case "measureUpdate":
      console.log("measureUpdate");
      progression = await createProgression(chords);
      //transport.pause();
      transport.cancel();
      Tone.getTransport().bpm.value = bpm;
      Tone.getTransport().loop = true;
      Tone.getTransport().loopEnd = `${numMeasures}m`;

      if (arrangementStore.getState().currentPart != null) {
        arrangementStore.getState().currentPart?.dispose();
      }
      await createPart({ measureStore, progression });
      if (currentMeasureStore) {
        currentMeasureStore.setState({ isPlaying: false });
      }
      measureStore.setState({ isPlaying: true });
      currentMeasureStore = measureStore;
      if (transportState === "started") {
        transport.start();
      }
      return;
  }
};

export const playAllMeasures = async (
  arrangementStore: UseBoundStore<StoreApi<ArrangementStoreType>>
) => {
  const { stores, setAllPlaying } = arrangementStore.getState();
  setAllPlaying(true);

  if (!stores || stores.length === 0) {
    console.log("No measures to play.");
    return;
  }
  await Tone.loaded();

  Tone.getTransport().pause();
  Tone.getTransport().cancel();
  Tone.getTransport().stop();

  // Load all instruments before playing
  await Promise.all(
    stores.map((measure) => loadInstrument({ measureStore: measure.store }))
  );

  let parts: Tone.Part[] = [];

  // Iterate over each measure to create its own Tone.Part
  for (const measure of stores) {
    measure.store.setState({ isPlaying: true });
    const { chords } = measure.store.getState();
    const { instrument } = measure.store.getState();
    const sampler = loadedInstruments[instrument.id];

    if (!sampler) {
      console.error("Sampler not loaded for measure", measure);
      continue;
    }

    // Build progression for this measure
    const progression = await createProgression(chords);

    // Create and store a Tone.Part for this measure
    const part = new Tone.Part((time, chord) => {
      chord.notes.forEach((note: string) => {
        sampler.triggerAttackRelease(note, chord.duration, time);
      });
    }, progression).start();

    parts.push(part);
  }

  // Start playback with slight delay to ensure timing consistency
  Tone.getTransport().start();
};
