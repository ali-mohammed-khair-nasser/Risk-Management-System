import React, { Component } from 'react';
import './App.scss';
import MainMap from '../MainMap/MainMap';
import MainMenu from '../../components/MainMenu/MainMenu';
import ActionCenters from '../ActionCenters/ActionCenters';
import Cameras from '../../components/Cameras/Cameras';
import { BrowserRouter, Route } from 'react-router-dom';
import { connect } from 'react-redux';
import * as actions from '../../store/actions/index';

class App extends Component {
    // Calling the update datat on component mout to get the data from the database for the first time
    componentDidMount() { this.props.updateData(); }

    render() {
        return (
            <BrowserRouter>
                <div className="app">
                    <Route path="/" exact component={ MainMap } />
                    <Route path="/actionCenters" exact component={ ActionCenters } />
                    <Route path="/cameras" exact component={ Cameras } />
                    <MainMenu />
                </div>
            </BrowserRouter>
        );
    }
}

// Connect the component to redux store then export it
const mapStateToProps = ( state ) => ({ locations: state.elements.locations, cameras: state.elements.cameras });
const mapDispatchToProps = ( dispatch ) => ({ updateData: () => dispatch(actions.getAllElements()) });
export default connect(mapStateToProps, mapDispatchToProps)(App);