// src/components/Dealer/Dashboard/DealerProfile.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Button,
  TextField,
  Grid,
  Typography,
  IconButton,
  Card,
  CardContent,
  Input,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,FormControlLabel, Radio, RadioGroup
} from "@mui/material";
import { Edit, Delete, Home } from "@mui/icons-material";
import { CameraAlt } from "@mui/icons-material";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // Import default styles
import Close from '@mui/icons-material/Close';

const DealerProfile = ({ userData, fetchUserDetails, setUserData }) => {
  const user = JSON.parse(localStorage.getItem("user"));
  const [addressList, setAddressList] = useState([]);
  const [errors, setErrors] = useState({});

  const [isEditable, setIsEditable] = useState(false);
  const [open, setOpen] = useState(false);
  const [newAddress, setNewAddress] = useState({
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
    is_default: false,
  });

  useEffect(() => {
    if (!userData) {
      fetchUserDetails();
    }
  }, [userData, fetchUserDetails]);

  const validateFields = () => {
    const newErrors = {};

    if (!userData.first_name?.trim())
      newErrors.first_name = "First Name is required.";
    if (!userData.last_name?.trim())
      newErrors.last_name = "Last Name is required.";
    if (!userData.email?.trim() || !/\S+@\S+\.\S+/.test(userData.email)) {
      newErrors.email = "A valid Email is required.";
    }
    if (
      !userData.mobile_number?.trim() ||
      !/^\d{10}$/.test(userData.mobile_number)
    ) {
      newErrors.mobile_number = "A valid 10-digit Mobile Number is required.";
    }
    if (!userData.company_name?.trim())
      newErrors.company_name = "Company Name is required.";

    // Check if address list is empty
    if (!userData?.address_obj_list || userData.address_obj_list.length === 0) {
      newErrors.address =
        "Address list is empty. Please add at least one address.";
      alert("Address list is empty. Please add at least one address.");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // Return true if no errors
  };

  const handleEdit = () => {
    setIsEditable(true);
  };

  const handleSave = async () => {
    // Check if at least one address is marked as default
    const isDefaultAddressPresent = userData.address_obj_list.some(address => address.is_default);
  
    if (!isDefaultAddressPresent) {
      // Show an error or toast message
      toast.error("To Save add atleast one default address and fill all mandatory fields.");
      return; // Stop the save if no default address is selected
    }
  
    if (!validateFields()) {
      return; // Stop saving if validation fails
    }
  
    try {
      const filteredAddressList = userData.address_obj_list.map(
        ({
          street,
          city,
          state,
          zipCode,
          country,
          is_default,
          address_id,
        }) => ({
          street,
          city,
          state,
          zipCode,
          country,
          is_default,
          id: address_id,
        })
      );
  
      const response = await axios.post(
        `${process.env.REACT_APP_IP}updateUserProfile/`,
        {
          user_id: user.id,
          user_obj: {
            first_name: userData.first_name,
            last_name: userData.last_name,
            email: userData.email,
            mobile_number: userData.mobile_number,
            profile_image: userData.profile_image, // Send Base64 image
            company_name: userData.company_name,
            website: userData.website,
          },
          address_obj_list: filteredAddressList,
          bank_details_obj_list: userData.bank_details_obj_list,
          ware_house_obj_list: userData.ware_house_obj_list,
        }
      );
  
      const fullName = `${userData.first_name} ${userData.last_name}`;
  
      setIsEditable(false); // Disable editing after save
      fetchUserDetails();
    } catch (error) {
      console.error("Error updating user profile:", error);
    }
  };
  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUserData((prevState) => ({
          ...prevState,
          profile_image: reader.result, // Update Base64 image in userData
        }));
      };
      reader.readAsDataURL(file); // Convert to Base64
    }
  };

  // handleRemove function (used when address_id is missing)
