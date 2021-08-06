import React, { Component } from 'react';
import './AddLocation.scss';
import { Row, Col } from 'react-bootstrap';
import { Map, TileLayer } from 'react-leaflet';
import { connect } from 'react-redux';
import * as actions from '../../store/actions/index';
import 'leaflet/dist/leaflet.css';
import Leaflet from 'leaflet';
import { Input, TextArea, Button, RadioButton } from '../../components/UIElements/FormElements/FormElements';
import SearchLocation from '../SearchLocation/SearchLocation';;

// Change the default marker icon
delete Leaflet.Icon.Default.prototype._getIconUrl;
Leaflet.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.4.0/dist/images/marker-icon-2x.png',
    iconUrl: require( '../../assets/images/LocationMarker.svg' ).default,
    shadowUrl: 'https://unpkg.com/leaflet@1.4.0/dist/images/marker-shadow.png'
});

class AddLocation extends Component {
    // Component state contents:
    // =========================
    // addLocationMapRef: Create a referance to the map so we can use it to add markers and edited ( it will bind with the map object and this class )
    // initialize marker object and state and this state will contain the following:
    // type: Will contain the type of that center to use it letter in the icon and this type is ( FireStation, MedicalCenter, PoliceCenter )
    // name: How you want the center name to be
    // numberOfCars, NumberOfPersons: How many cars and persons in this center and at the start of adding will ues this values for current cars and persons too
    // additionalInformation: Some text about that center
    // lat, lng: The position of that center on the map ( lantitude and langtude )
    constructor( props ) {
        super( props );
        this.addLocationMapRef = this.addLocationMapRef.bind( this );
        this.state = {
            type: 'FireStation',
            name: '',
            numberOfCars: 0,
            numberOfPersons: 0,
            additionalInformation: '',
            lat: null,
            lng: null
        }
    }

    // This function used fo setting the center latitude and langtude with the final marker position on the map
    getLocationLatLng = ( locationLatLng ) => this.setState({ lat: locationLatLng.lat, lng: locationLatLng.lng });

    // This function used for getting map object referance
    addLocationMapRef = ( map ) => { this.map = map; }

    // Radio button change handler function:
    // =====================================
    // This function will set the state with the center type
    // But before set the state we should change the type to the same types that we use it in the database
    // We can't use that types directly on the radio buttons becouse we used this names before in another radio buttons in the filter
    // If we use the same names it will couse compatibility errors so we change it :)
    radioButtonChangeHandler = ( event ) => {
        let selectedOption = 'FireStation';
        switch ( event.target.value ) {
            case 'fireStationSelect': selectedOption = 'FireStation'; break;
            case 'medicalCenterSelect': selectedOption = 'MedicalCenter'; break;
            case 'policeCenterSelect': selectedOption = 'PoliceCenter'; break;
            default: selectedOption = 'FireStation';
        }
        this.setState({ type: selectedOption });
    }

    // Save to database function:
    // ==========================
    // In this function we prepare the data in an object to save it to the database
    // We prepare it like an object becouse we use the mongoDB database and it uses that structure
    saveToDatabase = ( event ) => {
        event.preventDefault(); // Prevent button click defaults becouse we want to handle the request by javascript

        // Collect the data from our state in object
        const locationInformation = {
            city: 'Damascus',
            country: 'Syria',
            lat: this.state.lat,
            lng: this.state.lng,
            name: this.state.name,
            numberOfCars: this.state.numberOfCars,
            numberOfPersons: this.state.numberOfPersons,
            type: this.state.type,
            currentCars: this.state.numberOfCars,
            currentPersons: this.state.numberOfPersons,
            additionalInformation: this.state.additionalInformation
        }

        // Passing the data to the database
        this.props.addNewLocation("station", locationInformation);
    }

    render() {
        // Here we update the state by the input right values on input value change
        // And we call the AddLocationMapRef function on the map to make the referance
        return (
            <Row className="add-location">
                <Col className="form" md="6">
                    <h3>New Action Center</h3>
                    <form>
                        <RadioButton mainlabel="Select center type" name="centersType" defaultselectedvalue="fireStationSelect" options={{ fireStationSelect: 'Fire stations', medicalCenterSelect: 'Hospitals', policeCenterSelect: 'Police centers' }} onChange={ this.radioButtonChangeHandler } />
                        <Input mainlabel="Center name" type="text" name="locationName" placeholder="You can use letters, numbers and symbols" autoComplete="off" onChange={ ( event ) => this.setState({ name: event.target.value || '' }) } />
                        <SearchLocation mainlabel="Center location" name="centerLocation" placeholder="Search for location or click to locate on the map" mapReferance={ this.map } getLocationHandler={ this.getLocationLatLng } />
                        <Row>
                            <Col md="6"><Input mainlabel="Number of cars" type="number" name="crasNumber" placeholder="0" min={ 0 } onChange={ ( event ) => this.setState({ numberOfCars: +event.target.value || 0 }) } /></Col>
                            <Col md="6"><Input mainlabel="Number of persons" type="number" name="personsNumber" placeholder="0" min={ 0 } onChange={ ( event ) => this.setState({ numberOfPersons: +event.target.value || 0 }) } /></Col>
                        </Row>
                        <TextArea mainlabel="Additional information ( Optional )" placeholder="Center description or other important details" autoComplete="off" onChange={ ( event ) => this.setState({ additionalInformation: event.target.value || '' }) } />
                        <Button className="button-success" onClick={ this.saveToDatabase } >OK! Add Center</Button>
                    </form>
                </Col>
                <Col md="6">
                    <Map center={ [ 33.5024, 36.2988 ] } zoom={ 15 } minZoom={ 14 } scrollWheelZoom={ true } className="map-container" ref={ this.addLocationMapRef }>
                        <TileLayer url="https://api.mapbox.com/styles/v1/ali-nasser/ckpfoqsaq00ck17s4otlto1d4/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1IjoiYWxpLW5hc3NlciIsImEiOiJja21rc3ZlbXMxNGU2MnZxb2NjanhyY29yIn0.YTLiNcuXW-kRZjmxsZB3Mg" />
                    </Map>
                </Col>
            </Row>
        );
    }
}

// Connect the component to redux store then export it
const mapStateToProps = state => ({ addNewCenter: state.elements.addNewCenter, deleteCenter: state.elements.deleteCenter });
const mapDispatchToProps = dispatch => ({ addNewLocation: (elementType, elementInfo) => dispatch(actions.addElement(elementType, elementInfo)) });
export default connect(mapStateToProps, mapDispatchToProps)(AddLocation);