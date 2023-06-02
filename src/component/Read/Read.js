import React, { useEffect, useState } from 'react'
import axios from 'axios';
import { Link } from 'react-router-dom';



const Read = () => {

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

        const interval = setInterval(() => {
            fetchData();
        }, 5000);

        return () => {
            clearInterval(interval);
        };
    }, []);

    const setID = (id) => {
        console.log(id)
        localStorage.setItem('ID', id)
    }

    return (

        <div className='d-flex justify-content-center align-item-center mt-5'>
            <table className="table table-dark table-striped-columns w-50">
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


                                <td><Link to='/update'><button onClick={() => setID(data.id)} className='btn btn-success'><i className="bi bi-pencil-square"></i> Edit</button></Link></td>
                                <td><Link to='/delete'><button className='btn btn-danger'><i className="bi bi-pencil-square"></i> Delete</button> </Link></td>
                            </tr>
                        )

                    })}
                </tbody>
            </table>
        </div>


    )
}

export default Read