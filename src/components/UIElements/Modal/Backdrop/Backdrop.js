import React from 'react';
import './Backdrop.scss';
import { Iconly } from 'react-iconly';

const Modal = ( props ) => (
    <div className="backdrop" onClick={ props.backdropClickHandler } style={{ opacity: props.show ? 1 : 0, pointerEvents: props.show ? 'all' : 'none' }} >
        { props.noArrow ? null : <Iconly name="ArrowRight" stroke="light" label="Arrow Right" size={ 40 } className="exit-icon" /> }
    </div>
);

export default Modal;