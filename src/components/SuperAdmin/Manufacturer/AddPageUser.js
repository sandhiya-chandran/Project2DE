// src\components\SuperAdmin\Manufacturer\AddPageUser.js

import React, { useState, useEffect } from "react";
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

const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};


function AddNewUser({ id , onClose , reloadUser }) {
  const user = JSON.parse(localStorage.getItem("user"));
  const manufactureUnitId = id; 
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [emailStatus, setEmailStatus] = useState(""); // Track email status
  const [errors, setErrors] = useState({ name: "", email: "" });
  const [successMessage, setSuccessMessage] = useState(""); // State for success message
  // Use debounce for email to avoid too many API calls
  const debouncedEmail = useDebounce(email, 500);

  // Check if email exists or not
  const checkEmailExistOrNot = async (email, manufactureUnitId) => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_IP}checkEmailExistOrNot/`, {
        params: {
          email,
          manufacture_unit_id: manufactureUnitId,
        },
      });
  
      // Log the value of is_exist inside the nested data object
      console.log("Email existence check is_exist value:", response.data.data.is_exist);
  
      // Check if the is_exist is true or false
      if (response.data && response.data.data && response.data.data.is_exist !== undefined) {
        if (response.data.data.is_exist) {
          // Email exists
          setEmailStatus({
            message: "Email already exists.",
            color: "red", // Set the color to red for error
          });
          return true; // Email exists
        } else {
          // Email is valid
          setEmailStatus({
            message: "Email is valid.",
            color: "green", // Set the color to green for success
          });
          return false; // Email does not exist
        }
      } else {
        // Handle case where API response is unexpected or missing data
        setEmailStatus({
          message: "Error: Invalid API response.",
          color: "orange", // Set the color to orange for errors
        });
        return false;
      }
    } catch (error) {
      console.error("Error checking email existence:", error);
      setEmailStatus({
        message: "Error validating email.",
        color: "orange", // Set the color to orange for errors
      });
      return false; // Handle error gracefully
    }
  };
  
  

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

    // Check email validity before generating username
    const emailExists = await checkEmailExistOrNot(email, manufactureUnitId);
    if (emailExists) return; // Do not proceed with username generation if email exists

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
          role_name: user.role_name,
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
        setEmailStatus(""); // Clear email status after successful user creation


        if (onClose) onClose(); // Close the dialog
        
        reloadUser();
            }


    } catch (error) {
      console.error("Error creating user:", error);
      // Handle error, e.g., set error message in the state if necessary
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      // Check if email exists
      const emailExists = await checkEmailExistOrNot(email, manufactureUnitId);
      if (emailExists) {
        // Do not proceed with creating the user if email exists
        return;
      }
      createUser(); // Call createUser if validation is successful and email doesn't exist
    }
  };

  useEffect(() => {
    if (debouncedEmail && name && emailStatus.message === "Email is valid.") {
      fetchUsername();
    }
  }, [debouncedEmail, name, emailStatus.message]);


  return (
    <Container maxWidth="xs" style={{ marginTop: "20px" }}>
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
    onChange={async (e) => {
      const emailValue = e.target.value;
      setEmail(emailValue);
      setErrors({ ...errors, email: "" });
      setEmailStatus(""); // Reset email status on input change

      // Validate the email format first
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (emailPattern.test(emailValue)) {
        // If email format is valid, check if it exists
        await checkEmailExistOrNot(emailValue, manufactureUnitId);
      } else {
        setEmailStatus({
          message: "Invalid email format",
          color: "red",
        });
      }
    }}
    error={!!errors.email}
    helperText={errors.email}
  />
  
  {/* Only show the email status message when the email format is valid */}
  {emailStatus && emailStatus.message !== "Invalid email format" && (
    <Typography
      variant="body2"
      color="textSecondary"
      sx={{ fontSize: "12px", mt: 1, color: emailStatus.color }}
    >
      {emailStatus.message}
    </Typography>
  )}
</Box>

          <Box mb={2} sx={{ display: "flex", gap: 2 }}>
            <TextField
              label="Username"
              variant="outlined"
              fullWidth
              value={username}
              onChange={(e) => setUsername(e.target.value)} // Allow user to edit username
              InputProps={{
                readOnly: true, // Makes the field non-editable
              }}
            />
            <Tooltip title="Regenerate Username" arrow>
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
          <Typography
            variant="body2"
            color="textSecondary"
            sx={{ fontSize: "12px", mt: -1 }}
          >
            Username is auto-generated and cannot be edited. Please wait for
            it to generate or regenerate manually with the icon.
          </Typography>
          <Box>
            <Button sx={{ mt: 2 }} type="submit" variant="contained" color="success" fullWidth>
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

export default AddNewUser;
