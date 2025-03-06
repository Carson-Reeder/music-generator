"use client";
import { playAllMeasures } from "../../utils/soundPlayer";
import { ScrollSync, ScrollSyncPane } from "react-scroll-sync";
import dynamic from "next/dynamic";
import MeasureToolbar from "../MeasureToolbar/page";
const Measure = dynamic(() => import("../Measure/page"));
const MeasureLabel = dynamic(() => import("../MeasureLabel/page"));
const RemoveMeasure = dynamic(() => import("../RemoveMeasure/page"));
const AddMeasure = dynamic(() => import("../AddMeasure/page"));
import ShowInstruments from "../ShowInstruments/page";
const MeasureControls = dynamic(() => import("../MeasureControls/page"));
import { arrangementStore } from "../../stores/ArrangementStore";
import ShowNotes from "../ShowNotes/page";

export default function Arrangement() {
  const { stores, toolBarSelector } = arrangementStore();

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
            <div>
              {stores.map(({ id, store }, index) => {
                return (
                  <div key={id}>
                    {/* Measure Toolbar */}
                    <div className="pl-2 pr-2">
                      <MeasureToolbar
                        measureStore={store}
                        arrangementStore={arrangementStore}
                        compositionId={id}
                      />
                    </div>
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
                        <MeasureLabel index={index} />
                        {index === 0 ? (
                          <MeasureControls
                            arrangementStore={arrangementStore}
                          />
                        ) : null}
                      </div>
                      <div
                        style={{
                          width: "80%",
                          position: "relative",
                          height: "7rem",
                          left: "0",
                          flexGrow: "2",
                          bottom: "0",
                          boxShadow:
                            "0rem 0rem .25rem .2rem rgba(93, 148, 125, 0.57)",
                          borderRadius: "0.5rem",
                          marginRight: "0.5rem",
                          marginLeft: "0.5rem",
                          marginBottom: "0.75rem",
                          //overflowX: "auto",
                          overflowY: "hidden",
                          zIndex: 1,
                        }}
                        className=""
                      >
                        {toolBarSelector === "instrument" ? (
                          <ShowInstruments
                            compositionId={id}
                            arrangementStore={arrangementStore}
                            measureStore={store}
                          />
                        ) : null}

                        {toolBarSelector === "note" ? (
                          <ShowNotes
                            compositionId={id}
                            arrangementStore={arrangementStore}
                            measureStore={store}
                          />
                        ) : null}
                      </div>
                    </div>

                    {/* Measure */}

                    <div
                      className="ml-2 mr-2 measure"
                      style={{
                        overflowX: "auto",
                        overflowY: "visible",
                        scrollbarColor: "rgba(93, 148, 125, 0.57)",
                        scrollbarWidth: "thin",
                      }}
                    >
                      <ScrollSyncPane key={id}>
                        <div
                          style={{
                            overflow: "visible",
                            height: "6rem",
                          }}
                        >
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
          </div>
        </ScrollSync>
      </div>
    </div>
  );
}
