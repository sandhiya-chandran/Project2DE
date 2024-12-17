import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, Grid, Input,Paper, Tooltip, FormControlLabel, Radio } from '@mui/material';
import { PhotoCamera, Add, Close } from '@mui/icons-material';
import axios from 'axios';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import IconButton from '@mui/material/IconButton';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import CancelIcon from '@mui/icons-material/Cancel';
import AddAPhotoIcon from '@mui/icons-material/AddAPhoto';
import DEFAULT_LOGO from "../../assets/user-logo.jpg";

import 'react-toastify/dist/ReactToastify.css'; // Import the CSS file
import { ToastContainer, toast } from 'react-toastify';
import { CameraAlt } from "@mui/icons-material";
const UserProfile = () => {
  const [userImage, setUserImage] = useState(null);
  const [bankDetailsList, setBankDetailsList] = useState([ ]);
  const [imageError, setImageError] = useState(""); 
  const [originalUserDetails, setOriginalUserDetails] = useState({
 
   first_name: '',
    last_name: '',
    email: '',
    mobile_number: '',
    company_name: '',
  });
  
const [originalBankDetails, setOriginalBankDetails] = useState([]);
  const [userDetails, setUserDetails] = useState({ ...originalUserDetails });
  // const [bankDetailsList, setBankDetailsList] = useState([
  //   {
  //     bank_name: '',
  //     account_number: '',
  //     ifsc_code: '',
  //     iban: '',
  //     swift_code: '',
  //     branch: '',
  //     currency: '',
  //     is_default: true, // You can set a default if needed
  //   },
  // ]);
  const [defaultAddressIndex, setDefaultAddressIndex] = useState(0); // Example default index for bank details
  const [loading, setLoading] = useState(false);
  // const [warehouse, setWarehouse] = useState([{ street: '', city: '', zipCode: '', state: '', country: '', is_default: true }]); // Start with empty fields
  const [warehouse, setWarehouse] = useState([]); // Start with empty fields

  // Initialize warehouse state
  const [isEditable, setIsEditable] = useState(false); // Example state for controlling if the fields are editable
  const [defaultwarehouseIndex, setDefaultwarehouseIndex] = useState(0); // Default warehouse index
  // const [defaultBankIndex, setDefaultBankIndex] = useState(null);
  const [addresses, setAddresses] = useState([])
  // const [addresses, setAddresses] = useState([ { street: '',
  //   city: '',
  //   state: '',
  //   zipCode: '',
  //   country: '',
  //   is_default: false}]);

  // useEffect(() => {
  //   // Assuming bankDetails are fetched from API
  //   const fetchedBankDetails = [...]; // Your fetched data
  
  //   // Set first item as default
  //   if (fetchedBankDetails.length > 0) {
  //     fetchedBankDetails[0].is_default = true;
  //   }
  
  //   setBankDetailsList(fetchedBankDetails);
  // }, []);

  // const [userDetails, setUserDetails] = useState({
  //   first_name: '',
  //   last_name: '',
  //   email: '',
  //   mobile_number: '',
  //   company_name: '',
  // });

  const fetchUserDetails = async () => {
    setLoading(true);
    try {
      const userData = localStorage.getItem('user');
      const userId = userData ? JSON.parse(userData).id : '';
      const response = await axios.get(
        `${process.env.REACT_APP_IP}obtainUserDetailsForProfile/?user_id=${userId}`
      );
      const data = response.data?.data || {};
      setUserDetails(data.user_obj || {});
      const bankDetails = data.user_obj?.bank_details_obj_list || [];
      setBankDetailsList(bankDetails);
      // setBankDetailsList(bankDetails.length > 0 ? bankDetails : [
      //   {
      //     bank_name: '',
      //     account_number: '',
      //     ifsc_code: '',
      //     iban: '',
      //     swift_code: '',
      //     branch: '',
      //     currency: '',
      //     is_default: true,
      //   },
      // ]);
      const warehouseList = data.user_obj?.ware_house_obj_list || [];
      // setWarehouse(warehouseList.length > 0 ? warehouseList : [{ street: '', city: '', zipCode: '', state: '', country: '', is_default: false }]);
      setWarehouse(warehouseList);
      // const defaultBankIndex = bankDetails.findIndex((bank) => bank.is_default);
      // setDefaultBankIndex(defaultBankIndex !== -1 ? defaultBankIndex : null);
      const addressList = data.user_obj?.address_obj_list || [];
      const defaultAddressIndex = addressList.findIndex((address) => address.is_default);
      setAddresses(addressList);
      // setAddresses(addressList.length > 0 ? addressList: [{ city: '',
      //   state: '',
      //   zipCode: '',
      //   country: '',
      //   is_default: true}])
      setDefaultAddressIndex(defaultAddressIndex !== -1 ? defaultAddressIndex : null);
    } catch (err) {
      console.error('Error fetching user details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserDetails();
  }, []);

  const toggleEdit = () => {
    setIsEditable(!isEditable);
  };

 



  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserDetails({
      ...userDetails,
      [name]: value,
    });
  };

  const handleEditToggleProfile = () => {
    setIsEditable(true);
  };

  const handleSaveProfile = () => {
    console.log('Profile saved:', userDetails);
    setOriginalUserDetails({ ...userDetails });
    setIsEditable(false);
  };

  const handleEditCancel = () => {
    // Revert to the original user details when canceling the edit
    setUserDetails({ ...originalUserDetails });
    setIsEditable(false);
  };
  // const handleBankDetailsChange = (index, field, value) => {
  //   const updatedBankDetails = [...bankDetailsList];
  //   updatedBankDetails[index] = { ...updatedBankDetails[index], [field]: value };
  //   setBankDetailsList(updatedBankDetails);
  // };

  const handleBankDetailsChange = (index, field, value) => {
    setBankDetailsList((prev) => {
      const updatedList = [...prev];
      updatedList[index][field] = value;
      return updatedList;
    });
  };

  
  const handleRemoveBankDetails = async (index, bankId, isDefault) => {
    const userData = localStorage.getItem('user');
    const userId = userData ? JSON.parse(userData).id : '';
  
    try {
      // Make an API call to delete the bank details
      const deleteResponse = await axios.post(`${process.env.REACT_APP_IP}deleteBankDetails/`, {
        bank_id: bankId,
        user_id: userId,
        is_default: isDefault,
      });
  
      // Check if the response is successful
      if (deleteResponse.data.message === 'success') {
        console.log(deleteResponse.data.message);
  
        // Fetch updated user details only if deletion is successful
        const userDetailsResponse = await axios.get(
          `${process.env.REACT_APP_IP}obtainUserDetailsForProfile/?user_id=${userId}`
        );
        
        const data = userDetailsResponse.data?.data || {};
        
        // Filter the bank details to remove the bank with the given index
        const updatedBankDetails = bankDetailsList.filter((_, idx) => idx !== index);
  
        // Update the bank details list in the state
        setBankDetailsList(updatedBankDetails);
      } else {
        console.error('Failed to delete bank details:', deleteResponse.data.message);
      }
    } catch (error) {
      console.error('Error deleting bank details:', error);
    }
  };
  

 

  const handleAddBankDetails = () => {
    setBankDetailsList((prevBankDetails) => {
      // Check if it's the first bank detail entry added
      const isFirstBankDetail = prevBankDetails.length === 0;
      return [
        ...prevBankDetails,
        {
          bank_name: '',
          account_number: '',
          ifsc_code: '',
          iban: '',
          swift_code: '',
          branch: '',
          currency: '',
          is_default: isFirstBankDetail, // First entry has is_default: true, others will be false
          isEditing: true, // New entry starts in editing mode
        },
      ];
    });
  };
  
  const handleDefaultBankDetails = (index) => {
    const updatedBankDetails = bankDetailsList.map((bank, i) => {
      if (i === index) {
        bank.is_default = true;  // Set selected one to default
      } else {
        bank.is_default = false; // Set the others to not default
      }
      return bank;
    });
  
    setBankDetailsList(updatedBankDetails);
  };
  

  const handleImageToBase64 = (file, setImageCallback) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setImageCallback(reader.result);
    };
    if (file) reader.readAsDataURL(file);
  };
  const handleUserImageChange = (event) => {
    const file = event.target.files[0];
  
    // Clear any previous error message
    setImageError("");
  
    // Check if the file exists
    if (!file) return;
  
    // Check if the file type is valid (jpg, jpeg, svg, png)
    const validTypes = ['image/jpeg', 'image/png', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      // Show error message if file type is not allowed
      setImageError("Please upload a valid image (JPG, JPEG, PNG, or SVG).");
      return; // Prevent further processing if the file type is not valid
    }
  
    // Check if the file size is greater than 1MB
    if (file.size > 1 * 1024 * 1024) {
      // Show error message if file size exceeds 1MB
      setImageError("Please upload an image smaller than 1MB.");
      return; // Prevent further processing if the file is too large
    }
  
    // If the file type and size are acceptable, convert to base64
    handleImageToBase64(file, setUserImage);
  };
  
  


  const handleAddressChange = (index, event) => {
    const { name, value } = event.target;
    const updatedAddresses = [...addresses];
    updatedAddresses[index][name] = value;
    setAddresses(updatedAddresses);
  };

  const handleDefaultAddressChange = (index) => {
    const updatedAddresses = addresses.map((address, idx) => ({
      ...address,
      is_default: idx === index,
    }));
    setAddresses(updatedAddresses);
    setDefaultAddressIndex(index);
  };

  const handleAddAddress = () => {
    const newAddress = {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
      is_default: true,
    };
    setAddresses([...addresses, newAddress]);
  };
  const handleRemoveAddress = async (index, addressId, isDefault, address) => {
    const updatedAddresses = addresses.filter((_, i) => i !== index);
    setAddresses(updatedAddresses);
  
    const userData = localStorage.getItem('user');
    const userId = userData ? JSON.parse(userData).id : '';
  
    try {
      // Make an API call to delete the address
      const response = await axios.post(`${process.env.REACT_APP_IP}deleteAddress/`, {
        address_id: addressId,
        user_id: userId,
        is_default: isDefault,
        ware_house: address,
      });
  
      console.log(response.data.message);
  
      if (response.data.message === 'success') {
        console.log('Address deleted successfully');
  
        // Fetch updated user details only if deletion is successful
        const userDetailsResponse = await axios.get(
          `${process.env.REACT_APP_IP}obtainUserDetailsForProfile/?user_id=${userId}`
        );
        const data = userDetailsResponse.data?.data || {};
  
        // Optionally update user details in state if needed
  
        // If the deleted address was default, reset the default address
        if (isDefault) {
          setDefaultAddressIndex(null); // Reset default address index if the removed address was default
        }
  
        // Refetch user details and set the updated address list
        fetchUserDetails();
      } else {
        console.error('Failed to delete address:', response.data.message);
      }
    } catch (error) {
      console.error('Error deleting address:', error);
    }
  };
  
  const handleSaveAddress = (index) => {
    const updatedAddresses = [...addresses];
    updatedAddresses[index].isEditing = false; // Exit edit mode
    setAddresses(updatedAddresses);
  };

  // Handler to cancel address editing
  const handleCancelEditAddress = (index) => {
    const updatedAddresses = [...addresses];
    updatedAddresses[index].isEditing = false; // Exit edit mode without saving changes
    setAddresses(updatedAddresses);
  };


  // Function to handle editing an address
