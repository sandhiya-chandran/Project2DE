import React, { useState, useEffect } from 'react';
import { useLocation , useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Box, Button, Container, Divider, Paper, TextField, Typography, Grid } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledButton = styled(Button)({
  marginTop: '16px',
});

function PaymentConfirmationPage() {
  const navigate = useNavigate();
  const [isPaymentConfirmed, setIsPaymentConfirmed] = useState(false);
  const [file, setFile] = useState(null);
  const [transactionId, setTransactionId] = useState('');
  const [message, setMessage] = useState('');
  const [fileError, setFileError] = useState('');
  const [formError, setFormError] = useState('');
  const [manufactureBankDetails, setManufactureBankDetails] = useState(null);
  const userData = localStorage.getItem("user");
  const location = useLocation();
  const orderId = location.state?.orderId;

  useEffect(() => {
    const fetchManufactureBankDetails = async () => {
      try {
        const manufacture_unit_id = userData ? JSON.parse(userData).manufacture_unit_id : null;
        if (manufacture_unit_id) {
          const response = await axios.get(
            `${process.env.REACT_APP_IP}getManufactureBankDetails/?manufacture_unit_id=${manufacture_unit_id}`
          );
          setManufactureBankDetails(response.data.data.user_obj);
        }
      } catch (error) {
        console.error("Error fetching user details:", error);
      }
    };
    fetchManufactureBankDetails();
  }, [userData]);

  const handleConfirmPayment = async () => {
    if (!file || !transactionId) {
      setFormError("Please upload payment proof and enter transaction ID before confirming payment.");
      return;
    }
  
    try {
      console.log("Attempting to confirm payment...");
      const userId = userData ? JSON.parse(userData).id : null;
  
      const messageToSend = message.trim() === '' ? 'Nil' : message;
      const base64File = await convertFileToBase64(file);
      console.log("File converted to base64 successfully.");
  
      const bodyData = {
        user_id: userId,
        order_id: orderId,
        payment_proof: base64File,
        message: messageToSend,
        transaction_id: transactionId,
      };
  
      console.log("Sending POST request with bodyData:", bodyData);
  
      const response = await axios.post(
        `${process.env.REACT_APP_IP}conformPayment/`,
        bodyData
      );
  
      console.log("Received response:", response);
  
      // Check if status is true
      if (response.status === 200 && response.data.status === true) {
        console.log("Payment confirmed successfully, showing thank-you message...");
        
        // Show thank-you message
        setIsPaymentConfirmed(true);
      } else {
        const errorMessage = response.data.is_saved || "There was an error processing your payment. Please try again.";
        console.log("Payment confirmation failed:", errorMessage);
        setFormError(errorMessage);
      }
    } catch (error) {
      console.error("Error confirming payment:", error);
      setFormError("There was an error confirming your payment. Please try again.");
    }
  };
  
  const handleFileUpload = (event) => {
    const uploadedFile = event.target.files[0];
    const maxSizeInMB = 1;
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;

    if (uploadedFile && uploadedFile.size > maxSizeInBytes) {
      setFileError(`File size should not exceed ${maxSizeInMB} MB.`);
      setFile(null);
    } else {
      setFileError('');
      setFile(uploadedFile);
    }
  };

  const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result.split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper sx={{ p: 4 }}>
        {!isPaymentConfirmed ? (
          <>
            <Typography variant="h4" gutterBottom align="center">
              Payment Confirmation
            </Typography>
            <Divider sx={{ my: 2 }} />

            <Grid container spacing={4}>
              {/* Left column - Payment Info */}
              <Grid item xs={12} md={6}>
                <Box>
                  <Typography variant="body1">
                    <strong>Name:</strong> {manufactureBankDetails ? `${manufactureBankDetails.first_name} ${manufactureBankDetails.last_name}` : 'N/A'}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Bank Name:</strong> {manufactureBankDetails?.bank_details?.bank_name || 'N/A'}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Account Number:</strong> {manufactureBankDetails?.bank_details?.account_number || 'N/A'}
                  </Typography>
                  <Typography variant="body1">
                    <strong>IFSC Code:</strong> {manufactureBankDetails?.bank_details?.ifsc_code || 'N/A'}
                  </Typography>
                  <Typography variant="body1">
                    <strong>SWIFT Code:</strong> {manufactureBankDetails?.bank_details?.swift_code || 'N/A'}
                  </Typography>
                  <Typography variant="body1">
                    <strong>IBAN:</strong> {manufactureBankDetails?.bank_details?.iban || 'N/A'}
                  </Typography>
                  <Typography variant="body1" gutterBottom sx={{ marginTop: '20px', fontWeight: 200 , fontSize:'12px', marginRight:'20px' }}>
                    Note: Your order is confirmed. Kindly make the payment to the bank details provided above and upload the payment proof to confirm your payment. If you choose to pay later, you can use the "Order View" to upload your payment proof and confirm your payment. Please note that shipping will only be initiated once the payment is confirmed and verified.
                  </Typography>
                </Box>
              </Grid>

              {/* Right column - Form */}
              <Grid item xs={12} md={6}>
                <Typography variant="h6">Upload Payment Proof</Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                  Please upload a screenshot or image of your payment confirmation (Max size: 1MB).
                </Typography>

                <TextField
                  type="file"
                  onChange={handleFileUpload}
                  fullWidth
                  sx={{ mb: 2 }}
                  inputProps={{ accept: 'image/*' }}
                />
                {fileError && (
                  <Typography color="error" variant="body2" sx={{ mb: 2 }}>
                    {fileError}
                  </Typography>
                )}

                <TextField
                  label="Enter Transaction ID"
                  variant="outlined"
                  fullWidth
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  sx={{ mb: 2 }}
                />

                <TextField
                  label="Message (Optional)"
                  variant="outlined"
                  multiline
                  rows={4}
                  fullWidth
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  sx={{ mb: 2 }}
                />

                {formError && (
                  <Typography color="error" variant="body2" sx={{ mb: 2 }}>
                    {formError}
                  </Typography>
                )}

                <StyledButton
                  variant="contained"
                  color="primary"
                  fullWidth
                  onClick={handleConfirmPayment}
                >
                  Confirm Payment
                </StyledButton>
              </Grid>
            </Grid>
          </>
        ) : (
          <Box textAlign="center">
            <Typography variant="h4" gutterBottom>
            Thank you for your payment!
            </Typography>
            <Typography variant="body1" sx={{fontSize:'14px'}}>
            Please check your registered email for a "Payment Received" notification. Your payment is currently under review, and we are working to verify it as quickly as possible. Once verified, you will receive a confirmation email. </Typography>
            <Button
        variant="contained"
        color="primary"
        onClick={() => navigate("/dealer/products")}
        sx={{marginTop:'20px'}}
      >
        Continue Shopping
      </Button>
          </Box>
        )}
      </Paper>
    </Container>
  );
}

export default PaymentConfirmationPage;
