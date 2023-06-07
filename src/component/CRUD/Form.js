import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';

//Material UI Imports
import { Avatar, Paper, Typography, TextField, Button, Tooltip } from '@mui/material';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import Checkbox from '@mui/material/Checkbox';
import Grid from '@mui/material/Unstable_Grid2';



const Form = () => {
    const paperstyle = { padding: "30px 20px", width: 800, margin: "20px auto" }

    let navigate = useNavigate();
    const location = useLocation();
     

    const [id, setId] = useState(0);
    const [editMode, setEditMode] = useState(false);

    let mode = location.state

    useEffect(() => {
        if (mode) {
            setEditMode(true);
            setId(localStorage.getItem('id'));
        }
    }, [mode])
    console.log(editMode);


    // ---------- Using form hook ---------- //
    const schema = yup.object().shape({
        username: yup.string().required('Name is required.').max(8, 'Name should be maximum 8 characters.'),
        email: yup.string().required('Email is required.').email('Invalid email format.'),
        password: yup
            .string()
            .required('Password is required.')
            .matches(
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                'Password must contain at least 8 characters, including one uppercase letter, one lowercase letter, one digit, and one special character.'
            ),
        phonenumber: yup.string().required('Phone Number is required.').matches(/^\d{10}$/, 'Phone Number should be 10 digits.'),

    });

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,

    } = useForm({
        resolver: yupResolver(schema),
        defaultValues: localStorage.getItem('id') ? {
            username: localStorage.getItem('username'),
            phonenumber: localStorage.getItem('phonenumber'),
            email: localStorage.getItem('email'),
            password: localStorage.getItem('password')
        } : {
            username: '',
            phonenumber: '',
            email: '',
            password: ''
        }
    });

    // For Add User Data
    const sendDataToAPI = async (data) => {
        try {
            await axios.post(`https://6479698ca455e257fa632c3a.mockapi.io/Signup`, {
                Username: data.username,
                Phonenumber: data.phonenumber,
                Email: data.email,
                Password: data.password,
            }).then(() => {
                navigate('/');
            })
            console.log('Data posted successfully!');
        } catch (error) {
            console.error('Error posting data:', error);
        }
    };

    const onAddSubmit = (data) => {
        sendDataToAPI(data);
        reset();
    };

    

    // For Update User Data
    const updateDataToAPI = async (data) => {

        axios.put(`https://6479698ca455e257fa632c3a.mockapi.io/Signup/${id}`, {
            Username: data.username,
            Phonenumber: data.phonenumber,
            Email: data.email,
            Password: data.password,
        }).then(() => {
            localStorage.clear();
            navigate('/');
        });
    }

    const onEditSubmit = (data) => {
        updateDataToAPI(data);
        reset();
    };

    return (
        <Grid>
            <Paper elevation={3} style={paperstyle} className='bg-info-subtle rounded-5 mt-5'>
                <Grid align="center">
                    <Avatar>

                    </Avatar>
                    <h2 className='mt-2'>Sign Up!</h2>
                    <Typography variant='h6'>Let you just quick sign up and join our community!</Typography>

                </Grid>



                <form className='mt-5' onSubmit={handleSubmit(editMode ? onEditSubmit : onAddSubmit)}>
                    <FormControl fullWidth>
                        <TextField
                            fullWidth
                            label='Name'
                            name='username'
                            {...register('username')}
                            error={!!errors.username}
                            helperText={errors.username?.message}
                            className='mb-3'
                            color='secondary'
                        />

                        <TextField
                            fullWidth
                            label='Phone number'
                            name='phonenumber'
                            type='number'
                            {...register('phonenumber')}
                            error={!!errors.phonenumber}
                            helperText={errors.phonenumber?.message}
                            className='mb-3'
                            color='secondary'
                        />

                        <TextField
                            fullWidth
                            label='Email Id'
                            name='email'
                            type='email'
                            {...register('email')}
                            error={!!errors.email}
                            helperText={errors.email?.message}
                            className='mb-3'
                            color='secondary'
                        />

                        <TextField
                            fullWidth
                            label='Password'
                            name='password'
                            type='password'
                            {...register('password')}
                            error={!!errors.password}
                            helperText={errors.password?.message}
                            className='mb-3'
                            color='secondary'
                        />

                        {editMode ? "" : <FormControlLabel className='mt-3' required control={<Checkbox color="secondary" />} label="I accept the terms and conditions" />}

                        <Tooltip title={editMode ? 'Update' : 'Sign Up'}>
                            <Button type='submit' variant="contained" className='mt-4 rounded-pill' color="secondary">
                                {editMode ? 'Update' : 'Sign Up'}
                            </Button>
                        </Tooltip>

                    </FormControl>



                </form>

            </Paper>
        </Grid>
    );
}

export default Form