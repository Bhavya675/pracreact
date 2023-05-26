import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import reportWebVitals from './reportWebVitals';
// import TestComponent  from './App.js';
import {Second} from './App.js';
// import {ListAndKey} from './component/ListAndKey';
// import ConditionalRenderingDemo from './component/ConditionalRendering'
import {ContextExample} from './App.js'
import { Reducer } from './component/usereducer';
import Counter from './component/useMemo';
import RefDemo from './component/UseRef';
import TodoList from './component/UseCallback'
// import {ToggleButton} from './component/UseCallback'


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <>
    <h1>React is all about components</h1>
    {/* <TestComponent />
   
    <ListAndKey />
    <ConditionalRenderingDemo /> */}
     <Second />
    <ContextExample />
    <Reducer />
    <Counter />
    <RefDemo />
    <TodoList />
    
  </>
);



reportWebVitals();
