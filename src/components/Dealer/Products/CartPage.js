// src\components\Dealer\Products\CartPage.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Paper,
  Dialog,
  DialogActions,
  DialogTitle,
} from "@mui/material";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import { useNavigate } from "react-router-dom";
import soonImg from "../../assets/soon-img.png";

const CartPage = ({fetchCartCount}) => {
  const [cartItems, setCartItems] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [cartCount, setCartCount] = useState(0); // To store cart count
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteItemId, setDeleteItemId] = useState(null);
  const [emptyCartDialogVisible, setEmptyCartDialogVisible] = useState(false);
  const [deleteItemDialogVisible, setDeleteItemDialogVisible] = useState(false);
  const [itemQuantity, setItemQuantity] = useState({}); // To store the updated quantity for each item
  const navigate = useNavigate();

  // Fetch user data from localStorage
  const getUserData = () => {
    const userData = localStorage.getItem("user");
    return userData ? JSON.parse(userData) : null;
  };

  // Fetch the cart items for the logged-in user
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

  // Fetch the total checkout amount and cart count for the user
  const fetchTotalAmountAndCount = async (userId) => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_IP}totalCheckOutAmount/?user_id=${userId}`
      );

      // Log the response for debugging
      console.log("Response:", response.data);

      if (response.data && response.data.data) {
        const { total_amount, cart_count } = response.data.data; // Destructure the values from 'data'

        // Update the state with the fetched values
        setTotalAmount(total_amount || 0);
        setCartCount(cart_count || 0);

        console.log("Total Amount:", total_amount);
        console.log("Cart Count:", cart_count);
      } else {
        console.error("Invalid response structure for total amount and count.");
      }
    } catch (err) {
      console.error("Error fetching total amount and count:", err);
    }
  };

  // Function to delete a cart item
  const deleteCartItem = async (cartItemId) => {
    try {
      const user = getUserData();
      if (user) {
        await axios.post(
          `${process.env.REACT_APP_IP}updateOrDeleteUserCartItem/`,
          {
            is_delete: true,
            empty_cart: false,
            id: cartItemId,
            quantity: 0,
          }
        );

        setCartItems((prevItems) => {
          const updatedCartItems = prevItems.filter(
            (item) => item.id !== cartItemId
          );
          if (updatedCartItems.length === 0) {
            setTotalAmount(0);
            setCartCount(0);
          }
          return updatedCartItems;
        });

        if (cartItems.length > 1) {
          fetchTotalAmountAndCount(user.id);
         
          console.log("Cart count updated successfully!");
        }
      }

      fetchCartCount();
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  // Handle item deletion confirmation
  const handleDeleteConfirmation = (cartItemId) => {
    setDeleteItemId(cartItemId);
    setDeleteItemDialogVisible(true);
  };

  // Confirm item deletion
  const handleConfirmDeleteItem = () => {
    if (deleteItemId) {
      deleteCartItem(deleteItemId);
    }
    setDeleteItemDialogVisible(false);
  };

  // Handle empty cart confirmation
  const handleEmptyCartConfirmation = () => {
    setEmptyCartDialogVisible(true);
  };

  // Function to update cart item quantity
  const updateCartItemQuantities = async () => {
    try {
      const user = getUserData();
      if (user) {
        // Create a list of cart items with their updated quantities and recalculate the total price for each item
        const updatedCartItems = cartItems.map((item) => {
          const updatedQuantity =
            Number(itemQuantity[item.id]) || item.quantity;
          const updatedTotalPrice = updatedQuantity * item.price; // Recalculate total_price based on the new quantity
          return {
            ...item,
            quantity: updatedQuantity,
            total_price: updatedTotalPrice, // Update total_price
          };
        });

        console.log(
          "Updated cartList with new quantities and total prices:",
          updatedCartItems
        );

        // Send the cart list with updated quantities and total prices in one request
        await axios.post(
          `${process.env.REACT_APP_IP}updateOrDeleteUserCartItem/`,
          {
            is_delete: false,
            empty_cart: false,
            cart_list: updatedCartItems.map((item) => ({
              id: item.id,
              quantity: item.quantity,
            })),
          }
        );

        // Update the state with the new cart items and recalculate total amount
        setCartItems(updatedCartItems);
        fetchTotalAmountAndCount(user.id); // Recalculate the total amount and cart count
      }
    } catch (error) {
      console.error("Error updating quantities:", error);
    }
  };


  const handleProductClick = (productId) => {
    navigate(`/dealer/products/${productId}`);
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

  // Handle quantity change
  const handleQuantityChange = (cartItemId, newQuantity) => {
    setItemQuantity((prev) => ({
      ...prev,
      [cartItemId]: newQuantity,
    }));
  };

  // Confirm empty cart
  const handleEmptyCart = async () => {
    try {
      const user = getUserData();
      if (user) {
        await axios.post(
          `${process.env.REACT_APP_IP}updateOrDeleteUserCartItem/`,
          {
            empty_cart: true,
            user_id: user.id,
          }
        );
        setCartItems([]);
        setTotalAmount(0);
        setCartCount(0);
        fetchCartCount();
        console.log("Cart count updated successfully!");
      }
    } catch (error) {
      console.error("Error emptying cart:", error);
    }
    setEmptyCartDialogVisible(false);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <Box sx={{ margin: "15px 8px" }}>
      {cartItems.length === 0 ? (
        <>
          <Box sx={{ textAlign: "center", paddingTop: "50px" }}>
            <Typography variant="h6" marginBottom={"20px"}>
              No products available in cart
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate("/dealer/products")}
            >
              Continue Shopping
            </Button>
          </Box>
        </>
      ) : (
        <>
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              marginBottom: "15px",
            }}
          >
           
            <Box
              sx={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}
            >
              {/* Empty Cart Button */}
              <Button
                variant="outlined"
                color="primary"
                onClick={handleEmptyCartConfirmation}
              >
                Empty Cart
              </Button>
             
           
             
            </Box>

          </Box>

          <Box
           sx={{
            display: "flex",
            justifyContent: "flex-end",
            marginBottom: "15px",
          }}
          >
              <Typography variant="body1">
                Total Items in Cart: {cartCount}
              </Typography>
            </Box>

          {/* Empty Cart Confirmation Dialog */}
          <Dialog
            open={emptyCartDialogVisible}
            onClose={() => setEmptyCartDialogVisible(false)}
          >
            <DialogTitle>Are you sure you want to empty the cart?</DialogTitle>
            <DialogActions>
              <Button onClick={handleEmptyCart} color="primary">
                Yes
              </Button>
              <Button
                onClick={() => setEmptyCartDialogVisible(false)}
                color="secondary"
              >
                No
              </Button>
            </DialogActions>
          </Dialog>

          {/* Delete Item Confirmation Dialog */}
          <Dialog
            open={deleteItemDialogVisible}
            onClose={() => setDeleteItemDialogVisible(false)}
          >
            <DialogTitle>
              Are you sure you want to delete this item from the cart?
            </DialogTitle>
            <DialogActions>
              <Button onClick={handleConfirmDeleteItem} color="primary">
                Yes
              </Button>
              <Button
                onClick={() => setDeleteItemDialogVisible(false)}
                color="secondary"
              >
                No
              </Button>
            </DialogActions>
          </Dialog>

          {/* Cart Table */}
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Product Image</TableCell>
                  <TableCell>Product Name</TableCell>
                  <TableCell>SKU No</TableCell>
                  <TableCell>MPN No</TableCell>
                  <TableCell>Brand Name</TableCell>
                  <TableCell>Quantity</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Total Price</TableCell>
                  <TableCell>Remove</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {cartItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      {item.primary_image && (
                       <img
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
                       alt={item.name || "Product Image"}
                       style={{
                         width: "40px",
                         height: "40px",
                         objectFit: "cover",
                         boxShadow: "0px 0px 2px rgba(0, 0, 0, 0.1)", // Light shadow
                       }}
                     />
                      
                      )}
                    </TableCell>
                    <TableCell >
                     <span style={{cursor:'pointer'}} onClick={() => handleProductClick(item.product_id)}> {item.name.length > 15
                        ? `${item.name.slice(0, 20)}...`
                        : item.name}</span>
                    </TableCell>
                    <TableCell>{item.sku_number}</TableCell>
                    <TableCell>{item.mpn_number}</TableCell>
                    <TableCell>{item.brand_name}</TableCell>

                    <TableCell>
                      <TextField
                        type="number"
                        value={itemQuantity[item.id] || item.quantity}
                        onChange={(e) =>
                          handleQuantityChange(item.id, e.target.value)
                        }
                        size="small"
                        inputProps={{ min: 1 }}
                        style={{ width: "80px" }}
                      />
                    </TableCell>
                    <TableCell>${item.price}</TableCell>
                    <TableCell>${item.total_price}</TableCell>
                    <TableCell>
                    <HighlightOffIcon sx={{ color: '#ab003c' }} onClick={() => handleDeleteConfirmation(item.id)} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Total Amount */}
          <Typography
            variant="h6"
            style={{ marginTop: "20px", textAlign: "right" }}
          >
            Total Amount: ${totalAmount}
          </Typography>
         
          {/* Checkout Button */}
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: "20px" , marginTop: "20px"}}>
          <Button
                variant="outlined"
                color="primary"
                onClick={updateCartItemQuantities}
              >
                Update Quantity
              </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate("/dealer/checkout")}
            >
              Checkout
            </Button>
          </Box>
        </>
      )}
    </Box>
  );
};

export default CartPage;
