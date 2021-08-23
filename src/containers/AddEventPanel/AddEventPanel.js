import React, { Component, Fragment } from 'react';
import './AddEventPanel.scss';
import Leaflet from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import movingMarkerFunction from '../../components/MovingMarker/MovingMarker';
import { Iconly } from 'react-iconly';
import { Button, RadioButton, Input, TextArea } from '../../components/UIElements/FormElements/FormElements';
import { Container, Row, Col, Accordion, Card } from 'react-bootstrap';
import SearchLocation from '../SearchLocation/SearchLocation';

class AddEventPanel extends Component {
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

    // Get location lat lng function:
    // ==============================
    // We use this function to get the location lat and lang from the search location component
    // So we pass this function to that component and update the state with the new values on it
    getLocationLatLng = ( locationLatLng, mapMarker ) => {
        this.setState({ mapMarker: mapMarker, eventInformation: { ...Object.assign( {}, this.state.eventInformation ), lat: locationLatLng.lat, lng: locationLatLng.lng } });
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
        document.getElementById( 'add-event' ).classList.toggle( 'add-event-closed' );
        document.getElementById( 'circle-button' ).classList.toggle( 'circle-button-closed' );

        // We make the animation here in code becouse it not works in CSS :(
        // And that becouse the css edit the dom elements before that function run ends
        setTimeout( () => { document.getElementById( 'add-event' ).classList.toggle( 'overflow-toggle-class' ); }, 300 );

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

            axios.post( 'http://localhost:8080/api/event', eventInformation ).then( ( response ) => {
                if ( response ) {
                    // Delete all events markers becouse after saving the event we get the markers from the database for the event which not responded yet
                    // The finished events will never shown on the map but we can get it from the history tab :)
                    this.props.mapReferance.leafletElement.removeLayer(this.state.mapMarker);
                    // Loop through all cars and render each car path and move it on that path
                    response.data.data.elements.forEach( (element) => {
                        // Reverce the path array becouse we get that langtude before the lattitude from the server
                        let reversedPath = element.reaction.path.map(function reverse(item) {
                            return Array.isArray(item) && Array.isArray(item[0]) ? item.map( reverse ) : item.reverse();
                        });

                        // Change the color of road based on the event type
                        // [ Fire => Red | Fighting => Green | Medical Event => Blue ]
                        let iconColor = "";
                        switch( element.type ) {
                            case 'PoliceCar': iconColor = '#53DB93'; break;
                            case 'Ambulance': iconColor = '#6FA1EC'; break;
                            default: iconColor = '#EC6F6F';
                        }

                        delete Leaflet.Icon.Default.prototype._getIconUrl;
                        Leaflet.Icon.Default.mergeOptions({
                            iconRetinaUrl: "", iconUrl: require( `../../assets/images/${ element.type }Marker.svg` ).default, shadowUrl: '',
                            popupAnchor: [ 0, -5 ], iconAnchor: [ 5, 5 ], iconSize: [ 10, 10 ]
                        });

                        // Drawing the route path on the map then fit the map zoom to it
                        let path = new Leaflet.polyline(reversedPath, { weight: 4, color: iconColor, opacity: 0.5 }).addTo(map);
                        map.addLayer(path);

                        // Use the moving marker script to move the car marker on this coordinates smothly :)
                        movingMarkerFunction( map, reversedPath, element, { autostart: true }, iconColor );
                    });
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
                <Button className="circle-button circle-button-closed" id="circle-button" aria-label="Add Event" onClick={ this.addEventPanel }><Iconly name="ChevronUp" label="Chevron Up" size={ 24 } /></Button>
                <Container fluid className="add-event-closed overflow-toggle-class" id="add-event">
                    <Row>
                        <Col>
                            <h2 className="section-title">Select an event to add it to the map</h2>
                            <RadioButton name="eventType" defaultselectedvalue="Fire" options={{ Fire: 'Fire & Smoke', Violence: 'Fighting', Medical: 'Medical Event' }} onChange={ ( event ) => { this.setState({ eventInformation: { ...Object.assign( {}, this.state.eventInformation ), type: event.target.value } }); this.generateEventNames(event.target.value); } } />
                            <h2 className="section-title">Event name</h2>
                            <Input type="text" name="eventName" autoComplete="off" onChange={ ( event ) => this.setState({ eventInformation: { ...Object.assign( {}, this.state.eventInformation ), name: event.target.value } }) } />
                            <h2 className="section-title">Add location</h2>
                            <SearchLocation name="eventLocation" placeholder="Search for location or click to locate on the map" mapReferance={ this.props.mapReferance } mapMarker={ this.state.mapMarker } getLocationHandler={ this.getLocationLatLng } />
                        </Col>
                        <Col className="with-borders">
                            { this.state.eventInformation.type === 'Fire' ? <div><h2 className="section-title">Fire size</h2><RadioButton name="eventSize" defaultselectedvalue="Small" options={{ Small: 'Small', Medium: 'Medium', Large: 'Large' }} onChange={ ( event ) => this.setState({ eventInformation: { ...Object.assign( {}, this.state.eventInformation ), size: event.target.value } }) } /></div> : <div><h2 className="section-title">Number of persons</h2><Input style={{ marginBottom: '15px' }} type="text" name="personEngaged" placeholder="The number of persons in that event" autoComplete="off" onChange={ ( event ) => this.setState({ eventInformation: { ...Object.assign( {}, this.state.eventInformation ), personEngaged: +event.target.value } }) }/></div> }
                            <h2 className="section-title">Additional information ( Optional )</h2>
                            <TextArea name="additionalInformation" placeholder="Event description or other important details" autoComplete="off" onChange={ ( event ) => this.setState({ eventInformation: { ...Object.assign( {}, this.state.eventInformation ), description: event.target.value } }) }/>
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
                                                <Input mainlabel="Number of cars" type="number" name={ respondType.name + "CrasNumber" } placeholder="0" min={ -1 } onChange={ ( event ) => this.setState({ eventInformation: { ...Object.assign( {}, this.state.eventInformation ), respond: { ...Object.assign( {}, this.state.eventInformation.respond ), [ respondType.name ]: { ...Object.assign( {}, this.state.eventInformation.respond[ respondType.name ] ), numberOfCars: +event.target.value } } } }) }/>
                                            </Card.Body>
                                        </Accordion.Collapse>
                                    </Card>
                                ) ) }
                            </Accordion>
                            <Button className="button-success" onClick={ this.addGetDirections }>Add Event/Get Directions</Button>
                        </Col>
                    </Row>
                </Container>
            </Fragment>
        );
    }
}

export default AddEventPanel;