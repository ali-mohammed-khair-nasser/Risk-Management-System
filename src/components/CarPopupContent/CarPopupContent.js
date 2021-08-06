import React from 'react';
import './CarPopupContent.scss';

const CarPopupContent = props => (
    <div className="car-popup-content">
        <span className="icon" style={{ backgroundColor: props.iconcolor }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                <defs>
                    <clipPath id="clip-path"><rect width="24" height="24" fill="none"/></clipPath>
                    <clipPath id="clip-path-2">
                        <path id="path" d="M27.727,27.273v1.364a1.364,1.364,0,0,1-2.727,0V27.273H15v1.364a1.364,1.364,0,0,1-2.727,0V27.273A2.279,2.279,0,0,1,10,25V19.545a2.256,2.256,0,0,1,1.023-1.886l1.409-5.636A2.742,2.742,0,0,1,15,10H25a2.742,2.742,0,0,1,2.568,2.023l1.409,5.636A2.256,2.256,0,0,1,30,19.545V25a2.279,2.279,0,0,1-2.273,2.273ZM25.818,12.455A.961.961,0,0,0,25,11.818H15a.961.961,0,0,0-.818.636l-1.2,4.818H27.023l-1.2-4.818Zm-14,7.091V25a.456.456,0,0,0,.455.455H27.727A.456.456,0,0,0,28.182,25V19.545a.456.456,0,0,0-.455-.455H12.273a.456.456,0,0,0-.455.455ZM15,23.636a1.364,1.364,0,1,1,1.364-1.364A1.368,1.368,0,0,1,15,23.636Zm10,0a1.364,1.364,0,1,1,1.364-1.364A1.368,1.368,0,0,1,25,23.636Z" transform="translate(-10 -10)"/>
                    </clipPath>
                </defs>
                <g id="icons_transport_car" data-name="icons/transport/car" clipPath="url(#clip-path)">
                    <rect id="bg" width="24" height="24" fill="none"/>
                    <g id="icon" transform="translate(2 2)" clipPath="url(#clip-path-2)"><rect id="bg-2" data-name="bg" width="24.545" height="24.545" transform="translate(-2.273 -2.273)" fill="#fff"/></g>
                </g>
            </svg>
        </span>
        <span className="info">
            <h3>{ props.neddedTime }</h3>
            <p>{ props.neededDistance }</p>
        </span>
    </div>
);

export default CarPopupContent;