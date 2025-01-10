import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Divider,
  Paper,
  Box,
  Table,
  TableCell,
  TableHead,
  TableBody,
  TableRow,
  List,
  ListItem,
  ListItemText,
  Modal,
  IconButton,
  Tooltip,  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle 
} from "@mui/material";
import { useLocation } from "react-router-dom";
import axios from "axios";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import DownloadIcon from "@mui/icons-material/Download";
import CloseIcon from "@mui/icons-material/Close";

const getButtonStyles = (paymentStatus) => {
  if (paymentStatus === "Paid" || paymentStatus === "Completed") {
    return {
      pointerEvents: "none",
      cursor: "not-allowed",
      borderColor: "lightgray",
      color: "rgba(0, 0, 0, 0.26)",
    };
  }
  return {};
};

const OrderDetailPage = () => {
  const navigate = useNavigate();
  const [orderDetails, setOrderDetails] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReorderSuccess, setIsReorderSuccess] = useState(false);
  const [isReorderError, setIsReorderError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isReorderDialogOpen, setIsReorderDialogOpen] = useState(false);

  const userData = localStorage.getItem("user");
  const userId = userData ? JSON.parse(userData).manufacture_unit_id : "";
  const location = useLocation();
  const orderId = location.state?.orderId;

  const handlePreview = (image) => {
    setPreviewImage(image);
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setPreviewImage(null);
  };

  // Fetch order details
  const fetchOrderDetails = async () => {
    try {
      const categoryResponse = await axios.get(
        `${process.env.REACT_APP_IP}getorderDetails/?order_id=${orderId}&manufacture_unit_id=${userId}&`
      );
      setOrderDetails(categoryResponse.data.data.order_obj); // Set the fetched data to state
      setLoading(false);
    } catch (error) {
      console.error("Error fetching order details:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId, userId]);

   // Handler to open the confirmation dialog
   const handleReorderClick = () => {
    setIsReorderDialogOpen(true);
  };

  // Handler to close the confirmation dialog
  const handleReorderCancel = () => {
    setIsReorderDialogOpen(false);
  };

  const handleReorder = async () => {
    setIsReorderDialogOpen(false);
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_IP}createReorder/`,
        {
          order_id: orderId,
        }
      );
      if (response.status === 200) {
        setIsReorderSuccess(true);
        navigate("/dealer/checkoutRedirect");
      }
    } catch (error) {
      console.error("Reorder API error:", error);
      setIsReorderError(true);
    }
  };

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

  const handlePayment = (orderId) => {
    console.log("PaymentConfirm ID: ", orderId);
    navigate("/dealer/paymentConfirm", { state: { orderId } });
  };

  // Return loading state if orderDetails is not yet available
  if (loading) {
    return <Typography variant="h6">Loading...</Typography>;
  }

  const {
    order_id,
    name,
    email,
    mobile_number,
    delivery_status,
    fulfilled_status,
    payment_status,
    placed_on,
    billing_address,
    shipping_address,
    total_items,
    total_amount,
    currency,
  } = orderDetails;

  return (
    <div>
      <Box sx={{ m: 1 }}>
        <Button
          variant="outlined"
          onClick={generateInvoice}
          color="primary"
          sx={{ m: 1 }}
        >
          Download Invoice
        </Button>
        <Button
          variant="outlined"
          color="primary"
          sx={{
            m: 1,
            ...getButtonStyles(orderDetails.payment_status),
          }}
          onClick={() => handlePayment(orderDetails.id)}
          disabled={
            orderDetails.payment_status === "paid" ||
            orderDetails.payment_status === "completed"
          }
        >
          Confirm Payment
        </Button>
        <Button disabled variant="outlined" color="primary" sx={{ m: 1 }}>
          Track Order
        </Button>
        <Button
          // onClick={handleReorder}
          onClick={handleReorderClick}
          variant="outlined"
          color="primary"
          sx={{ m: 1 }}
        >
          Reorder
        </Button>
        <Button disabled variant="outlined" color="primary" sx={{ m: 1 }}>
          Return
        </Button>
      </Box>

      <div id="invoice" style={{ padding: "20px" }}>
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
                  backgroundColor: "#888", // </div>Thumb color
                  borderRadius: "10px", // Rounded scrollbar thumb
                },
                "&::-webkit-scrollbar-thumb:hover": {
                  backgroundColor: "#555", // Hover effect
                },
              }}
            >
              <CardContent>
                <Typography sx={{ fontSize: "16px" }} fontWeight="bold" mb={2}>
                  Order Summary
                </Typography>
                <Divider sx={{ my: 1 }} />
                <Typography sx={{ fontSize: "14px" }}>
                  <strong>Order ID: </strong>
                  {order_id}
                </Typography>
                <Typography sx={{ fontSize: "14px" }}>
                  <strong>Customer Name: </strong>
                  {name}
                </Typography>
                <Typography sx={{ fontSize: "14px" }}>
                  <strong>Email: </strong>
                  {email}
                </Typography>
                <Typography sx={{ fontSize: "14px" }}>
                  <strong>Mobile: </strong>
                  {mobile_number}
                </Typography>
                <Typography sx={{ fontSize: "14px" }}>
                  <strong>Order Date: </strong>
                  {new Date(placed_on).toLocaleString()}
                </Typography>
                <Typography sx={{ fontSize: "14px" }}>
                  <strong>Total Items: </strong>
                  {total_items}
                </Typography>
                <Typography sx={{ fontSize: "14px" }}>
                  <strong>Order Value: </strong>
                  {currency}
                  {total_amount}
                </Typography>
                <Typography sx={{ fontSize: "14px" }}>
                  <strong>Delivery Status: </strong>
                  {delivery_status}
                </Typography>
                <Typography sx={{ fontSize: "14px" }}>
                  <strong>Payment Status: </strong>
                  {payment_status}
                </Typography>
                <Typography sx={{ fontSize: "14px" }}>
                  <strong>Fulfilled Status: </strong>
                  {fulfilled_status}
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
                  sx={{ fontSize: "16px" }}
                  variant="h6"
                  fontWeight="bold"
                  mb={2}
                >
                  Transaction History
                </Typography>
                <Divider sx={{ my: 1 }} />
                <List sx={{ p: 0 }}>
                  {orderDetails?.transaction_list?.length > 0 ? (
                    orderDetails.transaction_list.map((transaction, index) => (
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
                    ))
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
                      sx={{ display: "flex", justifyContent: "space-between" }}
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

        <Box sx={{ marginTop: "20px" }}>
          <Card>
            <CardContent>
              <Typography sx={{ fontSize: "16px" }} fontWeight="bold">
                Billing Address
              </Typography>
              <Typography sx={{ fontSize: "14px" }}>
                {billing_address.street}, {billing_address.city},{" "}
                {billing_address.state}, {billing_address.zipCode},{" "}
                {billing_address.country}
              </Typography>
              <Divider sx={{ my: 1 }} />
              <Typography sx={{ fontSize: "16px" }} fontWeight="bold">
                Shipping Address
              </Typography>
              <Typography sx={{ fontSize: "14px" }}>
                {shipping_address.shipping_address.street},{" "}
                {shipping_address.shipping_address.city},{" "}
                {shipping_address.shipping_address.state},{" "}
                {shipping_address.shipping_address.zipCode},{" "}
                {shipping_address.shipping_address.country}
              </Typography>
            </CardContent>
          </Card>
        </Box>

        {/* Order Items */}
        <Box sx={{ marginTop: "20px" }}>
          <Paper variant="outlined">
            {/* Populate order items if available */}
            {orderDetails?.product_list.length > 0 ? (
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Product Thumbnail</TableCell>
                    <TableCell>SKU</TableCell>
                    <TableCell>Quantity</TableCell>
                    <TableCell>Product Name</TableCell>
                    <TableCell>Brand Name</TableCell>
                    <TableCell>Price</TableCell>
                    <TableCell>Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {orderDetails.product_list.map((product, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        {" "}
                        <img
                          src={product?.primary_image}
                          alt={product?.product_name}
                          width={50}
                          height={50}
                        />
                      </TableCell>
                      <TableCell>{product?.sku_number}</TableCell>
                      <TableCell>{product?.quantity}</TableCell>
                      <TableCell sx={{ width: "180px" }}>
                        {product?.product_name}
                      </TableCell>
                      <TableCell>{product?.brand_name}</TableCell>
                      <TableCell>
                        {product?.currency}
                        {product?.price}
                      </TableCell>
                      <TableCell>
                        {product?.currency}
                        {product?.total_price}
                      </TableCell>
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
          <Typography variant="body1">Free Shipping</Typography>
          <Typography variant="body1">
            Subtotal: ${orderDetails?.total_amount}
          </Typography>
          <Typography variant="body1">Shipping Handling: $0.00</Typography>
          <Typography variant="body1">Tax Amount: 10%</Typography>
          <Typography variant="h5" fontWeight="bold">
            Total: ${(orderDetails?.total_amount * 1.1).toFixed(2)}
          </Typography>
        </Box>
      </div>


      <Dialog
        open={isReorderDialogOpen}
        onClose={handleReorderCancel}
      >
        <DialogTitle>Confirm Reorder</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to reorder this order? A new order will be placed.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleReorderCancel} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleReorder} color="primary">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reorder Error Modal */}
      <Modal
        open={isReorderError}
        onClose={() => setIsReorderError(false)}
        aria-labelledby="reorder-error-title"
      >
        <Box
          sx={{
            p: 3,
            backgroundColor: "white",
            borderRadius: 2,
            textAlign: "center",
            m: "auto",
            mt: "15vh",
            width: 300,
          }}
        >
          <Typography id="reorder-error-title" variant="h6" color="error">
            Failed to place order!
          </Typography>
          <Button
            variant="contained"
            color="primary"
            sx={{ mt: 2 }}
            onClick={() => setIsReorderError(false)}
          >
            Close
          </Button>
        </Box>
      </Modal>
    </div>
  );
};

export default OrderDetailPage;
