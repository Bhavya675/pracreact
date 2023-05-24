//importing comoponents
import { TestToComponent } from './component/demo.js';
import React, { useState } from "react";
import { expenses } from './component/data.js';
// import './App.css'



// Creating Demo Components //

//Component For Default Export
function TestComponent() {
  return <h1>This is Test Component</h1>;
}


//Component For Named Export
export function Second() {

  const [counter, setCounter] = useState(0);

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

      <div className="counter">
        <h1>React Counter</h1>
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

export function ListAndKey() {
  const [selectedValue, setSelectedValue] = useState('');
  const handleDropdownChange = (event) => {
    setSelectedValue(event.target.value);
  };

  const filteredExpenses = expenses.filter(element => element.category === selectedValue);

  return (
    <>
      <h3>Expense List</h3>
      <select className='form-select' value={selectedValue} onChange={handleDropdownChange}>
        <option value="">Choose Category</option>
        <option value="Expensive">Expensive</option>
        <option value="Moderate">Moderate</option>
      </select>
      <ol>
        {filteredExpenses.map((expense) => (
          <li key={expense.id}>
            Title: {expense.title} <br />
            Amount: ${expense.amount} <br />
            Category: {expense.category} <br /> <br />
          </li>
        ))}
      </ol>
    </>
  );
}


export default TestComponent;
