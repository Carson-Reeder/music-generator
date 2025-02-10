import React from "react";

type MeasureBackgroundProps = {
  numMeasures: number;
};

export default function MeasureBackground({ numMeasures }: MeasureBackgroundProps) {
  return (
    <>
      {Array.from({ length: numMeasures }).map((_, measureIndex) => (
        <div
          key={`measure-bg-${measureIndex}`}
          className="rounded-sm"
          style={{
            position: "absolute",
            left: `${(measureIndex * 100) / numMeasures}%`,
            width: `${100 / numMeasures}%`,
            height: "100%",
            backgroundColor: measureIndex % 2 === 0 ? "rgba(4, 150, 94, 0.4)" : "rgba(1, 255, 158, 0.12)",
            zIndex: 2,
            borderRadius: "0.2rem",
          }}
        />
      ))}
    </>
  );
}