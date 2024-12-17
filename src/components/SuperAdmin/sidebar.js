import React from 'react';
import { Link , useLocation } from 'react-router-dom';
import { Box, Drawer, List, ListItem, ListItemButton, ListItemText, Divider,ListItemIcon } from '@mui/material';
import { Dashboard, Business, Storefront, Settings } from '@mui/icons-material';
import Logout from '../Login/Logout';

const drawerWidth = 200;

const Sidebar = () => {

    const location = useLocation(); // Get the current location (route)

    // Function to return active style based on the current route
    const getActiveStyle = (path) => {
        return location.pathname === path
            ? { backgroundColor: '#f4f6f8', color: '#1976d2' } // Active state style
            : {}; // Default style
    };

    return (
        <Drawer
            sx={{
                width: drawerWidth,
                flexShrink: 0,
                '& .MuiDrawer-paper': {
                    width: drawerWidth,
                    boxSizing: 'border-box',
                    bgcolor: 'background.paper',
                },
            }}
            variant="permanent"
            anchor="left"
        >

        

            {/* Menu Items */}
            <List>
                {/* Dashboard */}
                <ListItem disablePadding>
                    <ListItemButton component={Link} to="/super_admin" sx={getActiveStyle('/super_admin')}>
                       
                            <Dashboard sx={{ mr: 1 }} />
                        
                        <ListItemText primary="Dashboard" />
                    </ListItemButton>
                </ListItem>

                {/* Manufacturer */}
                <ListItem disablePadding>
                    <ListItemButton component={Link} to="/super_admin/manufacturerList" sx={getActiveStyle('/super_admin/manufacturerList')}>
                       
                            <Business sx={{ mr: 1 }} />
                        
                        <ListItemText primary="Manufacturer" />
                    </ListItemButton>
                </ListItem>

              

                {/* Settings */}
                <ListItem disablePadding>
                    <ListItemButton component={Link} to="/super_admin/settings" sx={getActiveStyle('/super_admin/settings')}>
                      
                            <Settings sx={{ mr: 1 }} />
                       
                        <ListItemText primary="Settings" />
                    </ListItemButton>
                </ListItem>
            </List>

            <Divider />

            {/* Logout Section */}
            <Box sx={{ mt: 'auto', mb: 2, px: 2 }}>
                <ListItem disablePadding>
                    <ListItemButton component={Logout}>
                        <ListItemText primary="Logout" />
                    </ListItemButton>
                </ListItem>
            </Box>
        </Drawer>
    );
};

export default Sidebar;
