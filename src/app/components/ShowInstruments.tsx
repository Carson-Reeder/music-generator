import { MeasureStoreType } from "../stores/MeasureStore";
import { UseBoundStore, StoreApi } from "zustand";
import { useState } from "react";
import { useInstrumentStore } from "../stores/InstrumentStore";
import { loadInstrument } from "../utils/soundPlayer";
import { Instrument } from "../stores/InstrumentStore";

type ShowInstrumentProps = {
  measureStore: UseBoundStore<StoreApi<MeasureStoreType>>;
};

export default function ShowInstruments({ measureStore }: ShowInstrumentProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedInstrument, setSelectedInstrument] = useState<string | null>(
    null
  );
  const { setInstrument } = measureStore();
  const { instruments } = useInstrumentStore();

  // Get unique categories
  const categories = Array.from(
    new Set(instruments.map((value: Instrument) => value.category))
  ) as string[];

  if (!measureStore().isInstrumentClicked) return null;

  return (
    <div className="measure-display-parent">
      {/* Category selection always visible at the top */}
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

      {/* Instrument selection (updates based on selected category) */}
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
                  setInstrument(instrument);
                  setSelectedInstrument(instrument.name);
                  loadInstrument({ measureStore });
                }}
              >
                {instrument.name}
              </button>
            ))}
      </div>

      <style jsx>{`
        .category-selection {
          border-radius: 0.25rem;
          padding: 0.125rem;
          background-color: rgba(57, 201, 133, 0.08);
          display: flex;
          gap: 0rem;
          margin-bottom: 0rem;
          border-bottom: 0.125rem solid rgba(42, 131, 94, 0.32);
          border-offset: -0.125rem;
        }

        .category-button {
          margin-right: 0.25rem;
          padding: 0rem 0.125rem;
          background-color: rgba(155, 231, 199, 0.92);
          cursor: pointer;
          border: 0.125rem solid rgba(42, 131, 94, 0.42);
          border-offset: -0.125rem;
          border-radius: 5px;
          transition: background 0.3s;
        }

        .category-button.selected {
          background-color: #007bff;
          color: white;
          font-weight: bold;
        }

        .instrument-selection {
          display: flex;
          flex-wrap: wrap;
          gap: 0.25rem;
        }

        .instrument-button {
          margin-right: 0.25rem;
          padding: 0rem 0.125rem;
          background-color: #fff;
          border-radius: 0.25rem;
          transition: background 0.3s;
        }

        .instrument-button.selected-instrument {
          background-color: #28a745; /* Green highlight for selected instrument */
          color: white;
          font-weight: bold;
        }

        .instrument-button:hover {
          background-color: #e0e0e0;
        }
        .instrument-button.selected-instrument:hover {
          background-color: #28a765;
        }
      `}</style>
    </div>
  );
}
