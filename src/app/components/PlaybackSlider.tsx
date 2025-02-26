import * as Tone from "tone";
import interact from "interactjs";
import { useEffect } from "react";
import { UseBoundStore, StoreApi } from "zustand";
import { MeasureStoreType } from "../stores/MeasureStore";
import { ArrangementStoreType } from "../stores/ArrangementStore";

type PlaybackSliderProps = {
  sliderPosition: number;
  compositionId: number;
  arrangementStore: UseBoundStore<StoreApi<ArrangementStoreType>>;
  measureStore: UseBoundStore<StoreApi<MeasureStoreType>>;
};

export default function PlaybackSlider({
  sliderPosition,
  compositionId,
  arrangementStore,
  measureStore,
}: PlaybackSliderProps) {
  const { chords, setChordTiming, setChordLength, setChordStartPosition } =
    measureStore();
  const { widthMeasure } = arrangementStore();
  const pxToRem = (px: number) =>
    px / parseFloat(getComputedStyle(document.documentElement).fontSize);
  const remToPx = (rem: number) =>
    rem * parseFloat(getComputedStyle(document.documentElement).fontSize);
  // Convert chord position in parent element to chord indexBeat and indexMeasure
  const relativeXtoChordPosition = (id: string, relativeX: number) => {
    const relativeXRem = pxToRem(relativeX); // Convert px to rem
    // Calculate indexMeasure and indexBeat
    // indexBeat is from 0-4 with 0.5 increments
    // indexMeasure is from 0-numMeasures with 1.0 increments
    let indexMeasure = Math.floor(relativeXRem / widthMeasure);
    let indexBeat =
      Math.round(((relativeXRem % widthMeasure) / widthMeasure) * 8) / 2;
    // If indexBeat is 4, that is equal to increase of indexMeasure by 1
    if (indexBeat >= 4) {
      indexBeat = indexBeat - 4;
      indexMeasure += 1;
    }
    // Set new chord positions
    Tone.getTransport().position = `${indexMeasure}:${indexBeat}:0`;
    //setChordStartPosition(id, indexMeasure);
    //setChordTiming(id, indexBeat);
  };
  useEffect(() => {
    interact(`.draggableSlider-${compositionId}`).draggable({
      inertia: true,
      autoScroll: true,
      allowFrom: "*",
      modifiers: [
        interact.modifiers.restrictRect({
          restriction: "parent",
          endOnly: true,
        }),
        interact.modifiers.snap({
          targets: [
            (x, y) => {
              const parent = document.querySelector(".measure-container");
              if (!parent) return { x: 0, y: 0 };
              const parentRect = parent.getBoundingClientRect();
              return {
                // Snap to 1/8th of a measure
                x:
                  Math.round(
                    (x - parentRect.left) / (remToPx(widthMeasure) / 8)
                  ) *
                    (remToPx(widthMeasure) / 8) +
                  parentRect.left,
                y,
              };
            },
          ],
          range: Infinity,
          relativePoints: [{ x: 0, y: 0 }],
        }),
      ],
      listeners: {
        move: dragMoveListener,
        end(event) {
          const id = event.target.getAttribute("data-id");
          // Calculate rem distance of chord from far left of measure container
          const parentRect = event.target.parentNode.getBoundingClientRect();
          const targetRect = event.target.getBoundingClientRect();
          const relativeX = targetRect.left - parentRect.left;
          relativeXtoChordPosition(id, relativeX);
          // Reset position (chords jump around without this)
          event.target.style.transform = "none";
          event.target.setAttribute("data-x", "0");
          event.target.setAttribute("data-y", "0");
        },
      },
    });
  });

  // Boilerplate interact.js function for dragging chords
  function dragMoveListener(event: any) {
    var target = event.target;
    var x = (parseFloat(target.getAttribute("data-x")) || 0) + event.dx;
    var y = (parseFloat(target.getAttribute("data-y")) || 0) + event.dy;
    target.style.transform = "translate(" + x + "px, " + y + "px)";
    target.setAttribute("data-x", x);
    target.setAttribute("data-y", y);
    event.preventDefault();
  }
  return (
    <div
      className={`slider draggable draggableSlider-${compositionId} rounded-md`}
      style={{
        position: "absolute",
        top: 0,
        bottom: 0,
        left: `${sliderPosition}%`,
        width: "0.25rem",
        backgroundColor: "rgba(161, 125, 238, 1)",
        borderRadius: "0.2rem",
        border: "0.02rem solid rgb(209, 190, 251)",
        boxShadow: "0rem 0rem 1.5rem 0.5rem rgba(157, 154, 171, 0.57)",
        transition: "left 0.02s linear",
        zIndex: 10,
      }}
    />
  );
}
