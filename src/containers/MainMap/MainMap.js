import React, { Component } from 'react';
import './MainMap.scss';
import { Map, TileLayer, Marker, Popup } from 'react-leaflet';
import Leaflet from 'leaflet';
import 'leaflet/dist/leaflet.css';
import PopupContent from '../../components/PopupContent/PopupContent';
import AddEventPanel from '../AddEventPanel/AddEventPanel';
import CCTVCamera from '../../components/CCTVCamera/CCTVCamera';
import { connect } from 'react-redux';
import CarPopupContent from '../../components/CarPopupContent/CarPopupContent';
import * as actions from '../../store/actions/index';

class MainMap extends Component {
    // Component state contents:
    // =========================
    // isMapInit: We use it to make sure the map is initialized so we can put routs on it
    constructor( props ) {
        super( props );
        this.mainMapRef = this.mainMapRef.bind( this );
        this.state = { isMapInit: false }
    }

    // Create referance for the map
    mainMapRef = ( map ) => {
        this.map = map;
        this.setState({ isMapInit: true });
    }
    
    componentDidUpdate() {
        this.props.updateData();
        this.props.getCarsNewLocations(this.props.cars);
        this.props.getEventsNewInformations(this.props.events);
    }
    
    render() {
        return (
            <div className="main-container">
                <Map center={[ 33.5024, 36.2988 ]} zoom={ 15 } minZoom={ 14 } scrollWheelZoom={ true } className="map-container" ref={ this.mainMapRef } >
                    <TileLayer url="https://api.mapbox.com/styles/v1/ali-nasser/ckpfoqsaq00ck17s4otlto1d4/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1IjoiYWxpLW5hc3NlciIsImEiOiJja21rc3ZlbXMxNGU2MnZxb2NjanhyY29yIn0.YTLiNcuXW-kRZjmxsZB3Mg" />
                    {
                        // Loop throw cameras and display it on the map
                        this.props.cameras.map( ( camera ) => {
                            // Create a camera icon to show it as a marker for cameras
                            let cameraIcon = Leaflet.icon({ iconUrl: require( '../../assets/images/CameraMarker.svg' ).default, popupAnchor: [ 0, -50 ], iconAnchor: [ 20, 30 ], iconSize: [ 25.67, 31.5 ] });
                            return (
                                <Marker position={[ camera.lat, camera.lng ]} icon={ cameraIcon } key={ camera.id }>
                                    <Popup className="camera-popup">
                                        <CCTVCamera cameraName={ camera.name } cameraStatus={ true } videoSource={ require( '../../assets/videos/' + camera.streamUrl ).default } autoPlay={ true } muted={ true } loop={ true } />
                                    </Popup>
                                </Marker>
                            );
                        })
                    }
                    {
                        // Loop throw locations data and display it on the map
                        this.props.locations.map( ( location ) => {
                            // Choose the right icon based on the type of the action center to show it as a marker
                            // Then add this markers to the map in the right posation with popup include all information about that center which comming from database
                            let markerIcon = Leaflet.icon({ iconUrl: require( `../../assets/images/${ location.type }.svg` ).default, popupAnchor: [ 0, -20 ], iconAnchor: [ 20, 20 ] });
                            return (
                                <Marker position={[ location.lat, location.lng ]} icon={ markerIcon } key={ location.id }>
                                    <Popup>
                                        <PopupContent centerInformation={ location } />
                                    </Popup>
                                </Marker>
                            );
                        })
                    }
                    {                        
                        // Loop throw events data and display it on the map
                        this.props.events.map( ( event ) => {
                            // Create an event icon to show it as a marker for cameras
                            let markerIcon = Leaflet.icon({ iconUrl: require( `../../assets/images/EventMarker.svg` ).default, iconSize: [ 35, 35 ], iconAnchor: [ 15, 35 ], popupAnchor: [ 0, 0 ] });
                            return event.status === "Fininshed" ? null : <Marker position={[ event.lat, event.lng ]} icon={ markerIcon } key={ event.id }><Popup>{ event.status }</Popup></Marker>;
                        })
                    }
                    {
                        // Loop throw cars elements data and display it on the map
                        this.props.cars.map( (car) => {
                            // Choose the right icon based on the type of the car to show it as a marker
                            // Then add this markers to the map in the right posation with popup include all information about that car which comming from database
                            let carIcon = Leaflet.icon({ iconUrl: require( `../../assets/images/${ car.carInfo.type }Marker.svg` ).default, popupAnchor: [ 0, -5 ], iconAnchor: [ 5, 5 ], iconSize: [ 10, 10 ] });
                            // Change the color of road based on the car type
                            // [ Fire car => Red | Police car => Green | Ambulance => Blue ]
                            let iconColor = "";
                            switch( car.carInfo.type ) {
                                case 'PoliceCar': iconColor = '#53DB93'; break;
                                case 'Ambulance': iconColor = '#6FA1EC'; break;
                                default: iconColor = '#EC6F6F';
                            }
                            return car.carInfo.state === "InStation" ? null : ( <Marker position={[ car.carInfo.lat, car.carInfo.lng ]} icon={ carIcon } key={ car.carInfo.name }><Popup className="car-popup"><CarPopupContent iconcolor={ iconColor } neddedTime={ 0 } neededDistance={ 0 } elementInfo={ car.carInfo } allEvents={ this.props.events } /></Popup></Marker> );
                        })
                    }
                </Map>
                <AddEventPanel mapReferance={ this.map } />
            </div>
        );
    }
}

// Connect the component to redux store then export it
const mapStateToProps = ( state ) => ({
    locations: state.elements.locations,
    cameras: state.elements.cameras,
    events: state.elements.events,
    cars: state.elements.cars
});
const mapDispatchToProps = ( dispatch ) => ({
    updateData: () => dispatch(actions.getAllElements()),
    getCarsNewLocations: (oldLocations) => dispatch(actions.getCarsLocationFromSocket(oldLocations)),
    getEventsNewInformations: (oldEvents) => dispatch(actions.getEventInfoFromSocket(oldEvents))
});
export default connect(mapStateToProps, mapDispatchToProps)(MainMap);