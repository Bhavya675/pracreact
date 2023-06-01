import *  as React from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useState } from 'react';

import { Avatar, Paper, Typography, TextField, InputLabel, MenuItem, Select, Button, Autocomplete, Rating, Box, Slider, Tooltip } from '@mui/material';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import Checkbox from '@mui/material/Checkbox';
import Grid from '@mui/material/Unstable_Grid2';
import StarIcon from '@mui/icons-material/Star';
import Switch from '@mui/material/Switch';
import { styled } from '@mui/material/styles';
import { useForm } from 'react-hook-form';


// ------------ Validation Schema -------------- //

const schema = yup.object().shape({
    name: yup.string().required('Name is required.').max(8, 'Name should be maximum 8 characters.'),
    email: yup.string().required('Email is required.').email('Invalid email format.'),
    password: yup
        .string()
        .required('Password is required.')
        .matches(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
            'Password must contain at least 8 characters, including one uppercase letter, one lowercase letter, one digit, and one special character.'
        ),
    phoneNumber: yup.string().required('Phone Number is required.').matches(/^\d{10}$/, 'Phone Number should be 10 digits.'),
    date: yup.date().required('Please Enter Date of Birth').max(new Date(), 'Date cannot be greater than the current date.'),
    address: yup.string().required('Address is required.').max(250, 'Address should be maximum 100 characters.'),
    gender: yup.string().required('Please Select a Gender.'),
    role: yup.string().required('Please Choose a Role!'),
});

