import React, { Component, Fragment } from 'react';
import './ActionCenters.scss';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Row, Col } from 'react-bootstrap';
import { Input, Select, Button, RadioButton } from '../../components/UIElements/FormElements/FormElements';
import ReactTable from '../../components/UIElements/ReactTable/ReactTable';
import Modal from '../../components/UIElements/Modal/Modal';
import AddLocation from '../AddLocation/AddLocation';
import Spinner from '../../components/UIElements/Spinner/Spinner';
import { connect } from 'react-redux';
import * as actions from '../../store/actions/index';

class ActionCenters extends Component {
    // Component state contents:
    // =========================
    // filterBySelectBox: Contain the first part of the top filters and that include:
    // sortFilter: Sort by name or by number of cars or persons assanding or desending
    // statusFilter: Showing all status or available or not available status
    // searchFilterBox: For searching for a spicific center by it's name
    // viewCentersFilters: Filter the centers passed on it's type ( Fire stations, Medical centers, Police centers )
    // selectedCenter: Used to know which center should deleted
    state = {
        filterBySelectBox: {
            sortFilter: 'sortByNameASC',
            statusFilter: 'allStatus'
        },
        searchFilterBox: '',
        viewCentersFilters: 'allCenters',
        selectedCenter: null,
    }

    // Filter by select box click function:
    // ====================================
    // Getting selected option of the options menu value then set the state to the right selected values to use it in the filter
    filterBySelectBoxClickHandle = () => {
        this.setState({
            filterBySelectBox: {
                sortFilter: document.getElementById( 'sort-type' ).value,
                statusFilter: document.getElementById( 'status-view' ).value
            }
        });
    }

    // Filter locations function:
    // ==========================
    // After getting filtering values then it's time to filter the locations passed on that filter values
    // Apply select boxes sort filters
    filterLocations = ( filteredLocations ) => {
        // Filter by location information
        switch ( this.state.filterBySelectBox.sortFilter ) {
            // Sort locations by it's name alphabeticaly DESC
            case 'sortByNameDESC': filteredLocations.sort( ( locationOne, locationTwo ) => locationTwo.name.localeCompare( locationOne.name.toLowerCase() ) ); break;
            // Sort locations by it's number of cars ASC
            case 'sortByCarsNumberASC': filteredLocations.sort( ( locationOne, locationTwo ) => locationOne.numberOfCars - locationTwo.numberOfCars ); break;
            // Sort locations by it's number of cars DESC
            case 'sortByCarsNumberDESC': filteredLocations.sort( ( locationOne, locationTwo ) => locationTwo.numberOfCars - locationOne.numberOfCars ); break;
            // Sort locations by it's number of persons ASC
            case 'sortByPersonsNumberASC': filteredLocations.sort( ( locationOne, locationTwo ) => locationOne.numberOfPersons - locationTwo.numberOfPersons ); break;
            // Sort locations by it's number of persons DESC
            case 'sortByPersonsNumberDESC': filteredLocations.sort( ( locationOne, locationTwo ) => locationTwo.numberOfPersons - locationOne.numberOfPersons ); break;
            // Sort locations by it's name alphabeticaly ASC
            default: filteredLocations.sort( ( locationOne, locationTwo ) => locationOne.name.localeCompare( locationTwo.name.toLowerCase() ) );
        }
        // Apply select boxes status filters ( Filter by availability )
        if ( this.state.filterBySelectBox.statusFilter === 'available' ) {
            filteredLocations = filteredLocations.filter( location => location.currentCars > 0 );
        } else if ( this.state.filterBySelectBox.statusFilter === 'notAvailable' ) {
            filteredLocations = filteredLocations.filter( location => location.currentCars <= 0 );
        }
        // Apply search filter ( Filter by name )
        filteredLocations = filteredLocations.filter( location => ( location.name.toLowerCase().includes( this.state.searchFilterBox.toLowerCase() ) ) );
        // Apply radio buttons filter ( Filter by type )
        filteredLocations = ( this.state.viewCentersFilters === 'allCenters' ) ? filteredLocations : filteredLocations.filter( location => ( location.type.includes( this.state.viewCentersFilters ) ) );
        // Return the filtered locations to apply the filters on the data
        return filteredLocations;
    }

    // Get center to delete function:
    // ===============================
    // Get the right center id and set the state to prepare it for delete
    getCenterToDelete = ( event, centerId ) => {
        event.preventDefault(); // Prevent button click defaults becouse we want to handle the request by javascript
        this.props.deleteElementBackdropOpen();
        this.setState({ selectedCenter: centerId });
    }

