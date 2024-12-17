import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Typography,
  Box,
  Divider,
  CircularProgress,
  Card,Tooltip
} from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function ValidatePopup({ open, onClose, data, xlData, industry }) {
  console.log('Popup Open:', open, 'Industry ID:', data);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const productXldata = data?.duplicate_products || []; // Ensure the correct data is used
  const industryId = data?.industry_id;

  console.log('0088', productXldata); // Debugging log to verify the data structure
  const truncateText = (text, maxWords) => {
    const words = text.split(" ");
    if (words.length > maxWords) {
      return words.slice(0, maxWords).join(" ") + "...";
    }
    return text;
  };
  const onAcceptButton = async () => {
    setLoading(true);

    // Retrieve and parse user data from localStorage
    const userData = localStorage.getItem("user");
    const parsedUserData = userData ? JSON.parse(userData) : null;
    const manufactureUnitId = parsedUserData?.manufacture_unit_id;

    if (!manufactureUnitId) {
      setLoading(false);
      console.error("Manufacture Unit ID is missing.");
      return;
    }

    try {
      const apiUrl = `${process.env.REACT_APP_IP}save_file/`;
      const response = await axios.post(apiUrl, {
        allow_duplicate: true,
        manufacture_unit_id: manufactureUnitId,
        xl_data: productXldata,
        industry_id: industryId, // Include the industry ID
      });

      if (response.data) {
        const duplicates = response.data?.data?.duplicates || null;
        if (duplicates) {
          console.log("Duplicates Found:", duplicates);
        } else {
          console.log("No duplicates, data processed successfully.");
        }
        navigate("/manufacturer/products");
      }
    } catch (error) {
      console.error("Error while saving data:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmAccept = () => {
    setConfirmOpen(true); 
  };

  const handleConfirmClose = () => {
    setConfirmOpen(false); 
  };

  return (
    <>
      {/* Main Duplicate Dialog */}
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
        <DialogTitle>
          <Typography variant="h6" fontWeight="bold" sx={{ fontSize: "14px" }}>
          {productXldata.length} - Duplicate Products Found
          </Typography>
        </DialogTitle>
        <Divider />
        <DialogContent>
  {productXldata.length > 0 ? (
    <Box sx={{ mt: 2 }}>
      {/* Iterate over productXldata and display each duplicate product in a card layout */}
      <Grid container spacing={2}>
        {productXldata.map((product, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card
              sx={{
                p: 2,
                height: "100px", // Limiting the height of the scrollable area
                overflowY: productXldata.length * 50 > 339 ? "scroll" : "auto", // Show scroll only if content exceeds the max height
                "&::-webkit-scrollbar": {
                  width: "4px", // Scrollbar width
                  
                },
                "&::-webkit-scrollbar-thumb": {
                  backgroundColor: "#888",
                  borderRadius: "10px",
                },
                "&::-webkit-scrollbar-thumb:hover": {
                  backgroundColor: "#555",
                },
              }}
            >
             <Typography
  variant="h6"
  sx={{
    cursor: 'pointer',
    fontSize: "12px",
    fontWeight: "bold",
    whiteSpace: "normal", // Allows wrapping
    textOverflow: "ellipsis", // Adds ellipsis for overflowed text
    overflow: "hidden", // Ensure content doesn't overflow
    maxWidth: '100%', // Prevents the text from overflowing
  }}
>
  <Tooltip title={product.product_obj.product_name} arrow>
    <span>{product.product_obj.product_name.length > 50 ? product.product_obj.product_name.slice(0, 50) + '...' : product.product_obj.product_name}</span>
  </Tooltip>
</Typography>

              <Typography variant="body2" sx={{ fontSize: "12px", color: "text.secondary" }}>
                SKU: {product.product_obj.sku_number_product_code_item_number ? product.product_obj.sku_number_product_code_item_number : 'N/A'}
              </Typography>
              {/* <Typography variant="body2" sx={{ fontSize: "12px" }}>
                Category: {product.category_obj.level1} / {product.category_obj.level2} / {product.category_obj.level3}
              </Typography> */}
              <Typography variant="body2" sx={{ fontSize: "12px" }}>
                Brand: {product.brand_obj.name ? product.brand_obj.name : 'N/A'}
              </Typography>
              <Typography variant="body2" sx={{ fontSize: "12px" }}>
                Vendor: {product.vendor_obj.name ? product.vendor_obj.name: 'N/A'}
              </Typography>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  ) : (
    <Typography sx={{ fontSize: "12px" }}>No duplicate products found.</Typography>
  )}
</DialogContent>
        <Divider />
        <DialogActions>
          <Button onClick={handleConfirmAccept} variant="contained" color="primary">
            Accept 
          </Button>
          <Button
            onClick={() => {
              navigate("/manufacturer/products");
              onClose();
            }}
            variant="outlined"
            color="error"
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={confirmOpen} onClose={handleConfirmClose}>
        <DialogTitle>
          <Typography variant="h6" sx={{ fontSize: "14px" }}>
            Confirm Accept
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to accept duplicate products?</Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              handleConfirmClose(); // Close confirmation popup
              onAcceptButton(); // Call the API
            }}
            variant="contained"
            color="primary"
            disabled={loading} // Disable button while loading
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" /> // Show spinner when loading
            ) : (
              "Yes"
            )}
          </Button>
          <Button onClick={() => {
              navigate("/manufacturer/products");
              onClose();
            }} variant="outlined" color="error">
            No
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default ValidatePopup;
