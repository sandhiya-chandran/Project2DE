import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Divider,
  TableCell,
  TableHead,
  Table,
  TableRow,
  TableBody,
  Chip,
  RadioGroup,
  FormControlLabel,
  Radio,
  Dialog,
  DialogTitle,
  DialogContent,
  Tooltip,
  Modal,
  IconButton,
  List,
  ListItem,
  ListItemText,
  DialogActions,
  Card,
  CardContent,
  CircularProgress,
  Checkbox,
} from "@mui/material";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DownloadIcon from "@mui/icons-material/Download";
import CloseIcon from "@mui/icons-material/Close";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useParams, useNavigate , useLocation } from "react-router-dom";
import axios from "axios";

const OrderDetail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const [orderDetails, setOrderDetails] = useState(null); // State to store order details
  const [loading, setLoading] = useState(true);

  const userData = localStorage.getItem("user");
  const userId = userData ? JSON.parse(userData).manufacture_unit_id : "";
  const orderStatus =
    orderDetails?.order_obj?.payment_status === "Paid"
      ? "Completed"
      : "Shipping"; // Update based on payment status
  const [dialogOpen, setDialogOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [action, setAction] = useState(""); // 'accept' or 'reject'

  const [selectedProductIds, setSelectedProductIds] = React.useState([]); // To track selected product IDs

  const [selectedRows, setSelectedRows] = useState([]);

  const isRowSelected = (index) => selectedRows.includes(index);


  useEffect(() => {
    const handleBackButton = () => {
      // Custom logic for when the back button is pressed
      console.log('Back button pressed');
    };

    // Listen for history changes (back button)
    window.addEventListener('popstate', handleBackButton);

    return () => {
      window.removeEventListener('popstate', handleBackButton); // Clean up listener
    };
  }, []);

  const handleOpenDialog = (actionType) => {
    setAction(actionType); // Set the action to either 'Accept' or 'Reject'
    setDialogOpen(true); // Open the dialog
  };

  const handlePreview = (image) => {
    setPreviewImage(image);
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setPreviewImage(null);
  };

  // Handle confirmation of the action (Accept/Reject)
  const handleConfirm = async () => {
    try {
      // Fetch and parse user data from localStorage
      const userData = JSON.parse(localStorage.getItem("user"));
      console.log("User ID data:", userData);

      // Call the API with dynamic parameters
      const categoryResponse = await axios.get(
        `${process.env.REACT_APP_IP}acceptOrRejectOrder/?order_id=${id}&user_id=${userData?.id}&status=${action}`
      );
      console.log("Order details fetched:", categoryResponse.data);

      // Handle the successful API response and update UI as needed
      if (action === "Accept") {
        console.log("Order accepted!");
        // Add API call or logic to accept the order here
      } else if (action === "Reject") {
        console.log("Order rejected!");
        // Add API call or logic to reject the order here
      }

      // Close the dialog after successful confirmation
      setDialogOpen(false);
    } catch (error) {
      console.error("Error fetching order details:", error);
    }
  };

  const handleBreadcrum = () => {
    navigate("/manufacturer/orders/"); // Make sure the path matches your route setup
  };

  // Fetch order details
  const fetchOrderDetails = async () => {
    if (!id || !userId) return; // If id or userId is not available, do not proceed with the API call
    try {
      const categoryResponse = await axios.get(
        `${process.env.REACT_APP_IP}getorderDetails/?order_id=${id}&manufacture_unit_id=${userId}&`
      );
      console.log("Order details fetched:", categoryResponse.data);
      setOrderDetails(categoryResponse.data.data.order_obj); // Set the fetched data to state
      setLoading(false); // Set loading state to false once data is fetched
    } catch (error) {
      console.error("Error fetching order details:", error);
      setLoading(false); // Set loading state to false in case of an error
    }
  };

  useEffect(() => {
    fetchOrderDetails();
  }, [id, userId]);

  const generateInvoice = () => {
    const element = document.getElementById("invoice");
    html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
    }).then((canvas) => {
      const pdf = new jsPDF("p", "mm", "a4");
      const imgData = canvas.toDataURL("image/png");
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Invoice_${orderDetails.order_id}.pdf`);
    });
  };

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      // Filter products excluding those with "Shipped" status
      const filteredProducts = orderDetails.product_list.filter(
        (product) => product.product_status !== "Shipped"
      );

      // Get the IDs and indices of the filtered products
      const allProductIds = filteredProducts.map((product) => product.id);
      const selectedRows = filteredProducts.map((product) =>
        orderDetails.product_list.indexOf(product)
      );

      setSelectedRows(selectedRows); // Select rows by index
      setSelectedProductIds(allProductIds); // Store filtered product IDs in state
    } else {
      // Deselect all
      setSelectedRows([]);
      setSelectedProductIds([]);
    }
  };

  const handleRowSelect = (index) => {
    const productId = orderDetails.product_list[index]?.id; // Get product ID of the selected row
    if (selectedRows.includes(index)) {
      // Deselect row
      setSelectedRows(selectedRows.filter((rowIndex) => rowIndex !== index));
      setSelectedProductIds(
        selectedProductIds.filter((id) => id !== productId)
      );
    } else {
      // Select row
      setSelectedRows([...selectedRows, index]);
      setSelectedProductIds([...selectedProductIds, productId]);
    }
  };

  useEffect(() => {
    console.log("Selected Product IDs handleSelectAll:", selectedProductIds);
  }, [selectedProductIds]);

  const notifyBuyerForAvailableProducts = async () => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_IP}notifyBuyerForAvailableProductsInOrder/`,
        {
          order_id: id,
          user_cart_item_ids: selectedProductIds,
        }
      );
      console.log("Notification sent successfully:", response.data);
      await fetchOrderDetails();
      setSelectedRows([]);
      setSelectedProductIds([]);
    } catch (error) {
      console.error("Error sending notification:", error);
      // Handle error (e.g., show an error message)
    }
  };

  // Return loading state if orderDetails is not yet available
  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>