    render() {
        // Prepare the result of the table by applying filters on it then pass that results to the table to display it :)
        const filteredLocationsResults = this.filterLocations( this.props.locations );
        return (
            <Fragment>
                <Modal show={ this.props.addNewCenter } backdropClickHandler={ this.props.hideBackdrop }>
                    <AddLocation backdropClickHandler={ this.props.hideBackdrop } updateHandler={ this.props.updateData } />
                </Modal>
                <Modal show={ this.props.deleteCenter } backdropClickHandler={ this.props.hideBackdrop } noArrow className="delete-panel">
                    <img src={ require('../../assets/images/Trash.svg').default } alt="Trash icon" />
                    <h3>Confirm Permanently Delete</h3>
                    <p>Are you sure you want to delete this center permanently? <br/><strong>No going back in this step.</strong> You will not be able to recover the center again.</p>
                    <Button className="button-reverse-active" onClick={ this.props.hideBackdrop }>No, Keep it</Button>
                    <Button className="button-reverse" onClick={ () => this.props.deleteElement( "station", this.state.selectedCenter ) }>Yes, Delete it</Button>
                </Modal>
                <Container fluid className="action-centers-option-area">
                    <Row>
                        <Col>
                            <h2 className="section-title">Filter the centers</h2>
                            <Select data-menu className="select-menu" id="sort-type" defaultValue="sortByNameASC" options={{ sortByNameASC: 'Sort by name ASC', sortByNameDESC: 'Sort by name DESC', sortByCarsNumberASC: 'Sort by Cars Number ASC', sortByCarsNumberDESC: 'Sort by Cars Number DESC', sortByPersonsNumberASC: 'Sort by Persons Number ASC', sortByPersonsNumberDESC: 'Sort by Persons Number DESC' }} />
                            <Select data-menu className="select-menu" id="status-view" defaultValue="allStatus" options={{ allStatus: 'All status', available: 'Available status', notAvailable: 'Not available status' }} />
                            <Button className="button-success" onClick={ this.filterBySelectBoxClickHandle }>Apply</Button>
                        </Col>
                        <Col className="with-borders">
                            <h2 className="section-title">Search for action center</h2>
                            <Input type="search" name="search" placeholder="Type center full name or letters here..." autoComplete="off" onChange={ ( event ) => this.setState({ searchFilterBox: event.target.value }) } />
                        </Col>
                        <Col>
                            <h2 className="section-title">View centers</h2>
                            <RadioButton name="centersView" defaultselectedvalue="allCenters" options={{ allCenters: 'All', FireStation: 'Fire stations', MedicalCenter: 'Hospitals', PoliceCenter: 'Police centers' }} onChange={ ( event ) => this.setState({ viewCentersFilters: event.target.value }) } />
                        </Col>
                    </Row>
                </Container>
                <Container fluid className="action-centers-table">{ this.props.locations.length > 0 ? <ReactTable locations={ filteredLocationsResults } deleteCenterHandler={ this.getCenterToDelete } /> : <Spinner /> }</Container>
                <Button className="circle-button" onClick={ this.props.addNewLocationBackdropOpen } aria-label="Add Location"><svg xmlns="http://www.w3.org/2000/svg" width="13.5" height="13.5" viewBox="0 0 13.5 13.5"><g id="Iconly_Light_Plus" data-name="Iconly/Light/Plus" transform="translate(12.75 12.75) rotate(180)"><g id="Plus"><path id="Line_185" d="M.476,0V12" transform="translate(5.524)" fill="none" stroke="#fff" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth="1.5" /><path id="Line_186" d="M12,.476H0" transform="translate(0 5.524)" fill="none" stroke="#fff" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth="1.5" /></g></g></svg></Button>
            </Fragment>
        );
    }
}

// Connect the component to redux store then export it
const mapStateToProps = ( state ) => ({
    locations: state.elements.locations,
    addNewCenter: state.elements.addNewCenter,
    deleteCenter: state.elements.deleteCenter
});

const mapDispatchToProps = ( dispatch ) => ({
    updateData: () => dispatch(actions.getAllElements()),
    addNewLocationBackdropOpen: () => dispatch(actions.addElementBackdropOpen()),
    hideBackdrop: () => dispatch(actions.hideBackdrop()),
    deleteElementBackdropOpen: () => dispatch(actions.deleteElementBackdropOpen()),
    deleteElement: ( elementType, elementID ) => dispatch(actions.deleteElement( elementType, elementID ))
});

export default connect(mapStateToProps, mapDispatchToProps)(ActionCenters);