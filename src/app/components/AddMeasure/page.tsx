import { UseBoundStore, StoreApi } from "zustand";
import { ArrangementStoreType } from "../../stores/ArrangementStore";

type AddMeasureProps = {
  arrangementStore: UseBoundStore<StoreApi<ArrangementStoreType>>;
  measureId: string;
};

export default function AddMeasure({
  arrangementStore,
  measureId,
}: AddMeasureProps) {
  const { createStore, stores } = arrangementStore();

  const addMeasure = () => {
    createStore();
  };
  return (
    <div style={{}}>
      {measureId === stores[stores.length - 1].id && (
        <button
          className="ml-0 mt-4 items-center p-1 pr-2 pl-2 rounded-sm"
          style={{
            backgroundColor: "rgba(1, 255, 158, 0.12)",
            position: "relative",
            borderRadius: "0.5rem",
            boxShadow: "0rem 0rem .25rem .2rem rgba(93, 148, 125, 0.8)",
          }}
          onClick={addMeasure}
        >
          Add New Measure
        </button>
      )}
    </div>
  );
}
