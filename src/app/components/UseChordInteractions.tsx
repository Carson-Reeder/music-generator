import { useEffect } from "react";
import interact from "interactjs";
import { UseBoundStore, StoreApi } from "zustand";
import { MeasureStoreType } from "../stores/MeasureStore";
import { ArrangementStoreType } from "../stores/ArrangementStore";

export default function useChordInteractions(
  compositionId: number,
  measureStore: UseBoundStore<StoreApi<MeasureStoreType>>,
  arrangementStore: UseBoundStore<StoreApi<ArrangementStoreType>>
) {
  useEffect(() => {
    interact(`.draggable-${compositionId}`)
      .draggable({
        inertia: true,
        autoScroll: true,
        modifiers: [
          interact.modifiers.restrictRect({ restriction: "parent", endOnly: true }),
        ],
        listeners: {
          move(event) {
            const target = event.target;
            const x = (parseFloat(target.getAttribute("data-x")) || 0) + event.dx;
            target.style.transform = `translateX(${x}px)`;
            target.setAttribute("data-x", x);
          },
        },
      });
  }, [compositionId]);
}