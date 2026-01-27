import axios from 'axios';
import CryptoJS from "crypto-js";

const baseURL = `${process.env.REACT_APP_IP}/api/users`;
// const baseURL = 'http://localhost:5000/api/users';

const instance = axios.create({
  baseURL: baseURL,
  withCredentials: true
});

instance.interceptors.response.use(
  response => {
    // If the response is successful, just return the response
    return response;
  },
  error => {
    // If the response has a status code of 401, redirect to the login page
    if (error.response && error.response.status === 401) {
      window.location.href = '/'; // Replace with your login route
    }
    // Otherwise, reject the promise with the error object
    return Promise.reject(error);
  }
);

export const login = async (email, password) => {
  try {
    // Encrypt the password using AES
    const ciphertext = CryptoJS.AES.encrypt(JSON.stringify(password), CryptoJS.enc.Utf8.parse(process.env.REACT_APP_SECRET_KEY), {
      iv: CryptoJS.enc.Utf8.parse(process.env.REACT_APP_IV),
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    }).toString();
    const response = await instance.post('/login', {
      email: email,
      password: password,
    });
    localStorage.setItem('userRole', JSON.stringify(response.data.role)); // Save user role(s)
    return response.data;
  } catch (error) {
    // Handle errors, and include an error message in the response
    return { success: false, message: error.response.data.message };
  }
};

export const logout = async () => {
  try {
    const response = await instance.get('/logout', {

    });

    return response.data;
  } catch (error) {
    // Handle errors, and include an error message in the response
    return { success: false, message: error.response.data.message };
  }
};

export const createEmsUser = async (name, email, mobile, password, employeeId, department, designation) => {
  console.log('Creating EMS user with:', { name, email, mobile, password, employeeId, department, designation });
  try {
    const response = await instance.post('/createEmsUser', {
      name,
      email,
      mobile,
      password,
      employeeId,
      department,
      designation
    });
    return response.data;
  } catch (error) {
    console.log('Error response:', error.response);
    const errorMessage = error.response?.data?.data || error.response?.data?.message || 'An error occurred while creating user';
    return { success: false, message: errorMessage, data: errorMessage };
  }
}

export const forgotPassword = async (email) => {
  try {
    const response = await instance.post('/forgotpassword', {
      email: email,
    });
    return response.data;
  } catch (error) {
    return { success: false, data: error.response?.data?.data || error.response?.data?.message || 'An error occurred' };
  }
};

export const resetPassword = async (token, password) => {
  try {
    const response = await instance.put(`/resetpassword/${token}`, {
      password: password,
    });
    return response.data;
  } catch (error) {
    return { success: false, data: error.response?.data?.data || error.response?.data?.message || 'An error occurred' };
  }
};