// src\components\Logout.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Tooltip} from '@mui/material';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';

const Logout = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  return (

    <Tooltip title="Logout" arrow>
   
      <ExitToAppIcon sx={{fontSize:'2rem'}} onClick={handleLogout}/>
    
  </Tooltip>
  
  );
};

export default Logout;