const handleEditAddress = (index) => {
  // Set the 'isEditing' state of the selected address to true
  const updatedAddresses = [...addresses];
  updatedAddresses[index].isEditing = true;

  // Update the addresses array with the new state
  setAddresses(updatedAddresses);
};

 
  const handleWareHouseChange = (index, e) => {
    const { name, value } = e.target;
    const updatedWarehouse = [...warehouse];
    updatedWarehouse[index] = { ...updatedWarehouse[index], [name]: value };
    setWarehouse(updatedWarehouse);
  };
  

  // Add a new warehouse
  const handleAddwarehouse = () => {
    setWarehouse((prevWarehouse) => [
      ...prevWarehouse,
      {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: '',
        isEditing: true, // Ensure new field is in edit mode
        is_default: false,
      },
    ]);
  };
  const handleEditToggle = () => {
    setIsEditable(!isEditable);
  };
  const handleEditWarehouse = (index) => {
    const updatedWarehouse = [...warehouse];
    updatedWarehouse[index].isEditing = true;
    setWarehouse(updatedWarehouse);
  };
  const handleSaveWarehouse = (index) => {
    const updatedWarehouse = [...warehouse];
    updatedWarehouse[index].isEditing = false;
    // Optionally save the changes to the backend here
    setWarehouse(updatedWarehouse);
  };
  
  // Remove a warehouse
  const handleRemovewarehouse = async (index, addressId, isDefault, warehouse) => {
    const userData = localStorage.getItem('user');
    const userId = userData ? JSON.parse(userData).id : '';
  
    try {
      // Make an API call to delete the warehouse/address
      const response = await axios.post(`${process.env.REACT_APP_IP}deleteAddress/`, {
        address_id: addressId,
        user_id: userId,
        is_default: isDefault,
        ware_house: warehouse,
      });
  
      // If the delete API response is successful (check response.data.message directly)
      if (response.data.message === 'success') {
        console.log('Warehouse deleted successfully');
        
        // Remove the warehouse from the local state after successful deletion
        setWarehouse((prevWarehouse) => {
          return prevWarehouse.filter((_, i) => i !== index); // Remove the warehouse at the given index
        });
  
        // Fetch updated user details only if deletion is successful
        const userDetailsResponse = await axios.get(
          `${process.env.REACT_APP_IP}obtainUserDetailsForProfile/?user_id=${userId}`
        );
        const data = userDetailsResponse.data?.data || {}; // Capture the user data from the response
  
        // Optionally, you can refetch the user details or call fetchUserDetails() if needed
        fetchUserDetails(); // Make sure this function properly handles the updated details
  
      } else {
        console.error('Failed to delete warehouse:', response.data.message);
      }
    } catch (error) {
      console.error('Error deleting warehouse:', error);
    }
  };
  const handleCancelEditWarehouse = (index) => {
    // Ensure the index is valid and within bounds of the warehouse array
    if (index >= 0 && index < warehouse.length) {
      const currentWarehouse = warehouse[index];
  
      // Check if the currentWarehouse object exists
      if (currentWarehouse) {
        // Check if both fields (name and address) are empty, and remove the warehouse if so
        if (!currentWarehouse.street?.trim() && !currentWarehouse.city?.trim() && 
            !currentWarehouse.state?.trim() && !currentWarehouse.zipCode?.trim() && 
            !currentWarehouse.country?.trim()) {
          setWarehouse((prevState) => prevState.filter((_, i) => i !== index)); // Remove warehouse
        } else {
          // If any field has data, stop editing mode and retain the data
          setWarehouse((prevState) => {
            const updatedWarehouse = [...prevState];
            updatedWarehouse[index].isEditing = false; // Stop editing
            return updatedWarehouse;
          });
        }
      } else {
        console.error("Invalid warehouse data at index:", index);
      }
    } else {
      console.error("Invalid index:", index);
    }
  };
  
  

  
  // Set a warehouse as default
  const handleDefaultwarehouseChange = (index) => {
    setDefaultwarehouseIndex(index);
  };


  // Handle saving changes
  const handleSave = async () => {
    setLoading(true);
    const userData = localStorage.getItem('user');
    const userId = userData ? JSON.parse(userData).id : '';
    
    const user_obj = {
      first_name: userDetails.first_name,
      last_name: userDetails.last_name,
      email: userDetails.email,
      mobile_number: userDetails.mobile_number,
      company_name: userDetails.company_name,
      profile_image: userImage || userDetails.profile_image, // Check if userImage is null, send the existing profile image if so
    };
  
    // Map addresses to address_obj_list
    const address_obj_list = addresses
      .filter((address) => address.street || address.city || address.state || address.zipCode || address.country) // Only include non-empty addresses
      .map((address, index) => ({
        street: address.street || '',
        city: address.city || '',
        state: address.state || '',
        zipCode: address.zipCode || '',
        country: address.country || '',
        is_default: true, 
        // is_default: index === defaultBankIndex,  // Set is_default to true for the selected address
        id: address.address_id || undefined,
      }));

      const ware_house_obj_list = warehouse
      .filter((address) => address.street || address.city || address.state || address.zipCode || address.country) // Only include non-empty addresses
      .map((address, index) => ({
        street: address.street || '',
        city: address.city || '',
        state: address.state || '',
        zipCode: address.zipCode || '',
        country: address.country || '',
        is_default: index === defaultwarehouseIndex, // Set default to true for selected warehouse
        id: address.address_id || undefined,
      }));

    // Map bank details to bank_details_obj_list
    const bank_details_obj_list = bankDetailsList
    .map((bankDetail, index) => ({
      account_number: bankDetail.account_number || '',
      bank_name: bankDetail.bank_name || '',
      branch: bankDetail.branch || '',
      iban: bankDetail.iban || '',
      ifsc_code: bankDetail.ifsc_code || '',
      swift_code: bankDetail.swift_code || '',
      images: bankDetail.images || [],
      is_default: index === defaultAddressIndex,
      bank_id: bankDetail.bank_id || undefined,
    }))
    .filter((bankDetail) => {
      // Ensure at least one field is filled out
      return (
        bankDetail.account_number ||
        bankDetail.bank_name ||
        bankDetail.branch ||
        bankDetail.iban ||
        bankDetail.ifsc_code ||
        bankDetail.swift_code ||
        bankDetail.images.length > 0
      );
    });
  
  console.log('Filtered bank_details_obj_list:', bank_details_obj_list);
  
    const payload = {
      user_id: userId,
      user_obj,
      address_obj_list,
      bank_details_obj_list, 
      ware_house_obj_list,// Include bank_details_obj_list
    };
  
    try {
      const response = await axios.post(`${process.env.REACT_APP_IP}updateUserProfile/`, payload);
      console.log(response.data.message);
  
      // Fetch updated user details after a successful response
      fetchUserDetails();
  
      // Set isEditable to false after the successful update, so the "Edit" button is shown
      setIsEditable(false);
    } catch (err) {
      console.error('Error updating profile:', err);
    } finally {
      setLoading(false);  // Set loading to false after the request is complete
    }
  };
  
  // const handleCancel = () => {
  //  // Reset to initial state
  //   setIsEditable(false); // Switch back to non-editable mode
  // };
  const handleSaveBankDetails = (index) => {
    // Save the updated bank details here
    const updatedBankDetails = [...bankDetailsList];
    updatedBankDetails[index].isEditing = false;  // Stop editing once saved
    setBankDetailsList(updatedBankDetails);
  
    // Optionally, send the updated data to an API or handle further logic here
  };
  
  const handleEditBankDetails = (index) => {
    // Store the original values before starting the edit
    setOriginalBankDetails((prev) => {
      const updatedOriginalDetails = [...prev];
      updatedOriginalDetails[index] = { ...bankDetailsList[index] };
      return updatedOriginalDetails;
    });
  
    // Set the bank detail to edit mode
    setBankDetailsList((prev) => {
      const updatedList = [...prev];
      updatedList[index].isEditing = true;
      return updatedList;
    });
  };
  
  
  const handleCancelEditBankDetails = (index) => {
    const currentBankDetails = bankDetailsList[index];
    
    // Check if any required field is empty (i.e., the user has not filled any data)
    if (
      !currentBankDetails.bank_name &&
      !currentBankDetails.account_number &&
      !currentBankDetails.ifsc_code &&
      !currentBankDetails.branch &&
      !currentBankDetails.swift_code &&
      !currentBankDetails.iban &&
      !currentBankDetails.currency
    ) {
      // If all the fields are empty, remove the bank details entry from the list
      setBankDetailsList((prev) => prev.filter((_, i) => i !== index));
    } else {
      // If any data exists, revert the changes and stop editing
      setBankDetailsList((prev) => {
        const updatedList = [...prev];
        updatedList[index].isEditing = false; // Stop editing mode
        return updatedList;
      });
    }
  };
  
  

  if (loading) {
    return <Typography>Loading...</Typography>;
  }
  return (
    <Box sx={{ p: 3 ,}}>
<Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
  <Box sx={{ display: "flex", alignItems: "center", gap: "10px" }}>
    <div style={{ position: "relative", display: "inline-block" }}>
      <img
        src={userImage || userDetails.profile_image || DEFAULT_LOGO} // Fallback to default image
        alt="User"
        style={{
          width: "50px",
          height: "50px",
          borderRadius: "50%",
          border: "1px solid lightgray",
        }}
      />
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
            onChange={handleUserImageChange}
            style={{ display: "none" }}
          />
        </IconButton>
      )}


    </div>
   
    <Typography variant="h6">
      Hi, {userDetails.first_name} {userDetails.last_name}!
    </Typography>

        {/* Display error message if there is one */}
        {imageError && (
    <Typography variant="body2" color="error" sx={{ marginTop: "10px" }}>
      {imageError}
    </Typography>
  )}
  </Box>
 
  <Box>
    {isEditable ? (
      <>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSave}
          sx={{
            marginTop: "20px",
            textTransform: "capitalize",
            marginRight: "10px",
          }}
          disabled={loading} // Disable button when loading
        >
          Save
        </Button>
      </>
    ) : (
      <Button variant="outlined" onClick={toggleEdit}>
        Edit
      </Button>
    )}
  </Box>


