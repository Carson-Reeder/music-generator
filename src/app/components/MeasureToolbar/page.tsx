import { UseBoundStore, StoreApi } from "zustand";
import { MeasureStoreType } from "../../stores/MeasureStore";
import { ArrangementStoreType } from "../../stores/ArrangementStore";
import { playMeasure } from "../../utils/soundPlayer";
import { useInstrumentStore } from "../../stores/InstrumentStore";
import ShowInstruments from "../ShowInstruments/page";
import ShowNotes from "../ShowNotes/page";

type MeasureToolbarProps = {
  measureStore: UseBoundStore<StoreApi<MeasureStoreType>>;
  arrangementStore: UseBoundStore<StoreApi<ArrangementStoreType>>;
  compositionId: string;
};

const toggleToolbar = (
  toggle: string,
  measureStore: UseBoundStore<StoreApi<MeasureStoreType>>
) => {
  if (measureStore.getState().toolBarSelector === toggle) {
    measureStore.setState({ toolBarSelector: "" });
  } else {
    measureStore.setState({ toolBarSelector: toggle });
  }
};

export default function MeasureToolbar({
  measureStore,
  arrangementStore,
  compositionId,
}: MeasureToolbarProps) {
  const { setToolBarSelector, toolBarSelector } = measureStore();
  return (
    <div className="toolbar">
      <button
        className="bg-gray-300 pl-0 pr-1"
        style={{
          backgroundColor: "rgba(1, 255, 158, 0.12)",
          boxShadow: "0rem 0rem .2rem .1rem rgba(93, 148, 125, 0.57)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          width: "clamp(4rem, calc(100% / 3), 7rem)",
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
          width: "clamp(6rem, calc(100% / 3), 9rem)",
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
          width: "clamp(6rem, calc(100% / 3), 12rem)",
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
          onClick={() => toggleToolbar("instrument", measureStore)}
        >
          Instrument
        </button>
      </div>
      <ShowInstruments
        measureStore={measureStore}
        arrangementStore={arrangementStore}
        compositionId={compositionId}
      />
      <ShowNotes
        measureStore={measureStore}
        arrangementStore={arrangementStore}
        compositionId={compositionId}
      />
      <style jsx>{`
        button:focus {
          outline: 0.25rem solid black;
          outline-offset: -0.25rem;
        }
      `}</style>
    </div>
  );
}
