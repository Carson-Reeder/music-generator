//import React from "react";

type MeasureLabelProps = {
    compositionId: number;
}

export default function MeasureLabel({ compositionId }: MeasureLabelProps) {
    return (
        <div 
            className=''
            style={{
                height: '2rem'
            }}>
            <label 
                className='text-grey items-center pr-2 pl-2 pb-1 rounded-sm' 
                style={{ 
                    backgroundColor: 'rgba(1, 255, 158, 0.01)',
                    //outline: '0.1rem solid #1E291E', 
                    borderRadius: '0.5rem',
                    boxShadow: '0rem 0rem .25rem .2rem rgba(93, 148, 125, 0.57)',
                    width: '6rem',
                    position: 'relative',
                    zIndex: 1,
                    fontWeight: '500',
                    color: 'rgb(20, 78, 66)',
                                            
                }}>Measure {compositionId}</label>
                                        
        </div>
    );
}