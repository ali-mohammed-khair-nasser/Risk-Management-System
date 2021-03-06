import React, { Component } from 'react';
import './App.scss';
import MainMap from '../MainMap/MainMap';
import MainMenu from '../../components/MainMenu/MainMenu';
import ActionCenters from '../ActionCenters/ActionCenters';
import Cameras from '../../components/Cameras/Cameras';
import { BrowserRouter, Route, Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import * as actions from '../../store/actions/index';

class App extends Component {
    // Calling the update datat on component mout to get the data from the database for the first time
    componentDidMount() { this.props.updateData(); }

    // We use redirect to home page for the deploy ( for github pages )
    render() {
        return (
            <BrowserRouter>
                <div className="app">
                    <Redirect to="/" />
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
const mapDispatchToProps = ( dispatch ) => ({ updateData: () => dispatch(actions.getAllElements()) });
export default connect(null, mapDispatchToProps)(App);