</Box>



      <Box
  sx={{
    display: 'flex',
    alignItems: 'center', // Align content vertically center
    justifyContent: 'space-between', // Adjust spacing
    marginBottom: '20px',
  }}
>

</Box>

<Paper sx={{ p: 1, marginTop: '3px', marginBottom: '16px' }}>
  {/* Title Section */}
  <Typography variant="h6" sx={{ marginBottom: 2, textTransform: 'capitalize' }}>
    Personal Details
  </Typography>

  <Grid container spacing={2} alignItems="center">
    {/* Profile Section */}
 

    {/* Personal Details Section */}
    <Grid item xs={8}>


  <Grid container spacing={1.5}>
    {/* Editable Fields */}
    {['first_name', 'last_name', 'mobile_number'].map((field, index) => (
      <Grid item xs={4} key={index}>
        <TextField
          fullWidth
          label={field
            .replace('_', ' ') // Replace underscores with spaces
            .replace(/\b\w/g, (char) => char.toUpperCase()) // Capitalize the first letter of each word
          }
          variant="outlined"
          size="small"
          name={field}
          value={userDetails[field]}
          onChange={handleChange}
          InputProps={{
            readOnly: !isEditable, // Toggle readOnly based on isEditable state
            style: { fontSize: '14px' }, // Input text font size
          }}
          InputLabelProps={{
            style: { fontSize: '14px' }, // Label font size
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: isEditable ? 'currentColor' : 'transparent', // Conditional border color
              },
              '&:hover fieldset': {
                borderColor: isEditable ? 'currentColor' : 'transparent', // Conditional hover border color
              },
              '&.Mui-focused fieldset': {
                borderColor: isEditable ? 'currentColor' : 'transparent', // Conditional focus border color
              },
            },
          }}
        />
      </Grid>
    ))}

    {/* Email and Company Name */}
    {['email', 'company_name'].map((field, index) => (
      <Grid item xs={6} key={index}>
        <TextField
          fullWidth
          label={field
            .replace('_', ' ') // Replace underscores with spaces
            .replace(/\b\w/g, (char) => char.toUpperCase()) // Capitalize the first letter of each word
          }
          variant="outlined"
          size="small"
          name={field}
          value={userDetails[field]}
          onChange={handleChange}
          InputProps={{
            readOnly: !isEditable, // Toggle readOnly based on isEditable state
            style: { fontSize: '14px' }, // Input text font size
          }}
          InputLabelProps={{
            style: { fontSize: '14px' }, // Label font size
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: isEditable ? 'currentColor' : 'transparent', // Conditional border color
              },
              '&:hover fieldset': {
                borderColor: isEditable ? 'currentColor' : 'transparent', // Conditional hover border color
              },
              '&.Mui-focused fieldset': {
                borderColor: isEditable ? 'currentColor' : 'transparent', // Conditional focus border color
              },
            },
          }}
        />
      </Grid>
    ))}
  </Grid>
