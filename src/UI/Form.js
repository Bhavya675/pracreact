import * as React from 'react';

import { Avatar, Grid, Paper, Typography, TextField, InputLabel, MenuItem, Select, Button } from '@mui/material';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import Checkbox from '@mui/material/Checkbox';


const Form = () => {
    const paperstyle = { padding: "30px 20px", width: 800, margin: "20px auto" }

    return (
        <Grid>
            <Paper elevation={3} style={paperstyle} className='bg-info-subtle rounded-5'>
                <Grid align="center">
                    <Avatar>

                    </Avatar>
                    <h2 className='mt-2'>Register User</h2>
                    <Typography varient='caption'>Please fill this form to create an account !</Typography>

                </Grid>
                <form className='mt-5'>
                    <TextField fullWidth label="Name" className='mb-3' color="secondary" />
                    <TextField fullWidth label="Phonenumber" type='number' className='mb-3' color="secondary" />
                    <TextField fullWidth label="Email Id" type='email' className='mb-3' color="secondary" />
                    <TextField fullWidth label="Password" type='password' className='mb-3' color="secondary" />
                    <FormControl fullWidth>
                        <FormLabel id="demo-row-radio-buttons-group-label">Gender</FormLabel>
                        <RadioGroup
                            row
                            aria-labelledby="demo-row-radio-buttons-group-label"
                            name="row-radio-buttons-group"
                        >
                            <FormControlLabel value="male" control={<Radio color="secondary" />} label="Male" />
                            <FormControlLabel value="female" control={<Radio color="secondary" />} label="Female" />
                            <FormControlLabel value="other" control={<Radio color="secondary" />} label="Other" />

                        </RadioGroup>

                        <FormControl fullWidth className='mt-3'>
                            <InputLabel id="demo-simple-select-label" color="secondary">Role</InputLabel>
                            <Select
                                labelId="demo-simple-select-label"
                                id="demo-simple-select"
                                color="secondary"
                                label="Age"

                            >
                                <MenuItem value={10}>HR</MenuItem>
                                <MenuItem value={20}>Manager</MenuItem>
                                <MenuItem value={30}>Engineer</MenuItem>
                            </Select>
                        </FormControl>
                        <FormControlLabel className='mt-3' required control={<Checkbox color="secondary" />} label="I accept the terms and conditions" />
                        <Button variant="contained" className='mt-4 rounded-pill' color="secondary">Register !</Button>

                    </FormControl>



                </form>

            </Paper>
        </Grid>
    );
}

export default Form;