import * as Tone from "tone";
import interact from "interactjs";
import { useEffect, useState } from "react";
import { UseBoundStore, StoreApi } from "zustand";
import { MeasureStoreType } from "../stores/MeasureStore";
import { ArrangementStoreType } from "../stores/ArrangementStore";
import { relative } from "path";

const sliderWidth = 0.3; // Width of the slider in rem

type PlaybackSliderProps = {
  compositionId: number;
  arrangementStore: UseBoundStore<StoreApi<ArrangementStoreType>>;
  measureStore: UseBoundStore<StoreApi<MeasureStoreType>>;
};

export default function PlaybackSlider({
  compositionId,
  arrangementStore,
  measureStore,
}: PlaybackSliderProps) {
  const { chords, setChordTiming, setChordLength, setChordStartPosition } =
    measureStore();
  const { widthMeasure, numMeasures } = arrangementStore();
  const [sliderPosition, setSliderPosition] = useState(0);
  const beatsPerMeasure = 4;
  const totalBeats = numMeasures * beatsPerMeasure;
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
    } else if (indexBeat < 0) {
      indexBeat = 0;
    }
    if (indexMeasure < 0) {
      indexMeasure = 0;
    }
    // Set new chord positions
    Tone.getTransport().position = `${indexMeasure}:${indexBeat}:0`;
    console.log("indexMeasure", indexMeasure);
    console.log("indexBeat", indexBeat);
    //setChordStartPosition(id, indexMeasure);
    //setChordTiming(id, indexBeat);
  };
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
  useEffect(() => {
    interact(`.draggableSlider-${compositionId}`).draggable({
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

              // Ensure snapping stays within bounds
              const snappedX = Math.max(
                parentRect.left, // Prevent moving too far left
                Math.round(
                  (x - parentRect.left) / (remToPx(widthMeasure) / 8)
                ) *
                  (remToPx(widthMeasure) / 8) +
                  parentRect.left
              );
              return {
                x: snappedX - remToPx(sliderWidth) / 2, // Adjust for slider width
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
          // Calculate rem distance of slider from far left of measure container
          const parentRect = event.target.parentNode.getBoundingClientRect();
          const targetRect = event.target.getBoundingClientRect();
          let relativeX = targetRect.left - parentRect.left;
          if (relativeX < 0) {
            relativeX = 0;
          }
          relativeXtoChordPosition(id, relativeX);
          // Reset position (chords jump around without this)
          event.target.style.transform = "none";
          event.target.setAttribute("data-x", "0");
          event.target.setAttribute("data-y", "0");
          const transport = Tone.getTransport();
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
        },
      },
    });
  });

  // Boilerplate interact.js function for dragging chords
  function dragMoveListener(event: any) {
    var target = event.target;
    var parent = target.parentNode.getBoundingClientRect();
    var x = event.clientX - parent.left;

    // Convert x to percentage for responsive updates
    var parentWidth = parent.width;
    var newLeft = (x / parentWidth) * 100;

    // Prevent going out of bounds
    newLeft = Math.max(0, Math.min(100, newLeft));
    if (newLeft < sliderWidth) {
      newLeft = sliderWidth;
    }

    target.style.left = `calc(${newLeft}% - ${sliderWidth / 2}rem)`; // Adjust for slider width
    target.setAttribute("data-left", newLeft);
  }
  return (
    <div
      className={`slider draggable draggableSlider-${compositionId} rounded-md relative`}
      style={{
        position: "absolute",
        height: "6rem",
        top: "0rem",
        left:
          sliderPosition === 0
            ? "0rem"
            : `calc(${sliderPosition}% - ${sliderWidth / 2}rem)`,
        width: `${sliderWidth}rem`,
        backgroundColor: "rgba(161, 125, 238, 1)",
        borderRadius: "0.2rem",
        border: "0.02rem solid rgb(209, 190, 251)",
        boxShadow: "0rem 0rem 1.5rem 0.5rem rgba(157, 154, 171, 0.57)",
        transition: "left 0.05s linear",
        zIndex: 5,
      }}
    >
      {/* Invisible hitbox for better touch targeting */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          width: "2rem", // Make it wider
          height: "1.5rem", // Increase touch area
          transform: "translateX(-45%)", // Center it
          backgroundColor: "rgba(161, 125, 238, 0.15)",
          borderRadius: "0.2rem", // Invisible but interactive
          zIndex: 4,
        }}
      />
      {/* Add the bow effect using a pseudo-element */}
      <div
        style={{
          content: '""',
          position: "absolute",
          bottom: 0,
          left: 0,
          width: "200%",
          height: "1.25rem", // Height of the bow effect
          borderRadius: "50% 50% 0 0", // Rounded bottom corners for bow shape
          backgroundColor: "rgba(161, 125, 238, 1)", // Same as slider color
        }}
      />
      <div
        style={{
          content: '""',
          position: "absolute",
          bottom: 0,
          left: 0,
          width: "200%",
          transform: "translateX(-50%)",
          height: "1.25rem", // Height of the bow effect
          borderRadius: "50% 50% 0 0", // Rounded bottom corners for bow shape
          backgroundColor: "rgba(161, 125, 238, 1)", // Same as slider color
        }}
      />
    </div>
  );
}