</Grid>

    {/* Action Buttons */}
    <Grid item xs={2}>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
     
      </div>
    </Grid>
  </Grid>
</Paper>

<Paper sx={{ p: 2, mb: 2, borderRadius: 2, boxShadow: 3 }}>
  <Box sx={{display:'flex'}}>
  <Typography variant="h6" sx={{ mb: 2 }}>
    Address
  </Typography>
  {/* <Grid item sx={{ display: 'flex', alignItems: 'center', gap: 2, paddingLeft: '20px' }}>

  <FormControlLabel
            control={
              <Radio
                checked='true'
              // Only editable in edit mode
                sx={{
                  paddingLeft:'14px',
               
                  marginTop: '-7px',
                  color: '#1565c0',
                  '& .MuiSvgIcon-root': { color: '#1565c0' },
                }}
              />
            }
            label="Default"
          />
          </Grid> */}
</Box>
  {addresses.map((addressItem, index) => (
    <Grid container key={index} spacing={2} sx={{ mb: 2, pl: 2, alignItems: 'center' }}>
      {/* Address and Actions */}
      <Grid item xs={12} sx={{ display: 'flex'}}>
        
        {/* Editable Fields or Display Address */}
        {addressItem.isEditing ? (
          <Grid container spacing={2} sx={{ flexGrow: 1 }}>
            {['street', 'city', 'state', 'zipCode', 'country'].map((field) => (
              <Grid item xs={12} sm={6} md={2} key={field}>
                <TextField
                  fullWidth
                  label={field.charAt(0).toUpperCase() + field.slice(1)}
                  variant="outlined"
                  size="small"
                  name={field}
                  value={addressItem[field] || ''}
                  onChange={(e) => handleAddressChange(index, e)}
                  sx={{
                    '& .MuiOutlinedInput-root fieldset': { borderColor: 'currentColor' },
                  }}
                />
              </Grid>
            ))}
          </Grid>
        ) : (
          <Typography variant="body2" sx={{ flexGrow: 1, pl: 2 }}>
            {`${addressItem.street}, ${addressItem.city}, ${addressItem.state}, ${addressItem.zipCode}, ${addressItem.country}`}
          </Typography>
        )}

        {/* Action Buttons */}
        <Grid item sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {/* Default Address Radio Button */}
          {/* <FormControlLabel
            control={
              <Radio
                checked={defaultAddressIndex === index}
                onChange={() => handleDefaultAddressChange(index)}
                disabled={addressItem.isEditing} // Only editable in edit mode
                sx={{
                  marginTop: '-7px',
                  color: '#1565c0',
                  '& .MuiSvgIcon-root': { color: '#1565c0' },
                }}
              />
            }
            label="Default"
          /> */}
          {/* Edit, Save, Cancel and Delete Buttons */}
          {addressItem.isEditing ? (
            <>
              <IconButton onClick={() => handleSaveAddress(index)} sx={{ color: 'green' }}>
                <SaveIcon />
              </IconButton>
              <IconButton onClick={() => handleCancelEditAddress(index)} sx={{ color: 'gray' }}>
                <CancelIcon />
              </IconButton>
            </>
          ) : (
            isEditable && (
              <>
                <IconButton onClick={() => handleEditAddress(index)} sx={{ color: 'blue' }}>
                  <EditIcon />
                </IconButton>
                <IconButton onClick={() => handleRemoveAddress(index, addressItem.id, addressItem.isDefault, addressItem)} sx={{ color: 'red' }}>
                  <DeleteIcon />
                </IconButton>
              </>
            )
          )}
        </Grid>
      </Grid>
    </Grid>
  ))}

  {/* Add Address Button */}

