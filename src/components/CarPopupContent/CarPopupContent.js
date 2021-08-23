import React from 'react';
import './CarPopupContent.scss';
import { Container, Row, Col } from 'react-bootstrap';
import RoundedProgressBar from './../EditEvent/RoundedProgressBar/RoundedProgressBar';
import { Select, Button } from '../../components/UIElements/FormElements/FormElements';

const CarPopupContent = ( props ) => (
    <div className="car-popup-content">
        <div className="current-car-info">
            <Container>
                <Row>
                    <Col md="4" className="progress-bar"><RoundedProgressBar progress={ 64 } time={ props.elementInfo.reaction.timeNeeded } distance={ props.elementInfo.reaction.distanceNeeded } /></Col>
                    <Col className="car-info">
                        <h5 className="title">Vehicle information</h5>
                        <p className="meta-info"><span><span className="circle"></span> Status:</span> { props.elementInfo.state.replace(/([a-z0-9])([A-Z])/g, '$1 $2') }</p>
                        <p className="meta-info"><span><span className="circle"></span> Name:</span> { props.elementInfo.name }</p>
                        <p className="meta-info"><span><span className="circle"></span> Center:</span> { props.elementInfo.station.name }</p>
                    </Col>
                </Row>
            </Container>
        </div>
        <span className="info">
            <h2 className="section-title">Respond to an event</h2>
            <Select data-menu className="select-menu" id="events-to-respond" defaultValue={props.elementInfo.state === "Available" ? "Zero" : "One"} options={{ Zero: 'Select event to respond', One: 'Event_fire_and_smoke_135', Two: 'Event_falling_event_651D' }} />
            <Button className="button-danger">Back To Center</Button>
        </span>
    </div>
);

export default CarPopupContent;