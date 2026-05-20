import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // <-- 1. Import this
import { loginUser } from './auth.service';
import { handleLoginError } from './auth.utils';

const Login = () => {
  const navigate = useNavigate(); // <-- 2. Initialize it
  const [formData, setFormData] = useState({ email: '', password: '', rememberMe: false });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await loginUser(formData);
      // 3. Replace the alert with a redirect to the 2FA page
      navigate('/2fa'); 
    } catch (err) {
      setError(handleLoginError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px', maxWidth: '350px', margin: '20px' }}>
      <h2 style={{ margin: '0 0 10px 0' }}>{user?.name}</h2>
      <p><strong>Username:</strong> {user?.username}</p>
      <p><strong>Email:</strong> {user?.email}</p>
      <p><strong>Website:</strong> {user?.website}</p>
    </div>
  );
};

export default UserProfile;