import React, { useEffect, useState } from 'react'
import axios from 'axios';
import { useNavigate , Link } from 'react-router-dom';



const Read = () => {

    let navigate = useNavigate();

    const [apiData, setApiData] = useState([]);

    const fetchData = () => {
        axios.get(`https://6479698ca455e257fa632c3a.mockapi.io/Signup`)
            .then((getData) => {
                setApiData(getData.data);
                console.log(getData.data)
            });
    };

    useEffect(() => {
        fetchData();
    }, []);

    const editField = (id, Username, Phonenumber, Email, Password) => {
        localStorage.setItem('id', id);
        localStorage.setItem('username', Username);
        localStorage.setItem('phonenumber', Phonenumber);
        localStorage.setItem('email', Email);
        localStorage.setItem('password', Password);
    }

    const handleDelete = (id) => {
        axios.delete(`https://6479698ca455e257fa632c3a.mockapi.io/Signup/${id}`)
        .then(() => {
            fetchData();
        });
    }
    return (
        <>
           
            <div className='d-flex justify-content-center mt-5'> 
            <button onClick={() => navigate('/create')} className=' btn btn-secondary fs-4'><i className="bi bi-person-fill-add fs-3"></i> Add User</button>
            </div>
            
            <div className='d-flex justify-content-center align-item-center mt-5'>

                <table className="table table-dark table-striped table-responsive w-50">
                    <thead>
                        <tr>
                            <th scope="col">Name</th>
                            <th scope="col">Phone Number</th>
                            <th scope="col">Edit</th>
                            <th scope="col">Delete</th>
                        </tr>
                    </thead>
                    <tbody className="table-group-divider">
                        {apiData.map((data, id) => {
                            return (
                                <tr key={id}>
                                    <td>{data.Username}</td>
                                    <td>{data.Phonenumber}</td>


                                    <td><Link to='/update'><button onClick={() => editField(data.id, data.Username, data.Phonenumber, data.Email, data.Password)} className='btn btn-success'><i className="bi bi-pencil-square"></i> Edit</button></Link></td>
                                    
                                    <td><button onClick={() => { if(window.confirm('Are You Sure Want to Delete User?')) {handleDelete(data.id)}}}  className='btn btn-danger'><i className="bi bi-pencil-square"></i> Delete</button></td>
                                </tr>
                            )

                        })}
                    </tbody>
                </table>
            </div>

        </>


    )
}

export default Read