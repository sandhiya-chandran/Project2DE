// src\components\Dealer\sidebar.js
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Box, Drawer, List, ListItem, ListItemButton, ListItemText, Divider } from '@mui/material';
import Logout from '../Login/Logout'; 
import { Dashboard, Receipt, Settings, ShoppingCart } from '@mui/icons-material'; 
import ProductBrand from './Products/ProductBrands';


const drawerWidth = 230;

const Sidebar = ({industryId}) => {
    const location = useLocation(); // Get the current location (route)

    // Function to return active style based on the current route
    const getActiveStyle = (path) => {
        return location.pathname === path
            ? { backgroundColor: '#f4f6f8', color: '#1976d2' } // Active state style
            : {}; // Default style
    };

    // Check if the current route is '/dealer/products'
    const isProductsPage = location.pathname === '/dealer/products';

    return (
        <Drawer
            sx={{
                width: drawerWidth,
               
                flexShrink: 0,
                '& .MuiDrawer-paper': {
                    width: drawerWidth,
                    boxSizing: 'border-box',
                },
            }}
            variant="permanent"
            anchor="left"
        >
            <List>
                <ListItem disablePadding>
                    <ListItemButton component={Link} to="/dealer" sx={getActiveStyle('/dealer')}>
                        <Dashboard sx={{ mr: 1 }} /> 
                        <ListItemText primary="Dashboard" />
                    </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                    <ListItemButton component={Link} to="/dealer/products" sx={getActiveStyle('/dealer/products')}>
                        <ShoppingCart sx={{ mr: 1 }} /> 
                        <ListItemText primary="Products" />
                    </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                    <ListItemButton component={Link} to="/dealer/orders" sx={getActiveStyle('/dealer/orders')}>
                        <Receipt sx={{ mr: 1 }} /> 
                        <ListItemText primary="Orders" />
                    </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                    <ListItemButton component={Link} to="/dealer/settings" sx={getActiveStyle('/dealer/settings')}>
                        <Settings sx={{ mr: 1 }} />
                        <ListItemText primary="Settings" />
                    </ListItemButton>
                </ListItem>
            </List>
            <Divider />

            {isProductsPage && (
                <>
                    <Divider />
                    <ProductBrand  industryId={industryId}/> {/* Render ProductSidebar if on products page */}
                </>
            )}

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
