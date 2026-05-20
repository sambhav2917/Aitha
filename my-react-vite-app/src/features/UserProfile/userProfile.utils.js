/**
 * Processes API errors into user-friendly UI display strings
 */
export const handleProfileError = (error) => {
  if (error.response) {
    const status = error.response.status;
    if (status === 404) return 'The requested user profile does not exist.';
    if (status === 403) return 'You do not have administrative permission to view this.';
    if (status >= 500) return 'Internal server error. Please try again later.';
  }
  return 'Unable to connect. Please check your internet connection.';
};