const handleRemove = (index) => {
  console.log("Removing address at index:", index);

  setUserData((prevState) => {
    const updatedAddressList = [...prevState.address_obj_list];

    // Remove the address at the given index
    updatedAddressList.splice(index, 1);

    return { ...prevState, address_obj_list: updatedAddressList };
  });
};
  const handleDelete = async (index, addressId, isDefault) => {
    console.log("Deleting address ID:", addressId);
  
    // Prevent deletion if the address is marked as the default address
    if (isDefault) {
      console.error("Cannot delete default address.");
      return;
    }
  
    const userData = localStorage.getItem("user");
    if (!userData) {
      console.error("No user data found in localStorage.");
      return;
    }
  
    const userId = JSON.parse(userData).id;
    const addressList = JSON.parse(userData).address_obj_list || [];
  
    // If addressId is available, use it; otherwise, fall back to the index-based approach
    const addressToDelete = addressId || addressList[index]?.address_id;
  
    if (!addressToDelete) {
      console.error("Address ID or index not found for deletion");
      return;
    }
  
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_IP}deleteAddress/`,
        {
          address_id: addressToDelete,
          user_id: userId,
          is_default: isDefault,
        }
      );
  
      if (response.data.message === "success") {
        console.log("Address deleted successfully");
  
        setUserData((prevState) => {
          const updatedAddressList = [...prevState.address_obj_list];
  
          // Use addressId if available, otherwise delete by index
          const deleteIndex = addressId
            ? updatedAddressList.findIndex((address) => address.address_id === addressToDelete)
            : index;
  
          // Proceed with deletion only if the address exists and is not the default
          if (deleteIndex !== -1 && !updatedAddressList[deleteIndex].is_default) {
            updatedAddressList.splice(deleteIndex, 1); // Splice removes the address at the found index
          } else if (updatedAddressList[deleteIndex]?.is_default) {
            console.error("Cannot delete default address.");
            return prevState; // Return the same state without deletion
          }
  
          // If the deleted address was the default one, set the first address as default
          if (updatedAddressList.length > 0 && !updatedAddressList.some(address => address.is_default)) {
            updatedAddressList[0].is_default = true; // Set the first address as default if none is marked
          }
  
          return { ...prevState, address_obj_list: updatedAddressList };
        });
  
        fetchUserDetails();
      } else {
        console.error("Failed to delete address:", response.data.message);
      }
    } catch (error) {
      console.error("Error deleting address:", error);
    }
  };
  

  const handleDefaultChange = (index) => {
    setUserData((prevState) => {
      const updatedAddressList = prevState.address_obj_list.map((address, i) =>
        i === index
          ? { ...address, is_default: true } // Set selected address as default
          : { ...address, is_default: false } // Unset others as default
      );
  
      // If no address has is_default true, set the first address as default
      if (!updatedAddressList.some(address => address.is_default)) {
        updatedAddressList[0].is_default = true;
      }
  
      return {
        ...prevState,
        address_obj_list: updatedAddressList,
      };
    });
  };
  
  
  const handleAddAddress = () => {

    if (!newAddress.street || !newAddress.city || !newAddress.zipCode || !newAddress.country || !newAddress.state) {
          alert("Please fill out all required fields.");
          return;
        }

    const newAddressWithDefault = {
      ...newAddress,
      id: Date.now().toString(),
      is_default: false,  // Ensure default is set to false
    };
  
    setUserData((prevState) => ({
      ...prevState,
      address_obj_list: [...prevState.address_obj_list, newAddressWithDefault],
    }));
  
    // Reset newAddress form
    setNewAddress({
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "",
      is_default: false,  // Ensure newAddress is also set to default false
    });
  };
  
  // const handleAddAddress = () => {
  //   if (!newAddress.street || !newAddress.city || !newAddress.zipCode) {
  //     alert("Please fill out all required fields.");
  //     return;
  //   }

  //   const newAddressWithDefault = {
  //     ...newAddress,
  //     id: Date.now().toString(),
  //     is_default: userData.address_obj_list.some(
  //       (address) => address.is_default
  //     )
  //       ? false // If a default exists, set new address as non-default
  //       : true, // Otherwise, make it the default
  //   };

  //   // Add the new address to the existing list without altering the `is_default` of existing addresses
  //   setUserData((prevState) => ({
  //     ...prevState,
  //     address_obj_list: [...prevState.address_obj_list, newAddressWithDefault],
  //   }));

  //   // Reset the new address form state
  //   setNewAddress({
  //     street: "",
  //     city: "",
  //     state: "",
  //     zipCode: "",
  //     country: "",
  //     is_default: false,
  //   });

  //   console.log("New address added:", newAddressWithDefault);
  // };

  const handleClickOpen = () => {
    setOpen(true); // Open the modal
  };

  const handleClose = () => {
    setOpen(false); // Close the modal
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setNewAddress((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  // const deleteAddress = async ({
  //   address_id,
  //   is_default,
  //   user_id,
  //   ware_house,
  // }) => {
  //   try {
  //     const response = await axios.post(
  //       `${process.env.REACT_APP_IP}deleteAddress/`,
  //       {
  //         address_id,
  //         is_default,
  //         user_id,
  //         ware_house,
  //       }
  //     );
  //     return { success: true, data: response.data };
  //   } catch (error) {
  //     console.error("Error deleting address:", error);
  //     return { success: false, message: error.message };
  //   }
  // };

  // const handleDelete = async (addressId) => {
  //   const result = await deleteAddress({
  //     address_id: addressId,
  //     is_default: true, // Adjust as needed
  //     user_id: user.id,
  //     ware_house: false,
  //   });

  //   if (result.success) {
  //     // Directly update the userData state to remove the address
  //     setUserData((prevData) => ({
  //       ...prevData,
  //       address_obj_list: prevData.address_obj_list.filter(
  //         (address) => address.id !== addressId
  //       ),
  //     }));

  //     // Optionally, fetch updated user data
  //     fetchUserDetails();
  //   } else {
  //     alert(result.message);
  //   }
  // };

  // Conditionally render content based on userData
  if (!userData) {
    return <div>Loading...</div>; // Show loading message or spinner while user data is being fetched
  }

  return (
    <div style={{ padding: 20 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Box>
            <div style={{ position: "relative", display: "inline-block" }}>
              {/* Profile Image */}
              {userData && userData.profile_image ? (
                <img
                  src={userData.profile_image}
                  alt="Profile Preview"
                  style={{
                    width: "50px",
                    height: "50px",
                    marginTop: "10px",
                    borderRadius: "50%",
                    objectFit: "cover",
                  }}
                />
              ) : (
                <div
                  style={{
                    width: "100px",
                    height: "100px",
                    backgroundColor: "#ccc",
                    marginTop: "10px",
                    borderRadius: "50%",
                  }}
                />
              )}

              {/* Camera Icon on top of the image */}
              {isEditable && (
                <IconButton
                  component="label"
                  style={{
                    position: "absolute",
                    bottom: 5,
                    right: 5,
                    backgroundColor: "rgba(0, 0, 0, 0.5)",
                    color: "white",
                  }}
                >
                  <CameraAlt />
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    style={{ display: "none" }}
                  />
                </IconButton>
              )}
            </div>
          </Box>
          <Typography variant="h6" gutterBottom m={0}>
            Hi, {userData.first_name} !
          </Typography>
        </Box>
        <Box>
          <Button
            variant="contained"
            color="primary"
            onClick={handleClickOpen}
            disabled={!isEditable}
            sx={{ marginRight: "10px" }}
          >
            Add New Address
          </Button>
          <Button
            onClick={handleEdit}
            variant="contained"
            color="primary"
            disabled={isEditable}
          >
            <Edit /> Edit
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            color="secondary"
            disabled={!isEditable}
            style={{ marginLeft: 10 }}
          >
            Save
          </Button>
        </Box>
      </Box>

      <Box
        sx={{ display: "flex", justifyContent: "space-between", marginTop: 3 }}
      >
        <Grid container spacing={2}>
           {/* Profile Information (Left side)  */}
          <Grid item xs={12} sm={6}>
            <Box>
              {userData && (
                <form style={{ marginTop: 20 }}>
                  <Grid container spacing={2}>
                    {(isEditable || userData.first_name) && (
                      <Grid item xs={12}>
                        <TextField
                          label="First Name"
                          name="first_name"
                          value={userData.first_name}
                          onChange={handleChange}
                          fullWidth
                          disabled={!isEditable}
                          error={!!errors.first_name} // Highlight field in red if there's an error
                          helperText={errors.first_name} // Show error message below the field
                          required
                        />
                      </Grid>
                    )}
                    {(isEditable || userData.last_name) && (
                      <Grid item xs={12}>
                        <TextField
                          label="Last Name"
                          name="last_name"
                          value={userData.last_name || ""}
                          onChange={handleChange}
                          fullWidth
                          disabled={!isEditable}
                          error={!!errors.last_name} // Highlight field in red if there's an error
                          helperText={errors.last_name} // Show error message below the field
                          required
                        />
                      </Grid>
                    )}
                    {(isEditable || userData.email) && (
                      <Grid item xs={12}>
                        <TextField
                          label="Email"
                          name="email"
                          value={userData.email}
                          onChange={handleChange}
                          fullWidth
                          disabled={!isEditable}
                          error={!!errors.email}
                          helperText={errors.email}
                          required
                        />
                      </Grid>
                    )}
                    {(isEditable || userData.mobile_number) && (
                      <Grid item xs={12}>
                        <TextField
                          label="Mobile Number"
                          name="mobile_number"
                          value={userData.mobile_number}
                          onChange={handleChange}
                          fullWidth
                          disabled={!isEditable}
                          error={!!errors.mobile_number}
                          helperText={errors.mobile_number}
                        />
                      </Grid>
                    )}
                    {(isEditable || userData.company_name) && (
                      <Grid item xs={12}>
                        <TextField
                          label="Company Name"
                          name="company_name"
                          value={userData.company_name}
                          onChange={handleChange}
                          fullWidth
                          disabled={!isEditable}
                          error={!!errors.company_name}
                          helperText={errors.company_name}
                        />
                      </Grid>
                    )}
                    {(isEditable || userData.website) && (
                      <Grid item xs={12}>
                        <TextField
                          label="Website"
                          name="website"
                          value={userData.website}
                          onChange={handleChange}
                          fullWidth
                          disabled={!isEditable}
                        />
                      </Grid>
                    )}
                  </Grid>
                </form>
              )}
            </Box>
          </Grid>

          {/* Address Information (Right side) */}
          <Grid item xs={12} sm={6}>
          <Box>
          <div>
  {userData?.address_obj_list && userData.address_obj_list.length > 0 ? (
    <div style={{ marginTop: 20 }}>
      {userData.address_obj_list.map((address, index) => {
        console.log("9090", address.address_id); // Correct placement of console.log
        return (
          <Card key={address.address_id || index} style={{ marginBottom: 10 }}>
            <CardContent style={{ padding: "6px 10px" }}>
              <Typography variant="body2">
                {address.street}, {address.city}, {address.state}, {address.zipCode},{" "}
                {address.country}
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginTop: "10px",
                }}
              >
                <RadioGroup
                  row
                  value={address.is_default ? address.address_id : ""} // Ensure this reflects the default address
                  onChange={() => handleDefaultChange(index)} // This will trigger handleDefaultChange to update is_default
                >
                  <FormControlLabel
                    value={address.address_id}
                    control={<Radio />}
                    label="Default"
                  />
                </RadioGroup>

                {/* Display Close icon if address_id is missing */}
                <IconButton
                  color="error"
                  onClick={() => handleDelete(index, address.address_id, address.is_default)}
                >
                  {address.address_id ? (
                    <Delete />
                  ) : (
                    <IconButton   onClick={() => handleRemove(index)}>
                    <Close />
                    </IconButton>
                  )}
                </IconButton>
              </Box>
            </CardContent>
          </Card>
        );
      })}
    </div>
  ) : (
    <Box textAlign={"center"} style={{ marginTop: 20 }}>
      <Typography variant="h6">Please Add atleast one default address</Typography>
    </Box>
  )}
</div>


</Box>

          </Grid>
        </Grid>
      </Box>

      {/* Address Management */}

      {/* Modal/Dialog component */}
      <Dialog open={open} onClose={handleClose} fullWidth>
        <DialogTitle>Add New Address</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex" }}>
            <div style={{ marginTop: "5px" }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Street"
                    name="street"
                    value={newAddress.street}
                    onChange={handleAddressChange}
                    fullWidth
                    disabled={!isEditable}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="City"
                    name="city"
                    value={newAddress.city}
                    onChange={handleAddressChange}
                    fullWidth
                    disabled={!isEditable}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="State"
                    name="state"
                    value={newAddress.state}
                    onChange={handleAddressChange}
                    fullWidth
                    disabled={!isEditable}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Zip Code"
                    name="zipCode"
                    value={newAddress.zipCode}
                    onChange={handleAddressChange}
                    fullWidth
                    disabled={!isEditable}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Country"
                    name="country"
                    value={newAddress.country}
                    onChange={handleAddressChange}
                    fullWidth
                    disabled={!isEditable}
                    required
                  />
                </Grid>
              </Grid>
            </div>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="secondary">
            Cancel
          </Button>
          <Button
            onClick={() => {
              handleAddAddress();
              handleClose();
            }}
            color="primary"
          >
            Add Address
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default DealerProfile;
