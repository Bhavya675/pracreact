import React from 'react'
import { useNavigate } from 'react-router-dom'
import { userOrders } from '../component/data';


const Home = () => {

    const navigate = useNavigate();

    function goToOrders(){
        navigate("/orders", {state : userOrders })
    }

    function goToSupport(){
        navigate("/support")
    }
   
    return (

        <>
            <div className='d-flex justify-content-center flex-column align-items-center'>
                <h3>This is Home Page of E-Commerce App</h3>

                
                {/* <button className='btn btn-warning mt-4'><Link to="/orders" className='mt-3 text-dark text-decoration-none'>Your Orders</Link></button> */}
                {/* <button className='btn btn-secondary mt-4'><Link to="/support" className='mt-3 text-light text-decoration-none'>Help and Support</Link></button> */}
                <button onClick={goToOrders} className='btn btn-warning mt-4 text-dark text-decoration-none'>Your Orders</button>
                <button onClick={goToSupport} className='btn btn-secondary mt-4 text-light text-decoration-none'>Help and Support</button>
            </div>

        </>
    )
}

export default Home