import { UseBoundStore, StoreApi } from "zustand";
import { ArrangementStoreType } from "../../stores/ArrangementStore";

type RemoveMeasureProps = {
  arrangementStore: UseBoundStore<StoreApi<ArrangementStoreType>>;
  measureId: number;
};

export default function RemoveMeasure({
  arrangementStore,
  measureId,
}: RemoveMeasureProps) {
  const { removeStore, stores } = arrangementStore();

  const removeComposition = (targetId: number) => {
    removeStore(targetId);
  };
  return (
    <div>
      {stores.length !== 1 && (
        <button
          className="mr-4 items-center p-1 rounded-sm"
          style={{
            backgroundColor: "rgba(203, 22, 100, 0.32)",
            position: "relative",
            //outline: '0.1rem solid #1E291E',
            borderRadius: "0.5rem",
            boxShadow: "0rem 0rem .25rem .2rem rgba(101, 30, 58, 0.52)",
          }}
          onClick={() => removeComposition(measureId)}
        >
          Delete
        </button>
      )}
    </div>
  );
}
