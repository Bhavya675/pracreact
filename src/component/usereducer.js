
import React, { useEffect, useState, useReducer } from "react";


// Initial state
const initialState = {
    count: 0,
  };
  
  // Reducer function
  const reducer = (state, action) => {
    switch (action.type) {
  
      case 'Increment':
        return {
          count: state.count + 1,
        };
  
      case 'Decrement':
        return {
          count: state.count - 1,
        };
  
      case 'Reset':
        return {
          count: 0,
        };
  
      default:
        return state;
    }
  };
  
  const Counter = () => {
    // useReducer hook
    const [state, dispatch] = useReducer(reducer, initialState);
  
    return (
      <div>
        <p>{state.count}</p>
        <button className="btn btn-success rounded-pill" onClick={() => dispatch({ type: 'Increment' })}>+</button>
        <button className="btn btn-danger rounded-pill ms-1" onClick={() => dispatch({ type: 'Decrement' })}>-</button>
        <button className="btn btn-warning ms-1"onClick={() => dispatch({ type: 'Reset' })}>Reset</button>
      </div>
    );
  };
  
  export const Reducer = () => {
    return (
      <div className='mt-5'>
        <h1>Counter Example using useReducer</h1>
        <Counter />
      </div>
    );
  };
  
  