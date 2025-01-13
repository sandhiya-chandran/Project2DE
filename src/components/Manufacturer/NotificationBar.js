import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, IconButton , Tooltip} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import MenuIcon from '@mui/icons-material/Menu'; 

const NotificationBar = ({toggleSidebar}) => {
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

<Box sx={{ display: "flex", alignItems: "center", gap:'20px' }}>
         {/* Toggle Sidebar Button (Menu Icon) */}
       <Tooltip title="Toggle Sidebar" arrow>
          <IconButton
            sx={{ color: "white" }}
            onClick={toggleSidebar}
          >
            <MenuIcon  fontSize="18px"/>
          </IconButton>
        </Tooltip>
        
      <Typography variant="h6" fontSize={18}>B2B-OP Seller</Typography>
      </Box>

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
