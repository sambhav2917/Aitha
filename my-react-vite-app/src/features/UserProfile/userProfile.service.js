import api from '@/config/api.config';

/**
 * Fetches user data from the API endpoint
 */
export const fetchUserData = async (userId) => {
  const response = await api.get(`/users/${userId}`);
  return response.data;
};