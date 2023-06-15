import axios from "axios";

// Fetch User Data
export const userData = async () => {
    try {
        const res = await axios
            .get(`https://6479698ca455e257fa632c3a.mockapi.io/Signup`)
        return res.data
    }
    catch (error) {
        console.log(error)
    }

};

// Add User Data
export const sendData = async (data) => {
    try {

        await axios.post(`https://6479698ca455e257fa632c3a.mockapi.io/Signup`, {
            Username: data.username,
            Phonenumber: data.phonenumber,
            Email: data.email,
            Password: data.password,
        })
        
    } catch (error) {
        console.error('Error posting data:', error);
    }
};

// Update User Data
export const updateData = async ({ id }, data) => {
    const res = await axios.put(`https://6479698ca455e257fa632c3a.mockapi.io/Signup/${id}`, {
        Username: data.username,
        Phonenumber: data.phonenumber,
        Email: data.email,
        Password: data.password,
    })
    return res.data

}

// Delete User Data
export const userDelete = async (id) => {
    try {
        const res = await axios
            .delete(`https://6479698ca455e257fa632c3a.mockapi.io/Signup/${id}`)
        return res.data
    }
    catch (error) {
        console.log(error)
    }
};
