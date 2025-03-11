import { UseBoundStore, StoreApi } from "zustand";
import { MeasureStoreType } from "../../stores/MeasureStore";
import { ArrangementStoreType } from "../../stores/ArrangementStore";
import { playMeasure } from "../../utils/soundPlayer";
import { useInstrumentStore } from "../../stores/InstrumentStore";
import ShowInstruments from "../ShowInstruments/page";

type MeasureToolbarProps = {
  measureStore: UseBoundStore<StoreApi<MeasureStoreType>>;
  arrangementStore: UseBoundStore<StoreApi<ArrangementStoreType>>;
  compositionId: number;
};

export default function MeasureToolbar({
  measureStore,
  arrangementStore,
  compositionId,
}: MeasureToolbarProps) {
  const { setIsInstrumentClicked } = measureStore();
  const { setToolBarSelector, toolBarSelector } = measureStore();
  return (
    <div
      className="flex bg-gray-200 mb-2 mr-2 ml-2 border border-0 h-8 p-0"
      style={{
        borderRadius: "0.5rem",
        overflow: "hidden",
        zIndex: 9999,
        boxShadow: "0rem 0rem .25rem .2rem rgba(93, 148, 125, 0.57)",
        backgroundColor: "transparent",
        height: "2rem",
      }}
    >
      <button
        className="bg-gray-300 pl-0 pr-1"
        style={{
          backgroundColor: "rgba(1, 255, 158, 0.12)",
          boxShadow: "0rem 0rem .2rem .1rem rgba(93, 148, 125, 0.57)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          width: "6rem",
        }}
        onClick={() => {
          setToolBarSelector("note");
        }}
      >
        + Note
      </button>
      <button
        className="bg-gray-300 pl-0"
        style={{
          backgroundColor: "rgba(1, 255, 158, 0.12)",
          boxShadow: "0rem 0rem .2rem .1rem rgba(93, 148, 125, 0.57)",
          width: "8rem",
        }}
        onClick={() =>
          playMeasure({
            measureStore,
            arrangementStore,
            compositionId,
            transportState: null,
            reason: "button",
          })
        }
      >
        Play/Pause
      </button>
      <div
        style={{
          //position: "relative",
          width: "8rem",
          height: "100%",
        }}
      >
        <button
          className="bg-gray-300 pl-0"
          style={{
            backgroundColor: "rgba(1, 255, 158, 0.12)",
            boxShadow: "0rem 0rem .2rem .1rem rgba(93, 148, 125, 0.57)",
            width: "100%",
            height: "100%",
          }}
          onClick={() => setToolBarSelector("instrument")}
        >
          Instrument
        </button>
        <ShowInstruments
          measureStore={measureStore}
          arrangementStore={arrangementStore}
          compositionId={compositionId}
        />
      </div>
      <style jsx>{`
        button:focus {
          outline: 0.25rem solid black;
          outline-offset: -0.25rem;
        }
      `}</style>
    </div>
  );
}
