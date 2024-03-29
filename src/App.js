//importing comoponents

import React, { useEffect, useState } from "react";
import { Routes, Route } from 'react-router-dom';

import { expenses } from './Components/data.js';
import { TestToComponent } from './Components/demo.js';
import DemoContext from './Components/context.js';
import Maps from "./Components/Maps.js";
import { MultipleMarker } from "./Components/Maps.js";

// Pages
import Users from './Pages/Users.js';
import Signup from './Pages/Signup.js';

// import Home from './Router/Home.js';
// import Orders from './Router/Orders.js';
// import Support from './Router/Support.js';




export default function App() {
  return (
    <>
      <Routes>

        {/* <Route exact path='/form' element={<Signup />} />

        <Route exact path='/' element={<Users />} /> */}

        {/* <Route path='/' element={<Home />} /> */}
        {/* <Route path='/orders' element={<Orders />} /> */}
        {/* <Route path='/support' element={<Support />} /> */}

      </Routes>

      {/* <Maps /> */}
      <MultipleMarker />
    </>



  );
}

// Creating Demo Components //

// Component For Default Export
export function TestComponent() {
  return <h1>This is Test Component</h1>;
}


// ------------ State Example --------------- //

//Component For Named Export
export function Second() {

  const [counter, setCounter] = useState(0);
  //const[counter, dispatch] = useReducer(reducer, initialvalue);

  //useEffect Hook
  useEffect(() => {
    if (counter !== 0) {
      document.title = counter
      alert("useEffect Works Well!")
    }

  }, [counter]);

  //increase counter
  const increase = () => {
    setCounter(count => count + 1);
  };

  //decrease counter
  const decrease = () => {
    setCounter(count => count - 1);
  };

  //reset counter 
  const reset = () => {
    setCounter(0)
  }

  return (
    <>
      <h5>Second component</h5>
      <div className='flex'>
        <TestToComponent />
      </div>

      <div className="counter mt-5">
        <h1>React Counter Using useState and useEffect</h1>
        <span className="counter__output">{counter}</span>
        <div className="btn__container">
          <button className="btn btn-success rounded-pill" onClick={increase}>+</button>
          <button className="btn btn-danger ms-1 rounded-pill" onClick={decrease}>-</button>
          <button className="reset btn btn-warning ms-1" onClick={reset}>Reset</button>
        </div>
      </div>
    </>

  );
}



// ------------ Context Example --------------- //

export const SampleContext = React.createContext();


export const ContextExample = () => {
  return (
    <div>
      <SampleContext.Provider value={expenses}>
        <DemoContext />
      </SampleContext.Provider>
    </div>
  );
}











