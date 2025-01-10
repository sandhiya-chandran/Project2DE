// src/components/Dealer/NotificationBar.js
import React from "react";
import { Box, Typography, IconButton, Badge, Tooltip } from "@mui/material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import FavoriteIcon from "@mui/icons-material/Favorite";
import MenuIcon from '@mui/icons-material/Menu';  // Add this import for the toggle icon
import { useNavigate } from "react-router-dom";

const NotificationBar = ({ cartCount, userData, toggleSidebar }) => {

  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));
  
  return (
    <Box
      sx={{
        backgroundColor: "#1976d2",
        color: "white",
        padding: "10px 10px",
        position: "sticky",
        top:0,
        zIndex: 1000,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >

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
        
      <Typography variant="h6" fontSize={18}>B2B-OP Buyer</Typography>
      </Box>

      <Box sx={{ display: "flex", alignItems: "center" }}>
        
       

        <Tooltip title="WishList" arrow>
          <IconButton
            sx={{ color: "white" }}
            onClick={() => navigate("/dealer/WishList")}
          >
            <FavoriteIcon />
          </IconButton>
        </Tooltip>

        <IconButton
          sx={{ color: "white" }}
          onClick={() => navigate("/dealer/cart")}
        >
          <Badge badgeContent={cartCount} color="error" sx={{ marginRight: "10px" }}>
            <ShoppingCartIcon />
          </Badge>
        </IconButton>

        <Tooltip title="Profile" arrow>
          <IconButton
            sx={{ color: "white" }}
            onClick={() => navigate("/dealer/profile")}
          >
            <AccountCircleIcon />
            <Typography variant="body2" ml={1}> {userData?.first_name || user.name}</Typography>
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
};

export default NotificationBar;
