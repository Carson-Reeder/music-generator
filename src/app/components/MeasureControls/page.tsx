import { UseBoundStore, StoreApi } from "zustand";
import { ArrangementStoreType } from "../../stores/ArrangementStore";
import { MeasureStoreType } from "../../stores/MeasureStore";
import MeasureLabel from "../MeasureLabel/page";
import AddMeasureLength from "./AddMeasureLength";
import RemoveMeasureLength from "./RemoveMeasureLength";
import AddWidthMeasure from "./AddWidthMeasure";
import RemoveWidthMeasure from "./RemoveWidthMeasure";

type MeasureControlsProps = {
  arrangementStore: UseBoundStore<StoreApi<ArrangementStoreType>>;
};

export default function MeasureControls({
  arrangementStore,
}: MeasureControlsProps) {
  return (
    <div className="measure-label-parent mr-2">
      <div className="measure-label-child">
        <AddMeasureLength arrangementStore={arrangementStore} />
        <RemoveMeasureLength arrangementStore={arrangementStore} />
      </div>
      <div className="measure-label-child">
        <AddWidthMeasure arrangementStore={arrangementStore} />
        <RemoveWidthMeasure arrangementStore={arrangementStore} />
      </div>
    </div>
  );
}
