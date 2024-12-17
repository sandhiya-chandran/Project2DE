import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Divider,
  Avatar, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Tooltip,
  Button
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const DealerDetail = () => {
  const { id } = useParams(); // Get dealer ID from the URL
  const navigate = useNavigate(); // For navigation
  const [dealerData, setDealerData] = useState(null); // State to hold dealer details
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state

  useEffect(() => {
    // Fetch dealer details
    const fetchDealerDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${process.env.REACT_APP_IP}obtainDealerDetails/?user_id=${id}`
        );
        setDealerData(response.data?.data);
      } catch (err) {
        setError(err.message || "Something went wrong while fetching data.");
      } finally {
        setLoading(false);
      }
    };

    fetchDealerDetails();
  }, [id]);

  if (loading) {
    return (
      <Box sx={{ padding: 3 }}>
        <Typography>Loading dealer details...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ padding: 3 }}>
        <Typography color="error">Error: {error}</Typography>
      </Box>
    );
  }

  const { user_details = {}, order_list = [] } = dealerData || {};

  return (
    <Box sx={{ padding: 3 }}>
      {/* Breadcrumb / Back Button */}
      <Button
        startIcon={<ArrowBackIcon />}
        variant="text"
        sx={{ marginBottom: 2, color: "primary.main", textTransform: "capitalize" }}
        onClick={() => navigate(-1)} // Go back to the previous page
      >
        Buyer / Buyer Details
      </Button>

      {/* Dealer Details Section */}
      <Card sx={{ marginBottom: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontSize: "16px", fontWeight: "bold" }}>
          Buyer Details
          </Typography>
          <Divider sx={{ my: 1 }} />
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography sx={{ fontSize: "14px", fontWeight: "bold" }}>Name:</Typography>
              <Typography sx={{ fontSize: "14px" }}>
                {`${user_details.first_name} ${user_details.last_name || ""}`}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography sx={{ fontSize: "14px", fontWeight: "bold" }}>Email:</Typography>
              <Typography sx={{ fontSize: "14px" }}>{user_details.email}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography sx={{ fontSize: "14px", fontWeight: "bold" }}>
                Mobile Number:
              </Typography>
              <Typography sx={{ fontSize: "14px" }}>{user_details.mobile_number}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography sx={{ fontSize: "14px", fontWeight: "bold" }}>Company:</Typography>
              <Typography sx={{ fontSize: "14px" }}>{user_details.company_name}</Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Order List Section */}
      {order_list.length > 0 ? (
        order_list.map((order) => (
          <Card
            key={order.order_id}
            sx={{
              marginBottom: 3,
              padding: 1, // Reducing padding for a more compact layout
            }}
          >
            <CardContent sx={{ paddingBottom: "4px" }}>
            

              <Box sx={{ justifyContent: 'space-between', display: 'flex', alignItems: 'center' , mb:1}}>
                <Box>
                <Typography variant="h6" sx={{ fontSize: "14px", fontWeight: "bold" }}>
                Order ID: {order.order_id}
              </Typography>
                </Box>
               <Box sx={{ justifyContent:'flex-end', display: 'flex', alignItems: 'center' }}>
               <Typography sx={{ fontSize: "12px", fontWeight: "bold" }}>Total Amount:</Typography>
                <Typography sx={{ fontSize: "12px", marginBottom: 0.5, marginLeft: 1 }}>
                  {order.amount}
                </Typography>
               </Box>
              </Box>


            

              <TableContainer component={Paper} sx={{ padding: 0 }}>
                <Table sx={{ minWidth: 650 }} aria-label="product table">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontSize: "12px" }}>Image</TableCell>
                      <TableCell sx={{ fontSize: "12px" }}>Product Name</TableCell>
                      <TableCell sx={{ fontSize: "12px" }}>Brand</TableCell>
                      <TableCell sx={{ fontSize: "12px" }}>SKU</TableCell>
                      <TableCell sx={{ fontSize: "12px" }}>MPN</TableCell>
                      <TableCell sx={{ fontSize: "12px" }}>Quantity</TableCell>
                      <TableCell sx={{ fontSize: "12px" }}>Price</TableCell>
                      <TableCell sx={{ fontSize: "12px" }}>Total</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {order.product_list.map((product) => (
                      <TableRow key={product.sku_number}>
                        <TableCell sx={{ padding: 1 }}>
                          <Avatar
                            variant="square"
                            src={product.primary_image}
                            alt={product.product_name}
                            sx={{ width: 40, height: 40 }} // Smaller avatar size
                          />
                        </TableCell>
                        <TableCell sx={{ padding: 1 }}>
                          <Tooltip title={product.product_name} arrow>
                            <Typography
                              sx={{
                                cursor: 'pointer',
                                fontSize: "12px",
                                fontWeight: "bold",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                maxWidth: "200px", // Adjusted width for compact layout
                              }}
                            >
                              {product.product_name}
                            </Typography>
                          </Tooltip>
                        </TableCell>
                        <TableCell sx={{ padding: 1 }}>
                          <Typography sx={{ fontSize: "12px" }}>{product.brand_name}</Typography>
                        </TableCell>
                        <TableCell sx={{ padding: 1 }}>
                          <Typography sx={{ fontSize: "12px" }}>{product.sku_number}</Typography>
                        </TableCell>
                        <TableCell sx={{ padding: 1 }}>
                          <Typography sx={{ fontSize: "12px" }}>{product.mpn_number}</Typography>
                        </TableCell>
                        <TableCell sx={{ padding: 1 }}>
                          <Typography sx={{ fontSize: "12px" }}>{product.quantity}</Typography>
                        </TableCell>
                        <TableCell sx={{ padding: 1 }}>
                          <Typography sx={{ fontSize: "12px" }}>
                            {product.price} {product.currency}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ padding: 1 }}>
                          <Typography sx={{ fontSize: "12px" }}>
                            {product.total_price} {product.currency}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>

          </Card>
        ))
      ) : (
        <Typography sx={{ fontSize: "12px", fontWeight: "bold", color: "text.secondary" }}>
          No orders available for this dealer.
        </Typography>
      )}

    </Box>
  );
};

export default DealerDetail;
