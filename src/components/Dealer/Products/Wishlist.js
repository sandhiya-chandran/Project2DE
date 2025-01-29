import React, { useState, useEffect } from "react";
import axios from "axios";
import Tooltip from "@mui/material/Tooltip";
import {
  Box,
  Typography,
  Card,
  CardMedia,
  CardContent,
  IconButton,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  CircularProgress
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import { useNavigate } from "react-router-dom";
import soonImg from "../../assets/soon-img.png";

const Wishlist = ({ fetchCartCount }) => {
  const navigate = useNavigate();
  const [wishlist, setWishlist] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false); 
  const [itemToDelete, setItemToDelete] = useState(null); 
  const [quantity, setQuantity] = useState({});
  const [cartItems, setCartItems] = useState([]);


  useEffect(() => 
    {
    const fetchWishlist = async () => {
      try {
        const userData = localStorage.getItem("user");
        if (!userData) {
          setError("No user logged in");
          console.error("No user logged in");
          return;
        }

        const user = JSON.parse(userData);
        const userId = user.id;

        const response = await axios.get(
          `${process.env.REACT_APP_IP}obtainWishlistForBuyer/?user_id=${userId}`
        );

        setWishlist(response.data.data || []);
        console.log("Wishlist data retrieved:", response.data);
        setLoading(false)
      } catch (error) {
        setError("Error retrieving wishlist");
        console.error("Error retrieving wishlist:", error);
      }
    };

    fetchWishlist(); // Call the function on component mount
  }, []);

  const handleRemove = async () => {
    if (!itemToDelete) return;

    try {
      const response = await axios.get(
        `${process.env.REACT_APP_IP}deleteWishlist/?wish_list_id=${itemToDelete}`
      );

      if (response.status === 200) {
        // Remove the item from the wishlist state
        setWishlist((prevWishlist) =>
          prevWishlist.filter((item) => item.id !== itemToDelete)
        );
        console.log("Item removed from wishlist successfully");
        setOpenDialog(false); // Close the dialog
      }
    } catch (error) {
      console.error("Error removing item from wishlist:", error);
      setError("Failed to remove item from wishlist");
    }
  };

  const handleOpenDialog = (wishListId) => {
    setItemToDelete(wishListId); // Set the item to delete
    setOpenDialog(true); // Open the dialog
  };

  const handleCloseDialog = () => {
    setOpenDialog(false); // Close the dialog without deleting
    setItemToDelete(null); // Clear the item to delete
  };

  const handleProductClick = (productId) => {
    navigate(`/dealer/products/${productId}`);
  };

  const handleAddToCart = async (product, quantity) => {
    try {
      const userData = localStorage.getItem("user");
      const user = JSON.parse(userData); // Assuming user data is stored in localStorage
      const userId = user.id; // Extract user ID

      // Check if the product already exists in the cart
      const existingItem = cartItems.find(
        (item) => item.product_id === product.id
      );

      if (existingItem) {
        // Update quantity if product is already in the cart
        // const updatedCartItems = cartItems.map((item) =>
        //   item.product_id === product.id
        //     ? { ...item, quantity: item.quantity + quantity }
        //     : item
        // );
        // setCartItems(updatedCartItems);

        // Send API request to update the cart
        await axios.post(
          `${process.env.REACT_APP_IP}createOrUpdateUserCartItem/`,
          {
            user_id: userId,
            product_id: product.product_id,
            quantity: 1,
            price: product.price,
          }
        );

        // toast.success("Product quantity updated."); 
      } else {
        // Add new item to the cart
        const newCartItem = {
          product_id: product.product_id,
          quantity: 1,
          price: product.price,
        };
        setCartItems([...cartItems, newCartItem]);

        // Send API request to create or update the cart item
        await axios.post(
          `${process.env.REACT_APP_IP}createOrUpdateUserCartItem/`,
          {
            user_id: userId,
            product_id: product.product_id,
            quantity: 1,
            price: product.price,
          }
        );

        // toast.success("Product added successfully."); 
      }

      console.log("Cart updated successfully!");
      fetchCartCount();
      console.log("Cart count updated successfully!");
    } catch (error) {
      console.error("Error adding item to cart:", error);
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography
        variant="h5"
        sx={{ mb: 3, fontWeight: "bold", textAlign: "left" }}
      >
        My Wishlist
      </Typography>

      {loading ? (
  <Box sx={{ textAlign: "center", paddingTop: "50px" }}>
    <CircularProgress color="primary" />
  </Box>
) : error ? (
  <Typography color="error">{error}</Typography>
) : wishlist.length > 0 ? (
  <Box display="flex" flexWrap="wrap" gap={3} justifyContent="flex-start">
    {wishlist.map((product) => (
      <Box
        key={product.id}
        width={{
          xs: "100%",
          sm: "calc(50% - 24px)",
          md: "calc(25% - 24px)",
        }}
        mb={3}
      >
        <Card
          onClick={() => handleProductClick(product.product_id)}
          style={{
            height: "350px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start",
            cursor: "pointer",
          }}
        >
          <Box position="relative">
            <CardMedia
              component="img"
              height="150"
              image={
                !product.primary_image ||
                product.primary_image.startsWith("http://example.com") ||
                !(
                  product.primary_image.startsWith("http") ||
                  product.primary_image.startsWith("https")
                )
                  ? soonImg
                  : product.primary_image
              }
              alt={product.name || "Product Image"}
              sx={{
                objectFit: "contain",
                boxShadow: "0px 0px 2px rgba(0, 0, 0, 0.1)",
              }}
            />
            {product.in_cart && (
              <Box
                position="absolute"
                bottom={8}
                left={8}
                bgcolor="green"
                color="white"
                px={1}
                py={0.5}
                borderRadius={1}
                zIndex={1}
                fontSize={8}
              >
                In Cart
              </Box>
            )}
            {product.discount > 0 &&
              product.price.toFixed(2) !== product.was_price.toFixed(2) && (
                <Box
                  position="absolute"
                  top={8}
                  left={8}
                  bgcolor="primary.main"
                  color="white"
                  px={1}
                  py={0.5}
                  borderRadius={1}
                  zIndex={1}
                  fontSize={8}
                >
                  {`${product.discount}% OFF`}
                </Box>
              )}
          </Box>
          <CardContent
            sx={{
              padding: "8px !important",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <Box>
              <Tooltip title={product.name}>
                <Typography
                  variant="subtitle1"
                  style={{
                    lineHeight: "22px",
                    marginBottom: "10px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    display: "-webkit-box",
                    WebkitBoxOrient: "vertical",
                    WebkitLineClamp: 2,
                  }}
                >
                  {product.name}
                </Typography>
              </Tooltip>
              <Box
                sx={{
                  mt: 1,
                  display: "flex",
                  gap: "10px",
                  alignItems: "center",
                  flexWrap: "wrap",
                }}
              >
                <Typography sx={{ fontSize: "12px" }}>
                  SKU: {product.sku_number}
                </Typography>
                <Typography sx={{ fontSize: "12px" }}>
                  MPN: {product.mpn_number}
                </Typography>
              </Box>
              <Typography sx={{ mt: 1, fontSize: "12px" }}>
                MSRP : {product.currency}
                {product.msrp.toFixed(2)}
              </Typography>
              <Box
                sx={{
                  mt: 1,
                  display: "flex",
                  gap: "10px",
                  alignItems: "center",
                  flexWrap: "wrap",
                }}
              >
                <Typography variant="body1" color="text.primary">
                  {product.currency}
                  {product.price.toFixed(2)}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  style={
                    product.price.toFixed(2) === product.was_price.toFixed(2)
                      ? { textDecoration: "none" }
                      : { textDecoration: "line-through" }
                  }
                >
                  Was:{product.currency}
                  {product.was_price.toFixed(2)}
                </Typography>
              </Box>
            </Box>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              gap={"8px"}
              mt={2}
            >
              <Box
                sx={{
                  display: "flex",
                  gap: "10px",
                  alignItems: "center",
                  justifyContent: "flex-end",
                }}
              >
                <IconButton
                  sx={{
                    backgroundColor: product.availability ? "inherit" : "#ccc",
                    color: "#615e5e",
                    padding: "0",
                    cursor: product.availability ? "pointer" : "not-allowed",
                  }}
                  disabled={!product.availability}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddToCart(product, quantity[product.id] || 1);
                  }}
                >
                  <ShoppingCartOutlinedIcon sx={{ padding: "0" }} />
                </IconButton>
                <Typography>
                  {product.availability ? "In Stock" : "Out of Stock"}
                </Typography>
              </Box>
              <Box>
              <Tooltip title="Remove Item">
                <IconButton
                  color="error"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenDialog(product.id);
                  }}
                >
                  <DeleteIcon />
                </IconButton>
                </Tooltip>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>
    ))}
  </Box>
) : (
  <Box sx={{ textAlign: "center", paddingTop: "50px" }}>
    <Typography variant="h6" marginBottom={"20px"}>
      Your Wishlist is Empty
    </Typography>
    <Button
      variant="contained"
      color="primary"
      onClick={() => navigate("/dealer/products")}
    >
      Continue Shopping
    </Button>
  </Box>
)}


      {/* Dialog for confirmation */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to remove this item from your wishlist?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={handleRemove} color="secondary">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Wishlist;
