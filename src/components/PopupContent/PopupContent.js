import React from 'react';
import './PopupContent.scss';

const PopupContent = props => (
    <div className="popup-content">
        <h2 className="name">{ props.centerInformation.name }</h2>
        <p>{ props.centerInformation.additionalInformation }</p>
        <ul>
            <li><h3>{ props.centerInformation.numberOfCars }</h3><h6>Total Cars</h6></li>
            <li><h3>{ props.centerInformation.numberOfPersons }</h3><h6>Total Persons</h6></li>
            <li><h3>{ props.centerInformation.currentCars }</h3><h6>Available Cars</h6></li>
            <li><h3>{ props.centerInformation.currentPersons }</h3><h6>Available Persons</h6></li>
        </ul>
    </div>
);

export default PopupContent;