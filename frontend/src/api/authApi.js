import axiosInstance from './axiosInstance';

export const authApi = {
  login: async (credentials) => {
    const response = await axiosInstance.post('/login/', credentials);
    return response.data;
  },

  register: async (userData) => {
    const response = await axiosInstance.post('/register/', userData);
    return response.data;
  },

  getProfile: async () => {
    const response = await axiosInstance.get('/me/');
    return response.data;
  },

  refreshToken: async (refresh) => {
    const response = await axiosInstance.post('/token/refresh/', { refresh });
    return response.data;
  },
};
