import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import reportWebVitals from './reportWebVitals';
import TestComponent  from './App.js';
import {Second} from './App.js';


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <>
    <h1>React is all about components</h1>
    <TestComponent />
    <Second />
  </>
);

reportWebVitals();
