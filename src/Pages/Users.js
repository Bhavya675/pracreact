import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { userDelete, userData } from '../API/UserAPI';


const Read = () => {
  let navigate = useNavigate();
  const [apiData, setApiData] = useState([]);
 

  const editField = (user) => {
    navigate('/form', { state: user });
  };

  const handleDelete = async (id) => {
    await userDelete(id);
    fetchData();
  };

 const fetchData = async () => {
   const fetchUser = await userData();
     setApiData(fetchUser);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <>
      <div className='d-flex justify-content-center mt-5'>
        <button
          onClick={() => navigate('/form')}
          className=' btn btn-secondary fs-4'
        >
          <i className='bi bi-person-fill-add fs-3'></i> Add User
        </button>
      </div>

      <div className='d-flex justify-content-center align-item-center mt-5'>
        <table className='table table-dark table-striped table-responsive w-50'>
          <thead>
            <tr>
              <th scope='col'>Name</th>
              <th scope='col'>Phone Number</th>
              <th scope='col'>Edit</th>
              <th scope='col'>Delete</th>
            </tr>
          </thead>
          <tbody className='table-group-divider'>
            {apiData.map((data) => {
              return (
                <tr key={data.id}>
                  <td>{data.Username}</td>
                  <td>{data.Phonenumber}</td>

                  <td>
                    <button
                      onClick={() => editField(data)}
                      className='btn btn-success'
                    >
                      <i className='bi bi-pencil-square'></i> Edit
                    </button>
                  </td>

                  <td>
                    <button
                       onClick={() => {
                        if (window.confirm('Are You Sure Want to Delete User?')) {
                          handleDelete(data.id);
                        }
                      }}
                      className='btn btn-danger'
                    >
                      <i className='bi bi-trash3-fill'></i> Delete
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default Read;
