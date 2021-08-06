import React from 'react';
import './Cameras.scss';
import { Container, Row, Col } from 'react-bootstrap';
import { RadioButton } from '../../components/UIElements/FormElements/FormElements';
import CCTVCamera from '../CCTVCamera/CCTVCamera';
import { connect } from 'react-redux';

const Cameras = ( props ) => (
    <div className="all-cameras">
        <div className="header">
            <Container>
                <Row>
                    <Col><h4>Surveillance Cameras (CCTV)</h4></Col>
                    <Col lg="4"><RadioButton name="camerasView" defaultselectedvalue="allCameras" options={{ allCameras: 'All Cameras', normalCameras: 'Normal Cameras', detectedEventsCameras: 'Detected Events Cameras' }}/></Col>
                </Row>
            </Container>
        </div>
        <div className="cameras">
            <Container>{ props.cameras.map( ( cameraKey ) => <CCTVCamera key={ cameraKey.id } cameraName={ cameraKey.name } cameraStatus={ true } videoSource={ require( '../../assets/videos/' + cameraKey.streamUrl ).default } autoPlay={ true } muted={ true } loop={ true } />) }</Container>
        </div>
    </div>
);

// Connect the component to redux store then export it
const mapStateToProps = ( state ) => ({ cameras: state.elements.cameras });
export default connect(mapStateToProps)(Cameras);