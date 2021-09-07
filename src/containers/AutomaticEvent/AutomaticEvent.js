import React, { Component, Fragment } from 'react';
import './AutomaticEvent.scss';
import { Map, TileLayer, Marker } from 'react-leaflet';
import Leaflet from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import { Iconly } from 'react-iconly';
import { Button, RadioButton, Input, TextArea } from '../../components/UIElements/FormElements/FormElements';
import { Container, Row, Col, Accordion, Card } from 'react-bootstrap';
import SearchLocation from '../SearchLocation/SearchLocation';
import CCTVCamera from '../../components/CCTVCamera/CCTVCamera';

class AutomaticEvent extends Component {
    // Component state contents:
    // =========================
    // eventInformation: Contains all information about an event which includes:
    // ===> type: Get the type of event to know which center type shuold response
    // ===> name: The title of that event to use it in the archive
    // ===> lat, lng: the latitide and langitude of that location on the map
    // ===> size: To know how many cars to send
    // ===> personEngaged: the number of persons in that event ( fighting persons for example )
    // ===> description: Contains information about event like description for example or any other important information
    // ===> respond: How many number of cars from each type to send to that event
    // eventRespond: Contains the 3 diffirent types of responding and each type contain the cars and persons number
    state = {
        mapMarker: null,
        eventInformation: {
            type: 'Fire',
            name: '',
            lat: null,
            lng: null,
            size: 'Small',
            personEngaged: -1,
            description: '',
            respond: {
                Medical: { numberOfCars: -1 },
                Violence: { numberOfCars: -1 },
                Fire: { numberOfCars: -1 }
            }
        },
        eventRespond: [
            { name: 'Medical', label: 'Send ambulances', defaultChecked: 'defaultChecked' },
            { name: 'Violence', label: 'Send police cars', defaultChecked: '' },
            { name: 'Fire', label: 'Send fire cars', defaultChecked: '' }
        ]
    }

    // Generate event name function:
    // =============================
    // This function generate a unique name for each event on click add event button
    // And it change the name of an event based on it's type
    // This function helps the user to add event fast and don't take time to think about event name ( just to make the request to an event faster )
    // It will used in AI models too for making the right event request event without user requiring.
    generateEventNames = (eventType) => {
        let chars = "abcdefghijklmnopqrstuvwxyz0123456789",                                      // Chars & numbers that used to generate the ID
            size = 4,                                                                            // Max size of the ID
            i = 1,                                                                               // Starting point of chars
            generatedName = "";                                                                    // The result of generating will saved in this variable

        // While the number of ID characters not equal to size repeat generating characters
        while ( i <= size ) { 
            let max = chars.length - 1,
                num = Math.floor(Math.random() * max),
                temp = chars.substr(num, 1);
            generatedName += temp;
            i++;
        }
        // Just setting the type of the event name to match each other
        if ( eventType === 'Fire' ) eventType = 'fire_and_smoke';
        if ( eventType === 'Violence' ) eventType = 'fighting';
        if ( eventType === 'Medical' ) eventType = 'person_falling';
        generatedName = `Event_${ eventType.toLowerCase() }_${ generatedName.toUpperCase() }`;

        // Set tthe event name in the ui :)
        document.querySelector( 'input[ name="eventName" ]' ).value = generatedName;
        return generatedName;
    }

    // Add event panel function:
    // ============================
    // Used to open and close the adding event panel so when add event button clicked will slide up to open
    // And when end adding or whant to close then close it
    // We do that by changing the class name and the values of the inputs ( return the values to default and empty the input )
    addEventPanel = () => {
        // Clear everything in the inputs on closing the panel
        document.querySelector( 'input[ name="eventName" ]' ).value = this.generateEventNames(this.state.eventInformation.type);
        document.querySelector( 'input[ id="Fire" ]' ).checked = true;
        document.querySelector( 'textarea[ name="additionalInformation" ]' ).value = '';
        document.querySelector( 'input[ name="MedicalCrasNumber" ]' ).value = '';
        document.querySelector( 'input[ name="ViolenceCrasNumber" ]' ).value = '';
        document.querySelector( 'input[ name="FireCrasNumber" ]' ).value = '';

        if ( this.state.eventInformation.type === 'Medical' || this.state.eventInformation.type === 'Violence' ) document.querySelector( 'input[ name="personEngaged" ] ').value = '';
        else document.querySelector( 'input[ id="Small" ]' ).checked = true;

        // Reset the state to default values when panel closed
        this.setState({
            eventInformation: {
                type: 'Fire',
                name: document.querySelector( 'input[ name="eventName" ]' ).value,
                lat: null,
                lng: null,
                size: 'Small',
                personEngaged: -1,
                description: '',
                respond: {
                    Medical: { numberOfCars: -1 },
                    Violence: { numberOfCars: -1 },
                    Fire: { numberOfCars: -1 }
                }
            }
        });
    }

