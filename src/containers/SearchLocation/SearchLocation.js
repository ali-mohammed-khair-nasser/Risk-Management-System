import React, { Component } from 'react';
import './SearchLocation.scss';
import { Button, Input } from '../../components/UIElements/FormElements/FormElements';
import { Iconly } from 'react-iconly';
import { AlgoliaProvider } from 'leaflet-geosearch';
import Leaflet from 'leaflet';

// Initialize the search for location provider
const provider = new AlgoliaProvider();

// Change the default marker icon to location icon
const changeMarkerIcon = () => {
    delete Leaflet.Icon.Default.prototype._getIconUrl;
    Leaflet.Icon.Default.mergeOptions({
        iconRetinaUrl: '',
        iconUrl: require( '../../assets/images/LocationMarker.svg' ).default,
        shadowUrl: '',
        iconSize: [ 25, 41 ],
        iconAnchor: [ 15, 35 ],
        popupAnchor: [ 0, 0 ]
    });
}

// Marker handler function:
// ======================
// This function used for setting the marker on the map by editing the state
// First we get the map element from the dom
// Then create a layyer to add the marker on it
// Handle adding new marker to the map
// Handle remove marker and add new one in new position on map click
// Handle marker dragging
// After handling all of that options then our state will contain the right marker position and we can use it when we pass the data to the database
const markerHandler = ( map, marker, latitude, langtude, setLocationHandler ) => {

    // Change the default marker icon to location icon
    changeMarkerIcon();

    let locationLatLng = null;
    const results = new Leaflet.LayerGroup().addTo( map );
    if ( latitude !== null && langtude !== null ) {
        // Check if there is an old marker then delete it to add the new one
        if ( marker !== null ) map.removeLayer( marker );

        // Create a marker on the lat and lang position and add it to the map layyer
        marker = new Leaflet.marker( [ langtude, latitude ], { draggable: true } );
        results.addLayer( marker );

        // Set the map view to the marker position with animation
        map.setView( [ langtude, latitude ], map.getZoom(), { animate: true });

        // Get the lat and lng of that marker to set it on the state so we can use it when we send that data to the database 
        locationLatLng = marker.getLatLng();
        setLocationHandler( locationLatLng, marker );

        // On map click we will remove the old markers and create a new one on the clicked position
        // So for that case we will pass the lang and lat of clicking event to marker and set view methods
        // Finally we set our state to the new position
        map.on( 'click', ( event ) => {
            // Change the default marker icon to location icon
            changeMarkerIcon();

            if ( marker !== null ) map.removeLayer( marker );
            marker = new Leaflet.marker( event.latlng, { draggable: true } );
            results.addLayer( marker );
            map.setView( event.latlng, map.getZoom(), { animate: true } );
            locationLatLng = marker.getLatLng();
            setLocationHandler( locationLatLng, marker );
        });

        // If the marker draged then we get the final position ( lat & lng ) after drag end and update the state with the new values
        marker.on( 'dragend', () => {
            locationLatLng = marker.getLatLng();
            setLocationHandler( locationLatLng, marker );
        });
    }
}

class SearchLocation extends Component {
    // Component state contents:
    // =========================
    // loactions: Will contain all locations that we get it from the search
    // selectedLocation: Will contain the information of selected location
    state = {
        loactions: [],
        selectedLocation: {
            name: '',
            position: { lat: null, lng: null }
        }
    }

    // Get search locations function:
    // ==============================
    // When type on the search input wel get the input value and search for locations by that value using Algolia provider
    // If we get result then will set the state after make sure the input contain some value
    // Else will reset the state ( this is used for empty input value )
    // Catch the errors if it occurs to prevent the fail of application when some thing get wrong 
    getSearchLocations = async () => {
        const input = document.querySelector( 'input[ type="search" ]' );
        try {
            await provider.search({ query: input.value }).then( ( data ) => {
                input.value !== '' ? this.setState({ loactions: data }) : this.setState({ loactions: [] });
            });
        } catch ( error ) { console.log(error); }
    }

    // Get selected location function:
    // ===============================
    // When the user pik one of the previews search results we should hide other results and update the state
    // After reset the Locations state and update SelectedLocation state then update the input value
    getSelectedLocation = ( location ) => {
        this.setState({
            selectedLocation: {
                name: location.label,
                position: { lat: location.x, lng: location.y }
            },
            loactions: []
        });
        document.querySelector( 'input[ type="search" ]' ).value = location.label;
    }

    // Locate button click handle function:
    // ====================================
    // This function get the selected location information then add a marker on it's lat and lng on the map
    locateButtonClickHandle = ( event ) => {
        event.preventDefault(); // Prevent button click defaults becouse we want to handle the request by javascript
        markerHandler( this.props.mapReferance.leafletElement, this.props.mapMarker ? this.props.mapMarker : null, this.state.selectedLocation.position.lat, this.state.selectedLocation.position.lng, this.props.getLocationHandler );
    }

    render() {
        // Before render the contetn loop throw all locations that we get from the search location provider and create a list item for it
        // Then a click listener to get the piked value
        const searchResults = this.state.loactions.map( ( location, index ) => {
            return <li key={ index } onClick={ () => this.getSelectedLocation( location ) }><Iconly name="Location" label="Location" size={ 22 } className="location-icon" /> { location.label }</li>;
        });

        return (
            <div className="search-location">
                <Input mainlabel={ this.props.mainlabel ? this.props.mainlabel : null } type="search" name={ this.props.name } placeholder={ this.props.placeholder } autoComplete="off" onChange={ this.getSearchLocations } />
                <Button className="button-danger" onClick={ this.locateButtonClickHandle }><Iconly name="Location" label="Location" size={ 24 } className="location-icon" />Locate</Button>
                { searchResults.length > 0 ? <div className="search-results"><ul>{ searchResults }</ul></div> : null }
            </div>
        );
    }
}

export default SearchLocation;