import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import axios from 'axios';

//Material UI Imports
import { Avatar, Paper, Typography, TextField, Button, Tooltip } from '@mui/material';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import Checkbox from '@mui/material/Checkbox';
import Grid from '@mui/material/Unstable_Grid2';

const Update = () => {


const [username, setUserName] = useState('');
const [phonenumber, setPhonenumber] = useState('');
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');


    const paperstyle = { padding: "30px 20px", width: 800, margin: "20px auto" }

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
    } = useForm({ resolver: yupResolver(schema) });


    const sendDataToAPI = async (data) => {
        try {
            await axios.post(`https://6479698ca455e257fa632c3a.mockapi.io/Signup`, {
                Username: data.username,
                Phonenumber: data.phonenumber,
                Email: data.email,
                Password: data.password,
            });
            console.log('Data posted successfully!');
            console.log(data.phonenumber)
        } catch (error) {
            console.error('Error posting data:', error);
        }
    };

    const onSubmit = (data) => {
        sendDataToAPI(data);
        reset();
    };

    useEffect(() => {
        setUserName();
    })

    return (
        <Grid>
            <Paper elevation={3} style={paperstyle} className='bg-info-subtle rounded-5 mt-5'>
                <Grid align="center">
                    <Avatar>

                    </Avatar>
                    <h2 className='mt-2'>Update Your Profile!</h2>
                    <Typography variant='h6'>Update user profile</Typography>


                </Grid>

                <form className='mt-5' onSubmit={handleSubmit(onSubmit)}>
                    {/* ((data) => console.log(data))} */}
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

                        <FormControlLabel className='mt-3' required control={<Checkbox color="secondary" />} label="I accept the terms and conditions" />

                        <Tooltip title="Sign Up">
                            <Button type='submit' variant="contained" className='mt-4 rounded-pill' color="secondary">Update</Button>
                        </Tooltip>

                    </FormControl>



                </form>

            </Paper>
        </Grid>
    )
}

export default Update