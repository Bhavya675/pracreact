import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useNavigate, useLocation } from 'react-router-dom';
import { schema } from '../Validations/UserValidations'


//Material UI Imports
import { Avatar, Paper, Typography, TextField, Button, Tooltip } from '@mui/material';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import Checkbox from '@mui/material/Checkbox';
import Grid from '@mui/material/Unstable_Grid2';
import { sendData, updateData } from '../API/UserAPI';


const Form = () => {
    const paperstyle = { padding: "30px 20px", width: 800, margin: "20px auto" }

    let navigate = useNavigate();
    const location = useLocation();


const editMode = location.state
    console.log(editMode)

    const [id, setId] = useState();

    useEffect(() => {

        if (editMode) {
            setId(editMode.id);
        }

    }, [editMode])


    // ---------- Using form hook ---------- //
    // const schema = yup.object().shape({
    //     username: yup.string().required('Name is required.').max(8, 'Name should be maximum 8 characters.'),
    //     email: yup.string().required('Email is required.').email('Invalid email format.'),
    //     password: yup
    //         .string()
    //         .required('Password is required.')
    //         .matches(
    //             /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    //             'Password must contain at least 8 characters, including one uppercase letter, one lowercase letter, one digit, and one special character.'
    //         ),
    //     phonenumber: yup.string().required('Phone Number is required.').matches(/^\d{10}$/, 'Phone Number should be 10 digits.'),

    // });

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,

    } = useForm({
        resolver: yupResolver(schema),
        defaultValues: editMode ? {
            username: editMode.Username,
            phonenumber: editMode.Phonenumber,
            email: editMode.Email,
            password: editMode.Password,
        } : {
            username: '',
            phonenumber: '',
            email: '',
            password: ''
        }
    });

    // For Add User Data
    const sendDataToAPI = async (data) => {

        await sendData(data);
        navigate('/');

    };

    const onAddSubmit = (data) => {
        sendDataToAPI(data);
        reset();
    };



    // For Update User Data
    const updateDataToAPI =  (data) => {
        
        updateData({id}, data);
        navigate('/');

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

                    {editMode ? <h2 className='mt-2'>Update Your Profile!</h2> : <h2 className='mt-2'>Sign Up!</h2>}
                    {editMode ? <Typography variant='h6'>Update user profile</Typography> : <Typography variant='h6'>Let you just quick sign up and join our community!</Typography>}

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