// src/components/Dealer/NotificationBar.js
import React, { useState, useEffect } from 'react';
import axios from 'axios'; // Import axios for making API requests
import { Box, Typography, IconButton, Badge, Tooltip } from "@mui/material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import FavoriteIcon from "@mui/icons-material/Favorite";
import MenuIcon from '@mui/icons-material/Menu';  // Add this import for the toggle icon
import { useNavigate } from "react-router-dom";

const NotificationBar = ({ cartCount, userData, toggleSidebar }) => {
  const [logoPreview, setLogoPreview] = useState(null); // Define logoPreview state
  const [loading, setLoading] = useState(false); // Define loading state

  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    fetchLogo(); // Fetch the logo on component mount
  }, []);

  const fetchLogo = async () => {
    setLoading(true); // Set loading state to true before starting the API call

    try {
      const response = await axios.get(
        `${process.env.REACT_APP_IP}getManufactureUnitLogo/`,
        {
          params: {
            manufacture_unit_id: user.manufacture_unit_id, // Pass the manufacture unit id
          },
        }
      );

      console.log("Response:", response);

      // Check if logo exists in the response
      if (response.data && response.data.data.logo) {
        // Assuming the logo is a base64 string, directly use it for the image source
        setLogoPreview(response.data.data.logo); // Update logoPreview with the fetched base64 logo
        console.log('9090',logoPreview)
      }
    } catch (error) {
      console.error("Error fetching logo:", error);
      alert('Error fetching logo');
    } finally {
      setLoading(false); // Set loading state to false after the API call finishes
    }
  };
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

       {/* Show logo if available */}
       {logoPreview ? (
  <img src={logoPreview} alt="Company Logo" width="100" height="50" />
) : null} {/* Only render the image if logoPreview is not null */}


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
