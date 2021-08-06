import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './containers/App/App';
import reportWebVitals from './reportWebVitals';
import { createStore, combineReducers, applyMiddleware, compose } from 'redux';
import { Provider } from 'react-redux';
import ReduxThunk from 'redux-thunk';
import elementsReducer from './store/reducers/elementsReducer';

// Combilne all reducers to one reducer for the redux pakage to can use it
const rootReducer = combineReducers({ elements: elementsReducer });

// Create compose enhancers helper function to we can activate the redux devtool chrome extention
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

// Create redux store and apply middleware to give us the ability to dispatch asynchronous code
const store = createStore(rootReducer, composeEnhancers(applyMiddleware(ReduxThunk)));

// Finally render our application to the DOM
ReactDOM.render(<Provider store={ store }><App /></Provider>, document.getElementById('root'));

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
