import React, { useState, useEffect, useRef } from "react";
import { UseBoundStore, StoreApi } from "zustand";
import {
  ArrangementStoreType,
  createArrangementStore,
} from "../stores/ArrangementStore";
import { playAllMeasures } from "../utils/soundPlayer";
import Measure from "./Measure";
import MeasureToolbar from "./MeasureToolbar";
import MeasureLabel from "./MeasureLabel";
import RemoveMeasure from "./RemoveMeasure";
import AddMeasure from "./AddMeasure";
import ShowInstruments from "./ShowInstruments";
import MeasureControls from "./MeasureControls";
import { ScrollSync, ScrollSyncPane } from "react-scroll-sync";

type arrangementProps = {
  arrangementStore: UseBoundStore<StoreApi<ArrangementStoreType>>;
  arrangementId: number;
};

export default function Arrangement({
  arrangementStore,
  arrangementId,
}: arrangementProps) {
  const {
    numMeasures,
    setNumMeasures,
    widthMeasure,
    setWidthMeasure,
    stores,
    createStore,
    removeStore,
  } = arrangementStore();
  const [selectedChordId, setSelectedChordId] = useState<string | null>(null); // Track last clicked chord
  const [activeChordId, setActiveChordId] = useState<string | null>(null); // Track chord being dragged

  return (
    <div style={{ zIndex: 0 }}>
      <h1 className="ml-6 pb-1">Arrangement:</h1>
      {/* Render fixedComposition components */}
      <div
        className="arrangement-container pl-6 pt-6 pb-6 m-3 pr-6"
        style={{
          backgroundColor: "rgba(93, 148, 125, 0.36)",
          //border: '0.1rem solid #1E291E',
          borderRadius: "0.5rem",
          boxShadow: "0rem 0rem .25rem .1rem rgba(93, 148, 125, 0.8)",
        }}
      >
        <button
          className="m-4"
          onClick={() => playAllMeasures(arrangementStore)}
        >
          Play All Measures
        </button>

        <ScrollSync>
          <div>
            {stores.map(({ id, store }, index) => {
              return (
                <div key={id}>
                  <div
                    className="flex"
                    style={{
                      width: "100%",
                      height: "100%",
                      justifyContent: "space-between",
                    }}
                  >
                    <div
                      style={{
                        width: "20%",
                        height: "100%",
                        flexShrink: "0",
                        flexGrow: "0",
                        minWidth: "6rem",
                        maxWidth: "9rem",
                      }}
                      className="flex flex-wrap"
                    >
                      {index === 0 ? (
                        <MeasureControls arrangementStore={arrangementStore} />
                      ) : null}
                      <MeasureLabel index={index} />
                    </div>
                    <div
                      style={{
                        width: "80%",
                        height: "5.25rem",
                        left: "0",
                        flexGrow: "2",
                        bottom: "0",
                        boxShadow:
                          "0rem 0rem .25rem .2rem rgba(93, 148, 125, 0.57)",
                        borderRadius: "0.5rem",
                        marginRight: "0.5rem",
                        marginLeft: "0.5rem",
                        marginBottom: "0.75rem",
                        overflowY: "auto",
                      }}
                      className=""
                    >
                      <ShowInstruments measureStore={store} />
                    </div>
                  </div>

                  {/* Measure Toolbar */}
                  <div className="pl-2 pr-2">
                    <MeasureToolbar
                      measureStore={store}
                      arrangementStore={arrangementStore}
                      compositionId={id}
                    />
                  </div>
                  {/* Measure */}

                  <div
                    className="ml-2 mr-2 measure"
                    style={{ overflowX: "auto", overflowY: "visible" }}
                  >
                    <ScrollSyncPane>
                      <div style={{ overflow: "visible", height: "6rem" }}>
                        <Measure
                          measureStore={store}
                          arrangementStore={arrangementStore}
                          compositionId={id}
                        />
                      </div>
                    </ScrollSyncPane>
                  </div>

                  {/* Add or Remove Measures */}
                  <div
                    className="mt-2 mb-2 flex flex-wrap"
                    style={{ marginLeft: "0.5rem" }}
                  >
                    <RemoveMeasure
                      arrangementStore={arrangementStore}
                      measureId={id}
                    />
                    <AddMeasure
                      arrangementStore={arrangementStore}
                      measureId={id}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollSync>
      </div>
    </div>
  );
}
