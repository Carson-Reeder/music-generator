"use client";
import { UseBoundStore, StoreApi } from "zustand";
import { useState, useEffect } from "react";
import * as Tone from "tone";
import { MeasureStoreType } from "../stores/MeasureStore";
import { ArrangementStoreType } from "../stores/ArrangementStore";
import MeasureBackground from "./MeasureBackground";
import MeasureLines from "./MeasureLines";
import Chord from "./Chord";
import PlaybackSlider from "./PlaybackSlider";

type MeasureProps = {
  measureStore: UseBoundStore<StoreApi<MeasureStoreType>>;
  compositionId: number;
  arrangementStore: UseBoundStore<StoreApi<ArrangementStoreType>>;
};

export default function Measure({
  measureStore,
  compositionId,
  arrangementStore,
}: MeasureProps) {
  const { isPlaying, chords } = measureStore();
  const { widthComposition, numMeasures } = arrangementStore();

  const beatsPerMeasure = 4;
  const totalBeats = numMeasures * beatsPerMeasure;

  const [sliderPosition, setSliderPosition] = useState(0);

  useEffect(() => {
    const transport = Tone.getTransport();

    const updatePosition = () => {
      const [bars, beats, sixteenths] = String(transport.position)
        .split(":")
        .map(Number);

      const currentBeat = bars * beatsPerMeasure + beats + sixteenths / 4;
      const progress = currentBeat / totalBeats;
      if (progress >= 1) {
        transport.stop();
        setSliderPosition(0);
      }
      setSliderPosition(progress * 100);
    };

    const interval = setInterval(updatePosition, 50); // Update every 50ms

    return () => clearInterval(interval);
  }, [numMeasures, beatsPerMeasure, totalBeats]);

  return (
    <div
      className="measure-container"
      style={{
        width: `${widthComposition}rem`,
        height: "4.5rem",
        position: "relative",
        borderRadius: "0.2rem",
        zIndex: 3,
        alignItems: "center",
        boxShadow: "0rem 0rem .25rem .2rem rgba(93, 148, 125, 0.57)",
        overflow: "hidden",
      }}
    >
      <MeasureBackground numMeasures={numMeasures} />
      <MeasureLines numMeasures={numMeasures} />

      {/* Moving slider */}
      {isPlaying && <PlaybackSlider sliderPosition={sliderPosition} />}

      {/* Render chords */}
      {chords.map((chord) => (
        <Chord
          key={chord.id}
          chord={chord}
          compositionId={compositionId}
          measureStore={measureStore}
          arrangementStore={arrangementStore}
        />
      ))}
    </div>
  );
}
