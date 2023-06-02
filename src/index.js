import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

import { BrowserRouter } from 'react-router-dom';
import App from './App'
//import Create from './component/Create/Create';

// import MaterialDemo from './UI/MaterialDemo';
// import {TestComponent}  from './App.js';
// import {Second} from './App.js';
// import {ListAndKey} from './component/ListAndKey';
// import ConditionalRenderingDemo from './component/ConditionalRendering'
// import {ContextExample} from './App.js'
// import { Reducer } from './component/usereducer';
// import Counter from './component/useMemo';
// import RefDemo from './component/UseRef';
// import TodoList from './component/UseCallback'
// import {ToggleButton} from './component/UseCallback'
//import PrimarySearchAppBar from './component/MaterialDemo'

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <>
    <div>

      {/* 
    <h1>React is all about components</h1> */}
      {/* <TestComponent />
   
    <ListAndKey />
    <ConditionalRenderingDemo /> */}
      {/* <Second />
    <ContextExample />
    <Reducer />
    <Counter />
    <RefDemo />
    <TodoList />
     */}
      <BrowserRouter>
        <App />
        
        {/* <MaterialDemo /> */}
      </BrowserRouter>


    </div>
  </>
);


