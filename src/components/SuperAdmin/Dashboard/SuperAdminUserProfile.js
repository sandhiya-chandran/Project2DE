import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Paper,
  Tooltip,
  FormControlLabel,
  Radio,
  RadioGroup,
  Input,
  IconButton,
} from "@mui/material";
import { CameraAlt } from "@mui/icons-material";
import axios from "axios";
import { Close } from "@mui/icons-material";
import Add from "@mui/icons-material/Add";

const SuperAdminUserProfile = () => {
  const [userImage, setUserImage] = useState(null);
  const [bankImage, setBankImage] = useState(null);
  const [defaultAddressIndex, setDefaultAddressIndex] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [isEditable, setIsEditable] = useState(false); // Track edit mode

  const [userDetails, setUserDetails] = useState({
    first_name: "",
    last_name: "",
    email: "",
    mobile_number: "",
    company_name: "",
  });
  const [bankDetails, setBankDetails] = useState({
    bank_name: "",
    account_number: "",
    ifsc_code: "",
    iban: "",
    swift_code: "",
    branch: "",
    currency: "",
  });
  const [loading, setLoading] = useState(true);

  // Fetch user details
  const fetchUserDetails = async () => {
    setLoading(true);
    try {
      const userData = localStorage.getItem("user");
      const userId = userData ? JSON.parse(userData).id : "";
      const response = await axios.get(
        `${process.env.REACT_APP_IP}obtainUserDetailsForProfile/?user_id=${userId}`
      );
      const data = response.data.data || {};
      const { userDetails, bankDetails, addresses } = response.data;
      setUserDetails(userDetails);
      setBankDetails(bankDetails);
      setAddresses(addresses);
      const user = data.user_obj || {};

      setUserDetails(user);
      setBankDetails({
        bank_name: user.bank_details?.bank_name || "",
        account_number: user.bank_details?.account_number || "",
        ifsc_code: user.bank_details?.ifsc_code || "",
        iban: user.bank_details?.iban || "",
        swift_code: user.bank_details?.swift_code || "",
        branch: user.bank_details?.branch || "",
        currency: user.bank_details?.currency || "",
      });

      // Setting addresses and default address index
      const addressList = user.address_obj_list || [];
      const defaultAddressIndex = addressList.findIndex(
        (address) => address.is_default === true
      );
      if (defaultAddressIndex !== -1) {
        setAddresses([
          addressList[defaultAddressIndex],
          ...addressList.filter((_, idx) => idx !== defaultAddressIndex),
        ]);
        setDefaultAddressIndex(0); // Set the default address to the first position
      } else {
        setAddresses(addressList);
      }
    } catch (err) {
      console.error("Error fetching user details:", err);
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
  // Handle image upload conversion to Base64
  const handleImageToBase64 = (file, setImageCallback) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setImageCallback(reader.result);
    };
    if (file) reader.readAsDataURL(file);
  };

  // Handle user image change
  const handleUserImageChange = (event) => {
    const file = event.target.files[0];
    handleImageToBase64(file, setUserImage);
  };

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserDetails((prevDetails) => ({
      ...prevDetails,
      [name]: value,
    }));
  };

  // Handle bank image change
  const handleBankImageChange = (event) => {
    const file = event.target.files[0];
    handleImageToBase64(file, setBankImage);
  };

  // Handle address field changes
  const handleAddressChange = (index, event) => {
    const { name, value } = event.target;
    const updatedAddresses = [...addresses];
    updatedAddresses[index][name] = value;
    setAddresses(updatedAddresses);
  };

  // Handle default address change
  const handleDefaultAddressChange = (index) => {
    const updatedAddresses = [...addresses];
    updatedAddresses.forEach((address, idx) => {
      address.is_default = idx === index; // Mark the clicked address as default
    });
    setAddresses(updatedAddresses);
    setDefaultAddressIndex(index);
  };

  // Handle adding a new address
  const handleAddAddress = () => {
    const newAddress = {
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "",
      is_default: false,
    };
    setAddresses([...addresses, newAddress]);
  };

  // Handle removing an address
  const handleRemoveAddress = (index) => {
    const updatedAddresses = addresses.filter((_, i) => i !== index);
    setAddresses(updatedAddresses);

    // Reset the default address index if the default address was removed
    if (index === defaultAddressIndex) {
      setDefaultAddressIndex(null);
    }
  };

  // Handle saving changes
  const handleSave = async () => {
    setLoading(true);
    const userData = localStorage.getItem("user");
    const userId = userData ? JSON.parse(userData).id : "";

    const user_obj = {
      first_name: userDetails.first_name,
      last_name: userDetails.last_name,
      email: userDetails.email,
      mobile_number: userDetails.mobile_number,
      company_name: userDetails.company_name,
      // Check if userImage is null, send the existing profile image if so
      profile_image: userImage || userDetails.profile_image,
    };

    const address_obj_list = addresses
      .filter(
        (address) =>
          address.street ||
          address.city ||
          address.state ||
          address.zipCode ||
          address.country
      ) // Only include non-empty addresses
      .map((address, index) => ({
        street: address.street || "",
        city: address.city || "",
        state: address.state || "",
        zipCode: address.zipCode || "",
        country: address.country || "",
        is_default: index === defaultAddressIndex, // This will set is_default to true for the selected address
        id: address.address_id || undefined,
      }));

    const bank_details_obj = Object.keys(bankDetails).some(
      (key) => bankDetails[key]
    )
      ? {
          account_number: bankDetails.account_number || "",
          bank_name: bankDetails.bank_name || "",
          branch: bankDetails.branch || "",
          currency: bankDetails.currency || "",
          iban: bankDetails.iban || "",
          ifsc_code: bankDetails.ifsc_code || "",
          swift_code: bankDetails.swift_code || "",
          images: bankImage ? [bankImage] : [], // Send bank image if present
        }
      : {};

    const payload = {
      user_id: userId,
      user_obj,
      address_obj_list,
      bank_details_obj,
    };

    // Set loading to true when the request starts
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_IP}updateUserProfile/`,
        payload
      );
      console.log(response.data.message);

      // Fetch updated user details after a successful response
      fetchUserDetails();

      // Set isEditable to false after the successful update, so the "Edit" button is shown
      setIsEditable(false);
    } catch (err) {
      console.error("Error updating profile:", err);
    } finally {
      setLoading(false); // Set loading to false after the request is complete
    }
  };
  // const handleCancel = () => {
  //  // Reset to initial state
  //   setIsEditable(false); // Switch back to non-editable mode
  // };

  if (loading) {
    return <Typography>Loading...</Typography>;
  }
  return (
    <Box style={{ padding: 20 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between" , alignItems: "center",}}>
        <Box sx={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ position: "relative", display: "inline-block" }}>
            <img
              src={userImage || userDetails.profile_image}
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
            Hi, {userDetails.first_name} {userDetails.last_name} !
          </Typography>
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
              {/* <Button
        variant="outlined"
        onClick={handleCancel} // Handle cancel to reset the form
        sx={{ marginTop: '20px' }}
      >
        Cancel
      </Button> */}
            </>
          ) : (
            <Button variant="outlined" onClick={toggleEdit}>
              Edit
            </Button>
          )}
        </Box>

        
      </Box>

      <Grid container spacing={2} sx={{ marginTop: "15px" }} xs={12} md={6}>
              {/* Editable Fields */}
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  variant="outlined"
                  size="small"
                  name="first_name"
                  value={userDetails.first_name}
                  onChange={handleChange}
                  InputProps={{
                    readOnly: !isEditable,
                    disableUnderline: !isEditable, // Disable underline when not editable
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": {
                        borderColor: isEditable
                          ? "currentColor"
                          : "transparent", // Transparent border when not editable
                      },
                      "&:hover fieldset": {
                        borderColor: isEditable
                          ? "currentColor"
                          : "transparent", // Remove border on hover when not editable
                      },
                    },
                  }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  variant="outlined"
                  size="small"
                  name="last_name"
                  value={userDetails.last_name}
                  onChange={handleChange}
                  InputProps={{
                    readOnly: !isEditable,
                    disableUnderline: !isEditable,
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": {
                        borderColor: isEditable
                          ? "currentColor"
                          : "transparent",
                      },
                      "&:hover fieldset": {
                        borderColor: isEditable
                          ? "currentColor"
                          : "transparent",
                      },
                    },
                  }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Email"
                  variant="outlined"
                  size="small"
                  name="email"
                  value={userDetails.email}
                  onChange={handleChange}
                  InputProps={{
                    readOnly: !isEditable,
                    disableUnderline: !isEditable,
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": {
                        borderColor: isEditable
                          ? "currentColor"
                          : "transparent",
                      },
                      "&:hover fieldset": {
                        borderColor: isEditable
                          ? "currentColor"
                          : "transparent",
                      },
                    },
                  }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Mobile Number"
                  variant="outlined"
                  size="small"
                  name="mobile_number"
                  value={userDetails.mobile_number}
                  onChange={handleChange}
                  InputProps={{
                    readOnly: !isEditable,
                    disableUnderline: !isEditable,
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": {
                        borderColor: isEditable
                          ? "currentColor"
                          : "transparent",
                      },
                      "&:hover fieldset": {
                        borderColor: isEditable
                          ? "currentColor"
                          : "transparent",
                      },
                    },
                  }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Company Name"
                  variant="outlined"
                  size="small"
                  name="company_name"
                  value={userDetails.company_name}
                  onChange={handleChange}
                  InputProps={{
                    readOnly: !isEditable,
                    disableUnderline: !isEditable,
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": {
                        borderColor: isEditable
                          ? "currentColor"
                          : "transparent",
                      },
                      "&:hover fieldset": {
                        borderColor: isEditable
                          ? "currentColor"
                          : "transparent",
                      },
                    },
                  }}
                />
              </Grid>
            </Grid>

    
      {/* <Paper sx={{ p: 2, marginBottom: '20px' }}>
  <Typography sx={{ marginBottom: '20px' }} variant="body1">
    Addresses
  </Typography>
  {addresses.map((address, index) => (
    <Grid container key={index} spacing={2} sx={{ marginBottom: '10px' }}>
      <Grid item xs={3}>
        <TextField
          fullWidth
          label="Street"
          variant="outlined"
          size="small"
          name="street"
          value={address.street}
          onChange={(e) => handleAddressChange(index, e)}
          InputProps={{
            readOnly: !isEditable,
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: isEditable ? 'currentColor' : 'transparent', // Transparent border when not editable
              },
              '&:hover fieldset': {
                borderColor: isEditable ? 'currentColor' : 'transparent', // Remove border on hover when not editable
              },
            },
          }}
        />
      </Grid>
      <Grid item xs={3}>
        <TextField
          fullWidth
          label="City"
          variant="outlined"
          size="small"
          name="city"
          value={address.city}
          onChange={(e) => handleAddressChange(index, e)}
          InputProps={{
            readOnly: !isEditable,
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: isEditable ? 'currentColor' : 'transparent',
              },
              '&:hover fieldset': {
                borderColor: isEditable ? 'currentColor' : 'transparent',
              },
            },
          }}
        />
      </Grid>
      <Grid item xs={3}>
        <TextField
          fullWidth
          label="State"
          variant="outlined"
          size="small"
          name="state"
          value={address.state}
          onChange={(e) => handleAddressChange(index, e)}
          InputProps={{
            readOnly: !isEditable,
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: isEditable ? 'currentColor' : 'transparent',
              },
              '&:hover fieldset': {
                borderColor: isEditable ? 'currentColor' : 'transparent',
              },
            },
          }}
        />
      </Grid>
      <Grid item xs={3}>
        <TextField
          fullWidth
          label="Zip Code"
          variant="outlined"
          size="small"
          name="zipCode"
          value={address.zipCode}
          onChange={(e) => handleAddressChange(index, e)}
          InputProps={{
            readOnly: !isEditable,
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: isEditable ? 'currentColor' : 'transparent',
              },
              '&:hover fieldset': {
                borderColor: isEditable ? 'currentColor' : 'transparent',
              },
            },
          }}
        />
      </Grid>
      <Grid item xs={3}>
        <TextField
          fullWidth
          label="Country"
          variant="outlined"
          size="small"
          name="country"
          value={address.country}
          onChange={(e) => handleAddressChange(index, e)}
          InputProps={{
            readOnly: !isEditable,
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: isEditable ? 'currentColor' : 'transparent',
              },
              '&:hover fieldset': {
                borderColor: isEditable ? 'currentColor' : 'transparent',
              },
            },
          }}
        />
      </Grid>
    </Grid>
  ))}
</Paper> */}

      {/* <Paper sx={{ p: 2, marginBottom: '20px' }}>
  <Typography sx={{ marginBottom: '20px' }} variant="body1">
    Bank Details
  </Typography>
  <Grid container spacing={2}>
    <Grid item xs={6}>
      <TextField
        fullWidth
        label="Bank Name"
        variant="outlined"
        size="small"
        value={bankDetails.bank_name}
        onChange={(e) => setBankDetails({ ...bankDetails, bank_name: e.target.value })}
        InputProps={{
          readOnly: !isEditable,
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: isEditable ? 'currentColor' : 'transparent', // Transparent border when not editable
            },
            '&:hover fieldset': {
              borderColor: isEditable ? 'currentColor' : 'transparent', // Remove border on hover when not editable
            },
          },
        }}
      />
    </Grid>
    <Grid item xs={6}>
      <TextField
        fullWidth
        label="Account Number"
        variant="outlined"
        size="small"
        value={bankDetails.account_number}
        onChange={(e) => setBankDetails({ ...bankDetails, account_number: e.target.value })}
        InputProps={{
          readOnly: !isEditable,
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: isEditable ? 'currentColor' : 'transparent',
            },
            '&:hover fieldset': {
              borderColor: isEditable ? 'currentColor' : 'transparent',
            },
          },
        }}
      />
    </Grid>
    <Grid item xs={6}>
      <TextField
        fullWidth
        label="IFSC Code"
        variant="outlined"
        size="small"
        value={bankDetails.ifsc_code}
        onChange={(e) => setBankDetails({ ...bankDetails, ifsc_code: e.target.value })}
        InputProps={{
          readOnly: !isEditable,
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: isEditable ? 'currentColor' : 'transparent',
            },
            '&:hover fieldset': {
              borderColor: isEditable ? 'currentColor' : 'transparent',
            },
          },
        }}
      />
    </Grid>
    <Grid item xs={6}>
      <TextField
        fullWidth
        label="IBAN"
        variant="outlined"
        size="small"
        value={bankDetails.iban}
        onChange={(e) => setBankDetails({ ...bankDetails, iban: e.target.value })}
        InputProps={{
          readOnly: !isEditable,
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: isEditable ? 'currentColor' : 'transparent',
            },
            '&:hover fieldset': {
              borderColor: isEditable ? 'currentColor' : 'transparent',
            },
          },
        }}
      />
    </Grid>
    <Grid item xs={6}>
      <TextField
        fullWidth
        label="SWIFT Code"
        variant="outlined"
        size="small"
        value={bankDetails.swift_code}
        onChange={(e) => setBankDetails({ ...bankDetails, swift_code: e.target.value })}
        InputProps={{
          readOnly: !isEditable,
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: isEditable ? 'currentColor' : 'transparent',
            },
            '&:hover fieldset': {
              borderColor: isEditable ? 'currentColor' : 'transparent',
            },
          },
        }}
      />
    </Grid>
    <Grid item xs={6}>
      <TextField
        fullWidth
        label="Branch"
        variant="outlined"
        size="small"
        value={bankDetails.branch}
        onChange={(e) => setBankDetails({ ...bankDetails, branch: e.target.value })}
        InputProps={{
          readOnly: !isEditable,
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: isEditable ? 'currentColor' : 'transparent',
            },
            '&:hover fieldset': {
              borderColor: isEditable ? 'currentColor' : 'transparent',
            },
          },
        }}
      />
    </Grid>
    <Grid item xs={6}>
      <TextField
        fullWidth
        label="Currency"
        variant="outlined"
        size="small"
        value={bankDetails.currency}
        onChange={(e) => setBankDetails({ ...bankDetails, currency: e.target.value })}
        InputProps={{
          readOnly: !isEditable,
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: isEditable ? 'currentColor' : 'transparent',
            },
            '&:hover fieldset': {
              borderColor: isEditable ? 'currentColor' : 'transparent',
            },
          },
        }}
      />
    </Grid>
  </Grid>
</Paper> */}
    </Box>
  );
};

export default SuperAdminUserProfile;
