import React, { useRef } from 'react';

// export default function UseRef() {
//   const countRef = useRef(0);

//   const increment = () => {
//     console.log(countRef.current)
//     countRef.current += 1;
//     console.log('Current count:', countRef.current);
//   };

//   return (
//     <div>
//       <p>Count: {countRef.current}</p>
//       <button onClick={increment()}>Increment</button>
//     </div>
//   );
// }

export default function RefDemo() {
    const getRef = useRef(null);
    const setRef = useRef(null);
  
    const handleButtonClick = () => {
      getRef.current.value =  setRef.current.value ;
    };
  
    const formHandler = (e) =>{
        setRef.current.value = e.target.value
    }
    return (
      <div className='mt-4 mb-5'>
        <h2>Transfering Input Value using useRef</h2>
        <p>Write Here</p>
        <div className='d-flex'>
        <input type="text" className='w-25 form-control mb-3' ref={setRef} onChange={formHandler}/>
        <button className='btn btn-secondary h-25 ms-2' onClick={handleButtonClick}>Send Below</button>
        

        </div>
        <p>Get Here</p>
        <input type="text" className='form-control mb-3' ref={getRef} />
        
      </div>
    );
  }