import React, { useState, useCallback } from 'react';

export default function TodoList() {
    const [todos, setTodos] = useState([]);
    const [inputValue, setInputValue] = useState('');

    const handleInputChange = useCallback((event) => {
        setInputValue(event.target.value);
    }, []);

    const handleAddTodo = useCallback(() => {
        setTodos((prevTodos) => [...prevTodos, inputValue]);
        setInputValue('');
    }, [inputValue]);

    const handleDeleteTodo = useCallback((index) => {
        setTodos((prevTodos) => prevTodos.filter((_, i) => i !== index));
    }, []);

    return (
        <div>
            <h2>Todo List using UseCallback</h2>
            <div className='d-flex mt-4'>
                <input type="text" className='w-25 form-control mb-3' value={inputValue} onChange={handleInputChange} />
                <button className='btn btn-success h-25 ms-2' onClick={handleAddTodo}>Add Todo</button>
            </div>
            <ul>
                {todos.map((todo, index) => (
                    <li key={index}>
                        <div className='mt-2'>
                            {todo}
                            <button className='btn btn-danger ms-5 h-25' onClick={() => handleDeleteTodo(index)}>Delete</button>
                        </div>

                    </li>
                ))}
            </ul>
        </div>
    );
}

