// src\components\Dealer\Products\ProductModal.js

import React, { useState, useEffect } from "react";
import {
  Modal,
  Box,
  Typography,
  IconButton,
  Button,
} from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import { useNavigate } from 'react-router-dom';
import soonImg from "../../assets/soon-img.png";

const ProductModal = ({ open, onClose, product, handleAddToCart }) => {
  const [quantity, setQuantity] = useState(1);
  const navigate = useNavigate();

  // Reset quantity whenever the product changes
  useEffect(() => {
    setQuantity(1);  // Reset quantity to 1 when a new product is viewed
  }, [product]);

  if (!product) return null;

  const handleQuantityChange = (type) => {
    setQuantity(prev => type === "increment" ? prev + 1 : Math.max(prev - 1, 1));
  };

  const handleAddToCartClick = () => {
    handleAddToCart(product, quantity);  // Add product to cart with quantity
    onClose();  // Close modal after adding to cart
  };

  const handleProductClick = (productId) => {
    navigate(`/dealer/products/${productId}`);
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 500,
          bgcolor: "background.paper",
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
          display: "flex",
        }}
      >
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ position: "absolute", top: 8, right: 8 }}
        >
          <CloseIcon />
        </IconButton>

        {/* Left Side - Product Image */}
        <Box
          sx={{
            width: "40%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            pr: 2,
          }}
        >
          <img
             src={product.logo && 
              (product.logo.startsWith("http://example.com")
                ? soonImg
                : (product.logo.startsWith("http") || product.logo.startsWith("https"))
                  ? product.logo
                  : soonImg)}
            alt={product.name}
            style={{ width: "100%", borderRadius: "8px" }}
          />
        </Box>

        {/* Right Side - Product Details */}
        <Box sx={{ width: "60%" }}>
          <Typography variant="h6" component="h2" sx={{fontSize: '16px', lineHeight: '22px'}} >
            {product.name}
          </Typography>
          <Typography sx={{ mt: 1,  fontSize:'12px'}}>
           SKU NO:{product.sku_number} /  MPN:{product.mpn}
          </Typography>
          <Typography sx={{ mt: 1, fontWeight: 'bold',fontSize: '20px' }}>
            {product.currency}{product.price}
          </Typography>
          <Box sx={{display:'flex' , gap:'5px'}}>

          {product.discount > 0 &&
              product.price.toFixed(2) !==
              product.was_price.toFixed(2) && (
                <Typography>
                {product.discount}% off from
              </Typography>
              )}


          
                 <Typography
                
                color="text.secondary"
                style={
                  product.price.toFixed(2) ===
                    product.was_price.toFixed(2)
                    ? { textDecoration: "none" }
                    : { textDecoration: "line-through" }
                }
              >
                Was:{product.currency}
                {product.was_price.toFixed(2)}
              </Typography>
          </Box>
         
          <Typography sx={{ mt: 1, color: product.availability ? "green" : "red" }}>
            {product.availability ? "In Stock" : "Out of Stock"}
          </Typography>
          <Typography sx={{ mt: 1, color: product.availability ? "green" : "red" }}>
            Units : {product.quantity}
          </Typography>
          <Typography sx={{ mt: 1 }}>
           {product.brand_name}
          </Typography>
          <Typography sx={{ mt: 1 }}>
            {product.end_level_category}
          </Typography>

          <Typography
            component="a"
            sx={{ cursor:'pointer', mt: 1, display: "block", color: "primary.main", textDecoration: "none", fontSize:'12px' }}
            onClick={() => handleProductClick(product.id)}
          >
            View More Details
          </Typography>

          {/* Quantity and Add to Cart */}
          <Box sx={{ display: "flex", gap: '10px' }}>
            <Box sx={{ display: "flex", alignItems: "center", mt: 2, border: '1px solid #1976d2', borderRadius: '5px' }}>
              <Button sx={{minWidth: '40px'}} onClick={() => handleQuantityChange("decrement")}>-</Button>
              <Typography sx={{ mx: 1 }}>{quantity}</Typography>
              <Button sx={{minWidth: '40px'}} onClick={() => handleQuantityChange("increment")}>+</Button>
            </Box>
            <Button
              variant="contained"
              color="primary"
              sx={{ mt: 2 , fontSize:'12px' }}
              onClick={handleAddToCartClick} // Trigger add to cart functionality
            >
              Add to Cart
            </Button>
          </Box>
        </Box>
      </Box>
    </Modal>
  );
};

export default ProductModal;
