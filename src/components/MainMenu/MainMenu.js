import React, { Fragment } from 'react';
import { Iconly } from 'react-iconly';
import './MainMenu.scss';
import { NavLink } from 'react-router-dom';

const MainMenu = () => (
    <Fragment>
        <header className="main-menu">
            <div className="inner-menu">
                <NavLink to="/" exact><Iconly name="Category" label="Category" size={ 25 } className="menu-icon" /></NavLink>
                <NavLink to="/actionCenters" exact><Iconly name="Activity" label="Activity" size={ 28 } className="menu-icon" /></NavLink>
                <NavLink to="/cameras" exact><Iconly name="Video" label="Video" size={ 28 } className="menu-icon" /></NavLink>
                <NavLink to="/logs" exact><Iconly name="Paper" label="Paper" size={ 28 } className="menu-icon" /></NavLink>
                <NavLink to="/settings" exact><Iconly name="Setting" label="Setting" size={ 28 } className="menu-icon" /></NavLink>
                <span className="slide"></span>
            </div>
        </header>
        <div className="dummy-map"></div>
    </Fragment>
);

export default MainMenu;