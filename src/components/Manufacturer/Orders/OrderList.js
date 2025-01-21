// src\components\Manufacturer\Orders\OrderList.js
import React, { useMemo, useEffect, useState } from "react";
import { useLocation } from 'react-router-dom';
import Tooltip from "@mui/material/Tooltip";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import FileUploadOutlinedIcon from "@mui/icons-material/FileUploadOutlined";
import SearchIcon from "@mui/icons-material/Search";
import {
  Paper,
  Box,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Menu,
  MenuItem,
  IconButton,
  Checkbox,
  ListItemText,
  CircularProgress,
  InputAdornment,
  Typography,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { styled } from "@mui/material/styles";
import "../../Manufacturer/manufacturer.css";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { Margin } from "@mui/icons-material";

// Styled TextField
const CustomTextField = styled(TextField)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    "& fieldset": {
      borderRadius: "5px",
    },
    "& input": {
      height: "20px",
      padding: "8px", // Set custom padding
      fontSize: "12px", // Adjust font size for input
    },
  },
}));

const StyledMenu = styled(Menu)(({ theme }) => ({
  "& .MuiMenu-paper": {
    padding: 0,
    maxHeight: "400px", // Ensure there's a maximum height for the entire dropdown
    width: "300px",
    overflowY: "hidden", // Avoid overall overflow for the entire menu
    fontSize: "12px",
    display: "flex", // Use flexbox layout for the entire menu
    flexDirection: "column", // Stack elements vertically
  },
  "& .MuiMenu-list": {
    paddingTop: 0, // Remove the padding-top
    paddingBottom: 0, // Remove the padding-bottom
    Margin: "5px 0px",
  },
}));