</Paper>

   

<Paper sx={{ p: 2, mb: 2, borderRadius: 2, boxShadow: 3 }}>
  <Typography variant="h6" sx={{ mb: 2, color: 'black' }}>Warehouse Address</Typography>

  {warehouse.map((warehouseItem, index) => (
    <Grid container key={index} spacing={2} sx={{ mb: 2, pl: 2, alignItems: 'center' }}>
      {/* Header Section with Address Title */}
      <Grid item xs={12}>
        <Box sx={{ display: 'flex' }}>
          <Typography variant="subtitle1" sx={{ color: 'black' }}>Address {index + 1}</Typography>
          <Grid item sx={{ display: 'flex', alignItems: 'center', gap: 2, paddingLeft: '20px' }}>
            <FormControlLabel
              control={
                <Radio
                  checked={defaultwarehouseIndex === index}
                  onChange={() => handleDefaultwarehouseChange(index)}
               
                  disabled={!warehouseItem.isEditing} // Only editable in edit mode
                  sx={{
                    marginTop: '-7px',
                    color: '#1565c0',
                    '& .MuiSvgIcon-root': { color: '#1565c0' },
                  }}
                />
              }
              label="Default"
            />
          </Grid>
        </Box>

        {/* Address and Actions */}
        <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
          {/* Editable Fields or Display Address */}
          {warehouseItem.isEditing ? (
            <Grid container spacing={2} sx={{ flexGrow: 1 }}>
              {['street', 'city', 'state', 'zipCode', 'country'].map((field) => (
                <Grid item xs={12} sm={6} md={2} key={field}>
                  <TextField
                    fullWidth
                    label={field.charAt(0).toUpperCase() + field.slice(1)}
                    variant="outlined"
                    size="small"
                    name={field}
                    value={warehouseItem[field] || ''}
                    onChange={(e) => handleWareHouseChange(index, e)}
                    sx={{
                      '& .MuiOutlinedInput-root fieldset': { borderColor: 'currentColor' },
                    }}
                  />
                </Grid>
              ))}
            </Grid>
          ) : (
            <Typography variant="body2" sx={{ flexGrow: 1, pl: 2, color: 'black' }}>
              {`${warehouseItem.street}, ${warehouseItem.city}, ${warehouseItem.state}, ${warehouseItem.zipCode}, ${warehouseItem.country}`}
            </Typography>
          )}

          {/* Action Buttons */}
          {warehouseItem.isEditing ? (
            <>
              <IconButton onClick={() => handleSaveWarehouse(index)} sx={{ color: 'green' }}>
                <SaveIcon />
              </IconButton>
              <IconButton onClick={() => handleCancelEditWarehouse(index)} sx={{ color: 'gray' }}>
                <CancelIcon />
              </IconButton>
            </>
          ) : (
            isEditable && (
              <>
                <IconButton onClick={() => handleEditWarehouse(index)} sx={{ color: 'blue' }}>
                  <EditIcon />
                </IconButton>
                <IconButton onClick={() => handleRemovewarehouse(index, warehouseItem.address_id, warehouseItem.is_default, true)} sx={{ color: 'red' }}>
                  <DeleteIcon />
                </IconButton>
              </>
            )
          )}
        </Grid>
      </Grid>
    </Grid>
  ))}

  {/* Add Warehouse Button */}
  {isEditable && (
    <Grid container justifyContent="flex-end" sx={{ mt: 2 }}>
      <Button
        onClick={handleAddwarehouse}
        variant="contained"
        sx={{ backgroundColor: 'green', color: 'white', textTransform:'capitalize' }}
      >
        Add Warehouse
      </Button>
    </Grid>
  )}
