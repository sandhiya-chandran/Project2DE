// src/components/Login.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { TextField, Button, Box, Typography,IconButton, InputAdornment ,CircularProgress} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import './Login.css';
import ForgotPassword from './ForgotPassword';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const toggleForgotPassword = () => {
    setShowForgotPassword(!showForgotPassword);
  };
  
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${process.env.REACT_APP_IP}loginUser/`, { email, password });
      const { data } = response.data;

      console.log('API Response:', data);

      if (data.valid) {
        localStorage.setItem('token', data._c1);
        localStorage.setItem('user', JSON.stringify(data));

        console.log('User Role:', data.role_name);

        switch (data.role_name) {
          case 'super_admin':
            navigate('/super_admin');
            break;
          case 'dealer_admin':
            navigate('/dealer');
            break;
            case 'dealer_user':
              navigate('/dealer');
              break;
          case 'manufacturer_admin':
            navigate('/manufacturer');
            break;

            case 'manufacturer_user':
              navigate('/manufacturer');
              break;
          default:
            alert('Role not recognized');
            navigate('/');
        }
      } else {
        alert('Invalid credentials');
      }
    } catch (error) {
      console.error('Login Error:', error);
      alert('Server Error');
    }
    finally {
      setLoading(false); // Stop loading spinner
    }
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

 
  return (
    <Box display="flex" height="100vh">
      {/* Left side */}
      <Box className="login-page" flex={1} display="flex" flexDirection="column" justifyContent="center" alignItems="center"  px={5}>
        <Typography variant="h4" color="textPrimary" gutterBottom>
          B2B Ordering Platform
        </Typography>
        <Typography variant="body1" color="textSecondary" padding={'20px'} align="center">
        B2B Ordering Platform streamlines business operations for manufacturers, distributors, and dealers with easy catalog management, efficient order processing, and seamless logistics integration. It enhances visibility, communication, and performance across all parties, driving sales and operational efficiency.
        </Typography>
      </Box>

     

      {/* Right side */}
      <Box flex={1} display="flex" justifyContent="center" alignItems="center">
      {showForgotPassword ? (
        <ForgotPassword onClose={toggleForgotPassword} />
      ) : (
        <Box display="flex" flexDirection="column" alignItems="center" gap={2} width="100%" maxWidth="400px" mx="auto" px={3}>
          <Typography variant="h5" color="textPrimary" gutterBottom>
            Sign In
          </Typography>
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
            variant="outlined"
            InputProps={{
              style: {
                height: '60px',  
              },
            }}
          />

          <TextField
            label="Password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            variant="outlined"
            InputProps={{
              style: {
                height: '60px',  
              },
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={handleClickShowPassword}
                    onMouseDown={handleMouseDownPassword}
                    edge="end"
                  >
                    {showPassword ? <Visibility /> : <VisibilityOff />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

        
<Button
            variant="contained"
            color="primary"
            onClick={handleLogin}
            fullWidth
            disabled={loading} // Disable button during loading
            startIcon={loading && <CircularProgress size={20} color="inherit" />} // Show spinner
          >
            {loading ? 'Logging in...' : 'Login'}
          </Button>
          <Typography
            variant="body2"
            color="primary"
            style={{ cursor: 'pointer', alignSelf: 'flex-end' }}
            onClick={toggleForgotPassword}
          >
            Forgot Password?
          </Typography>
        </Box>
      )}
       
      </Box>
    </Box>
  );
};

export default Login;
