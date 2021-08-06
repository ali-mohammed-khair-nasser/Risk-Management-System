import React, { Fragment } from 'react';
import './Modal.scss';
import Backdrop from './Backdrop/Backdrop';

const Modal = ( props ) => (
    <Fragment>
        <div className={ [ 'modal', props.className ].join(" ") } style={{ opacity: props.show ? 1 : 0, pointerEvents: props.show ? 'all' : 'none', transform: props.show ? 'translate(-50%, -50%) scale(1)' : 'translate(-50%, -50%) scale(.7)' }} >{ props.children }</div>
        <Backdrop show={ props.show } backdropClickHandler={ props.backdropClickHandler } noArrow={ props.noArrow } />
    </Fragment>
);

export default Modal;