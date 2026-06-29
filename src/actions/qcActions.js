import axios from 'axios';

const baseURL = `${process.env.REACT_APP_IP}/api/qc`;
const instance = axios.create({ baseURL, withCredentials: true });

instance.interceptors.response.use(
    (r) => r,
    (error) => {
        if (error.response && error.response.status === 401) {
            window.location.href = '/dash/login';
        }
        return Promise.reject(error);
    }
);

export const listQcReports = async ({ status, q } = {}) => {
    try {
        const { data } = await instance.get('/reports', { params: { status, q } });
        return data;   // { reports, counts }
    } catch (e) {
        return { success: false, message: e.response?.data?.message || 'Failed to list QC reports' };
    }
};

export const getQcReport = async (id) => {
    try {
        const { data } = await instance.get(`/reports/${encodeURIComponent(id)}`);
        return data;
    } catch (e) {
        return { success: false, message: e.response?.data?.message || 'Failed to load QC report' };
    }
};
