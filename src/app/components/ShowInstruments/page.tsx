"use client";
import { MeasureStoreType } from "../../stores/MeasureStore";
import { ArrangementStoreType } from "../../stores/ArrangementStore";
import { UseBoundStore, StoreApi } from "zustand";
import { useState, useEffect } from "react";
import { useInstrumentStore } from "../../stores/InstrumentStore";
import { loadInstrument } from "../../utils/soundPlayer";
import { Instrument } from "../../stores/InstrumentStore";

type ShowInstrumentProps = {
  compositionId: number;
  measureStore: UseBoundStore<StoreApi<MeasureStoreType>>;
  arrangementStore: UseBoundStore<StoreApi<ArrangementStoreType>>;
};

export default function ShowInstruments({
  compositionId,
  arrangementStore,
  measureStore,
}: ShowInstrumentProps) {
  const [loading, setLoading] = useState(true);
  const { setInstrument } = measureStore();
  const instruments = useInstrumentStore((state) => state.instruments);
  const { setInstruments } = useInstrumentStore.getState();
  const { categories, setCategories, isLoading, setIsLoading } =
    useInstrumentStore.getState();
  const [prevInstrument, setPrevInstrument] = useState<Instrument | null>(null);
  const [currentInstrument, setCurrentInstrument] = useState<Instrument | null>(
    null
  );
  const {
    setIsInstrumentClicked,
    toolBarSelector,
    selectedInstrumentCategory,
    setSelectedInstrumentCategory,
    selectedInstrument,
    setSelectedInstrument,
  } = measureStore();

  useEffect(() => {
    // Fetch instrument data on page load
    fetch("/api/instruments")
      .then((res) => res.json())
      .then((data) => {
        setInstruments(data);
        console.log("Instruments loaded:", data);

        setLoading(false); // Set loading to false when data is fetched
      })
      .catch((err) => console.error("Error loading instruments:", err));
  }, []);

  // Get unique categories
  const categories2 = Array.from(
    new Set(instruments.map((value: Instrument) => value.category))
  ) as string[];

  if (measureStore.getState().toolBarSelector != "instrument") return null;

  return (
    <div className={`instrument-dropdown `}>
      {loading ? (
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div className={`category-selection `}>
            <button className="category-button-loading selected">brass</button>
            <button className="category-button-loading">keyboards</button>
            <button className="category-button-loading">percussion</button>
            <button className="category-button-loading">strings</button>
            <button className="category-button-loading">woodwinds</button>
          </div>

          <div className="instrument-selection">
            <button className="instrument-button-loading selected-instrument">
              french-horn
            </button>
            <button className="instrument-button-loading">trombone</button>
            <button className="instrument-button-loading">trumpet</button>
            <button className="instrument-button-loading">tuba</button>
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "row" }}>
          <div className="category-selection">
            {categories2.map((category) => (
              <button
                key={category}
                className={`category-button ${
                  selectedInstrumentCategory === category ? "selected" : ""
                }`}
                onClick={() => setSelectedInstrumentCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="instrument-selection">
            {selectedInstrumentCategory &&
              instruments
                .filter(
                  (instrument: Instrument) =>
                    instrument.category === selectedInstrumentCategory
                )
                .map((instrument: Instrument) => (
                  <button
                    key={instrument.id}
                    className={`instrument-button ${
                      selectedInstrument === instrument.name
                        ? "selected-instrument"
                        : ""
                    }`}
                    onClick={() => {
                      setPrevInstrument(currentInstrument);
                      setCurrentInstrument(instrument);
                      setInstrument(instrument);
                      setSelectedInstrument(instrument.name);
                      loadInstrument({ measureStore });
                    }}
                  >
                    {instrument.name}
                  </button>
                ))}
          </div>
        </div>
      )}
    </div>
  );
}
