import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Box, Button, Table, TableBody,MenuItem, Menu,TableCell, TableContainer, TableHead, TableRow, Paper, TextField ,IconButton, InputAdornment,} from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import ClearIcon from "@mui/icons-material/Clear";
import SearchIcon from "@mui/icons-material/Search";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

const OrderList = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();
  const location = useLocation();
  const filter = location.state?.filter || {};
  const [orders, setOrders] = useState([]);
  const [searchQuery, setSearchQuery] = useState(""); // State for search input
  const [anchorEl, setAnchorEl] = useState(null);
  const [currentColumn, setCurrentColumn] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "asc" });
  const [delivery_status, setDeliveryStatus] = useState("all");
  const [fulfilled_status, setFulfilledStatus] = useState("all");
  const [payment_status, setPaymentStatus] = useState(filter?.payment_status || "all");
  const [is_reorder, setis_reorder] = useState(filter?.is_reorder || "all");
  const [selectedDate, setSelectedDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [page, setPage] = useState(0);

  const fetchOrderList = async (key, direction) => {
    console.log('pass', key, direction);
    try {
      const formattedDate = selectedDate ? selectedDate.format("YYYY-MM-DD") : null;
      const formattedEndDate = endDate ? endDate.format("YYYY-MM-DD") : null;
      const sort_by_value = direction === 'asc' ? 1 : direction === 'desc' ? -1 : '';

      const response = await axios.post(
        `${process.env.REACT_APP_IP}obtainOrderListForDealer/`,
        {
          user_id: user?.id, // Safely access user ID
          sort_by: key || "", // Provide fallback for sort key
          sort_by_value: sort_by_value, // Determine sort direction
          delivery_status,  // Use state directly
          fulfilled_status, // Use state directly
          payment_status,
          is_reorder,   // Use state directly
          // search_by_date: formattedDate,
          start_date: formattedDate,
          end_date : formattedEndDate,
        }
      );

      // Check if the response contains an array of orders
      if (Array.isArray(response?.data?.data)) {
        setOrders(response.data.data); // Update state with the fetched orders
      } else {
        console.error("Fetched data is not an array:", response?.data?.data);
      }
    } catch (error) {
      console.error("Error fetching order list:", error);
    }
  };

  useEffect(() => {
    fetchOrderList(sortConfig.key, sortConfig.direction);
  }, [
    user?.id,
    page,
    delivery_status,
    fulfilled_status,
    payment_status,
    is_reorder,
    selectedDate
  ]);


  const handlePayment = (orderId) => {
    console.log("PaymentConfirm ID: ", orderId);
    navigate("/dealer/paymentConfirm", { state: { orderId } });
  };

  const handleOrderClick = (orderId) => {
    console.log("OrderDetail ID:", orderId);
    navigate("/dealer/OrderDetail", { state: { orderId } });
  };

  const getButtonStyles = (paymentStatus) => {
    if (paymentStatus === "Paid" || paymentStatus === "Completed") {
      return {
        backgroundColor: "#D3D3D3", // Light gray color for disabled state
        cursor: "not-allowed",
        pointerEvents: "none",
      };
    }
    return {};
  };

  // Filter logic for search functionality
  const filteredOrders = orders.filter(
    (order) =>
      order.order_id.toString().includes(searchQuery) ||
      order.payment_status.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.delivery_status.toLowerCase().includes(searchQuery.toLowerCase())||
      order.fulfilled_status.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenMenu = (event, column) => {
    setCurrentColumn(column);
    setAnchorEl(event.currentTarget);
  };
  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleSelectSort = (key, direction) => {
    console.log('army',key, direction)
    setSortConfig({ key, direction });
    setPage(0);  // Reset page to 0 when sorting is applied
    fetchOrderList( key, direction);
    setAnchorEl(null);  // Close the menu after selection
  };


  const handleStatusFilter = (statusType, status) => {
    // Clear all filters except the one that was selected
    if (statusType === "delivery_status") {
      setDeliveryStatus(status);
      setFulfilledStatus("all");
      setPaymentStatus("all");
      setis_reorder("all");
    } else if (statusType === "fulfilled_status") {
      setDeliveryStatus("all");
      setFulfilledStatus(status);
      setPaymentStatus("all");
      setis_reorder("all");
    } else if (statusType === "payment_status") {
      setDeliveryStatus("all");
      setFulfilledStatus("all");
      setPaymentStatus(status);
      setis_reorder("all");
    } else if (statusType === "is_reorder") {
      setDeliveryStatus("all");
      setFulfilledStatus("all");
      setPaymentStatus("all");
      setis_reorder(status);
    }
  
    setAnchorEl(null); // Close the menu
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column"}}>
     
      <Box  sx={{ display: "flex", justifyContent: "flex-end", alignItems:'center' , gap:2 , padding:'15px 10px',
         backgroundColor:'white',
         position:'sticky',
         top:'55px',
         zIndex:9,
      }}> 

       <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DemoContainer components={["DatePicker"]}>
                    <DatePicker
                      value={selectedDate}
                      onChange={(newDate) => {
                        console.log("Selected Date after change:", newDate);
                        setSelectedDate(newDate);
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          size="small"
                          sx={{
                            width: 200,
                            fontSize: "0.875rem",
                            height: 40,
                            "& .MuiInputBase-root": {
                              height: 40,
                            },
                            "& .MuiOutlinedInput-root": {
                              padding: "0 14px", // Adjust this padding as needed
                            },
                            "& .MuiInputBase-input": {
                              padding: "0px", // Remove padding from the input itself
                            },
                          }}
                          componentsProps={{
                            actionBar: {
                              sx: {
                                fontSize: "1rem", // Adjust calendar icon size here
                              },
                            },
                          }}
                        />
                      )}
                    />
                  </DemoContainer>
      
             
      </LocalizationProvider>
                
         <TextField
          placeholder="Search Orders"
          sx={{
            width: "250px",
            "& .MuiOutlinedInput-input": {
              padding: "5px 10px",
              fontSize: "12px",
            },
            '& .MuiOutlinedInput-root': {
              paddingRight: 0, // Removes padding-right
            },
          }}
          onKeyPress={(event) => {
            if (event.key === " " && (searchQuery.trim() === "" || searchQuery.startsWith(" ") || searchQuery.endsWith(" "))) {
              event.preventDefault();
            }
          }}
          variant="outlined"
          size="small"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ fontSize: "20px" }} />{" "}
                {/* Adjust size in input */}
              </InputAdornment>
            ),
            endAdornment: searchQuery && (
              <InputAdornment position="end">
                <IconButton onClick={() => setSearchQuery("")} size="small">
                  <ClearIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
          
        
        />  
        
        <Button sx={{ textTransform: "none" , padding:0}}>
        Total Orders: {filteredOrders.length}
      </Button>
      </Box>
     <Box sx={{margin:'10px'}}>
     <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell align="center">OrderId
              <IconButton onClick={(e) => handleOpenMenu(e, "order_id")}>
                  <MoreVertIcon sx={{ fontSize: "14px" }} />
                </IconButton>
              </TableCell>
              <TableCell align="center">Total Items
              <IconButton onClick={(e) => handleOpenMenu(e, "total_items")}>
                  <MoreVertIcon sx={{ fontSize: "14px" }} />
                </IconButton>
              </TableCell>
              <TableCell align="center">Order Value
              <IconButton onClick={(e) => handleOpenMenu(e, "amount")}>
                  <MoreVertIcon sx={{ fontSize: "14px" }} />
                </IconButton>
              </TableCell>
              <TableCell align="center">Order Date
              <IconButton onClick={(e) => handleOpenMenu(e, "order_date")}>
                  <MoreVertIcon sx={{ fontSize: "14px" }} />
                </IconButton>
              </TableCell>
              <TableCell align="center">Payment Status
              <IconButton
                    onClick={(e) => handleOpenMenu(e, "payment_status")}
                  >
                    <MoreVertIcon sx={{ fontSize: "14px" }} />
                  </IconButton>
              </TableCell>
              <TableCell align="center">Fulfilled Status
              <IconButton
                    onClick={(e) => handleOpenMenu(e, "fulfilled_status")}
                  >
                    <MoreVertIcon sx={{ fontSize: "14px" }} />
                  </IconButton>
              </TableCell>
              <TableCell align="center">Delivery Status
              <IconButton
                    onClick={(e) => handleOpenMenu(e, "delivery_status")}
                  >
                    <MoreVertIcon sx={{ fontSize: "14px" }} />
                  </IconButton>
              </TableCell>
              <TableCell align="center">Reorder
              <IconButton
                    onClick={(e) => handleOpenMenu(e, "is_reorder")}
                  >
                    <MoreVertIcon sx={{ fontSize: "14px" }} />
                  </IconButton>
              </TableCell>
              <TableCell>Make Payment</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Array.isArray(filteredOrders) && filteredOrders.length > 0 ? (
              filteredOrders.map((order) => (
                <TableRow key={order.order_id} style={{ cursor: "pointer" }} 
                sx={{
                  '&:hover': {
                    backgroundColor: '#6fb6fc38', // Customize your hover color here
                  },
                }}>
                  <TableCell align="center" onClick={() => handleOrderClick(order.id)}>
                    {order.order_id}
                  </TableCell>
                  <TableCell align="center" onClick={() => handleOrderClick(order.id)}>{order.total_items}</TableCell>
                  <TableCell align="center" onClick={() => handleOrderClick(order.id)}>{order.currency + order.amount}</TableCell>
                  <TableCell align="center" onClick={() => handleOrderClick(order.id)}>
                    {new Date(order.order_date).toLocaleDateString()}
                  </TableCell>
                  <TableCell align="center"
                  style={{
                    color:
                      order.payment_status === "Pending"
                        ? "red"
                        : order.payment_status === "Paid"
                        ? "orange"
                        : order.payment_status === "Completed"
                        ? "green"
                        : order.payment_status === "Failed"
                        ? "red"
                        : "black", // Default color
                  }}>{order.payment_status}</TableCell>
                  <TableCell align="center"
                  style={{
                    color:
                      order.fulfilled_status === "Unfulfilled"
                        ? "red"
                        : order.fulfilled_status === "Partially Fulfilled"
                        ? "orange"
                        : order.fulfilled_status === "Fulfilled"
                        ? "green"
                        : "black", // Default color
                  }}>{order.fulfilled_status}</TableCell>
                  <TableCell align="center" style={{
                    color:
                      order.delivery_status === "Pending"
                        ? "red"
                        : order.delivery_status === "Shipped"
                        ? "orange"
                        : order.delivery_status === "Completed"
                        ? "green"
                        : order.delivery_status === "Canceled"
                        ? "red"
                        : "black", // Default color
                  }}
>{order.delivery_status}</TableCell>
                  <TableCell align="center">{order.is_reorder ? "yes" : "no"}</TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      color="primary"
                      sx={{
                        fontSize: "10px",
                        textTransform: "none",
                        border: "none",
                        padding: "3px 6px",
                        boxShadow: "none",
                        ...getButtonStyles(order.payment_status),
                      }}
                      onClick={() => handlePayment(order.id)}
                      disabled={
                        order.payment_status === "paid" ||
                        order.payment_status === "completed"
                      }
                    >
                      Confirm Payment
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={9} align="center">
                  No Orders Available
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
     </Box>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
      >

{currentColumn === "order_id" && (
          <>
            <MenuItem onClick={() => handleSelectSort("order_id", "asc")}>
              Sort Low to High
            </MenuItem>
            <MenuItem onClick={() => handleSelectSort("order_id", "desc")}>
              Sort High to Low
            </MenuItem>
          </>
        )}

{currentColumn === "total_items" && (
          <>
            <MenuItem onClick={() => handleSelectSort("total_items", "asc")}>
              Sort Low to High
            </MenuItem>
            <MenuItem onClick={() => handleSelectSort("total_items", "desc")}>
              Sort High to Low
            </MenuItem>
          </>
        )}

{currentColumn === "amount" && (
          <>
            <MenuItem onClick={() => handleSelectSort("amount", "asc")}>
              Sort Low to High
            </MenuItem>
            <MenuItem onClick={() => handleSelectSort("amount", "desc")}>
              Sort High to Low
            </MenuItem>
          </>
        )}

{currentColumn === "order_date" && (
          <>
            <MenuItem onClick={() => handleSelectSort("order_date", "asc")}>
              Lowest
            </MenuItem>
            <MenuItem onClick={() => handleSelectSort("order_date", "desc")}>
             Highest
            </MenuItem>
          </>
        )}


        {currentColumn === "delivery_status" && (
          <>
            <MenuItem
              onClick={() => handleStatusFilter("delivery_status", "all")}
            >
              All
            </MenuItem>
            <MenuItem
              onClick={() => handleStatusFilter("delivery_status", "Pending")}
            >
              Pending
            </MenuItem>
            <MenuItem
              onClick={() => handleStatusFilter("delivery_status", "Shipped")}
            >
              Shipped
            </MenuItem>
            <MenuItem
              onClick={() => handleStatusFilter("delivery_status", "Completed")}
            >
              Completed
            </MenuItem>
            <MenuItem
              onClick={() => handleStatusFilter("delivery_status", "Canceled")}
            >
              Canceled
            </MenuItem>
          </>
        )}

        {currentColumn === "fulfilled_status" && (
          <>
            <MenuItem
              onClick={() => handleStatusFilter("fulfilled_status", "all")}
            >
              All
            </MenuItem>
            <MenuItem
              onClick={() =>
                handleStatusFilter("fulfilled_status", "Fulfilled")
              }
            >
              Fulfilled
            </MenuItem>
            <MenuItem
              onClick={() =>
                handleStatusFilter("fulfilled_status", "Unfulfilled")
              }
            >
              Unfulfilled
            </MenuItem>
            <MenuItem
              onClick={() =>
                handleStatusFilter("fulfilled_status", "Partially Fulfilled")
              }
            >
              Partially Fulfilled
            </MenuItem>
          </>
        )}

        {currentColumn === "payment_status" && (
          <>
            <MenuItem
              onClick={() => handleStatusFilter("payment_status", "all")}
            >
              All
            </MenuItem>
            <MenuItem
              onClick={() => handleStatusFilter("payment_status", "Completed")}
            >
              Completed
            </MenuItem>
            <MenuItem
              onClick={() => handleStatusFilter("payment_status", "Pending")}
            >
              Pending
            </MenuItem>
            <MenuItem
              onClick={() => handleStatusFilter("payment_status", "Paid")}
            >
              Paid
            </MenuItem>
            <MenuItem
              onClick={() => handleStatusFilter("payment_status", "Failed")}
            >
              Failed
            </MenuItem>
          </>
        )}

        {currentColumn === "is_reorder" && (
          <>
            <MenuItem onClick={() => handleStatusFilter("is_reorder", "all")}>
              All
            </MenuItem>
            <MenuItem onClick={() => handleStatusFilter("is_reorder", "Yes")}>
              Yes
            </MenuItem>
            <MenuItem onClick={() => handleStatusFilter("is_reorder", "No")}>
              No
            </MenuItem>
          </>
        )}
      </Menu>
    </Box>
  );
};

export default OrderList;