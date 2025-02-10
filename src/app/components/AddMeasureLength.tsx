import React from "react";
import { ArrangementStoreType } from "../stores/ArrangementStore";
import { UseBoundStore, StoreApi } from 'zustand';

type AddMeasureLengthProps = {
    arrangementStore: UseBoundStore<StoreApi<ArrangementStoreType>>;

}

export default function AddMeasureLength({arrangementStore}: AddMeasureLengthProps) {
    const { numMeasures, setNumMeasures } = arrangementStore();
    return (
        <div className="add-measure"
        style={{
            height: '2rem',
        }}>
        <button
            className="pb-1"
            onClick={() => setNumMeasures(numMeasures + 1)}
            style={{
                backgroundColor: 'rgba(1, 255, 158, 0.12)',
                borderRadius: '0.5rem',
                width: '3.5rem',
                marginLeft: '0.25rem',
                boxShadow: '0rem 0rem .25rem .2rem rgba(93, 148, 125, 0.8)',
            }}
        >+</button>
        </div>
    );
}