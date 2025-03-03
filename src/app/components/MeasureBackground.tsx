import React from "react";

type MeasureBackgroundProps = {
  numMeasures: number;
};

export default function MeasureBackground({
  numMeasures,
}: MeasureBackgroundProps) {
  return (
    <div>
      {Array.from({ length: numMeasures }).map((_, measureIndex) => (
        <div
          key={`measure-bg-${measureIndex}`}
          className="rounded-sm"
          style={{
            position: "absolute",
            left: `${(measureIndex * 100) / numMeasures}%`,
            width: `${100 / numMeasures}%`,
            height: "100%",
            backgroundColor:
              measureIndex % 2 === 0
                ? "rgba(4, 150, 94, 0.4)"
                : "rgba(1, 255, 158, 0.12)",
            zIndex: 2,
            borderRadius: "0.2rem",
          }}
        />
      ))}
      <div
        style={{
          transform: "translateY(4.5rem)",
          height: "1.5rem",
          backgroundColor: "rgba(0, 0, 0, 0.05)",
          borderRadius: "0.2rem",
          //boxShadow: "inset 0rem 0rem .25rem .2rem rgba(0, 0, 0, 0.1)",
          boxShadow: "0rem 0rem .25rem .2rem rgba(93, 148, 125, 0.57)",
        }}
      ></div>
    </div>
  );
}
