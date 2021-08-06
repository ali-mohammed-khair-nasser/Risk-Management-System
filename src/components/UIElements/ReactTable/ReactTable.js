import React from 'react';
import './ReactTable.scss';
import { Table } from 'react-bootstrap';
import { Iconly } from 'react-iconly';
import EmptyState from '../EmptyState/EmptyState';

const ReactTable = ( props ) => {
    // Get all locations from props and loop on it
    // Then make a row for each one of them with it's data
    // Then add options to this row ( show, edit, delete )
    // Finally add them to locations array and show them in the table
    const locationsArray = Object.keys( props.locations ).map( ( locationKey ) => {
        return (
            <tr className="table-row" key={ props.locations[ locationKey ].id }>
                <td>{ +locationKey + 1 }</td>
                <td>{ props.locations[ locationKey ].name }</td>
                <td>{ props.locations[ locationKey ].city }, { props.locations[ locationKey ].country }</td>
                <td>{ props.locations[ locationKey ].numberOfCars }</td>
                <td>{ props.locations[ locationKey ].numberOfPersons }</td>
                <td className={ ( props.locations[ locationKey ].currentCars <= 0 ) ? 'no-available-cars' : 'available-cars' }>
                    <span className="ball"></span>{ ( props.locations[ locationKey ].currentCars <= 0 ) ? <span>No cars available</span> : <span>{ props.locations[ locationKey ].currentCars } Available cars and { props.locations[ locationKey ].currentPersons } persons</span> }
                </td>
                <td>
                    <div className="row-options">
                        <Iconly name="Show" size={ 28 } className="row-options-icon" />
                        <Iconly name="Edit" size={ 28 } className="row-options-icon" />
                        <Iconly name="Delete" size={ 25 } className="row-options-icon" onClick={ ( event ) => props.deleteCenterHandler( event, props.locations[ locationKey ].id ) } />
                    </div>
                </td>
            </tr>
        );
    });

    return(
        <Table className="react-table">
            <thead><tr><th>#</th><th>Name</th><th>Location</th><th>Cars</th><th>Persons</th><th>Current Status</th><th>Actions</th></tr></thead>
            <tbody>{ locationsArray.length > 0 ? locationsArray : <tr><td style={{ border: 'none' }}><EmptyState title="No centers matches your filters" text="Try another key words for search or maybe you should change the filters that you apply on the search" /></td></tr> }</tbody>
        </Table>
    );
}

export default ReactTable;