import React from 'react';
import './EditEvent.scss';
import RoundedProgressBar from './RoundedProgressBar/RoundedProgressBar';
import { Iconly } from 'react-iconly';
import { Button, RadioButton, Input, TextArea } from '../UIElements/FormElements/FormElements';
import { Container, Row, Col, Accordion, Card } from 'react-bootstrap';
import SearchLocation from '../../containers/SearchLocation/SearchLocation';

const EditEvent = ( props ) => {
    return (
        <div className="edit-event">
            <div className="current-event-info">
                <Container>
                    <Row>
                        <Col md="4" className="progress-bar"><RoundedProgressBar progress={ 64 } time="16 min" distance="9.3 km" /></Col>
                        <Col className="event-info">
                            <h5 className="title">Current Respond information</h5>
                            <p className="meta-info"><span><span className="circle"></span> Status:</span> going to event.</p>
                            <p className="meta-info"><span><span className="circle"></span> Respond:</span> 5 fire cars with 36 fireman, 2 ambulances with 12 persons, 1 police car with 5 policeman.</p>
                        </Col>
                    </Row>
                </Container>
            </div>
            <div className="edit-main-information">
                <h5 className="title">update main information</h5>
                <Input mainlabel="Event name" type="text" name="newEventName" defaultValue="Event_fire_and_smoke_135" autoComplete="off" />
                <SearchLocation mainlabel="Event location" name="newEventLocation" placeholder="Edit event location on the map" mapReferance={ props.mapReferance } mapMarker={ props.mapMarker } />
                { props.eventInformation.type === 'SmokeFire' ? <RadioButton mainlabel="Fire size" name="newEventSize" defaultselectedvalue="newSizeSmall" options={{ newSizeSmall: 'Small', newSizeMedium: 'Medium', newSizeLarge: 'Large' }} /> : <Input mainlabel="Number of persons" style={{ marginBottom: '15px' }} type="text" name="newPersonEngaged" placeholder="The number of persons in that event" autoComplete="off" /> }
                <TextArea mainlabel="Additional information" name="newAdditionalInformation" placeholder="Event description or other important details" autoComplete="off" />
            </div>
            <div className="edit-event-respond">
                <h5 className="title">Send More cars & persons</h5>
                <Accordion defaultActiveKey="0">
                    { props.eventRespond.map( ( respondType, respondTypeIdx ) => (
                        <Card key={ respondTypeIdx }>
                            <Card.Header>
                                <Accordion.Toggle as={ Button } variant="link" eventKey={ respondTypeIdx.toString() } onClick={ () => props.colorTheSelectedTab( respondTypeIdx ) }>
                                    <div className="checkbox">
                                        <label className={ `checkbox-container ${ respondType.defaultChecked ? 'checked' : '' }` }><Iconly name="Play" label="TickSquare" set="bold" size={ 24 } className="iconly" /> { respondType.label }</label>
                                    </div>
                                </Accordion.Toggle>
                            </Card.Header>
                            <Accordion.Collapse eventKey={ respondTypeIdx.toString() }>
                                <Card.Body><Input mainlabel="Number of cars" type="number" name={ respondType.name + 'NewCrasNumber' } placeholder="0" min={ 0 } /></Card.Body>
                            </Accordion.Collapse>
                        </Card>
                    ) ) }
                </Accordion>
            </div>
            <div className="options">
                <Button className="button-success"><Iconly name="Edit" size={ 25 } className="options-icon" /> Update Event</Button>
                <Button className="button-danger"><Iconly name="Delete" size={ 22 } className="options-icon" /> Terminate Event</Button>
            </div>
        </div>
    );
};

export default EditEvent;