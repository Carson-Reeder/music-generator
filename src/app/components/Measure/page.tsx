import { UseBoundStore, StoreApi } from "zustand";
import { useState, useEffect } from "react";
import * as Tone from "tone";
import { MeasureStoreType } from "../../stores/MeasureStore";
import { ArrangementStoreType } from "../../stores/ArrangementStore";
import MeasureBackground from "./MeasureBackground/page";
import MeasureLines from "./MeasureLines/page";
import Chord from "./Chord/page";
import PlaybackSlider from "./PlaybackSlider/PlaybackSlider";

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
        overflow: "visible",
      }}
    >
      <MeasureBackground numMeasures={numMeasures} />
      <MeasureLines numMeasures={numMeasures} />

      {/* Moving slider */}
      {isPlaying && (
        <PlaybackSlider
          compositionId={compositionId}
          arrangementStore={arrangementStore}
          measureStore={measureStore}
        />
      )}

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
