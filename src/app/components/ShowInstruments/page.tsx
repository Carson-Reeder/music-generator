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
  const [selectedCategory, setSelectedCategory] = useState<string>("brass");
  const [selectedInstrument, setSelectedInstrument] =
    useState<string>("french-horn");
  const { setInstrument } = measureStore();

  const instruments = useInstrumentStore((state) => state.instruments);
  const { setInstruments } = useInstrumentStore.getState();
  const [prevInstrument, setPrevInstrument] = useState<Instrument | null>(null);
  const [currentInstrument, setCurrentInstrument] = useState<Instrument | null>(
    null
  );

  useEffect(() => {
    // Fetch instrument data on page load
    fetch("/api/instruments")
      .then((res) => res.json())
      .then((data) => {
        setInstruments(data);

        setLoading(false); // Set loading to false when data is fetched
      })
      .catch((err) => console.error("Error loading instruments:", err));
  }, []);

  // Get unique categories
  const categories = Array.from(
    new Set(instruments.map((value: Instrument) => value.category))
  ) as string[];

  if (arrangementStore.getState().toolBarSelector != "instrument") return null;
  return (
    <div className={`measure-display-parent `}>
      {loading ? (
        <div>
          <div className="instrument-selection">
            <div className={`category-selection `}>
              <button className="category-button-loading selected">
                brass
              </button>
              <button className="category-button-loading">keyboards</button>
              <button className="category-button-loading">percussion</button>
              <button className="category-button-loading">strings</button>
              <button className="category-button-loading">woodwinds</button>
            </div>
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
        <div className="instrument-selection">
          <div className="category-selection">
            {categories.map((category) => (
              <button
                key={category}
                className={`category-button ${
                  selectedCategory === category ? "selected" : ""
                }`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="instrument-selection">
            {selectedCategory &&
              instruments
                .filter(
                  (instrument: Instrument) =>
                    instrument.category === selectedCategory
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
