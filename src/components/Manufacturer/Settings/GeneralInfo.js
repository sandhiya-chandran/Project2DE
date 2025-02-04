import React, { useState, useEffect } from 'react';
import axios from 'axios'; // Import axios
import { Switch, TextField, Button, FormControlLabel } from '@mui/material';
import { Padding } from '@mui/icons-material';

function GeneralInfo({ companyInfo }) {
  const user = JSON.parse(localStorage.getItem("user"));
  const [loading, setLoading] = useState(false); // Loading state
  const [unitDetails, setUnitDetails] = useState(null); // State to store fetched data
  const [isActive, setIsActive] = useState(false); // Manage is_active status
  const [description, setDescription] = useState(""); // Manage description field
  const [logoPreview, setLogoPreview] = useState(null); // Preview the logo

  // Function to fetch manufacturer unit details
  const fetchUnitDetails = async () => {
    setLoading(true); // Set loading state to true when the API call starts
    try {
      const response = await axios.get(`${process.env.REACT_APP_IP}obtainManufactureUnitDetails/`, {
        params: {
          manufacture_unit_id: user.manufacture_unit_id, // Use the id from local storage
        },
      });
      const { manufacture_unit_obj } = response.data.data;
      setUnitDetails(manufacture_unit_obj); // Store the fetched data in state
      setIsActive(manufacture_unit_obj.is_active); // Set the initial state for is_active
      setLogoPreview(manufacture_unit_obj.logo); // Set the initial logo preview
    } catch (error) {
      console.error("Error fetching unit details:", error);
    } finally {
      setLoading(false); // Set loading state to false once the API call finishes
    }
  };

  // Fetch the details on component mount
  useEffect(() => {
    fetchUnitDetails();
  }, []);

  // Function to handle `is_active` change
  const handleIsActiveChange = (event) => {
    setIsActive(event.target.checked); // Update is_active value
  };

  // Function to handle description change
  const handleDescriptionChange = (event) => {
    setDescription(event.target.value); // Update description value
  };

  // Function to handle logo file change
  const handleLogoChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Create a FileReader to preview the image
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result); // Set the preview image
      };
      reader.readAsDataURL(file); // Read the file as base64
    }
  };

// Function to handle save changes
const handleSaveChanges = async () => {
    try {
      const data = {
        manufacture_unit_id: user.manufacture_unit_id,
        is_active: isActive,
        logo: logoPreview, // Send the logo as a base64 string (or the appropriate format)
      };
      
  
      // You can make a PUT or PATCH request to save the changes
      await axios.put(`${process.env.REACT_APP_IP}updateLogo/`, data);
      alert('Changes saved successfully');
    } catch (error) {
      console.error("Error saving changes:", error);
      alert('Error saving changes');
    }
  };
  
  if (loading) {
    return <div>Loading...</div>; // Display loading message while fetching data
  }

  return (
    <div>
      {unitDetails && (
        <>
          {/* Display the logo */}
          <div>
            <h3>Logo</h3>
            <div>
              {logoPreview ? (
                <img src={logoPreview} alt="Company Logo" width="100" height="100" />
              ) : (
                <p>No logo available</p>
              )}
            </div>
            <div style={{ paddingBottom: '2px' }}>
  <input
    type="file"
    accept="image/*"
    onChange={handleLogoChange}
  />
</div>

          </div>

          {/* Display and edit the is_active checkbox */}
          <div>
            <FormControlLabel
              control={
                <Switch
                  checked={isActive}
                  onChange={handleIsActiveChange}
                  color="primary"
                />
              }
              label="Is Active"
            />
          </div>

          {/* Display and edit the description */}
          {/* <div>
            <TextField
              label="Description"
              value={description}
              onChange={handleDescriptionChange}
              fullWidth
              multiline
              rows={4}
            />
          </div> */}

          {/* Save button to persist the changes */}
          <div>
            <Button variant="contained" color="primary" sx={{textTransform:'capitalize'}} onClick={handleSaveChanges}>
              Save Changes
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

export default GeneralInfo;
