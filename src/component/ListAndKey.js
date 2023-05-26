
import { expenses } from './data.js';
import React, { useEffect, useState, useReducer } from "react";
// ------------ List and Key Example --------------- //

export function ListAndKey() {
    const [selectedValue, setSelectedValue] = useState('');
    const handleDropdownChange = (event) => {
      setSelectedValue(event.target.value);
    };
  
    const filteredExpenses = expenses.filter(element => element.category === selectedValue);
  
    return (
      <div className='mt-5'>
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
      </div>
    );
  }
  