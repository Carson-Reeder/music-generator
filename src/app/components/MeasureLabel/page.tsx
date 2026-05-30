import React from "react";
import { UseBoundStore, StoreApi } from "zustand";
import { MeasureStoreType, TRACK_TYPES } from "../../stores/MeasureStore";

type MeasureLabelProps = {
  index: number;
  measureStore: UseBoundStore<StoreApi<MeasureStoreType>>;
};

export default function MeasureLabel({ index, measureStore }: MeasureLabelProps) {
  const { trackType, setTrackType } = measureStore();
  return (
    <div className="flex measure-label-parent flex-col justify-center items-center p-2 rounded-sm" style={{
      backgroundColor: "rgba(1, 255, 158, 0.01)",
      boxShadow: "0rem 0rem .25rem .2rem rgba(93, 148, 125, 0.57)",
      zIndex: 1,
      flexGrow: 1,
    }}>
      <label
        className="text-grey font-semibold measure-label-child mb-1"
        style={{
          color: "rgb(20, 78, 66)",
        }}
      >
        Track {index + 1}
      </label>
      <select
        value={trackType}
        onChange={(e) => setTrackType(e.target.value)}
        className="rounded text-sm p-1 border border-gray-300"
        style={{ color: "rgb(20, 78, 66)", backgroundColor: "white", outline: "none", cursor: "pointer", width: "100%", maxWidth: "12rem" }}
      >
        {TRACK_TYPES.map((type) => (
          <option key={type} value={type}>{type}</option>
        ))}
      </select>
    </div>
  );
}
