import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Grid,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent,
  CardHeader,
  Divider,CircularProgress
} from "@mui/material";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const DashboardHome = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true); // Added loading state

  // Fetch Dashboard Data from API
  const fetchDashboardData = async () => {
    try {
      console.log("Fetching data...");
      const response = await axios.get(
        `${process.env.REACT_APP_IP}obtainDashboardDetailsForDealer/?manufacture_unit_id=${user.manufacture_unit_id}&user_id=${user.id}`
      );
      setDashboardData(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && loading) {
      // Check if user exists and avoid re-triggering the effect
      fetchDashboardData();
    }
  }, [user, loading]);

  // Return loading state if data is not yet fetched
  if (loading || !dashboardData) {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh", // Full screen height
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // Analytics Data
  const analyticsData = [
    {
      title: "Total Spendings",
      value: `$${dashboardData.total_spend.toFixed(2) || '0'}`,
      color: "#4caf50",
    },
    {
      title: "Total Orders",
      value: dashboardData.total_order_count || '0',
      color: "#2196f3",
    },
    {
      title: "Pending Payments",
      value: dashboardData.pending_order_count || '0' ,
      color: "#f44336",
    },
    {
      title: "Re-Orders",
      value: dashboardData.re_order_count || '0',
      color: "#c522ff",
    },
  ];

  // Bar Chart Data for Top Selling Brands
  const barDataBrands = {
    labels: dashboardData.top_selling_brands.map((brand) => brand.brand_name),
    datasets: [
      {
        label: "Total Sales ($)",
        data: dashboardData.top_selling_brands.map(
          (brand) => brand.total_sales
        ),
        backgroundColor: "#2196f3",
      },
    ],
  };

  // Bar Chart Data for Top Selling Categories
  const barDataCategories = {
    labels: dashboardData.top_selling_categorys.map(
      (category) => category.category_name
    ),
    datasets: [
      {
        label: "Total Sales ($)",
        data: dashboardData.top_selling_categorys.map(
          (category) => category.total_sales
        ),
        backgroundColor: "#4caf50",
      },
    ],
  };

  return (
    <Box p={2}>
      {/* Analytics Section */}
      <Grid container spacing={3} mb={3}>
        {analyticsData.map((item, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Paper
              elevation={3}
              style={{
                padding: "16px",
                textAlign: "center",
                color: item.color,
              }}
            >
              <Typography variant="h6">{item.title}</Typography>
              <Typography variant="h5">{item.value}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Charts Section */}
      <Grid container spacing={3}>
        {/* Bar Chart for Top Selling Brands */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} style={{ padding: "16px" }}>
            <Typography variant="h6" gutterBottom>
              Top Selling Brands
            </Typography>
            <Bar data={barDataBrands} />
          </Paper>
        </Grid>

        {/* Bar Chart for Top Selling Categories */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} style={{ padding: "16px" }}>
            <Typography variant="h6" gutterBottom>
              Top Selling Categories
            </Typography>
            <Bar data={barDataCategories} />
          </Paper>
        </Grid>
      </Grid>

      {/* Top Selling Products Table */}
      <Grid container spacing={2}>
        <Grid item xs={12} md={8}>
          <Typography variant="h6" mt={3} mb={2}>
            Top Selling Products
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Product</TableCell>
                  <TableCell>SKU No</TableCell>
                  <TableCell>Brand</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Lastest Purchase</TableCell>
                  <TableCell>Units Sold</TableCell>
                  <TableCell>Total Sales ($)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>

              {dashboardData.top_selling_products.length > 0 ? (
  dashboardData.top_selling_products.map((product) => (
    <TableRow key={product.id}>
    <TableCell>
      <img
        src={product.primary_image}
        alt={product.sku_number}
        width="30"
      />
    </TableCell>
    <TableCell>{product.sku_number}</TableCell>
    <TableCell>
      <img
        src={product.brand_logo}
        alt={product.brand_name}
        width="15"
      />
    </TableCell>
    <TableCell>{product.category_name}</TableCell>
    <TableCell>
      {new Date(product.last_updated).toLocaleDateString()}
    </TableCell>
    <TableCell>{product.units_sold}</TableCell>
    <TableCell>{product.total_sales.toFixed(2)}</TableCell>
  </TableRow>
  ))
) : (
  <TableRow>
    <TableCell colSpan={7} style={{ textAlign: 'center' }}>
      No products found
    </TableCell>
  </TableRow>
)}

              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
        <Grid item xs={12} md={4}>
          <Typography variant="h6" mt={3} mb={2}>
            Your Recent Orders
          </Typography>
          <Grid container spacing={2}>
            {" "}
            {/* Adjusted spacing for consistency */}
            {dashboardData.recent_orders.length === 0 ? (
              <Grid item xs={12}>
                {" "}
                {/* Full-width card when no orders */}
                <Card sx={{ padding: "8px" }}>
                  <CardContent
                    sx={{
                      padding: 0,
                      "&:last-child": { paddingBottom: "0px" },
                    }}
                  >
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      sx={{ fontSize: "11px" }}
                    >
                      No Recent Orders available
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ) : (
              dashboardData.recent_orders.map((order) => (
                <Grid item xs={12} sm={6} md={6} key={order.id}>
                  {" "}
                  {/* 2 columns on small screens, 3 on medium */}
                  <Card sx={{ padding: "8px" }}>
                    <CardContent
                      sx={{
                        padding: 0,
                        "&:last-child": { paddingBottom: "0px" },
                      }}
                    >
                      <Typography
                        variant="body2"
                        color="black"
                        sx={{ fontSize: "14px" }}
                      >
                        {`Order #${order.order_id}`}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="textSecondary"
                        sx={{ fontSize: "11px" }}
                      >
                        Payment Status: {order.payment_status}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="textSecondary"
                        sx={{ fontSize: "11px" }}
                      >
                        Order Value: ${order.amount.toFixed(2)}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="textSecondary"
                        sx={{ fontSize: "11px" }}
                      >
                        Order Date:{" "}
                        {new Date(order.order_date).toLocaleDateString()}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="#1976d2"
                        sx={{ fontSize: "11px" , marginTop:'5px' , cursor: 'pointer' , fontWeight:500}}
                      >
                       Reorder
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))
            )}
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardHome;
