import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Box,
  Button,
  Container,
  Divider,
  Paper,
  TextField,
  Typography,
  Grid,
} from "@mui/material";
import { styled } from "@mui/material/styles";

const StyledButton = styled(Button)({
  marginTop: "16px",
});

function PaymentConfirmationPage() {
  const navigate = useNavigate();
  const [isPaymentConfirmed, setIsPaymentConfirmed] = useState(false);
  const [file, setFile] = useState(null);
  const [transactionId, setTransactionId] = useState("");
  const [message, setMessage] = useState("");
  const [fileError, setFileError] = useState("");
  const [formError, setFormError] = useState("");
  const [manufactureBankDetails, setManufactureBankDetails] = useState(null);
  const userData = localStorage.getItem("user");
  const location = useLocation();
  const orderId = location.state?.orderId;

  useEffect(() => {
    const fetchManufactureBankDetails = async () => {
      try {
        const manufacture_unit_id = userData
          ? JSON.parse(userData).manufacture_unit_id
          : null;
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
      setFormError(
        "Please upload payment proof and enter transaction ID before confirming payment."
      );
      return;
    }

    try {
      console.log("Attempting to confirm payment...");
      const userId = userData ? JSON.parse(userData).id : null;

      const messageToSend = message.trim() === "" ? "Nil" : message;
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
        console.log(
          "Payment confirmed successfully, showing thank-you message..."
        );

        // Show thank-you message
        setIsPaymentConfirmed(true);
      } else {
        const errorMessage =
          response.data.is_saved ||
          "There was an error processing your payment. Please try again.";
        console.log("Payment confirmation failed:", errorMessage);
        setFormError(errorMessage);
      }
    } catch (error) {
      console.error("Error confirming payment:", error);
      setFormError(
        "There was an error confirming your payment. Please try again."
      );
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
      setFileError("");
      setFile(uploadedFile);
    }
  };

  const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result.split(",")[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper sx={{ p: 4 }}>

          <Box>
          
          <Typography variant="body1">
             
              Please process the payment to <strong> {manufactureBankDetails
                ? `${manufactureBankDetails.first_name} ${manufactureBankDetails.last_name}`
                : "N/A"}</strong>
            </Typography>
            <Typography variant="body1">
              <strong>Name:</strong>{" "}
              {manufactureBankDetails
                ? `${manufactureBankDetails.first_name} ${manufactureBankDetails.last_name}`
                : "N/A"}
            </Typography>
            <Typography variant="body1">
              <strong>Bank Name:</strong>{" "}
              {manufactureBankDetails?.bank_details?.bank_name || "N/A"}
            </Typography>
            <Typography variant="body1">
              <strong>Account Number:</strong>{" "}
              {manufactureBankDetails?.bank_details?.account_number || "N/A"}
            </Typography>
            <Typography variant="body1">
              <strong>IFSC Code:</strong>{" "}
              {manufactureBankDetails?.bank_details?.ifsc_code || "N/A"}
            </Typography>
            <Typography variant="body1">
              <strong>SWIFT Code:</strong>{" "}
              {manufactureBankDetails?.bank_details?.swift_code || "N/A"}
            </Typography>
            <Typography variant="body1">
              <strong>IBAN:</strong>{" "}
              {manufactureBankDetails?.bank_details?.iban || "N/A"}
            </Typography>
           
          </Box>
          <Divider sx={{ my: 2 }} />
          <Typography variant="p" gutterBottom align="center">
            Your order is confirmed. Kindly make the payment to the bank details
            provided above and upload the payment proof to confirm your payment.
            If you choose to pay later, you can use the "Order View" to upload
            your payment proof and confirm your payment. Please note that
            shipping will only be initiated once the payment is confirmed and
            verified.
          </Typography>
         <Box>
         <Button
              variant="contained"
              color="primary"
              onClick={() => navigate("/dealer/orders")}
              sx={{ marginTop: "20px" }}
            >
              View Orders
            </Button>
         </Box>
       
      </Paper>
    </Container>
  );
}

export default PaymentConfirmationPage;
