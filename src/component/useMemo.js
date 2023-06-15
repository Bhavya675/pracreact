import React, { useMemo, useState } from 'react'

function Counter() {
    const [counterOne, setCounterOne] = useState(0)
    const [counterTwo, setCounterTwo] = useState(0)

    const incrementOne = () => {
        setCounterOne(counterOne + 1);
    }

    const incrementTwo = () => {
        setCounterTwo(counterTwo + 2);
    }


    const isEven = useMemo(() => {
        let i = 0;
        while (i < 200000000) i++
        return counterOne % 2 === 0
    }, [counterOne])

    const isDivisibleByThree = () => {
        let i = 0;
        while (i < 2000) i++
        console.log(i)
        return counterTwo % 3 === 0
    }

    return (
        <>
            <h2 className='mb-2 mt-5'>Example of useMemo(Kindely check the load)</h2>

            <div className='mt-4 d-flex mb-5'>

                <div>
                    <p className='fs-5 '>{counterOne}</p>
                    <button className='btn btn-secondary' onClick={incrementOne}>Increment By One</button>
                    <span>{isEven ? 'Even' : 'Odd'}</span>
                </div>

                <div>
                    <p>{counterTwo}</p>
                    <button className='btn btn-secondary' onClick={incrementTwo}>Increment By Two</button>
                    <span>{isDivisibleByThree() ? 'Divisible By Three' : 'Not Divisible By Three'}</span>
                </div>

            </div>
        </>
    );
}






export default Counter;