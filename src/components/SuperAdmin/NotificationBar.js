// src\components\Dealer\NotificationBar.js

import React from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { useNavigate } from 'react-router-dom';
const NotificationBar = () => {
  const navigate = useNavigate(); 
  const handleUserProfile = () => {
    navigate('/super_admin/adminUserProfile'); // Corrected spelling of navigate
  };

  return (
    <Box sx={{ 
      backgroundColor: "#1976d2",
        color: "white",
        padding: "10px 20px",
        position: "sticky",
        top:0,
        zIndex: 1000,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
    }}>
      <Typography variant="h6">B2B-OP Super Admin</Typography>  
      
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        {/* <IconButton sx={{ color: 'white' }}>
          <NotificationsIcon />
        </IconButton> */}
        <IconButton sx={{ color: 'white' }} onClick={handleUserProfile}>
          <AccountCircleIcon />
        </IconButton>
      </Box>
    </Box>
  );
};

export default NotificationBar;
