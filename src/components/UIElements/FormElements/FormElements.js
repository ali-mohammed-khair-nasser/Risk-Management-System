import React, { Fragment } from 'react';
import './FormElements.scss';
import { Iconly } from 'react-iconly';

// Button
const Button = ( props ) => <button { ...props }>{ props.children }</button>;

// Input
const Input = ( props ) => (
    <div className="input-area">
        { props.mainlabel ? <label className="main-label">{ props.mainlabel }</label> : null }
        <input { ...props } />
    </div>
);

// Textarea
const TextArea = ( props ) => (
    <div className="text-area-area">
        { props.mainlabel ? <label className="main-label">{ props.mainlabel }</label> : null }
        <textarea { ...props }></textarea>
    </div>
);

// Select
const Select = ( props ) => {
    // Get the selected option and loop on all options and make select HTML element with all of this options
    // Finally put all of thise options in the select menu
    const selectMenuOptions = Object.keys(props.options).map( ( optionKey ) => {
        return <option value={ optionKey } key={ optionKey }>{ props.options[optionKey] }</option>;
    });
    return (
        <div className="select-area">
            { props.mainlabel ? <label className="main-label">{ props.mainlabel }</label> : null }
            <Iconly name="ChevronDown" size={ 24 } className="menu-icon" />
            <select { ...props }>{ selectMenuOptions }</select>
        </div>
    );
}

// Radio button
const RadioButton = ( props ) => {
    // Get the selected option and loop on all options and make input field of all of them with it's options
    // Then put all of thise inputs in the same radio group
    const defaultValue = props.defaultselectedvalue;
    const radioButtonOptions = Object.keys(props.options).map( ( optionKey ) => {
        return (
            <Fragment key={ optionKey }>
                <input type="radio" { ...props } id={ optionKey } value={ optionKey } defaultChecked={ defaultValue === optionKey ? true : false } />
                <label htmlFor={ optionKey }>{ props.options[optionKey] }</label>
            </Fragment>
        );
    });

    return (
        <Fragment>
            { props.mainlabel ? <label className="main-label">{ props.mainlabel }</label> : null }
            <div className="radio-button-group">{ radioButtonOptions }</div>
        </Fragment>
    );
}

export { Button, Input, RadioButton, Select, TextArea };