const OrderList = () => {
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [anchorEl, setAnchorEl] = useState(null);
  const [currentColumn, setCurrentColumn] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "asc" });
  const [delivery_status, setDeliveryStatus] = useState("all");
  const [fulfilled_status, setFulfilledStatus] = useState("all");
  const [payment_status, setPaymentStatus] = useState("all");
  const [is_reorder, setis_reorder] = useState("all");
  const [exportAnchorEl, setExportAnchorEl] = useState(null);
  const [dealers, setDealers] = useState([]);
  const [dealerAnchorEl, setDealerAnchorEl] = useState(null);
  const [selectedDealerIds, setSelectedDealerIds] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [error, setError] = useState(null); // Track error
  const [loadingDealers, setLoadingDealers] = useState(false);

  const handleRowClick = (orderId) => {
    navigate(`/manufacturer/order-details/${orderId}`); // Navigate to the OrderDetail page with orderId
  };

 

  const filteredOrders = orders.filter((order) => {
    // Ensure searchTerm is normalized
    const normalizedSearchTerm = searchTerm?.toString().trim().toLowerCase();
  
    // Check for null or undefined order_id and dealer_name fields
    const orderIdMatch = order.order_id?.toString().toLowerCase().includes(normalizedSearchTerm);
    const dealerNameMatch = order.dealer_name?.toLowerCase().includes(normalizedSearchTerm);
  
    return orderIdMatch || dealerNameMatch;
  });


  useEffect(() => {
    fetchDealers(); // Fetch dealers on component mount
  }, [user.manufacture_unit_id]);

  const fetchDealers = async () => {
    setLoadingDealers(true); // Start loading
    setError(null); // Reset error state before fetching

    try {
      const response = await axios.get(
        `${process.env.REACT_APP_IP}obtainDealerlist/`,
        {
          params: { manufacture_unit_id: user.manufacture_unit_id },
        }
      );

      // Check if the response status is 200 (success)
      if (response.status === 200) {
        setDealers(
          response.data.data.map((dealer) => ({
            id: dealer.id,
            username: dealer.username,
          })) || []
        );
      } else {
        setError("Failed to load data"); // Set error if status is not 200
      }
    } catch (error) {
      console.error("Error fetching dealers:", error);
      setError("An error occurred while fetching dealers."); // Handle error if API call fails
    } finally {
      setLoadingDealers(false); // Stop loading
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Reset to the first page on rows per page change
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };



 
  const fetchOrders = async () => {
    setLoading(true);
    if (!user || !user.manufacture_unit_id) {
      console.error("User or manufacture_unit_id is not defined.");
      return;
    }
  
    try {
      const formattedDate = selectedDate ? selectedDate.format("YYYY-MM-DD") : null;
  
      const response = await axios.post(
        `${process.env.REACT_APP_IP}obtainOrderList/`,
        {
          manufacture_unit_id: user.manufacture_unit_id,
          search_query: searchTerm,
          sort_by: sortConfig.key,
          sort_by_value: sortConfig.direction === "asc" ? 1 : -1,
          page,
          rows_per_page: rowsPerPage,
          dealer_list: selectedDealerIds,
          delivery_status,  // Use state directly
          fulfilled_status, // Use state directly
          payment_status,   // Use state directly
          search_by_date: formattedDate,
          is_reorder,
        }
      );
      setOrders(response.data.data);
      console.log("Delivery Status:", delivery_status);
      console.log("Fulfilled Status:", fulfilled_status);
      console.log("Payment Status:", payment_status);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSort = (key, direction) => {
    console.log('army',key, direction)
    setSortConfig({ key, direction });
    setPage(0);  // Reset page to 0 when sorting is applied
    fetchOrders( key, direction);
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


  useEffect(() => {

    const searchParams = new URLSearchParams(location.search);
    const filter = searchParams.get('filter');

    // Set the filter state based on the query parameter in the URL
    if (filter === 'Pending') {
      setPaymentStatus('Pending');
    } else if (filter === 'yes') {
      setis_reorder('Yes');
    }
    
    fetchOrders(); // This will be called after the filter states are updated
  }, [
    location.search,
    user.manufacture_unit_id,
    searchTerm,
    sortConfig,
    page,
    rowsPerPage,
    delivery_status,
    fulfilled_status,
    payment_status,
    is_reorder,
    selectedDealerIds,
    selectedDate
  ]);

  
  const handleOpenMenu = (event, column) => {
    setCurrentColumn(column);
    setAnchorEl(event.currentTarget);
  };

  const handleOpenExportMenu = (event) => {
    setExportAnchorEl(event.currentTarget);
  };

  const handleCloseExportMenu = () => {
    setExportAnchorEl(null);
  };
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleExport = async (status) => {
    const exportUrl = `${process.env.REACT_APP_IP}exportOrders/`; // Changed variable name to exportUrl
    const params = {
      manufacture_unit_id: user.manufacture_unit_id,
      status,
    };

    try {
      const response = await axios.get(exportUrl, {
        params,
        responseType: "blob",
      }); // Use exportUrl here
      const blobUrl = window.URL.createObjectURL(new Blob([response.data])); // Changed to blobUrl
      const link = document.createElement("a");
      link.href = blobUrl; // Use blobUrl here
      link.setAttribute("download", `orders_${status}.xlsx`); // Specify the file name
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Error exporting orders:", error);
    }

    handleCloseExportMenu();
  };

  // Toggle dealer selection
  const handleDealerSelection = (dealer) => {
    setSelectedDealerIds((prevSelectedIds) => {
      if (prevSelectedIds.indexOf(dealer.id) > -1) {
        // If already selected, remove it
        return prevSelectedIds.filter((id) => id !== dealer.id);
      } else {
        // Otherwise, add to the selection
        return [...prevSelectedIds, dealer.id];
      }
    });
  };

  // Clear selected dealers
  const handleClearSelection = () => {
    setSelectedDealerIds([]); // Reset the selected dealer list
  };

 

  const handleOpenDealerDropdown = (event) => {
    setDealerAnchorEl(event.currentTarget);
  };

  const handleCloseDealerDropdown = () => {
    setDealerAnchorEl(null);
  };

  const handleApplyDealers = () => {
    // This can include additional logic if needed when applying dealer selection
    handleCloseDealerDropdown();
    fetchOrders(); // Fetch orders again after applying dealer selection
  };

  const handleSearchIconClick = () => {
    setIsSearchOpen(true);
  };

  const handleSearchBlur = () => {
    if (searchTerm.trim() === "") {
      setIsSearchOpen(false);
    }
  };
  return (
    <Box sx={{ display: "flex" , marginBottom:'25px' , p:0}}>
      <Box sx={{ p: 1, flexGrow: 1 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            pb: 2,
            gap: 2,
            backgroundColor:'white',
            position:'sticky',
            top:'56px',
            padding:'10px 0px',
            zIndex:9,
          }}
        >
          <Button
            sx={{
              border: "1px solid #1976d2",
              textTransform: "capitalize",
              fontSize: "12px",
            }}
            onClick={handleOpenDealerDropdown}
          >
            View Orders By Dealer Name
          </Button>

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

            {/* Button to manually trigger fetchOrders */}
            {/* <Button
              sx={{ fontSize: "14px" }}
              variant="contained"
              color="primary"
              onClick={fetchOrders}
            >
              Fetch Orders
            </Button> */}
          </LocalizationProvider>

          <Box display="flex" alignItems="center">
        
              <TextField
                variant="outlined"
                value={searchTerm}
                size="small"
                onChange={handleSearchChange}
                onBlur={handleSearchBlur}
                onKeyPress={(event) => {
                  // Prevent space key press at the start or end
                  if (
                    event.key === " " &&
                    (searchTerm.trim() === "" ||
                      searchTerm.startsWith(" ") ||
                      searchTerm.endsWith(" "))
                  ) {
                    event.preventDefault();
                  }
                }}
                autoFocus
                placeholder="Search by Order ID or Dealer Name"
                sx={{ width: 300 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ fontSize: "20px" }} />{" "}
                      {/* Adjust size in input */}
                    </InputAdornment>
                  ),
                  style: { fontSize: "12px" },
                }}
              />
          
          </Box>

          {/* Export Button */}
          <Tooltip title="Export" arrow>
            <IconButton onClick={handleOpenExportMenu} sx={{ padding: 0 }}>
              <FileUploadOutlinedIcon
                sx={{
                  fontSize: "40px",
                  color: "#1976d2",
                }}
              />
            </IconButton>
          </Tooltip>
        </Box>
       
        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
          <Button sx={{ p: 0, mb: 1, textTransform: "none" }}>
            Total Orders : {orders.length}{" "}
          </Button>
        </Box>

        <TableContainer component={Paper} sx={{ marginTop: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell align="center">
                  OrderId
                  <IconButton onClick={(e) => handleOpenMenu(e, "order_id")}>
                    <MoreVertIcon sx={{ fontSize: "14px" }} />
                  </IconButton>
                </TableCell>
                <TableCell align="center">
                  Dealer Name
                  <IconButton onClick={(e) => handleOpenMenu(e, "dealer_name")}>
                    <MoreVertIcon sx={{ fontSize: "14px" }} />
                  </IconButton>
                </TableCell>
                <TableCell align="center">
                  Destination
                  {/* <IconButton onClick={(e) => handleOpenMenu(e, "destination ")}>
                    <MoreVertIcon sx={{ fontSize: "14px" }} />
                  </IconButton> */}
                </TableCell>
                <TableCell align="center">
                  Total Items
                  <IconButton onClick={(e) => handleOpenMenu(e, "total_items")}>
                    <MoreVertIcon sx={{ fontSize: "14px" }} />
                  </IconButton>
                </TableCell>
                <TableCell align="center">
                  Order Value
                  <IconButton onClick={(e) => handleOpenMenu(e, "amount")}>
                    <MoreVertIcon sx={{ fontSize: "14px" }} />
                  </IconButton>
                </TableCell>
                <TableCell align="center">
                  Order Date
                  <IconButton
                    onClick={(e) => handleOpenMenu(e, "creation_date")}
                  >
                    <MoreVertIcon sx={{ fontSize: "14px" }} />
                  </IconButton>
                </TableCell>
                <TableCell align="center">
                  Payment Status
                  <IconButton
                    onClick={(e) => handleOpenMenu(e, "payment_status")}
                  >
                    <MoreVertIcon sx={{ fontSize: "14px" }} />
                  </IconButton>
                </TableCell>
                <TableCell align="center">
                  Fulfillment Status
                  <IconButton
                    onClick={(e) => handleOpenMenu(e, "fulfilled_status")}
                  >
                    <MoreVertIcon sx={{ fontSize: "14px" }} />
                  </IconButton>
                </TableCell>
                <TableCell align="center">
                  Delivery Status
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
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={12} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : filteredOrders.length > 0 ? (
                filteredOrders
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((order) => (
                    <TableRow
                      key={order._id}
                      onClick={() => handleRowClick(order._id)}
                      style={{ cursor: "pointer" }}
                    >
                      <TableCell align="center">{order.order_id}</TableCell>
                      <TableCell align="center">{order.dealer_name}</TableCell>
                      <TableCell align="center">
  {order.address.city && order.address.country
    ? `${order.address.city}, ${order.address.country}`
    : 'N/A'}
</TableCell>
                      <TableCell align="center">{order.total_items}</TableCell>
                      <TableCell align="center">{order.amount}{order.currency}</TableCell>
                      <TableCell align="center">
                        {new Date(order.creation_date).toLocaleDateString()}
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
                      }}
                      >
                        {order.payment_status}
                      </TableCell>
                      <TableCell align="center"
                      style={{
                        color:
                          order.fulfilled_status === "Unfulfilled"
                            ? "red"
                            : order.fulfilled_status === "Partially fulfilled"
                            ? "orange"
                            : order.fulfilled_status === "Fulfilled"
                            ? "green"
                            : "black", // Default color
                      }}>
                        {order.fulfilled_status}
                      </TableCell>
                      <TableCell align="center"
                      style={{
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
                      }}>
                        {order.delivery_status}
                      </TableCell>
                       <TableCell align="center">{order.is_reorder ? "yes" : "no"}</TableCell>
                    </TableRow>
                  ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9} style={{color: '#888'}} align="center">
                  No Orders Available
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[25, 50, 75]}
          component="div"
          count={filteredOrders.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Show"
        />
      </Box>

      {/* Menu for sorting and filtering options */}
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

{currentColumn === "dealer_name" && (
                  <>
                    <MenuItem onClick={() => handleSelectSort("dealer_name", "asc")}>
                    Sort A to Z
                    </MenuItem>
                    <MenuItem onClick={() => handleSelectSort("dealer_name", "desc")}>
                    Sort Z to A
                    </MenuItem>
                  </>
                )}

{currentColumn === "destination" && (
                  <>
                    <MenuItem onClick={() => handleSelectSort("destination", "asc")}>
                      Sort A to Z
                    </MenuItem>
                    <MenuItem onClick={() => handleSelectSort("destination", "desc")}>
                      Sort Z to A
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
        
        {currentColumn === "creation_date" && (
                  <>
                    <MenuItem onClick={() => handleSelectSort("creation_date", "asc")}>
                      Lowest
                    </MenuItem>
                    <MenuItem onClick={() => handleSelectSort("creation_date", "desc")}>
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

      {/* Dealer Selection Dropdown */}
      <StyledMenu
        anchorEl={dealerAnchorEl}
        open={Boolean(dealerAnchorEl)}
        onClose={handleCloseDealerDropdown}
        sx={{ maxWidth: 400 }} // You can adjust the max width if needed
      >
        {/* Dealer selection count fixed at the top */}
        <Box
          sx={{
            padding: 1,
            fontSize: "14px",

            backgroundColor: "white", // Ensure it has a solid background

            boxShadow: "0px 2px 5px rgba(0,0,0,0.1)", // Optional: Adds a shadow for separation
          }}
        >
          {loadingDealers
            ? "Loading..." // Show Loading message while data is being fetched
            : selectedDealerIds.length > 0
              ? `Selected ${selectedDealerIds.length} ${selectedDealerIds.length > 1 ? "dealers" : "dealer"}`
              : "No dealers selected"}
        </Box>

        {/* Scrollable list of dealers */}
        <Box sx={{ maxHeight: 300, overflowY: "auto" }}>
          {/* Loader will show if loading is true */}
          {loadingDealers ? (
            <Box
              sx={{
                height: "200px",
                display: "flex",
                justifyContent: "center",
                padding: 2,
              }}
            >
              <CircularProgress />
            </Box>
          ) : error ? (
            // Show error message if there was an issue with the API call
            <Box sx={{ display: "flex", justifyContent: "center", padding: 2 }}>
              <Typography color="error">{error}</Typography>
            </Box>
          ) : (
            // Show dealers once the data is successfully fetched
            dealers.map((dealer) => (
              <MenuItem
                key={dealer.id}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  width: "100%",
                  backgroundColor:
                    selectedDealerIds.indexOf(dealer.id) > -1
                      ? "#f0f0f0"
                      : "transparent", // Highlight selected items
                  "&:hover": { backgroundColor: "#e0e0e0" }, // Highlight on hover
                }}
                onClick={() => handleDealerSelection(dealer)} // Handle click to select/deselect
              >
                <ListItemText primary={dealer.username} />
              </MenuItem>
            ))
          )}
        </Box>

        {/* Buttons fixed at the bottom */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "10px",
            backgroundColor: "white", // Ensure background color is applied
            padding: "0", // Padding for the buttons
            zIndex: 1, // Ensure it's above the scrollable list
            boxShadow: "0px -2px 5px rgba(0,0,0,0.1)", // Optional: Adds a shadow for separation
            padding: "10px",
          }}
        >
          {/* Apply Button */}
          {/* <Button
            sx={{ fontSize: "12px" }}
            variant="contained"
            onClick={handleApplyDealers}
          >
            Apply
          </Button> */}

          {/* Clear Button */}
          <Button
            sx={{ fontSize: "12px" }}
            variant="outlined"
            onClick={handleClearSelection} // Function to clear selection
          >
            Clear
          </Button>
        </Box>
      </StyledMenu>

      {/* Export menu */}
      <Menu
        anchorEl={exportAnchorEl}
        open={Boolean(exportAnchorEl)}
        onClose={handleCloseExportMenu}
      >
        <MenuItem onClick={() => handleExport("all")}>
          Export All Orders
        </MenuItem>
        <MenuItem onClick={() => handleExport("Pending")}>
          Export Pending Orders
        </MenuItem>
        <MenuItem onClick={() => handleExport("Shipped")}>
          Export Shipped Orders
        </MenuItem>
        <MenuItem onClick={() => handleExport("Completed")}>
          Export Completed Orders
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default OrderList;
