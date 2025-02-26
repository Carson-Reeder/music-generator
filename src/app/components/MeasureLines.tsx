import React from "react";

type MeasureLinesProps = {
  numMeasures: number;
};

export default function MeasureLines({ numMeasures }: MeasureLinesProps) {
  return (
    <>
      {Array.from({ length: numMeasures * 8 }, (_, i) => {
        if (i === 0) return null;
        const isEndOfMeasure = i % 8 === 0;
        const isMiddleOfMeasure = i % 8 === 4;
        const lineWidth = isEndOfMeasure ? 3.25 : isMiddleOfMeasure ? 1.875 : 1;

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${(i * 100) / (numMeasures * 8)}%`,
              top: "50%",
              width: `${lineWidth}px`,
              height: "7.25rem",
              background: isEndOfMeasure
                ? "#1E291E"
                : isMiddleOfMeasure
                ? "#1A1A1A"
                : "#4C5A60",
              transform: "translateX(-50%) translateY(-50%)",
              zIndex: 2,
              borderRadius: "0.5rem",
            }}
          />
        );
      })}
    </>
  );
}
