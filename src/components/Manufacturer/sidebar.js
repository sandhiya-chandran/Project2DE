import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import Logout from '../Login/Logout';
import { Dashboard, Receipt, ShoppingCart, People, Settings, ExitToApp } from '@mui/icons-material'; // Import icons
import CloseIcon from '@mui/icons-material/Close';
const drawerWidth = 230;

const Sidebar = ({ isOpen , toggleSidebar }) => {
  const location = useLocation(); // Get the current location (route)
  
  const getActiveStyle = (path) => {
    return location.pathname === path
      ? { backgroundColor: '#f4f6f8', color: '#1976d2' } // Active state style
      : {}; // Default style
  };

  return (
   <Drawer
           variant="temporary"
           open={isOpen}
           onClose={toggleSidebar}
           ModalProps={{
             keepMounted: true, // Better performance on mobile
           }}
           sx={{
             '& .MuiDrawer-paper': {
               width: drawerWidth,
               boxSizing: 'border-box',
             },
           }}
         >

      <List sx={{ p: 0 }}>
      <ListItem disablePadding >
                    <ListItemButton onClick={toggleSidebar} sx={{ justifyContent: 'flex-end' , px:0 , py:1}}>
                        <CloseIcon sx={{ mr: 1 }} /> 
                    </ListItemButton>
                </ListItem>
                
        <ListItem disablePadding>
          <ListItemButton component={Link} to="/manufacturer" sx={getActiveStyle('/manufacturer')}>
            <Dashboard sx={{ mr: 1 }} /> {/* Dashboard Icon */}
            <ListItemText primary="Dashboard" />
          </ListItemButton>
        </ListItem>
      
        <ListItem disablePadding>
          <ListItemButton component={Link} to="/manufacturer/products" sx={getActiveStyle('/manufacturer/products')}>
            <ShoppingCart sx={{ mr: 1 }} /> {/* Products Icon */}
            <ListItemText primary="Products" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton component={Link} to="/manufacturer/orders" sx={getActiveStyle('/manufacturer/orders')}>
            <Receipt sx={{ mr: 1 }} /> {/* Orders Icon */}
            <ListItemText primary="Orders" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton component={Link} to="/manufacturer/dealerList" sx={getActiveStyle('/manufacturer/dealerList')}>
            <People sx={{ mr: 1 }} /> {/* Dealers Icon */}
            <ListItemText primary="Buyers" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton component={Link} to="/manufacturer/settings" sx={getActiveStyle('/manufacturer/settings')}>
            <Settings sx={{ mr: 1 }} /> {/* Settings Icon */}
            <ListItemText primary="Settings" />
          </ListItemButton>
        </ListItem>
      </List>
      <Divider />
      <Box sx={{ mt: 'auto', mb: 2, px: 2 }}>
        <ListItem disablePadding>
          <ListItemButton component={Logout}>
            <ExitToApp sx={{ mr: 2 }} /> {/* Logout Icon */}
            <ListItemText primary="Logout" />
          </ListItemButton>
        </ListItem>
      </Box>
    </Drawer>
  );
};

export default Sidebar;
