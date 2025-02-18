//import React from "react";

type MeasureLabelProps = {
    compositionId: number;
}

export default function MeasureLabel({ compositionId }: MeasureLabelProps) {
    return (
        <div 
            className='flex measure-label-parent'>
            <label 
                className='text-grey rounded-sm measure-label-child' 
                style={{ 
                    
                    backgroundColor: 'rgba(1, 255, 158, 0.01)',
                    //outline: '0.1rem solid #1E291E', 
                    borderRadius: '0.5rem',
                    boxShadow: '0rem 0rem .25rem .2rem rgba(93, 148, 125, 0.57)',
                    zIndex: 1,
                    fontWeight: '500',
                    flexGrow: 1,
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'rgb(20, 78, 66)',
                                            
                }}>Measure {compositionId}</label>
                                        
        </div>
    );
}