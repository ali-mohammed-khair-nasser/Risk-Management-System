import * as actionTypes from './actionTyprs';
import axios from 'axios';
import io from "socket.io-client";

// Creating socket io instance
const socket = io.connect('localhost:8080');

// Initialize location and cameras action creator function:
// ========================================================
// this will dispatch an action to make http request to the server and fitch all locations and cameras data
// We don't need to export this function because we used only on run the asynchronous code
export const initLocationsAndCameras = ( responsesData ) => {
    let carsArray = [];
    Object.keys( responsesData[ 2 ].data.data ).map( ( key ) => ({ ...responsesData[ 2 ].data.data[ key ] })).forEach( (car) => carsArray.push({ carID: car.id, carInfo: car }));
    return {
        type: actionTypes.GET_ALL_ELEMENTS,
        paylod: {
            Locations: Object.keys( responsesData[ 0 ].data.data ).map( ( key ) => ({ ...responsesData[ 0 ].data.data[ key ] })),
            Cameras: Object.keys( responsesData[ 1 ].data.data ).map( ( key ) => ({ ...responsesData[ 1 ].data.data[ key ] })),
            Events: Object.keys( responsesData[ 3 ].data.data ).map( ( key ) => ({ ...responsesData[ 3 ].data.data[ key ] })),
            Cars: carsArray
        }
    }
};

// Get cars location from socket function:
// =======================================
// This function get the location of all cars on the map every second from the server
// Then update the locations of the cars in our store :D
export const getCarsLocationFromSocket = ( oldLocations ) => {
    return ( dispatch ) => {
        socket.on("elements", ( newCarLocationElement ) => dispatch(updateCarsLocation(oldLocations, newCarLocationElement)) );
    }
}

// Update cars location function:
// ==============================
// After getting a car location we should update this car location only and not all cars
// So we compare our cars if the updated car is not one of them then add this car to our array ( as old car )
// Else put the new car element ( the updated one ) to that array 
// Finally return the updated cars array to update the store and update the dom :)
export const updateCarsLocation = ( oldCarLocations, newCarLocationElement ) => {
    let newCarsLocationsArray = [];
    oldCarLocations.forEach( ( car ) => {
        car.id !== newCarLocationElement.id ? newCarsLocationsArray.push(car) : newCarsLocationsArray.push(newCarLocationElement);
    });
    return {
        type: actionTypes.UPDATE_CARS_LOCATIONS,
        paylod: { Cars: newCarsLocationsArray }
    }
}

// Get all elements function:
// ======================
// This function used to update the state in the reducer then update the UI when new center has been added, deleted or edited ...etc
// We make two requests to the database for diffirent two tables then spread the request response object to get the right data for the centers and cameras
// Finally, if there is any error happend print it to console
export const getAllElements = () => {
    return ( dispatch ) => {
        axios.all([
            axios.get('http://localhost:8080/api/station'),
            axios.get('http://localhost:8080/api/camera'),
            axios.get('http://localhost:8080/api/element'),
            axios.get('http://localhost:8080/api/event')
        ]).then(axios.spread((...responses) => {
            dispatch(initLocationsAndCameras(responses));
        })).catch( ( errors ) => { console.log(errors); });
    }
}

// Handle closing modal and backdrop functions
export const addElementBackdropOpen = () => ({ type: actionTypes.ADDING_NEW_ELEMENT_BACKDROP });
export const deleteElementBackdropOpen = () => ({ type: actionTypes.DELETE_ELEMENT_BACKDROP });
export const hideBackdrop = () => ({ type: actionTypes.HIDE_BACKDROP });

// Add new element function:
// =========================
// In this function we get the data in an object to save it to the database then we make the http request to save it to the database
// We do the same thing to cameras and locations and for that we use only one action creator for them both
// After passing the data to the database and when we get a response from the server then we will update the table by calling the update function and close the modal
export const addElement = ( elementType, elementInformation ) => {
    return ( dispatch ) => {
        axios.post( `http://localhost:8080/api/${ elementType }`, elementInformation ).then( ( response ) => {
            if ( response ) {
                dispatch(getAllElements());
                dispatch(hideBackdrop());
            }
        }).catch( ( error ) => { console.log( error ); } );
    }
}

// Delete element function:
// ========================
// This function take the element type and id then make request to the server for deleting that record from the database
// After delete the record and getting response code then update the UI :)
export const deleteElement = ( elementType, elementId ) => {
    if ( elementId !== null ) {
        return ( dispatch )  => {
            axios.delete( `http://localhost:8080/api/${ elementType }/${ elementId }` ).then( ( response ) => {
                if ( response ) {
                    dispatch(getAllElements());
                    dispatch(hideBackdrop());
                }
            }).catch( ( error ) => { console.log( error ); });
        }
    }
}