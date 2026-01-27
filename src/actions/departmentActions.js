import axios from 'axios';
import { MdQrCode } from 'react-icons/md';

const baseURL = `${process.env.REACT_APP_IP}/api/department`;
// const baseURL = 'http://localhost:5000/api/admin';

const instance = axios.create({
    baseURL: baseURL,
    withCredentials: true
});

// instance.interceptors.response.use(
//   response => {
//     // If the response is successful, just return the response
//     return response;
//   },x
//   error => {
//     // If the response has a status code of 401, redirect to the login page
//     if (error.response && error.response.status === 401) {
//       window.location.href = '/'; // Replace with your login route
//     }
//     // Otherwise, reject the promise with the error object
//     return Promise.reject(error);
//   }
// );

export const getDepartments = async () => {
    try {
        const response = await instance.get('/getDepartment');
        return response.data;
    } catch (error) {
        // Handle errors, and include an error message in the response
        return { success: false, message: error.response.data.message };
    }
};