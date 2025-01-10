import React, { useEffect, useState } from "react";
import {
  Grid,
  Card,
  Typography,
  CardContent,
  Paper,
  CircularProgress
} from "@mui/material";
import { Bar, Line } from "react-chartjs-2";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
} from "chart.js";

// Register chart components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

const ManufacturerHome = () => {
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [showAll, setShowAll] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [dealerOrderData, setDealerOrderData] = useState(null);
  const [loading, setLoading] = useState(true); // Set loading to true initially

  const dealers = dealerOrderData?.total_dealer_list || [];
  const displayedDealers = showAll ? dealers : dealers.slice(0, 5);

  const handleSeeMore = () => {
    setShowAll(!showAll);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userData = localStorage.getItem("user");
        const parsedUserData = userData ? JSON.parse(userData) : null;
        const manufactureUnitId = parsedUserData?.manufacture_unit_id;

        if (!parsedUserData || !manufactureUnitId) {
          throw new Error("Invalid or missing manufacture unit ID.");
        }

        const [dashboardResponse, dealerOrderResponse] = await Promise.all([
          axios.get(
            `${process.env.REACT_APP_IP}obtainDashboardDetailsForManufactureAdmin/?manufacture_unit_id=${manufactureUnitId}`
          ),
          axios.get(
            `${process.env.REACT_APP_IP}manufactureDashboardEachDealerOrderValue/?manufacture_unit_id=${manufactureUnitId}`
          ),
        ]);

        setDashboardData(dashboardResponse.data?.data || {});
        setDealerOrderData(dealerOrderResponse.data?.data || {});
      } catch (err) {
        console.error("Error fetching dashboard details:", err);
        setError(err.message || "Something went wrong while fetching data.");
      } finally {
        setLoading(false); // Set loading to false after data is fetched
      }
    };

    fetchData();
  }, []);

  const barChartData = {
    labels: dashboardData?.top_selling_brands?.map((item) => item.brand_name) || [],
    datasets: [
      {
        label: "No of products sold",
        data: dashboardData?.top_selling_brands?.map((item) => item.units_sold) || [],
        backgroundColor: "#42a5f5",
      },
    ],
  };

  const lineChartData = {
    labels: dashboardData?.top_selling_categorys?.map((item) => item.category_name) || [],
    datasets: [
      {
        label: "No of products sold",
        data: dashboardData?.top_selling_categorys?.map((item) => item.units_sold) || [],
        borderColor: "#ff7043",
        fill: false,
        tension: 0.1,
      },
    ],
  };

  // const chartOptions = {
  //   responsive: true,
  //   plugins: {
  //     legend: {
  //       position: "top",
  //     },
  //     title: {
  //       display: true,
  //       text: "No of products sold",
  //     },
  //   },
  // };

  

  const handleProductClick = (productId) => {
    if (!productId) {
      console.error("Invalid productId");
      return;
    }
    navigate(`/manufacturer/products/details/${productId}`);
  };

  const handlePendingClick = () => {
    navigate(`/manufacturer/orders?filter=Pending`);
  };

  const handleReorderClick = () => {
    navigate(`/manufacturer/orders?filter=yes`);
  };

  const handleActiveBuyerClick = () => {
    navigate(`/manufacturer/dealerList`);
  };

  const handleRowClick = (username) => {
    navigate(`/manufacturer/dealer-details/${username}`);
  };
  
  

  return (
    <Grid container spacing={3} sx={{ p: 3, marginBottom:'25px' }}>
      {loading ? (
        // Show loader while data is being fetched
        <Grid item xs={12} sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <CircularProgress />
        </Grid>
      ) : (
        <>
          {/* Sales Overview Cards */}
          <Grid item xs={12} sm={6} md={3}>
            <Card   sx={{ backgroundColor: "#ffffff", color: "#1565c0", textAlign: "center", p: 2 }}>
              <CardContent>
                <Typography sx={{ fontSize: "16px", fontWeight: 'bold' }} >Total Sales</Typography>
                <Typography sx={{ fontSize: "14px" }} >${dashboardData?.total_sales || "0"}</Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card onClick={() => handleActiveBuyerClick()}   sx={{ cursor:'pointer' , backgroundColor: "#ffffff", color: "#66bb6a", textAlign: "center", p: 2 }}>
              <CardContent>
                <Typography sx={{ fontSize: "16px", fontWeight: 'bold' }}  >Active Buyers</Typography>
                <Typography sx={{ fontSize: "14px" }} >{dashboardData?.dealer_count || "0"}</Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card onClick={() => handleReorderClick()} sx={{cursor:'pointer' , backgroundColor: "#ffffff", color: "#ffa726", textAlign: "center", p: 2 }}>
              <CardContent>
                <Typography sx={{ fontSize: "16px", fontWeight: 'bold' }} >Re-Orders</Typography>
                <Typography sx={{ fontSize: "14px" }} >{dashboardData?.re_order_count || "0"}</Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card onClick={() => handlePendingClick()} sx={{ cursor:'pointer' , backgroundColor: "#ffffff", color: "#ef5350", textAlign: "center", p: 2 }}>
              <CardContent>
                <Typography sx={{ fontSize: "16px", fontWeight: 'bold' }} >Pending Orders</Typography>
                <Typography sx={{ fontSize: "14px" }} >{dashboardData?.pending_order_count || "0"}</Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Graphs Section */}
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 2 }}>
              <Typography variant="h7" sx={{ mb: 2, fontWeight: "bold" }}>
                Top Selling Brands
              </Typography>
              <Bar data={barChartData}  />
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 2 }}>
              <Typography variant="h7" sx={{ mb: 2, fontWeight: "bold" }}>
                Top Selling Categories
              </Typography>
              <Line data={lineChartData}  />
            </Paper>
          </Grid>

          {/* Top Selling Products and Total Dealers Section */}
          <Grid container spacing={3} sx={{ margin: "0px" }}>
            {/* Top Selling Products Section */}
            <Grid item xs={12} md={9}>
              <Typography variant="h7" sx={{ mb: 2, fontWeight: "bold" }}>
                Top Selling Products
              </Typography>

              <Paper
                elevation={5}
                sx={{
                  p: 2, marginTop: '18px',
                  height: "300px",
                  overflowY: dashboardData?.top_selling_products?.length * 50 > 339 ? "scroll" : "auto",
                  "&::-webkit-scrollbar": {
                    width: "4px",
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
                <Grid container spacing={1}>
                  {dashboardData?.top_selling_products?.length > 0 ? (
                    dashboardData?.top_selling_products?.map((product) => (
                      <Grid item xs={3} sm={3} md={3} key={product.id}>
                        <Card
                           onClick={() => handleProductClick(product.product_id)}
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            p: 3,
                            width: "100px",
                            height: "110px",
                            position: "relative",
                            cursor:'pointer'
                          }}
                        >
                          {/* Brand Logo */}
                          {/* <img
                            src={product.brand_logo}
                            alt={`${product.brand_name} logo`}
                            style={{
                              width: "20px",
                              height: "20px",
                              position: "absolute",
                              top: "8px",
                              right: "8px",
                            }}
                          /> */}
                          <img
                            src={product.primary_image}
                            alt={product.sku_number}
                            style={{
                              width: "54px",
                              height: "54px",
                              objectFit: "contain",
                              marginBottom: "10px",
                            }}
                          />
                          <Typography variant="subtitle2" sx={{ fontSize: "12px", fontWeight: "bold", color: "text.secondary" }}>
                            {product.brand_name}
                          </Typography>
                          <Typography variant="body2" sx={{ fontSize: "10px", color: "text.secondary" }}>
                            SKU: {product.sku_number}
                          </Typography>
                          <Typography variant="body2" sx={{ fontSize: "10px" }}>
                            ${product.total_sales.toFixed(2)}
                          </Typography>
                          <Typography variant="body2" sx={{ fontSize: "10px" }}>
                            Units Sold: {product.units_sold}
                          </Typography>
                        </Card>
                      </Grid>
                    ))
                  ) : (
                    <Grid item xs={12}>
                      <Typography variant="body2" sx={{ color: "text.secondary", fontSize: "14px", textAlign: "center" }}>
                        No top selling products found.
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </Paper>
            </Grid>

            {/* Total Dealers Section */}
            <Grid item xs={12} md={3}>
              <Typography variant="h7" sx={{ mb: 2, fontWeight: "bold" }}>
                Top Buyers
              </Typography>

              <Paper
                elevation={5}
                sx={{
                  p: 2,
                  height: "300px", marginTop: '18px',  // Limiting the height of the scrollable area
                  overflowY: dealerOrderData?.total_dealer_list?.length * 50 > 339 ? "scroll" : "auto", // Show scroll only if content exceeds the max height
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
                  // For Firefox
                }}
                className="custom-scrollbar"
              >
                <Grid container spacing={2}>

                  {dealerOrderData?.total_dealer_list?.map((dealer) => (
                    <Grid item xs={12} sm={12} md={12} key={dealer.id}>
                      <Card sx={{ p: 2, overflow: "hidden" }} onClick={() => handleRowClick(dealer.id)}>

                        <Typography
                          variant="h6"
                          sx={{
                            fontSize: "14px",
                            fontWeight: "bold",
                            whiteSpace: "normal", // Allows wrapping
                            wordWrap: "break-word", // Breaks long words
                            overflow: "hidden", // Prevents overflow
                            textOverflow: "ellipsis", // Adds ellipsis for overflowed text
                          }}
                        >
                          {dealer.name}
                        </Typography>
                        <Typography variant="body2" sx={{ fontSize: "12px", color: "text.secondary" }}>
                          Order Value: ${dealer.order_value.toFixed(2)}
                        </Typography>
                      </Card>
                    </Grid>
                  ))}
                  {!dealerOrderData?.total_dealer_list?.length && (
                    <Typography sx={{ mt: 2, textAlign: "center", padding: '10px' }}>No dealers available.</Typography>
                  )}
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        </>
      )}
    </Grid>
  );
};

export default ManufacturerHome;
