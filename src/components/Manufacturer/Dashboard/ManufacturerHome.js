import React, { useEffect, useState } from "react";
import {
  Grid,
  Card,
  Typography,
  CardContent,
  Paper,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,MenuItem,
  Select,
  FormControl
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
  const [topSellingProducts, setTopSellingProducts] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [dashboardCategory, setDashboardCategory] = useState(null);
    
  const dealers = dealerOrderData?.total_dealer_list || [];
  const displayedDealers = showAll ? dealers : dealers.slice(0, 5);
  const user = JSON.parse(localStorage.getItem("user"));
 
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

   // Fetch Top Selling Products
   const fetchTopSellingProducts = async (categoryId = "") => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.REACT_APP_IP}topSellingProductsForDashBoard/?manufacture_unit_id=${user.manufacture_unit_id}&product_category_id=${categoryId}`
      );
      setTopSellingProducts(response.data.data);
    } catch (error) {
      console.error("Error fetching top selling products:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopSellingProducts();
  }, []);

  // Fetch Categories
  useEffect(() => {
    const fetchDashboardCategory = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_IP}obtainEndlevelcategoryList/?manufacture_unit_id=${user.manufacture_unit_id}`
        );
        setDashboardCategory(response.data.data || []);
      } catch (error) {
        console.error("Error fetching category data:", error);
      }
    };
    fetchDashboardCategory();
  }, []);

  const barChartData = {
    labels:
      dashboardData?.top_selling_brands?.map((item) => item.brand_name) || [],
    datasets: [
      {
        label: "No of products sold",
        data:
          dashboardData?.top_selling_brands?.map((item) => item.units_sold) ||
          [],
        backgroundColor: "#42a5f5",
      },
    ],
  };

  const lineChartData = {
    labels:
      dashboardData?.top_selling_categorys?.map((item) => item.category_name) ||
      [],
    datasets: [
      {
        label: "No of products sold",
        data:
          dashboardData?.top_selling_categorys?.map(
            (item) => item.units_sold
          ) || [],
        borderColor: "#ff7043",
        fill: false,
        tension: 0.1,
      },
    ],
  };

  const handleTotalSpendingsClick = () => {
    navigate("/manufacturer/orders", { state: { filter: { payment_status: "Completed" } } });
  };

  const handlePendingClick = () => {
    navigate("/manufacturer/orders", { state: { filter: { payment_status: "Pending" } } });
  };

  const handleReorderClick = () => {
    navigate("/manufacturer/orders", { state: { filter: { is_reorder: "yes" } } });
  };

  const handleProductClick = (productId) => {
    if (!productId) {
      console.error("Invalid productId");
      return;
    }
    navigate(`/manufacturer/products/details/${productId}`);
  };

  
  // Handle Category Change
  const handleCategoryChange = (event) => {
    const categoryId = event.target.value;
    setSelectedCategory(categoryId);
    fetchTopSellingProducts(categoryId);
  };

  
  const handleActiveBuyerClick = () => {
    navigate(`/manufacturer/dealerList`);
  };

  const handleRowClick = (username) => {
    navigate(`/manufacturer/dealer-details/${username}`);
  };

  return (
    <Box>
      {loading ? (
        // Show loader while data is being fetched
        <Grid
          item
          xs={12}
          sx={{ display: "flex", justifyContent: "center", mt: 4 }}
        >
          <CircularProgress />
        </Grid>
      ) : (
        <Box p={2}>
          {/* Sales Overview Cards */}
          <Grid container spacing={3} mb={3}>

            <Grid item xs={12} sm={6} md={3}>
              <Paper
               onClick={() => handleTotalSpendingsClick()}
                elevation={3}
                style={{
                  padding: "16px",
                  textAlign: "center",
                  color: "#4caf50",
                  cursor: "pointer",
                }}
              >
                <Typography variant="h6">Total Sales</Typography>
                <Typography variant="h5">
                  {" "}
                  ${dashboardData?.total_sales || "0"}
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Paper
                onClick={() => handleActiveBuyerClick()}
                elevation={3}
                style={{
                  padding: "16px",
                  textAlign: "center",
                  color: "#2196f3",
                  cursor: "pointer",
                }}
              >
                <Typography variant="h6">Active Buyers</Typography>
                <Typography variant="h5">
                  {" "}
                  {dashboardData?.dealer_count || "0"}
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Paper
                onClick={() => handlePendingClick()}
                elevation={3}
                style={{
                  padding: "16px",
                  textAlign: "center",
                  color: "#f44336",
                  cursor: "pointer",
                }}
              >
                <Typography variant="h6">Pending Orders</Typography>
                <Typography variant="h5">
                  {" "}
                  {dashboardData?.pending_order_count || "0"}
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Paper
                onClick={() => handleReorderClick()}
                elevation={3}
                style={{
                  padding: "16px",
                  textAlign: "center",
                  color: "#c522ff",
                  cursor: "pointer",
                }}
              >
                <Typography variant="h6">Re-Orders</Typography>
                <Typography variant="h5">
                  {dashboardData?.re_order_count || "0"}
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          {/* Graphs Section */}
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper elevation={3} sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Top Selling Brands
                </Typography>
                <Bar data={barChartData} />
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper elevation={3} sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Top Selling Categories
                </Typography>
                <Line data={lineChartData} />
              </Paper>
            </Grid>
          </Grid>

          {/* Top Selling Products and Total Dealers Section */}
          <Grid container spacing={2}>
            {/* Top Selling Products Section */}
             <Grid item xs={12} md={9}>
                        <Box sx={{display: 'flex', justifyContent: 'space-between' , marginBottom: 1 , marginTop: 4}}>
                                <Typography variant="h6">
                                   Top Selling Products
                                  </Typography>
                      
                                 <Box>
                                 <FormControl size="small">
                         <Select value={selectedCategory} onChange={handleCategoryChange} displayEmpty>
                           <MenuItem value="">All Categories</MenuItem>
                           {dashboardCategory.map((category) => (
                             <MenuItem key={category.id} value={category.id}>
                               {category.name}
                             </MenuItem>
                           ))}
                         </Select>
                       </FormControl>
                                 </Box>
                        </Box>
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
           
                 {topSellingProducts.top_selling_products && topSellingProducts.top_selling_products.length > 0 ? (
                   topSellingProducts.top_selling_products.map((product) => (
                     <TableRow key={product.id} onClick={() => handleProductClick(product.product_id)} style={{ cursor: 'pointer' }}
                     sx={{
                      '&:hover': {
                        backgroundColor: '#6fb6fc38', 
                      },
                    }}
                    >
                     <TableCell >
                   <img
                     src={product.primary_image}
                     alt={product.sku_number}
                     width="30"
                   />
                     </TableCell>
                     <TableCell>{product.sku_number}</TableCell>
                     <TableCell>
             {product.brand_logo && product.brand_logo.startsWith("http") ? (
               <img
                 src={product.brand_logo}
                 alt={product.brand_name}
                 width="15"
               />
             ) : (
               product.brand_name
             )}
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

            {/* Total Dealers Section */}
            <Grid item xs={12} md={3}>
              <Typography variant="h6" mt={3} mb={2}>
                Top Buyers
              </Typography>

              <Paper
                elevation={5}
                sx={{
                  boxShadow: 1,
                  p: 2,
                  height: "250px",
                  marginTop: "18px", // Limiting the height of the scrollable area
                  overflowY:
                    dealerOrderData?.total_dealer_list?.length * 50 > 339
                      ? "scroll"
                      : "auto", // Show scroll only if content exceeds the max height
                  "&::-webkit-scrollbar": {
                    width: "3px", // Scrollbar width
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
                      <Card
                        sx={{
                          p: 2,
                          overflow: "hidden",
                          boxShadow: 0,
                          border: "0.1px solid #d3d3d385",
                        }}
                        onClick={() => handleRowClick(dealer.id)}
                      >
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
                        <Typography
                          variant="body2"
                          sx={{ fontSize: "12px", color: "text.secondary" }}
                        >
                          Order Value: ${dealer.order_value.toFixed(2)}
                        </Typography>
                      </Card>
                    </Grid>
                  ))}
                  {!dealerOrderData?.total_dealer_list?.length && (
                    <Typography
                      sx={{ mt: 2, textAlign: "center", padding: "10px" }}
                    >
                      No dealers available.
                    </Typography>
                  )}
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      )}
    </Box>
  );
};

export default ManufacturerHome;