</Paper>


<Paper sx={{ p: 2, mb: 2, borderRadius: 2, boxShadow: 3 }}>
  <Typography variant="h6" sx={{ mb: 2 }}>
    Bank Details
  </Typography>
           

  {bankDetailsList.map((bankDetails, index) => (
    <Grid container key={index} spacing={2} sx={{ mb: 2, pl: 2, alignItems: 'center' }}>
      <Grid item xs={12} sx={{display:'flex'}}>
        <Typography variant="subtitle1">Bank Detail {index + 1}</Typography>
        <FormControlLabel
            control={
              <Radio
                checked={bankDetails.is_default}
                onChange={() => handleDefaultBankDetails(index)}
              
                disabled={!bankDetails.isEditing} 
                sx={{ marginTop: '-7px',
                  paddingLeft: '32px',
                  color: '#1565c0',
                  '& .MuiSvgIcon-root': { color: '#1565c0' }
                }}
              />
            }
            label="Default"
          />
      </Grid>

      <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {bankDetails.isEditing ? (
          <Grid container spacing={2} sx={{ flexGrow: 1 }}>
            {['bank_name', 'account_number', 'ifsc_code', 'branch', 'swift_code', 'iban', 'currency'].map((field) => (
              <Grid item xs={12} sm={6} md={4} key={field}>
                <TextField
                  fullWidth
                  label={field.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())}
                  variant="outlined"
                  size="small"
                  value={bankDetails[field] || ''}
                  onChange={(e) => handleBankDetailsChange(index, field, e.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-root fieldset': {
                      borderColor: 'currentColor'
                    }
                  }}
                />
              </Grid>
            ))}
          </Grid>
        ) : (
          <Grid container spacing={2} sx={{ flexGrow: 1 }}>
            {['bank_name', 'account_number', 'ifsc_code', 'branch', 'swift_code', 'iban', 'currency'].map((field) => (
              <Grid item xs={12} sm={6} md={4} key={field}>
                <Typography variant="body2">
                  <strong>{field.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())}: </strong>
                  {bankDetails[field] || 'N/A'}
                </Typography>
              </Grid>
            ))}
          </Grid>
        )}

        <Grid item sx={{ display: 'flex', alignItems: 'center', gap: 2, marginLeft: '12px' }}>
          {/* <FormControlLabel
            control={
              <Radio
                checked={bankDetails.is_default}
                onChange={() => handleDefaultBankDetails(index)}
                disabled={!isEditable}
                sx={{
                  color: '#1565c0',
                  '& .MuiSvgIcon-root': { color: '#1565c0' }
                }}
              />
            }
            label="Default"
          /> */}
          {bankDetails.isEditing ? (
            <>
              <IconButton onClick={() => handleSaveBankDetails(index)} sx={{ color: 'green' }}>
                <SaveIcon />
              </IconButton>
              <IconButton onClick={() => handleCancelEditBankDetails(index)} sx={{ color: 'gray' }}>
                <CancelIcon />
              </IconButton>
            </>
          ) : (
            isEditable && (
              <>
                <IconButton onClick={() => handleEditBankDetails(index)} sx={{ color: 'blue' }}>
                  <EditIcon />
                </IconButton>
                <IconButton
                  onClick={() => handleRemoveBankDetails(index, bankDetails.bank_id, bankDetails.is_default)}
                  sx={{ color: 'red' }}
                >
                  <DeleteIcon />
                </IconButton>
              </>
            )
          )}
        </Grid>
      </Grid>
    </Grid>
  ))}

  {isEditable && (
    <Grid container justifyContent="flex-end" sx={{ mt: 2 }}>
      <Button onClick={handleAddBankDetails} variant="contained" sx={{ backgroundColor: 'green', color: 'white', textTransform:'capitalize' }}>
        Add Bank Details
      </Button>
    </Grid>
  )}
</Paper>


    
    </Box>
  );
};

export default UserProfile;
