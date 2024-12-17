// src\components\Dealer\NotificationBar.js

import React from "react";
import { Box, Typography, IconButton, Badge, Tooltip } from "@mui/material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import { useNavigate } from "react-router-dom";

const NotificationBar = ({ cartCount , userData}) => {

const navigate = useNavigate();

const user = JSON.parse(localStorage.getItem("user"));
  
  return (
    <Box
      sx={{
        backgroundColor: "#1976d2",
        color: "white",
        padding: "10px 20px",
        position: "sticky",
        top:0,
        zIndex: 1000,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
       
      }}
    >
      <Typography variant="h6">B2B-OP Buyer</Typography>
      

      <Box sx={{ display: "flex", alignItems: "center" }}>
        {/* Cart Icon with Count and Total */}
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
            sx={{ color: "white" ,  "&:hover": {
              backgroundColor: "transparent", // Disables background color on hover
            },}}
            onClick={() => navigate("/dealer/profile")}
          >
            <AccountCircleIcon />
          <Typography variant="body2" ml={1}>  {userData?.first_name || user.name}</Typography>
          </IconButton>
        </Tooltip>
      
      </Box>
    </Box>
  );
};

export default NotificationBar;
