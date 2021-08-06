import React from 'react';
import './EmptyState.scss';

const EmptyState = ( props ) => (
    <div className="empty-state">
        <img src={ require( '../../../assets/images/EmptyState.svg' ).default } alt="Empty Status" />
        <h3>{ props.title }</h3>
        <p>{ props.text }</p>
    </div>
);

export default EmptyState;