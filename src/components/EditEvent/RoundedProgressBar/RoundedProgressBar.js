import React from 'react';
import ProgressBar from 'react-customizable-progressbar';

const RoundedProgressBar = ( props ) => (
    <ProgressBar radius={ 100 } progress={ props.progress } cut={ 60 } rotate={ -240 } strokeWidth={ 16 } strokeColor="#53DB93" strokeLinecap="round" trackStrokeWidth={ 16 } trackStrokeColor="#494F5E" trackStrokeLinecap="round" pointerRadius={ 0 } initialAnimation={ true } transition="1.5s ease" trackTransition="0s ease">
        <div className="remaining-time-and-distance">
            <h3>{ props.time }</h3>
            <p>{ props.distance }</p>
        </div>
    </ProgressBar>
);

export default RoundedProgressBar;