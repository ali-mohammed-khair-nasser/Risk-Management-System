import React from 'react';
import './CCTVCamera.scss';
import { Row, Col, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { Iconly } from 'react-iconly';

const CCTVCamera = props => (
    <div className="cctv-camera">
        <div className="video-options">
            <Row>
                <Col><h6>{ props.cameraName }</h6></Col>
                <Col>
                    <ul>
                        <li>
                            <OverlayTrigger overlay={ <Tooltip id="tooltip-disabled">Extend view</Tooltip> }>
                                <Iconly set="bold" name="Category" label="Full View" size={ 20 } className="camera-icon" />
                            </OverlayTrigger>
                        </li>
                        { props.cameraStatus ? <li>Live<span className="active"></span></li> : <li>Record<span className="inactive"></span></li> }
                        <li>
                            <OverlayTrigger overlay={ <Tooltip id="tooltip-disabled">Alarms on</Tooltip> }>
                                <Iconly set="bold" name="Danger" label="Notifications" size={ 20 } className="camera-icon" />
                            </OverlayTrigger>
                        </li>
                        <li>
                            <OverlayTrigger overlay={ <Tooltip id="tooltip-disabled">Sounds off</Tooltip> }>
                                <Iconly set="bold" name="VolumeOff" label="Volume" size={ 20 } className="camera-icon" />
                            </OverlayTrigger>
                        </li>
                        <li>
                            <OverlayTrigger overlay={ <Tooltip id="tooltip-disabled">Edit</Tooltip> }>
                                <Iconly set="bold" name="Edit" label="Edit Camera" size={ 20 } className="camera-icon" />
                            </OverlayTrigger>
                        </li>
                        <li>
                            <OverlayTrigger overlay={ <Tooltip id="tooltip-disabled">Delete</Tooltip> }>
                                <Iconly set="bold" name="Delete" label="Delete Camera" size={ 20 } className="camera-icon" />
                            </OverlayTrigger>
                        </li>
                    </ul>
                </Col>
            </Row>
        </div>
        <div className="video-streem"><video src={ props.videoSource } type="video/mp4" autoPlay={ props.autoPlay } loop={ props.loop } muted={ props.muted }></video></div>
    </div>
);

export default CCTVCamera;