import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, IconButton } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

const NotificationBar = () => {
  const navigate = useNavigate(); // Use navigate hook for routing

  const user = JSON.parse(localStorage.getItem("user"));

  console.log( "User" , user.name)

  const handleUserProfile = () => {
    navigate('/manufacturer/userProfile'); // Corrected spelling of navigate
  };

  return (
    <Box sx={{ 
      backgroundColor: '#1976d2',
      color: 'white',
      padding: '10px 20px',
      position: 'sticky',
      top:0,
      zIndex: 1000,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    }}>
      <Typography variant="h6">B2B-OP Seller</Typography>  
      

      <Box sx={{ display: 'flex', alignItems: 'center' }}>
      
      <IconButton sx={{ color: 'white' }} onClick={handleUserProfile}>
          <AccountCircleIcon />
          <Typography  style={{fontSize:'16px', paddingLeft:'6px'}} variant="p">{user.name}</Typography>
        </IconButton>
     
       
       
      </Box>
    </Box>
  );
};

export default NotificationBar;
