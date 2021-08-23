import * as actionTypes from '../actions/actionTyprs';
import { updateState } from '../utilities';

// State contents:
// ===============
// locations: It will contains all locations that we need to put it on the map or in the tabel in action centers page
// cameras: It will contains all cameras that we have on our map ( array of cameras where each camera has it's own options )
// addNewCenter: Used for open and close the adding modal
// deleteCenter: Used for open and close the deleting modal
const initialState = {
    locations: [],
    cameras: [],
    cars: [],
    events: [],
    addNewCenter: false,
    deleteCenter: false 
};

const elementsReducer = ( state = initialState, action ) => {
    switch( action.type ) {
        case actionTypes.GET_ALL_ELEMENTS: return updateState(state, {
            locations: action.paylod.Locations,
            cameras: action.paylod.Cameras,
            cars: action.paylod.Cars,
            events: action.paylod.Events
        });
        case actionTypes.ADDING_NEW_ELEMENT_BACKDROP: return updateState(state, { addNewCenter: true });
        case actionTypes.DELETE_ELEMENT_BACKDROP: return updateState(state, { deleteCenter: true });
        case actionTypes.HIDE_BACKDROP: return updateState(state, { addNewCenter: false, deleteCenter: false });
        case actionTypes.UPDATE_CARS_LOCATIONS: return updateState(state, { cars: action.paylod.Cars });
        case actionTypes.UPDATE_EVENT_INFORMATION: return updateState(state, { events: action.paylod.Events });
        default: return state;
    }
};

export default elementsReducer;