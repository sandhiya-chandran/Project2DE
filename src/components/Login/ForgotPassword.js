import React, { useState } from 'react';
import { TextField, Button, Box, Typography, CircularProgress } from '@mui/material';
import axios from 'axios';

const ForgotPassword = ({ onClose }) => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Send OTP, 2: Change Password
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [userId, setUserId] = useState(''); // State to store user_id

  const handleForgotPassword = async () => {
    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const response = await axios.post(`${process.env.REACT_APP_IP}forgotPassword/`, { email });

      if (response.data.status) {
        setSuccessMessage(response.data.message); // Show success message
        setUserId(response.data.user_id); // Set user_id from response
        setStep(2); // Move to OTP and password step
      } else {
        setErrorMessage('Error sending OTP. Please try again.');
      }
    } catch (error) {
      console.error('Forgot Password Error:', error);
      setErrorMessage('Server error. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }
  
    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');
  
    try {
      const response = await axios.post(`${process.env.REACT_APP_IP}changePassword/`, {
        user_id: userId, // Use user_id from state
        otp: parseInt(otp, 10), // Convert OTP to a number
        password: newPassword,
      });
  
      if (response.data.status) {
        setSuccessMessage(response.data.message); // Show success message
        setTimeout(() => {
          onClose(); // Redirect to login page
        }, 2000);
      } else {
        setErrorMessage('Error changing password. Please try again.');
      }
    } catch (error) {
      console.error('Change Password Error:', error);
      setErrorMessage('Server error. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      gap={2}
      width="100%"
      maxWidth="400px"
      mx="auto"
      px={3}
      py={4}
      bgcolor="background.paper"
      borderRadius={2}
      boxShadow={3}
    >
      {step === 1 && (
        <>
          <Typography variant="h5" gutterBottom>
            Forgot Password
          </Typography>
          <Typography variant="body2" color="textSecondary" textAlign="center">
            Enter your registered email to receive an OTP for resetting your password.
          </Typography>
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
            variant="outlined"
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleForgotPassword}
            disabled={loading || !email}
            fullWidth
          >
            {loading ? <CircularProgress size={20} color="inherit" /> : 'Send OTP'}
          </Button>
        </>
      )}
      {step === 2 && (
        <>
          <Typography variant="h5" gutterBottom>
            Reset Password
          </Typography>
          <TextField
            label="OTP"
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            fullWidth
            variant="outlined"
          />
          <TextField
            label="New Password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            fullWidth
            variant="outlined"
          />
          <TextField
            label="Confirm Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            fullWidth
            variant="outlined"
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleChangePassword}
            disabled={loading || !otp || !newPassword || !confirmPassword}
            fullWidth
          >
            {loading ? <CircularProgress size={20} color="inherit" /> : 'Submit'}
          </Button>
        </>
      )}
      {successMessage && <Typography color="success.main">{successMessage}</Typography>}
      {errorMessage && <Typography color="error.main">{errorMessage}</Typography>}
      <Button onClick={onClose}  color="primary">
        Back to Login
      </Button>
    </Box>
  );
};

export default ForgotPassword;
