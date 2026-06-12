import axios from 'axios';

const baseURL = `${process.env.REACT_APP_IP}/api/provision`;
const instance = axios.create({
    baseURL: baseURL,
    withCredentials: true
});

instance.interceptors.response.use(
    response => response,
    error => {
        if (error.response && error.response.status === 401) {
            // 401 → kick back to MPS login. App basename is /dash so the
            // public path is /dash/login.
            window.location.href = '/dash/login';
        }
        return Promise.reject(error);
    }
);

// ── Batch lifecycle ──────────────────────────────────────────
export const createBatch = async (payload) => {
    // payload: { productModel, family, firmwareVersion, count, startDeviceId, endDeviceId }
    try {
        const response = await instance.post('/batch', payload);
        return response.data;
    } catch (error) {
        return { success: false, message: error.response?.data?.message || 'Failed to create batch' };
    }
};

export const getBatchStatus = async (batchId) => {
    try {
        const response = await instance.get(`/batch/${batchId}`);
        return response.data;
    } catch (error) {
        return { success: false, message: error.response?.data?.message || 'Failed to get batch' };
    }
};

export const listBatches = async () => {
    try {
        const response = await instance.get('/batches');
        return response.data;
    } catch (error) {
        return { success: false, message: error.response?.data?.message || 'Failed to list batches' };
    }
};

export const deleteBatch = async (batchId) => {
    try {
        const response = await instance.delete(`/batch/${batchId}`);
        return response.data;
    } catch (error) {
        return { success: false, message: error.response?.data?.message || 'Failed to delete batch' };
    }
};

export const downloadBatchZip = async (batchId) => {
    // Triggers a browser download of the ZIP. Uses window.location to
    // preserve cookies/session without double-fetching the whole blob.
    try {
        const response = await instance.get(`/batch/${batchId}/download`, { responseType: 'blob' });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const a = document.createElement('a');
        a.href = url;
        a.download = `${batchId}.zip`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        return { success: true };
    } catch (error) {
        return { success: false, message: error.response?.data?.message || 'Download failed' };
    }
};

// ── Firmware catalog ─────────────────────────────────────────
export const listFirmwares = async () => {
    try {
        const response = await instance.get('/firmwares');
        return response.data;
    } catch (error) {
        return { success: false, message: error.response?.data?.message || 'Failed to list firmwares' };
    }
};

// ── Admin: SKU catalog + MAC pool ────────────────────────────
export const listProductModels = async () => {
    try {
        const response = await instance.get('/admin/product-models');
        return response.data;   // { models: [...], count }
    } catch (error) {
        return { success: false, message: error.response?.data?.message || 'Failed to list product models' };
    }
};

export const searchDevices = async (q, limit = 50) => {
    try {
        const r = await instance.get(`/admin/devices`, { params: { q, limit } });
        return r.data;
    } catch (e) {
        return { success: false, message: e.response?.data?.message || 'Search failed' };
    }
};

export const getActivity = async (limit = 50) => {
    try {
        const r = await instance.get(`/admin/activity`, { params: { limit } });
        return r.data;
    } catch (e) {
        return { success: false, message: e.response?.data?.message || 'Activity fetch failed' };
    }
};

export const getMacStats = async () => {
    try {
        const response = await instance.get('/admin/macs/stats');
        return response.data;   // { total, byType: { Eth, WIFI, '4G', null } }
    } catch (error) {
        return { success: false, message: error.response?.data?.message || 'Failed to load MAC stats' };
    }
};

// ── Station callback (post-burn) ─────────────────────────────
export const reportVerification = async ({ deviceId, batchId, status, tests, metadata, certHash }) => {
    try {
        const response = await instance.post('/verify', {
            deviceId, batchId, status, tests, metadata, certHash
        });
        return response.data;
    } catch (error) {
        return { success: false, message: error.response?.data?.message || 'Verification report failed' };
    }
};
