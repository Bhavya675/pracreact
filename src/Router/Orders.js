import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

const Orders = () => {

  const navigate = useNavigate();
  const location = useLocation();

  console.log(location.state)
  const data = location.state

  function goToHome() {
    navigate("/")
  }

  function goToSupport() {
    navigate("/support")
  }
  return (
    <>
      <div className='d-flex justify-content-center flex-column align-items-center'>
        <h2>Hello user! here are your orders</h2><br></br><br></br>

        <div className='card bg-info-subtle shadow'>
          <div className='m-4'>
            {data.map((expense) => (
              <li key={expense.id}>
                Title: {expense.title} <br />
                Amount: ${expense.amount} <br />
                Category: {expense.category} <br /> <br />
              </li>))}
          </div>

        </div>

        <p className='mt-5'>Facing issues related to your orders?</p>

        {/* <Link to="/support">Help and Support</Link> */}
        {/* <button className='btn btn-primary mt-4'><Link to="/" className='mt-3 text-light text-decoration-none'>Home</Link></button>
        <button className='btn btn-secondary mt-4'><Link to="/support" className='mt-3 text-light text-decoration-none'>Help and Support</Link></button> */}

        <button onClick={goToSupport} className='btn btn-secondary mt-1'>Help and Support</button>
        <button onClick={goToHome} className='btn btn-primary mt-4'>Home</button>


      </div>

    </>
  )
}

export default Orders