import L from 'leaflet';
import CarPopupContent from '../CarPopupContent/CarPopupContent';
import ReactDOMServer from 'react-dom/server';

L.interpolatePosition = ( p1, p2, duration, t ) => {
    let k = t/duration;
    k = ( k > 0 ) ? k : 0;
    k = ( k > 1 ) ? 1 : k;
    return L.latLng( p1.lat + k * ( p2.lat - p1.lat ), p1.lng + k * ( p2.lng - p1.lng ) );
};

L.Marker.MovingMarker = L.Marker.extend({
    statics: { notStartedState: 0, endedState: 1, pausedState: 2, runState: 3 }, options: { autostart: false, loop: false },

    initialize: function ( latlngs, durations, options ) {
        L.Marker.prototype.initialize.call( this, latlngs[0], options );
        
        this._latlngs = latlngs.map( e => L.latLng( e ) );
        this._durations = ( durations instanceof Array ) ? durations : this._createDurations( this._latlngs, durations );
        this._currentDuration = 0;
        this._currentIndex = 0;
        this._state = L.Marker.MovingMarker.notStartedState;
        this._startTime = 0;
        this._startTimeStamp = 0;
        this._pauseStartTime = 0;
        this._animId = 0;
        this._animRequested = false;
        this._currentLine = [];
        this._stations = {};
    },

    isRunning: function() { return this._state === L.Marker.MovingMarker.runState; },
    isEnded: function() { return this._state === L.Marker.MovingMarker.endedState; },
    isStarted: function() { return this._state !== L.Marker.MovingMarker.notStartedState; },
    isPaused: function() { return this._state === L.Marker.MovingMarker.pausedState; },

    start: function() {
        if ( this.isRunning() ) return;
        if ( this.isPaused() ) { this.resume(); }
        else {
            this._loadLine( 0 );
            this._startAnimation();
            this.fire( 'start' );
        }
    },

    resume: function() {
        if ( !this.isPaused() ) return;
        
        this._currentLine[0] = this.getLatLng();
        this._currentDuration -= ( this._pauseStartTime - this._startTime );
        this._startAnimation();
    },

    pause: function() {
        if ( !this.isRunning() ) return;
        
        this._pauseStartTime = Date.now();
        this._state = L.Marker.MovingMarker.pausedState;
        this._stopAnimation();
        this._updatePosition();
    },

    stop: function( elapsedTime ) {
        if ( this.isEnded() ) return;
        this._stopAnimation();
        if ( typeof( elapsedTime ) === 'undefined' ) {
            elapsedTime = 0;
            this._updatePosition();
        }

        this._state = L.Marker.MovingMarker.endedState;
        this.fire( 'end', { elapsedTime: elapsedTime } );
    },

    addLatLng: function( latlng, duration ) {
        this._latlngs.push( L.latLng( latlng ) );
        this._durations.push( duration );
    },

    moveTo: function( latlng, duration ) {
        this._stopAnimation();
        this._latlngs = [ this.getLatLng(), L.latLng( latlng ) ];
        this._durations = [ duration ];
        this._state = L.Marker.MovingMarker.notStartedState;
        this.start();
        this.options.loop = false;
    },

    addStation: function( pointIndex, duration ) {
        if ( pointIndex > this._latlngs.length - 2 || pointIndex < 1 ) return;
        this._stations[ pointIndex ] = duration;
    },

    onAdd: function ( map ) {
        L.Marker.prototype.onAdd.call( this, map );
        if ( this.options.autostart && ( !this.isStarted() ) ) {
            this.start();
            return;
        }

        if ( this.isRunning() ) this._resumeAnimation();
    },

    onRemove: function( map ) {
        L.Marker.prototype.onRemove.call( this, map );
        this._stopAnimation();
    },

    _createDurations: function ( latlngs, duration ) {
        let lastIndex = latlngs.length - 1;
        let distances = [];
        let totalDistance = 0;
        let distance = 0;

        for ( let i = 0; i < lastIndex; i++ ) {
            distance = latlngs[ i + 1 ].distanceTo( latlngs[ i ] );
            distances.push( distance );
            totalDistance += distance;
        }

        let ratioDuration = duration / totalDistance;
        let durations = [];
        for ( let i = 0; i < distances.length; i++ ) { durations.push( distances[ i ] * ratioDuration ); }
        return durations;
    },

    _startAnimation: function() {
        this._state = L.Marker.MovingMarker.runState;
        this._animId = L.Util.requestAnimFrame( timestamp => {
            this._startTime = Date.now();
            this._startTimeStamp = timestamp;
            this._animate( timestamp );
        }, this, true);
        this._animRequested = true;
    },

    _resumeAnimation: function() {
        if ( !this._animRequested ) {
            this._animRequested = true;
            this._animId = L.Util.requestAnimFrame( timestamp => { this._animate(timestamp); }, this, true );
        }
    },

    _stopAnimation: function() {
        if ( this._animRequested ) {
            L.Util.cancelAnimFrame( this._animId );
            this._animRequested = false;
        }
    },

    _updatePosition: function() {
        let elapsedTime = Date.now() - this._startTime;
        this._animate( this._startTimeStamp + elapsedTime, true );
    },

    _loadLine: function( index ) {
        this._currentIndex = index;
        this._currentDuration = this._durations[ index ];
        this._currentLine = this._latlngs.slice( index, index + 2 );
    },

    _updateLine: function( timestamp ) {
        let elapsedTime = timestamp - this._startTimeStamp;
        if ( elapsedTime <= this._currentDuration ) return elapsedTime;
        let lineIndex = this._currentIndex;
        let lineDuration = this._currentDuration;
        let stationDuration;

        while ( elapsedTime > lineDuration ) {
            elapsedTime -= lineDuration;
            stationDuration = this._stations[lineIndex + 1];

            if ( stationDuration !== undefined ) {
                if ( elapsedTime < stationDuration ) {
                    this.setLatLng( this._latlngs[ lineIndex + 1 ] );
                    return null;
                }
                elapsedTime -= stationDuration;
            }

            lineIndex++;

            if ( lineIndex >= this._latlngs.length - 1 ) {
                if ( this.options.loop ) {
                    lineIndex = 0;
                    this.fire( 'loop', { elapsedTime: elapsedTime } );
                } else {
                    this.setLatLng( this._latlngs[ this._latlngs.length - 1 ]);
                    this.stop( elapsedTime );
                    return null;
                }
            }
            lineDuration = this._durations[ lineIndex ];
        }

        this._loadLine( lineIndex );
        this._startTimeStamp = timestamp - elapsedTime;
        this._startTime = Date.now() - elapsedTime;
        return elapsedTime;
    },

    _animate: function( timestamp, noRequestAnim ) {
        this._animRequested = false;
        let elapsedTime = this._updateLine( timestamp );
        if ( this.isEnded() ) return;

        if ( elapsedTime != null ) {
            let p = L.interpolatePosition( this._currentLine[0], this._currentLine[1], this._currentDuration, elapsedTime );
            this.setLatLng( p );
        }

        if ( !noRequestAnim ) {
            this._animId = L.Util.requestAnimFrame( this._animate, this, false );
            this._animRequested = true;
        }
    }
});

