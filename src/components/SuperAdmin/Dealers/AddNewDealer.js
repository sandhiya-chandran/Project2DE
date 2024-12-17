// src\components\Manufacturer\Dealers\AddNewDealer.js

import React, { useState } from "react";
import {
  TextField,
  Button,
  Container,
  Typography,
  Box,
  Snackbar,
  IconButton,
} from "@mui/material";
import axios from "axios";
import ReplayIcon from "@mui/icons-material/Replay";
import Tooltip from "@mui/material/Tooltip";

function AddNewDealer() {
  const user = JSON.parse(localStorage.getItem("user"));
  const manufactureUnitId = user?.manufacture_unit_id; // Retrieve manufacture_unit_id
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [errors, setErrors] = useState({ name: "", email: "" });
  const [successMessage, setSuccessMessage] = useState(""); // State for success message
  const validateForm = () => {
    let valid = true;
    let errors = { name: "", email: "" };

    if (!name) {
      errors.name = "Name is required";
      valid = false;
    }

    // Simple email validation
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      errors.email = "Email is required";
      valid = false;
    } else if (!emailPattern.test(email)) {
      errors.email = "Invalid email format";
      valid = false;
    }

    setErrors(errors);
    return valid;
  };

  // Function to fetch username from the API
  const fetchUsername = async () => {
    if (!validateForm()) return; // Validate fields before making the request
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_IP}generateUserName/`,
        {
          params: {
            manufacture_unit_id: manufactureUnitId, // Pass the manufacture_unit_id
            name: name,
          },
        }
      );

      console.log("API Response:", response);
      if (response.data && response.data.data && response.data.data.username) {
        setUsername(response.data.data.username); // Set the generated username
      } else {
        console.error("Username not found in response:", response.data);
      }
    } catch (error) {
      console.error("Error generating username:", error);
    }
  };

  // Function to create user
  const createUser = async () => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_IP}createUser/`,
        {
          name,
          username,
          email,
          manufacture_unit_id: manufactureUnitId,
        }
      );

      console.log("User creation response:", response);
      if (response.status === 200) {
        // Assuming 200 status code for success
        const message =
          response.data.data?.data?.message ||
          "User created successfully and email sent!";
        setSuccessMessage(message); // Set the success message from the response

        // Clear form fields
        setName("");
        setEmail("");
        setUsername("");
      }
    } catch (error) {
      console.error("Error creating user:", error);
      // Handle error, e.g., set error message in the state if necessary
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      createUser(); // Call createUser if validation is successful
    }
  };

  return (
    <Container maxWidth="xs" style={{ marginTop: "20px" }}>
      <Typography variant="h5" gutterBottom>
        Add New Dealer
      </Typography>
      <form onSubmit={handleSubmit}>
        <Box display="flex" flexDirection="column" spacing={2}>
          <Box mb={2}>
            <TextField
              label="Name"
              variant="outlined"
              fullWidth
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setErrors({ ...errors, name: "" }); // Clear error on change
              }}
              error={!!errors.name}
              helperText={errors.name}
            />
          </Box>
          <Box mb={2}>
            <TextField
              label="Email"
              variant="outlined"
              fullWidth
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErrors({ ...errors, email: "" });
              }}
              error={!!errors.email}
              helperText={errors.email}
            />
          </Box>
          <Box mb={2} sx={{ display: "flex", gap: 2 }}>
            <TextField
              label="Username"
              variant="outlined"
              fullWidth
              value={username}
              onChange={(e) => setUsername(e.target.value)} // Allow user to edit username
            />

            <Tooltip title="Generate Username" arrow>
              <IconButton onClick={fetchUsername} sx={{ padding: 0 }}>
                <ReplayIcon
                  sx={{
                    fontSize: "30px",
                    color: "#1976d2",
                  }}
                />
              </IconButton>
            </Tooltip>
           
              
          </Box>
          <Box>
            <Button type="submit" variant="contained" color="success" fullWidth>
              Create New User
            </Button>
          </Box>
        </Box>
      </form>
      {/* Snackbar for success message */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={6000}
        onClose={() => setSuccessMessage("")}
        message={successMessage}
      />
    </Container>
  );
}

export default AddNewDealer;