const Form = () => {
    const paperstyle = { padding: "30px 20px", width: 800, margin: "20px auto" }
    const top100Films = [
        { label: 'Java' },
        { label: 'Python' },
        { label: 'Asp.Net' },
        { label: 'Android(with java)' },
        { label: 'Android(with kotlin)' },
        { label: "Flutter" },
        { label: 'React' },
        {
            label: 'React Native',

        },
        { label: 'PHP' },
        { label: 'Node.js' },
        {
            label: 'Next.js',

        },
        {
            label: 'Angular',

        },
        { label: 'Wordpress', },
        { label: 'Odoo' },
        {
            label: 'Laravel',

        },
        { label: "IOS(native)" },
        { label: 'Ado.Net' },
        { label: 'VB.Net' },



    ];
    const labels = {
        0.5: 'Useless',
        1: 'Useless+',
        1.5: 'Poor',
        2: 'Poor+',
        2.5: 'Ok',
        3: 'Ok+',
        3.5: 'Good',
        4: 'Good+',
        4.5: 'Excellent',
        5: 'Excellent+',
    };

    const [value, setValue] = React.useState(2);
    const [hover, setHover] = React.useState(-1);
    function getLabelText(value) {
        return `${value} Star${value !== 1 ? 's' : ''}, ${labels[value]}`;
    }

    const MaterialUISwitch = styled(Switch)(({ theme }) => ({
        width: 62,
        height: 34,
        padding: 7,
        '& .MuiSwitch-switchBase': {
            margin: 1,
            padding: 0,
            transform: 'translateX(6px)',
            '&.Mui-checked': {
                color: '#fff',
                transform: 'translateX(22px)',
                '& .MuiSwitch-thumb:before': {
                    backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 20 20"><path fill="${encodeURIComponent(
                        '#fff',
                    )}" d="M4.2 2.5l-.7 1.8-1.8.7 1.8.7.7 1.8.6-1.8L6.7 5l-1.9-.7-.6-1.8zm15 8.3a6.7 6.7 0 11-6.6-6.6 5.8 5.8 0 006.6 6.6z"/></svg>')`,
                },
                '& + .MuiSwitch-track': {
                    opacity: 1,
                    backgroundColor: theme.palette.mode === 'dark' ? '#8796A5' : '#aab4be',
                },
            },
        },
        '& .MuiSwitch-thumb': {
            backgroundColor: theme.palette.mode === 'dark' ? '#003892' : '#001e3c',
            width: 32,
            height: 32,
            '&:before': {
                content: "''",
                position: 'absolute',
                width: '100%',
                height: '100%',
                left: 0,
                top: 0,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center',
                backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 20 20"><path fill="${encodeURIComponent(
                    '#fff',
                )}" d="M9.305 1.667V3.75h1.389V1.667h-1.39zm-4.707 1.95l-.982.982L5.09 6.072l.982-.982-1.473-1.473zm10.802 0L13.927 5.09l.982.982 1.473-1.473-.982-.982zM10 5.139a4.872 4.872 0 00-4.862 4.86A4.872 4.872 0 0010 14.862 4.872 4.872 0 0014.86 10 4.872 4.872 0 0010 5.139zm0 1.389A3.462 3.462 0 0113.471 10a3.462 3.462 0 01-3.473 3.472A3.462 3.462 0 016.527 10 3.462 3.462 0 0110 6.528zM1.665 9.305v1.39h2.083v-1.39H1.666zm14.583 0v1.39h2.084v-1.39h-2.084zM5.09 13.928L3.616 15.4l.982.982 1.473-1.473-.982-.982zm9.82 0l-.982.982 1.473 1.473.982-.982-1.473-1.473zM9.305 16.25v2.083h1.389V16.25h-1.39z"/></svg>')`,
            },
        },
        '& .MuiSwitch-track': {
            opacity: 1,
            backgroundColor: theme.palette.mode === 'dark' ? '#8796A5' : '#aab4be',
            borderRadius: 20 / 2,
        },
    }));

    const st = {
        maxHeight: 600
    }


    // ---------- Using form hook ---------- //
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({ resolver: yupResolver(schema) });

    const [selectedRole, setSelectedRole] = useState();
    const [isTechnologyDisabled, setIsTechnologyDisabled] = useState(false);

    return (
        <>

            <Grid>
                <Paper elevation={3} style={paperstyle} className='bg-info-subtle rounded-5'>
                    <Grid align="center">
                        <Avatar>

                        </Avatar>
                        <h2 className='mt-2'>Register User</h2>
                        <Typography variant='h6'>Please fill this form to create an account !</Typography>

                    </Grid>

                    <form className='mt-5 overflow-y-scroll' style={st} onSubmit={handleSubmit((data) => console.log(data))}>
                        <FormControl fullWidth>

                            <TextField fullWidth label="Name" className='mb-3' color="secondary" {...register('name')} />
                            {errors.name && <p className='text-danger'>{errors.name.message}</p>}

                            <TextField fullWidth label="Phonenumber" type='number' className='mb-3' color="secondary" {...register('phoneNumber')} />
                            {errors.phoneNumber && <p className='text-danger'>{errors.phoneNumber.message}</p>}


                            <input type="date" className="form-control form-control-lg bg-transparent border border-secondary mb-3" {...register('date')} placeholder='Date of birth' />
                            {errors.date && <p className='text-danger'>{errors.date.message}</p>}

                            <TextField
                                fullWidth
                                id="outlined-multiline-flexible"
                                label="Address"
                                multiline
                                maxRows={4}
                                className='mb-3'
                                color="secondary"
                                {...register('address')}
                            />
                            {errors.address && <p className='text-danger'>{errors.address.message}</p>}

                            <TextField fullWidth label="Email Id" type='email' className='mb-3' color="secondary" {...register('email')} />
                            {errors.email && <p className='text-danger'>{errors.email.message}</p>}

                            <TextField fullWidth label="Password" type='password' className='mb-3' color="secondary" {...register('password')} />
                            {errors.password && <p className='text-danger'>{errors.password.message}</p>}


                            <FormLabel id="demo-row-radio-buttons-group-label">Gender</FormLabel>
                            <RadioGroup {...register('gender')}
                                row
                                aria-labelledby="demo-row-radio-buttons-group-label"
                                name="row-radio-buttons-group"
                            >
                                <FormControlLabel value="male" control={<Radio color="secondary" />} label="Male" />
                                <FormControlLabel value="female" control={<Radio color="secondary" />} label="Female" />
                                <FormControlLabel value="other" control={<Radio color="secondary" />} label="Other" />

                            </RadioGroup>
                            {errors.gender && <p className='text-danger'>{errors.gender.message}</p>}

                            <FormControl fullWidth className='mt-3'>
                                <InputLabel id="demo-simple-select-label" color="secondary" >Role</InputLabel>
                                <Select
                                    labelId="demo-simple-select-label"
                                    id="demo-simple-select"
                                    color="secondary"
                                    label="Role"
                                    value={selectedRole}
                                    onChange={(e) => {
                                        setSelectedRole(e.target.value);
                                        if (e.target.value !== '30') setIsTechnologyDisabled(true);
                                        else setIsTechnologyDisabled(false);
                                        // setIsTechnologyDisabled(e.target.value !== '30');
                                    }}
                                    {...register('role')}

                                >
                                    <MenuItem value={10}>HR</MenuItem>
                                    <MenuItem value={20}>Manager</MenuItem>
                                    <MenuItem value={30}>Engineer</MenuItem>
                                </Select>
                                {errors.role && <p className='text-danger'>{errors.role.message}</p>}
                            </FormControl>

                            <Autocomplete fullWidth
                                className='mt-3'
                                disablePortal
                                id="combo-box-demo"
                                options={top100Films}

                                disabled={isTechnologyDisabled} // Disable if the selected role is not 'Engineer'
                                renderInput={(params) => <TextField {...params} label="Technology" />}
                            />


                            <Typography className='mt-3' component="legend">Rate Yourself</Typography>
                            <Rating
                                name="hover-feedback"
                                value={value}
                                precision={0.5}
                                getLabelText={getLabelText}
                                onChange={(event, newValue) => {
                                    setValue(newValue);
                                }}
                                onChangeActive={(event, newHover) => {
                                    setHover(newHover);
                                }}
                                emptyIcon={<StarIcon style={{ opacity: 0.55 }} fontSize="inherit" />}
                            />
                            {value !== null && (
                                <Box sx={{ ml: 2 }}>{labels[hover !== -1 ? hover : value]}</Box>
                            )}
                            <div className='d-flex'>

                                <div>
                                    <Typography className='mt-3' component="legend">Current Project Progress</Typography>
                                    <Slider defaultValue={50} sx={{ width: 300 }} color="secondary" aria-label="Default" valueLabelDisplay="auto" />
                                </div>

                                <div className='d-flex mt-3'>
                                    <p className='mt-3 me-3'>Day shift</p>
                                    <FormControlLabel
                                        control={<MaterialUISwitch sx={{ m: 1 }} defaultChecked />}
                                        label="Night shift"
                                    />
                                </div>
                            </div>




                            <FormControlLabel className='mt-3' required control={<Checkbox color="secondary" />} label="I accept the terms and conditions" />
                            <Tooltip title="Register Your Account">
                                <Button type='submit' variant="contained" className='mt-4 rounded-pill' color="secondary">Register !</Button>
                            </Tooltip>

                        </FormControl>



                    </form>

                </Paper>
            </Grid>


        </>
    );
}

export default Form;