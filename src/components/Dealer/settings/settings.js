import React from "react";
import {
  Box,
  Typography,
} from "@mui/material";

const SettingsPage = () => {
 

 
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

export default SettingsPage;
