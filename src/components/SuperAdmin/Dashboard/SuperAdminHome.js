// src/components/SuperAdmin/Dashboard/SuperAdminHome.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
} from "@mui/material";

const SuperAdminHome = () => {
  const [ setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoryResponse = await axios.get(`${process.env.REACT_APP_IP}obtainManufactureUnitList/`);
        console.log('9090',categoryResponse)
        setCategories(categoryResponse.data.data || []);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);

  return (
    <Box
    sx={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "200px",
      textAlign: "center",
      flexDirection: "column",
    }}
  >
    <Typography variant="h6" color="textSecondary">
      This feature will be available soon!
    </Typography>
    <Typography variant="body2" color="textSecondary">
      We're working on it. Stay tuned!
    </Typography>
  </Box>
  
  );
};

export default SuperAdminHome;