L.Marker.movingMarker = ( latlngs, duration, options ) => new L.Marker.MovingMarker( latlngs, duration, options );

// Convert from millisecond to right time function:
// ================================================
// This function convert time that we get from the routing machine from milliseconds to right time format
// We get the input milliseconds time and calculate the hours, minutes and seconds then return the time in the right format :)
const timeConvertor = ( duration ) => {
    let milliseconds = duration % 1000;
    duration = ( duration - milliseconds ) / 1000;
    let seconds = duration % 60;
    duration = ( duration - seconds ) / 60;
    let minutes = duration % 60;
    let hours = ( duration - minutes ) / 60;

    // If there is no hours then return only the minutes and seconds
    // and if there is no minute return only the seconds
    // Else return all time format
    if( hours === 0 ) return minutes === 0 ? seconds + ' sec' : minutes + ' min';
    return hours + ':' + minutes + ':' + seconds + ' hrs';
}

const movingMarkerFunction = ( map, latlngs, element, options, iconColor ) => {
    // Calculate the right needed time and distance between the action center and the event
    const duration = timeConvertor( element.reaction.duration * 1000 );
    const distance = ( element.reaction.distance / 1000 ).toFixed(1) + ' km';

    // Moving the marker smothly from the action center to the event
    // We display an popup contains the needed time and the distance between the action center and the event
    L.Marker.movingMarker( latlngs, element.reaction.duration*1000, options ).addTo( map ).bindPopup(ReactDOMServer.renderToString( <CarPopupContent iconcolor={ iconColor } neddedTime={ duration } neededDistance={ distance } elementInfo={ element } />), { className: 'car-popup' } );
} 

export default movingMarkerFunction;