    // Add get directions function:
    // ============================
    // This function prepare the event adding by collect it's information and calling get nearest action center function
    // So now we have the event information and the actions that shoud responsed sorted assending from the nearest to the farest one
    // Finnaly we can start the responding proccess :)
    addGetDirections = ( event ) => {
        const map = this.props.mapReferance.leafletElement;
        event.preventDefault(); // Prevent button click defaults becouse we want to handle the request by javascript

        // Prepare the event information object so we can store it and use it to get the responding
        const eventInformation = {
            type: this.state.eventInformation.type,
            name: this.state.eventInformation.name,
            lat: this.state.eventInformation.lat,
            lng: this.state.eventInformation.lng,
            size: this.state.eventInformation.size,
            personEngaged: this.state.eventInformation.personEngaged,
            description: this.state.eventInformation.description,
            respond: {
                Medical: { numberOfCars: this.state.eventInformation.respond.Medical.numberOfCars },
                Violence: { numberOfCars: this.state.eventInformation.respond.Violence.numberOfCars },
                Fire: { numberOfCars: this.state.eventInformation.respond.Fire.numberOfCars },
            }
        }


        // If we get a lat and long values so we have an event location then we can make the other proccesses
        if ( eventInformation.lat !== null || eventInformation.lng !== null ) {
            // After getting all informations that we need now we can close that panel
            // And make the markers on the map not clickable or movable so we can take an action
            this.addEventPanel();
            map.off( 'click' );
            this.state.mapMarker.dragging.disable();

            // Send the event to the server
            axios.post( 'http://localhost:8080/api/event', eventInformation ).then( ( response ) => {
                if ( response ) {
                    // Delete all events markers becouse after saving the event we get the markers from the database for the event which not responded yet
                    // The finished events will never shown on the map but we can get it from the history tab :)
                    this.props.mapReferance.leafletElement.removeLayer(this.state.mapMarker);
                }
            }).catch( ( error ) => { console.log( error ); } );
        }
    }

