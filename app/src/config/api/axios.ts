import axios, { type AxiosError } from 'axios'
import { getAuthStoreState } from '../../store/authStore'
import { environments } from '../environments';

const axiosInstance = axios.create({
    baseURL: environments.API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

axiosInstance.interceptors.request.use((config) => {
    const authState = getAuthStoreState();

    if (authState.access_token) {
        config.headers.Authorization = `Bearer ${authState.access_token}`;
    }

    return config;
});

axiosInstance.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
        if (error.response?.status === 401) {
            const { access_token, logout } = getAuthStoreState()
            if (access_token) {
                logout()
            }
        }
        return Promise.reject(error)
    }
)

export default axiosInstance