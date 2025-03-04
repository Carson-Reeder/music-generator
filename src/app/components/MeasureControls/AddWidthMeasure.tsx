import React from "react";
import { ArrangementStoreType } from "../../stores/ArrangementStore";
import { UseBoundStore, StoreApi } from "zustand";

type AddWidthMeasureProps = {
  arrangementStore: UseBoundStore<StoreApi<ArrangementStoreType>>;
};

export default function AddWidthMeasure({
  arrangementStore,
}: AddWidthMeasureProps) {
  const { widthMeasure, setWidthMeasure } = arrangementStore();
  return (
    <div className="add-measure">
      <button
        className="pb-1 flex justify-center items-center"
        onClick={() => setWidthMeasure(widthMeasure + 1)}
        style={{
          position: "relative",
          backgroundColor: "rgba(1, 255, 158, 0.12)",
          borderRadius: "0.5rem",
          minWidth: "100%",
          width: "100%",
          height: "100%",
          boxShadow: "0rem 0rem .25rem .2rem rgba(93, 148, 125, 0.8)",
        }}
      >
        +
      </button>
    </div>
  );
}