    // Color the selected tab function:
    // ================================
    // We use this function to color the active tab in responding area in the add event panel
    // When we open a tab then we color it green and remove the green color from the siblings tabs
    colorTheSelectedTab = ( tabID ) => {
        let newEventRespond = [
            { name: 'Medical', label: 'Send ambulances', defaultChecked: '' },
            { name: 'Violence', label: 'Send police cars', defaultChecked: '' },
            { name: 'Fire', label: 'Send fire cars', defaultChecked: '' }
        ];
    
        newEventRespond[ tabID ].defaultChecked = 'defaultChecked';
        this.setState({ eventRespond: newEventRespond });
    }
    render() {
        return (
            <Fragment>
                <div className="CameraSteam">
                    <Container fluid>
                        <Row>
                            <Col md={ 8 }>
                                <div className="detectionValue"><Iconly name="Danger" set="bold" label="Danger" size={ 25 } className="Icon" /> Fire & Smoke Detected!</div>
                                <CCTVCamera cameraName="OERD_CAMERA_98412" cameraStatus={ true } videoSource={ require( '../../assets/videos/fire (1).mp4' ).default } autoPlay={ true } muted={ true } loop={ true } />
                            </Col>
                            <Col md={ 4 }>
                                <div className="CameraName">OERD_CAMERA_98412</div>
                                <div className="main-container">
                                    <Map center={[ 33.5024, 36.2988 ]} zoom={ 15 } minZoom={ 14 } scrollWheelZoom={ true } className="map-container">
                                        <TileLayer url="https://api.mapbox.com/styles/v1/ali-nasser/ckpfoqsaq00ck17s4otlto1d4/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1IjoiYWxpLW5hc3NlciIsImEiOiJja21rc3ZlbXMxNGU2MnZxb2NjanhyY29yIn0.YTLiNcuXW-kRZjmxsZB3Mg" />
                                        {
                                            // Loop throw cameras and display it on the map
                                            this.props.cameras.map( ( camera ) => {
                                                // Create a camera icon to show it as a marker for cameras
                                                let cameraIcon = Leaflet.icon({ iconUrl: require( '../../assets/images/CameraMarker.svg' ).default, popupAnchor: [ 0, -50 ], iconAnchor: [ 20, 30 ], iconSize: [ 25.67, 31.5 ] });
                                                return <Marker position={[ camera.lat, camera.lng ]} icon={ cameraIcon } key={ camera.id } />;
                                            })
                                        }
                                        {
                                            // Loop throw locations data and display it on the map
                                            this.props.locations.map( ( location ) => {
                                                // Choose the right icon based on the type of the action center to show it as a marker
                                                // Then add this markers to the map in the right posation with popup include all information about that center which comming from database
                                                let markerIcon = Leaflet.icon({ iconUrl: require( `../../assets/images/${ location.type }.svg` ).default, popupAnchor: [ 0, -20 ], iconAnchor: [ 20, 20 ] });
                                                return <Marker position={[ location.lat, location.lng ]} icon={ markerIcon } key={ location.id } />;
                                            })
                                        }
                                        {                        
                                            // Loop throw events data and display it on the map
                                            this.props.events.map( ( event ) => {
                                                // Create an event icon to show it as a marker for cameras
                                                let markerIcon = Leaflet.icon({ iconUrl: require( `../../assets/images/EventMarker.svg` ).default, iconSize: [ 35, 35 ], iconAnchor: [ 15, 35 ], popupAnchor: [ 0, 0 ] });
                                                return event.status === "Fininshed" ? null : <Marker position={[ event.lat, event.lng ]} icon={ markerIcon } key={ event.id } />;
                                            })
                                        }
                                        {
                                            // Loop throw cars elements data and display it on the map
                                            this.props.cars.map( (car) => {
                                                // Choose the right icon based on the type of the car to show it as a marker
                                                // Then add this markers to the map in the right posation with popup include all information about that car which comming from database
                                                let carIcon = Leaflet.icon({ iconUrl: require( `../../assets/images/${ car.carInfo.type }Marker.svg` ).default, popupAnchor: [ 0, -5 ], iconAnchor: [ 5, 5 ], iconSize: [ 10, 10 ] });
                                                return car.carInfo.state === "InStation" ? null : <Marker position={[ car.carInfo.lat, car.carInfo.lng ]} icon={ carIcon } key={ car.carInfo.name } />;
                                            })
                                        }
                                    </Map>
                                </div>
                            </Col>
                        </Row>
                    </Container>
                </div>
                <Container fluid className="AutomaticEvent" id="AutomaticEvent">
                <Row>
                    <Col>
                        <h2 className="section-title">Select an event to add it to the map</h2>
                        <RadioButton name="eventType" defaultselectedvalue="FireSmokeDetected" options={{ FireSmokeDetected: 'Fire & Smoke', ViolenceDetected: 'Fighting', MedicalDetected: 'Medical Event' }} onChange={ ( event ) => console.log(event.target.value) } />
                        <h2 className="section-title">Event name</h2>
                        <Input type="text" name="eventName" autoComplete="off" onChange={ ( event ) => console.log(event.target.value) } />
                        <h2 className="section-title">Add location</h2>
                        <SearchLocation name="eventLocation" value="Selected Automaticly ( Camera Location )" placeholder="Search for location or click to locate on the map" mapReferance={ this.props.mapReferance } mapMarker={ this.state.mapMarker } getLocationHandler={ this.getLocationLatLng } />
                    </Col>
                    <Col className="with-borders">
                        { this.state.eventInformation.type === 'Fire' ? <div><h2 className="section-title">Fire size</h2><RadioButton name="eventSize" defaultselectedvalue="LargeSize" options={{ SmallSize: 'Small', MediumSize: 'Medium', LargeSize: 'Large' }} onChange={ ( event ) => console.log(event.target.value) } /></div> : <div><h2 className="section-title">Number of persons</h2><Input style={{ marginBottom: '15px' }} type="text" name="personEngaged" placeholder="The number of persons in that event" autoComplete="off" onChange={ ( event ) => console.log(event.target.value) }/></div> }
                        <h2 className="section-title">Additional information ( Optional )</h2>
                        <TextArea name="additionalInformation" placeholder="Event description or other important details" autoComplete="off" onChange={ ( event ) => console.log(event.target.value) }/>
                    </Col>
                    <Col className="event-respond">
                        <Accordion defaultActiveKey="0">
                            { this.state.eventRespond.map( ( respondType, respondTypeIdx ) => (
                                <Card key={ respondTypeIdx }>
                                    <Card.Header>
                                        <Accordion.Toggle as={ Button } variant="link" eventKey={ respondTypeIdx.toString() } onClick={ () => this.colorTheSelectedTab( respondTypeIdx ) }>
                                            <div className="checkbox"><label className={ `checkbox-container ${ respondType.defaultChecked ? 'checked' : '' }` }><Iconly name="Play" label="Tick Square" set="bold" size={ 24 } className="iconly" /> { respondType.label }</label></div>
                                        </Accordion.Toggle>
                                    </Card.Header>
                                    <Accordion.Collapse eventKey={ respondTypeIdx.toString() }>
                                        <Card.Body>
                                            <Input mainlabel="Number of cars" type="number" name={ respondType.name + "CrasNumber" } placeholder="0" min={ -1 } onChange={ ( event ) => console.log(event.target.value) }/>
                                        </Card.Body>
                                    </Accordion.Collapse>
                                </Card>
                            ) ) }
                        </Accordion>
                        <Button className="button-success" onClick={ this.addGetDirections }>Add Event/Get Directions</Button>
                        <Button className="button-danger" onClick={ () => console.log('fuck you :)') }>Ignore Event/Stop Alarm</Button>
                    </Col>
                </Row>
            </Container>
            </Fragment>
        );
    }
};

export default AutomaticEvent;