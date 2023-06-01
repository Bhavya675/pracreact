import React from 'react'
import { useNavigate } from 'react-router-dom' 

const Support = () => {

    const navigate = useNavigate();
    
    function goToHome(){
        navigate("/")
    }
    return (
        <>
            <div className='d-flex justify-content-center flex-column align-items-center'>
                <h2>Help & Support</h2><br></br><br></br>
                <p>Please generate a complain ticket...</p>
                <button className='btn btn-success'>Generate Ticket</button>
                {/* <button className='btn btn-primary mt-4'><Link to="/" className='mt-3 text-light text-decoration-none'>Home</Link></button> */}
                <button onClick={goToHome} className='btn btn-primary mt-4 text-light text-decoration-none'>Home</button>
            </div>
        </>

    )
}

export default Support