import * as yup from 'yup';

export const schema = yup.object().shape({
    username: yup.string().required('Name is required.').max(8, 'Name should be maximum 8 characters.'),
    email: yup.string().required('Email is required.').email('Invalid email format.'),
    password: yup
        .string()
        .required('Password is required.')
        .matches(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/,
            'Password must contain at least 8 characters, including one uppercase letter, one lowercase letter, one digit, and one special character.'
        ),
    phonenumber: yup.string().required('Phone Number is required.').matches(/^\d{10}$/, 'Phone Number should be 10 digits.'),

});