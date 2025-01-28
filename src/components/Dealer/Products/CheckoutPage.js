import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate , useLocation } from "react-router-dom";
import {
  Box,
  Button,
  Container,
  Paper,
  TextField,
  Typography,
  Divider,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton
} from '@mui/material';

import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import soonImg from "../../assets/soon-img.png";


function CheckoutPage({fetchCartCount}) {
  const navigate = useNavigate();
  const [userDetails, setUserDetails] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [cartCount, setCartCount] = useState(0); // Total number of items in the cart
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const userData = localStorage.getItem("user");
        console.log(userData);
        const userId = userData ? JSON.parse(userData).id : null;
        if (userId) {
          const response = await axios.get(
            `${process.env.REACT_APP_IP}obtainUserDetails/?user_id=${userId}`
          );
          setUserDetails(response.data.data.user_obj);
          console.log("User Details:", response.data.data.user_obj);
        }
      } catch (error) {
        console.error("Error fetching user details:", error);
      }
    };
    fetchUserDetails();
  }, []);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    // Optionally, add logic to save updated details via an API call
    setIsEditing(false);
  };

  // Fetch user data from localStorage
  const getUserData = () => {
    const userData = localStorage.getItem("user");
    return userData ? JSON.parse(userData) : null;
  };

  // Fetch cart items for the logged-in user
  const fetchCartItems = async (userId) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.REACT_APP_IP}obtainUserCartItemList/?user_id=${userId}`
      );
      setCartItems(response.data.data || []);
      console.log("Cart Items:", response.data.data);
    } catch (err) {
      setError("Failed to load cart items");
    } finally {
      setLoading(false);
    }
  };

  // Fetch total checkout amount and cart count for the user
  const fetchTotalAmountAndCount = async (userId) => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_IP}totalCheckOutAmount/?user_id=${userId}`
      );
      if (response.data && response.data.data) {
        const { total_amount, cart_count } = response.data.data;
        setTotalAmount(total_amount || 0);
        setCartCount(cart_count || 0);
      } else {
        console.error("Invalid response structure for total amount and count.");
      }
    } catch (err) {
      console.error("Error fetching total amount and count:", err);
    }
  };

  const handleConfirmOrder = async () => {

    // Check if all required fields are filled
  const { username, email, mobile_number, address } = userDetails || {};
  const { street, city, state, country, zipCode } = address || {};

  if (!username || !email || !mobile_number || !street || !city || !state || !country || !zipCode) {
    // Show an alert box if any required field is missing
    setOpenDialog(true);
    return; // Stop further execution of the order confirmation
  }

    const user = getUserData();
    const userId = user ? user.id : null;
    const manufactureUnitId = userDetails?.manufacture_unit_id;  // Assuming manufacture unit ID is in userDetails
    
    // Prepare the shipping address data
    const shippingAddress = userDetails?.address ? userDetails.address.address_id : null;  // Get the address from userDetails
  
    // Prepare the order items (just the IDs of the cart items)
    const orderItems = cartItems.map(item => item.id); 

    const currency = cartItems.length > 0 ? cartItems[0].currency : null;  
 


  
    // Prepare the payload for the order creation API
    const orderData = {
      manufacture_unit_id: manufactureUnitId,
      user_id: userId,
      amount: totalAmount,
      currency: currency, 
      shipping_address_id: shippingAddress,  
      order_items: orderItems,
    };
  
    try {
      const response = await axios.post(`${process.env.REACT_APP_IP}createOrder/`, orderData);
      if (response.data) {
        // Handle successful order creation
        console.log("Order created successfully:", response.data);
        const orderId = response.data.data.order_id;
        console.log("Checkout Order ID:", orderId);
        // Navigate to payment confirmation or order success page
        navigate("/dealer/checkoutRedirect");
      } else {
        console.error("Error creating order:", response);
      }

      fetchCartCount();
    } catch (error) {
      console.error("Error in order creation:", error);
    }
  };




  // Fetch data when component mounts
  useEffect(() => {
    const user = getUserData();
    if (user) {
      fetchCartItems(user.id); // Fetch cart items
      fetchTotalAmountAndCount(user.id); // Fetch total checkout amount and cart count
    } else {
      setError("User not found.");
      setLoading(false);
    }
  }, []);

  const handleProductClick = (productId) => {
    navigate(`/dealer/products/${productId}`);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false); // Close the dialog when the close button is clicked
  };

  const handleNavigateProfile = () => {
    navigate("/dealer/profile"); // Navigate to the profile page
    setOpenDialog(false); // Close the dialog
  };


  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;


  
  return (
    <Container sx={{ py: 4 }}>
      <Button
       startIcon={<ArrowBackIcon />}
        variant="text"
        color="primary"
        style={{ marginBottom: '15px', textTransform:'capitalize' }}
        onClick={() => navigate("/dealer/cart")}
      >
        Back to Cart
      </Button>
     

      <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: '20px' }}>
        {/* Left Side - Customer Information */}
        <Box sx={{ flex: 1 }}>
          <Paper sx={{ p: 4, position: 'relative' }}>
            <Typography variant="h6" gutterBottom>
              Customer Information
            </Typography>
            
            <Button
              onClick={isEditing ? handleSave : handleEditClick}
              variant="outlined"
              color="primary"
              sx={{ position: 'absolute', top: 16, right: 16 }}
            >
              {isEditing ? 'Save' : 'Edit'}
            </Button>

            {userDetails ? (
              <Box component="form">
                <TextField
                  label="Name"
                  fullWidth
                  margin="normal"
                  required
                  value={userDetails.username}
                  onChange={(e) => setUserDetails({ ...userDetails, username: e.target.value })}
                  disabled={!isEditing}
                />
                <TextField
                  label="Email"
                  fullWidth
                  margin="normal"
                  required
                  value={userDetails.email}
                  onChange={(e) => setUserDetails({ ...userDetails, email: e.target.value })}
                  disabled={!isEditing}
                />
                <TextField
                  label="Phone Number"
                  fullWidth
                  margin="normal"
                  required
                  value={userDetails.mobile_number}
                  onChange={(e) => setUserDetails({ ...userDetails, mobile_number: e.target.value })}
                  disabled={!isEditing}
                />
                <TextField
                  label="Street"
                  fullWidth
                  margin="normal"
                  required
                  value={userDetails.address?.street || ''}
                  onChange={(e) => setUserDetails({
                    ...userDetails,
                    address: { ...userDetails.address, street: e.target.value },
                  })}
                  disabled={!isEditing}
                />
                <TextField
                  label="City"
                  fullWidth
                  margin="normal"
                  required
                  value={userDetails.address?.city || ''}
                  onChange={(e) => setUserDetails({
                    ...userDetails,
                    address: { ...userDetails.address, city: e.target.value },
                  })}
                  disabled={!isEditing}
                />
                <TextField
                  label="State"
                  fullWidth
                  margin="normal"
                  required
                  value={userDetails.address?.state || ''}
                  onChange={(e) => setUserDetails({
                    ...userDetails,
                    address: { ...userDetails.address, state: e.target.value },
                  })}
                  disabled={!isEditing}
                />
                <TextField
                  label="Country"
                  fullWidth
                  margin="normal"
                  required
                  value={userDetails.address?.country || ''}
                  onChange={(e) => setUserDetails({
                    ...userDetails,
                    address: { ...userDetails.address, country: e.target.value },
                  })}
                  disabled={!isEditing}
                />
                <TextField
                  label="Zip Code"
                  fullWidth
                  margin="normal"
                  required
                  value={userDetails.address?.zipCode || ''}
                  onChange={(e) => setUserDetails({
                    ...userDetails,
                    address: { ...userDetails.address, zipCode: e.target.value },
                  })}
                  disabled={!isEditing}
                />
              </Box>
            ) : (
              <Typography>Loading user details...</Typography>
            )}
          </Paper>
        </Box>

        {/* Right Side - Order Summary */}
        <Box sx={{ flex: 1 }}>
          <Paper sx={{ p: 4 }}>
            <Typography variant="h6" gutterBottom>
              Order Summary
            </Typography>
            <Box sx={{
                maxHeight: '500px',
                overflowY: cartItems.length * 50 > 500 ? 'scroll' : 'auto',
                '&::-webkit-scrollbar': {
                  width: '3px', 
                },
                '&::-webkit-scrollbar-thumb': {
                  backgroundColor: '#888', 
                  borderRadius: '10px',
                },
                '&::-webkit-scrollbar-thumb:hover': {
                  backgroundColor: '#555', 
                },
              }}>
            {cartItems.map((item,index) => (
              <Box key={index} display="flex" alignItems="center" my={2}>


                <img
                  // src={item.primary_image}
                  src={
                    !item.primary_image ||
                    item.primary_image?.startsWith("http://example.com") ||
                    !(
                      item.primary_image?.startsWith("http") ||
                      item.primary_image?.startsWith("https")
                    )
                      ? soonImg
                      : item.primary_image
                  }
                  alt={item.name}
                  width={50}
                  height={50}
                  style={{ borderRadius: 4 }}
                />
                <Box ml={2} flex={1}>
                  <Typography variant="subtitle1" sx={{fontSize:'14px', lineHeight:'20px', marginRight:'15px' , cursor:'pointer'}} onClick={() => handleProductClick(item.product_id)}>{item.name}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    Quantity: {item.quantity}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Price: ${item.price.toFixed(2)}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Total: ${(item.price * item.quantity).toFixed(2)}
                  </Typography>
                </Box>
              </Box>
            ))}
            </Box>
           
            <Box>
            <Divider sx={{ my: 2 }} />
            <Typography variant="body1">
              Total Products: {cartCount}
            </Typography>
            <Typography variant="h6">
              Order Total: ${totalAmount.toFixed(2)}
            </Typography>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              sx={{ mt: 2 }}
              onClick={handleConfirmOrder}
            >
              Confirm Order & Proceed to Payment
            </Button>
            </Box>
           
          </Paper>
        </Box>
      </Box>

      {/* Dialog for missing information */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Profile Incomplete</Typography>
            <IconButton onClick={handleCloseDialog}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Please complete your profile with all required details before proceeding to checkout.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleNavigateProfile} color="primary">
            Update Profile
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default CheckoutPage;
