import api from '@/config/api.config';

export const loginUser = async (credentials) => {
  // Simulate an API call
  console.log("Sending credentials to backend:", credentials);
  return { success: true, message: "Logged in successfully" };
};