<Button
      startIcon={<ArrowBackIcon />}
      onClick={() => navigate(-1)}  // Use navigate(-1) instead of history.goBack()
      variant="text"
      sx={{ textTransform: 'capitalize', margin: "20px 20px 0px 20px", }}
    >
      Back to Orders
    </Button>
    
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          padding: "20px 20px 0px 20px",
        }}
      >
        <Box>
     

          <Button
            variant="outlined"
            onClick={generateInvoice}
            color="primary"
            sx={{ marginRight: 2, marginBottom: 2 }}
          >
            Purchase Order
          </Button>

          <Button
            disabled
            variant="outlined"
            color="primary"
            sx={{ marginRight: 2, marginBottom: 2 }}
          >
            Track Order
          </Button>
          <Button
            disabled
            variant="outlined"
            color="primary"
            sx={{ marginRight: 2, marginBottom: 2 }}
          >
            Reject order
          </Button>
          <Button
            disabled
            variant="outlined"
            color="primary"
            sx={{ marginRight: 2, marginBottom: 2 }}
          >
            Lead time
          </Button>
          <Button
            disabled
            variant="outlined"
            color="primary"
            sx={{ marginRight: 2, marginBottom: 2 }}
          >
            Fulfilment
          </Button>
        </Box>

        <Box>
          <Box>
            {/* Conditionally render radio buttons based on payment status */}
            {orderDetails?.payment_status === "Paid" && (
              <Box>
                <Typography variant="subtitle1" fontWeight="bold" mb={1}>
                  Update Payment Status
                </Typography>
                <RadioGroup
                  row
                  value={action} // Bind the value of the radio group to the state variable 'action'
                  onChange={(e) => handleOpenDialog(e.target.value)} // Update state when radio button changes
                >
                  <FormControlLabel
                    value="Accept" // Value of the radio button
                    control={<Radio sx={{ color: "green" }} />} // Radio button with green color
                    label="Accept" // Label for the radio button
                    sx={{ color: "green" }}
                  />
                  <FormControlLabel
                    value="Reject" // Value of the radio button
                    control={<Radio sx={{ color: "red" }} />} // Radio button with red color
                    label="Reject" // Label for the radio button
                    sx={{ color: "red" }}
                  />
                </RadioGroup>
              </Box>
            )}
          </Box>

          {/* Confirmation Dialog */}
          <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
            <DialogTitle>
              {action === "Accept"
                ? "Confirm Accept Order"
                : "Confirm Reject Order"}
            </DialogTitle>
            <DialogContent>
              Are you sure you want to{" "}
              <strong>
                {action === "Accept" ? "accept" : "reject"} this Payment?
              </strong>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDialogOpen(false)} color="primary">
                Cancel
              </Button>
              <Button
                onClick={handleConfirm}
                color={action === "Accept" ? "success" : "error"}
                variant="contained"
              >
                {action === "Accept" ? "Accept" : "Reject"}
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      </Box>
      <div id="invoice" style={{ padding: "20px" }}>
        <Box mb={3}>
          <Grid container spacing={3}>
            {/* Order Summary */}
            <Grid item xs={12} sm={6}>
              <Card
                sx={{
                  height: "350px",
                  overflowY: "auto", // Default to auto
                  ...(350 > 350 && { overflowY: "scroll" }), // Example logic, replace 350 > 350 with actual condition
                  "&::-webkit-scrollbar": {
                    width: "3px", // Scrollbar width
                  },
                  "&::-webkit-scrollbar-thumb": {
                    backgroundColor: "#888", // Thumb color
                    borderRadius: "10px", // Rounded scrollbar thumb
                  },
                  "&::-webkit-scrollbar-thumb:hover": {
                    backgroundColor: "#555", // Hover effect
                  },
                }}
              >
                <CardContent>
                  <Typography
                    sx={{ fontSize: "16px" }}
                    fontWeight="bold"
                    mb={2}
                  >
                    Dealer Information
                  </Typography>
                  <Divider sx={{ my: 1 }} />
                  <Typography sx={{ fontSize: "14px" }}>
                    <strong>Order ID: </strong>
                    {orderDetails?.order_id}
                  </Typography>
                  <Typography sx={{ fontSize: "14px" }}>
                    <strong>Buyer Name:: </strong>
                    {orderDetails?.name}
                  </Typography>
                  <Typography sx={{ fontSize: "14px" }}>
                    <strong>Email: </strong>
                    {orderDetails?.email}
                  </Typography>
                  <Typography sx={{ fontSize: "14px" }}>
                    <strong>Mobile: </strong>
                    {orderDetails?.mobile_number}
                  </Typography>
                  <Typography sx={{ fontSize: "14px" }}>
                    <strong>Order Date: </strong>
                    {new Date(orderDetails?.placed_on).toLocaleString()}
                  </Typography>
                  <Typography sx={{ fontSize: "14px" }}>
                    <strong>Total Items: </strong>
                    {orderDetails?.total_items}
                  </Typography>
                  <Typography sx={{ fontSize: "14px" }}>
                    <strong>Order Value: </strong>
                    {orderDetails?.currency}
                    {orderDetails?.total_amount}
                  </Typography>
                  <Typography sx={{ fontSize: "14px" }}>
                    <strong>Delivery Status: </strong>
                    {orderDetails?.delivery_status}
                  </Typography>
                  <Typography sx={{ fontSize: "14px" }}>
                    <strong>Payment Status: </strong>
                    {orderDetails?.payment_status}
                  </Typography>
                  <Typography sx={{ fontSize: "14px" }}>
                    <strong>Fulfilled Status: </strong>
                    {orderDetails?.fulfilled_status}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/*  Transaction History */}
            <Grid item xs={12} sm={6}>
              <Card
                sx={{
                  height: "350px",
                  overflowY: "auto", // Default to auto
                  ...(350 > 350 && { overflowY: "scroll" }), // Example logic, replace 350 > 350 with actual condition
                  "&::-webkit-scrollbar": {
                    width: "3px", // Scrollbar width
                  },
                  "&::-webkit-scrollbar-thumb": {
                    backgroundColor: "#888", // Thumb color
                    borderRadius: "10px", // Rounded scrollbar thumb
                  },
                  "&::-webkit-scrollbar-thumb:hover": {
                    backgroundColor: "#555", // Hover effect
                  },
                }}
              >
                <CardContent>
                  <Typography
                    variant="h6"
                    fontWeight="bold"
                    sx={{ fontSize: "16px" }}
                    mb={2}
                  >
                    Transaction History
                  </Typography>
                  <Divider sx={{ my: 1 }} />
                  <List sx={{ p: 0 }}>
                    {orderDetails?.transaction_list?.length > 0 ? (
                      orderDetails.transaction_list.map(
                        (transaction, index) => (
                          <ListItem key={index} sx={{ p: 0, mb: 2 }}>
                            <Box sx={{ width: "100%" }}>
                              <Typography
                                sx={{ fontSize: "14px" }}
                              >{`Transaction ${index + 1}`}</Typography>
                              <Typography sx={{ fontSize: "14px" }}>
                                <strong>Payment Date: </strong>
                                {new Date(
                                  transaction.transaction_date
                                ).toLocaleString()}
                              </Typography>
                              <Typography sx={{ fontSize: "14px" }}>
                                <strong>Status: </strong>
                                {transaction.status}
                              </Typography>
                              <Typography sx={{ fontSize: "14px" }}>
                                <strong>Payment Reviewed Date: </strong>
                                {new Date(
                                  transaction.updated_date
                                ).toLocaleString()}
                              </Typography>
                              <Typography sx={{ fontSize: "14px" }}>
                                <strong>Payment Proof: </strong>
                                <div>
                                  <Tooltip title="Click to Preview" arrow>
                                    <img
                                      src={`data:image/png;base64,${transaction.payment_proof}`}
                                      alt="Payment Proof"
                                      className="thumbnail"
                                      style={{
                                        width: 50,
                                        height: 50,
                                        cursor: "pointer",
                                        objectFit: "contain",
                                        border: "1px solid lightgray",
                                        borderRadius: "5px",
                                      }}
                                      onClick={() =>
                                        handlePreview(
                                          `data:image/png;base64,${transaction.payment_proof}`
                                        )
                                      }
                                    />
                                  </Tooltip>
                                </div>
                              </Typography>
                            </Box>
                          </ListItem>
                        )
                      )
                    ) : (
                      <ListItem>
                        <ListItemText primary="No Data Found" />
                      </ListItem>
                    )}
                  </List>
                </CardContent>
              </Card>

              {/* Modal for Image Preview */}
              <Modal open={isModalOpen} onClose={handleClose}>
                <Box
                  sx={{
                    backgroundColor: "white",
                    p: 2,
                    m: 2,
                    borderRadius: "5px",
                    height: "80vh",
                    width: "80vh",
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",

                    outline: "none",
                  }}
                >
                  {previewImage && (
                    <Box>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        {/* Download Icon */}
                        <Tooltip title="Download Image">
                          <IconButton
                            component="a"
                            href={previewImage}
                            download={`Payment_Proof_${new Date().toISOString()}.png`}
                            color="primary"
                          >
                            <DownloadIcon />
                          </IconButton>
                        </Tooltip>

                        {/* Close Icon */}
                        <IconButton onClick={handleClose}>
                          <CloseIcon />
                        </IconButton>
                      </Box>

                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <img
                          src={previewImage}
                          alt="Preview"
                          style={{
                            maxWidth: "100%",
                            maxHeight: "80vh",
                            marginBottom: 16,
                          }}
                        />
                      </Box>
                    </Box>
                  )}
                </Box>
              </Modal>
            </Grid>
          </Grid>
        </Box>

        <Box
          display="flex"
          alignItems="center"
          gap={12}
          flexWrap="wrap"
          mb={3}
          mt={3}
        >
          <Typography variant="body2">
            Paid on:{" "}
            {orderDetails?.paid_on
              ? new Date(orderDetails?.paid_on).toLocaleString()
              : "Not Paid"}
          </Typography>
          <Typography variant="body2">
            Placed on:{" "}
            {orderDetails?.placed_on
              ? new Date(orderDetails?.placed_on).toLocaleString()
              : "Not Available"}
          </Typography>
          <Typography variant="body2">
            Updated:{" "}
            {orderDetails?.updated
              ? new Date(orderDetails?.updated).toLocaleString()
              : "Not Available"}
          </Typography>
        </Box>

        <Box sx={{ marginTop: "20px" }}>
          <Card>
            <CardContent>
              <Typography sx={{ fontSize: "16px" }} fontWeight="bold">
                Billing Address
              </Typography>
              <Typography sx={{ fontSize: "14px" }}>
                {orderDetails?.billing_address.street},{" "}
                {orderDetails?.billing_address.city},{" "}
                {orderDetails?.billing_address.state},{" "}
                {orderDetails?.billing_address.zipCode},{" "}
                {orderDetails?.billing_address.country}
              </Typography>
              <Divider sx={{ my: 1 }} />
              <Typography sx={{ fontSize: "16px" }} fontWeight="bold">
                Shipping Address
              </Typography>
              <Typography sx={{ fontSize: "14px" }}>
                {orderDetails?.shipping_address.shipping_address.street},{" "}
                {orderDetails?.shipping_address.shipping_address.city},{" "}
                {orderDetails?.shipping_address.shipping_address.state},{" "}
                {orderDetails?.shipping_address.shipping_address.zipCode},{" "}
                {orderDetails?.shipping_address.shipping_address.country}
              </Typography>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ marginTop: "52px" }}>
          <Box
            display={"flex"}
            justifyContent={"space-between"}
            alignItems={"center"}
          >
            <Typography variant="h6" fontWeight="bold" mb={2}>
              Order Summary
            </Typography>
            <Button
              onClick={notifyBuyerForAvailableProducts}
              variant="contained"
              color="primary"
              sx={{ marginRight: 2, marginBottom: 2 }}
              disabled={
                selectedProductIds.length === 0 ||
                orderDetails?.fulfilled_status === "Fulfilled"
              }
            >
              Order Fulfillment
            </Button>
          </Box>

          <Paper variant="outlined">
            {/* Populate order items if available */}
            {orderDetails?.product_list.length > 0 ? (
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <Checkbox
                        checked={
                          selectedRows.length ===
                            orderDetails.product_list.filter(
                              (product) => product.product_status !== "Shipped"
                            ).length &&
                          orderDetails?.fulfilled_status !== "Fulfilled" // Ensure it's unchecked when "Fulfilled"
                        }
                        onChange={handleSelectAll}
                        indeterminate={
                          selectedRows.length > 0 &&
                          selectedRows.length <
                            orderDetails.product_list.filter(
                              (product) => product.product_status !== "Shipped"
                            ).length &&
                          orderDetails?.fulfilled_status !== "Fulfilled" // Ensure indeterminate is active only when not "Fulfilled"
                        }
                        disabled={
                          orderDetails?.fulfilled_status === "Fulfilled"
                        } // Disable the checkbox when "Fulfilled"
                      />
                    </TableCell>
                    <TableCell>Product Thumbnail</TableCell>
                    <TableCell>Product Name</TableCell>
                    <TableCell>SKU</TableCell>
                    <TableCell>Quantity</TableCell>
                    <TableCell>Brand Name</TableCell>
                    <TableCell>Price</TableCell>
                    <TableCell>Total</TableCell>
                    <TableCell>Product status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {orderDetails.product_list.map((product, index) => (
                    <TableRow key={index} selected={isRowSelected(index)}>
                      <TableCell>
                        <Checkbox
                          checked={isRowSelected(index)}
                          onChange={() => handleRowSelect(index)}
                          disabled={product.product_status === "Shipped"}
                        />
                      </TableCell>
                      <TableCell>
                        <img
                          src={product?.primary_image}
                          alt={product?.product_name}
                          width={50}
                          height={50}
                        />
                      </TableCell>
                      <Tooltip title={product.product_name} arrow>
                        <TableCell
                          sx={{
                            maxWidth: "200px",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {product?.product_name}
                        </TableCell>
                      </Tooltip>
                      <TableCell>{product?.sku_number}</TableCell>
                      <TableCell>{product?.quantity}</TableCell>
                      <TableCell>{product?.brand_name}</TableCell>
                      <TableCell>
                        {product?.currency}
                        {product?.price}
                      </TableCell>
                      <TableCell>
                        {product?.currency}
                        {product?.total_price}
                      </TableCell>
                      <TableCell>{product?.product_status}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <Typography variant="body1">
                No products in this order.
              </Typography>
            )}
          </Paper>
        </Box>

        <Box mt={2} mb={2}>
          <Typography class="para" variant="body1">
            Free Shipping
          </Typography>
          <Typography class="para">
            Subtotal: $ <span>{orderDetails?.total_amount}</span>
          </Typography>
          <Typography class="para" variant="body1">
            Shipping Handling: $0.00
          </Typography>
          <Typography class="para" variant="body1">
            Tax Amount: 10%
          </Typography>
          <Typography variant="body1" fontWeight="bold">
            Total: ${(orderDetails?.total_amount * 1.1).toFixed(2)}
          </Typography>
        </Box>
      </div>
    </Box>
  );
};

export default OrderDetail;
