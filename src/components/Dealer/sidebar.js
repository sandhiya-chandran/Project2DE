// src/components/Dealer/sidebar.js
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Box, Drawer, List, ListItem, ListItemButton, ListItemText, Divider } from '@mui/material';
import Logout from '../Login/Logout'; 
import { Dashboard, Receipt, Settings, ShoppingCart } from '@mui/icons-material'; 
import CloseIcon from '@mui/icons-material/Close';
const drawerWidth = 230;

const Sidebar = ({ isOpen , toggleSidebar }) => {
    const location = useLocation();

    const getActiveStyle = (path) => {
      return location.pathname === path
        ? { backgroundColor: '#f4f6f8', color: '#1976d2', fontWeight: 'bold' }
        : {};
    };

    const isProductsPage = location.pathname === '/dealer/products';

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
                    <ListItemButton component={Link} to="/dealer" sx={getActiveStyle('/dealer')} onClick={toggleSidebar}>
                        <Dashboard sx={{ mr: 1 }} /> 
                        <ListItemText primary="Dashboard" />
                    </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                    <ListItemButton component={Link} to="/dealer/products" sx={getActiveStyle('/dealer/products')} onClick={toggleSidebar}>
                        <ShoppingCart sx={{ mr: 1 }} /> 
                        <ListItemText primary="Products" />
                    </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                    <ListItemButton component={Link} to="/dealer/orders" sx={getActiveStyle('/dealer/orders')} onClick={toggleSidebar}>
                        <Receipt sx={{ mr: 1 }} /> 
                        <ListItemText primary="Orders" />
                    </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                    <ListItemButton component={Link} to="/dealer/settings" sx={getActiveStyle('/dealer/settings')} onClick={toggleSidebar}>
                        <Settings sx={{ mr: 1 }} />
                        <ListItemText primary="Settings" />
                    </ListItemButton>
                </ListItem>
            </List>

            <Divider />

            <Box sx={{ mt: 'auto', mb: 2, px: 2 }}>
                <ListItem sx={{mt:'15px'}} disablePadding>
                    <ListItemButton component={Logout}> 
                        <ListItemText primary="Logout" />
                    </ListItemButton>
                </ListItem>
            </Box>
        </Drawer>
    );
};

export default Sidebar;
