import axios from 'axios';

const apiClient = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request Interceptor: Add Token
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('lt');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401 and Errors
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Auto logout
            localStorage.removeItem('lu');
            localStorage.removeItem('lt');
            window.dispatchEvent(new Event('storage'));

            // Redirect to auth if not already there
            if (!window.location.pathname.includes('/auth')) {
                window.location.href = '/auth?expired=true';
            }
        }

        // Enhance error message
        const message = error.response?.data?.message || error.message || 'An unexpected error occurred';
        error.displayMessage = message;

        return Promise.reject(error);
    }
);

export default apiClient;
