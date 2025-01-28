// src/components/Manufacturer/Dealers/DealerList.js

import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  TextField,
  Dialog,
  DialogContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  MenuItem,
  Paper,
  Menu,
  IconButton,
  CircularProgress,
  Typography, InputAdornment
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { MoreVert as MoreVertIcon } from "@mui/icons-material";
import AddNewDealer from "./AddNewDealer";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { styled } from "@mui/material/styles";
import CloseIcon from '@mui/icons-material/Close';

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

function DealerList() {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const [loading, setLoading] = useState(true);
  const [filteredDealers, setFilteredDealers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [dealers, setDealers] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [anchorEl, setAnchorEl] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "asc" });
  const user = JSON.parse(localStorage.getItem("user"));
  const [currentColumn, setCurrentColumn] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchDealers();
  }, [user.manufacture_unit_id]);

  useEffect(() => {
    // Filter dealers whenever `searchTerm` changes
    const filtered = dealers.filter(
      (dealer) =>
        dealer.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dealer.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dealer.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredDealers(filtered);
  }, [searchTerm, dealers]);

  const fetchDealers = async (key, direction) => {
    setLoading(true);
    const keyValue = key;
    const sort_by_value =
      direction === "asc" ? 1 : direction === "desc" ? -1 : "";
    console.log("909090", key, sort_by_value);
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_IP}obtainDealerlist/`,
        {
          params: {
            manufacture_unit_id: user.manufacture_unit_id,
            sort_by: keyValue,
            sort_by: keyValue,
            sort_by_value: sort_by_value,
          },
        }
      );

      console.log("Response:", response);
      setDealers(
        response.data.data.map((dealer) => ({
          id: dealer.id,
          username: dealer.username || "N/A",
          email: dealer.email || "N/A",
          contact: dealer.mobile_number || "N/A",
          location1: dealer.address.country || "N/A",
          location2: dealer.address.city || "N/A",
          company_name: dealer.company_name || "N/A",
          website: dealer.website || "N/A",
          no_of_orders: dealer.no_of_orders || "N/A",
        })) || []
      );
    } catch (error) {
      console.error("Error fetching dealers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRowClick = (username) => {
    navigate(`/manufacturer/dealer-details/${username}`);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenMenu = (event, column) => {
    setAnchorEl(event.currentTarget);
    setCurrentColumn(column); // Set column to either "price" or "availability"
  };

  const handleSelectSort = (key, direction) => {
    console.log("Sorting with:", key, direction);
    setSortConfig({ key, direction });
    console.log(sortConfig, "assigned value");
    setPage(0); // Reset page to 0 when sorting is applied
    fetchDealers(key, direction);
    setAnchorEl(null); // Close the menu after selection
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const reloadDealers = () => {
    fetchDealers(); // Fetch the updated list after adding a new dealer
  };

  return (
    <div style={{   marginBottom:'25px' }}>
      <Box>
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            gap: 2,
            padding: "10px 0px",
            marginBottom: "20px",
            backgroundColor:'white',
            position:'sticky',
            top:'55px',
            zIndex:9,
            px:1
          }}
        >
          <Box>
            <Button
              sx={{ border: "1px solid #1976d2", textTransform: "capitalize" }}
              onClick={handleOpen}
            >
              Add New Buyer
            </Button>
            <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
              <DialogContent>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography variant="h6">Add New Buyer</Typography>
                  <IconButton onClick={handleClose}>
                    <CloseIcon />
                  </IconButton>
                </Box>
                <AddNewDealer reloadDealers={reloadDealers} onClose={handleClose}/>
              </DialogContent>
            </Dialog>
          </Box>
          <CustomTextField
            variant="outlined"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}  // Only use this handler
            onKeyPress={(event) => {
              // Prevent space key press at the start or end
              if (event.key === " " && (searchTerm.trim() === "" || searchTerm.startsWith(" ") || searchTerm.endsWith(" "))) {
                event.preventDefault();
              }
            }}
            // sx={{
            //   flexGrow: 0,
            //   width: "300px",
            //   fontSize:'12px'
            // }}
            sx={{ width: 300 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ fontSize: "20px" }} />{" "}
                  {/* Adjust size in input */}
                </InputAdornment>
              ),
              style: { fontSize: "11px" },
            }}
            placeholder="Search by Dealer Name or Dealer Email"
            size="small"

          />
        </Box>

        <Box sx={{ display: "flex", justifyContent: "flex-end" ,   px:1 }}>
          <Button sx={{ p: 0, mb: 1, textTransform: "none" }}>
            Total Buyers : {filteredDealers.length}{" "}
          </Button>
        </Box>


        {/* Dealer Listing table with horizontal scroll */}
        <Box sx={{ margin: "10px" }}>
          <TableContainer component={Paper} sx={{ marginTop: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold" }}>
                    Name
                    <IconButton onClick={(e) => handleOpenMenu(e, "username")}>
                      <MoreVertIcon sx={{ fontSize: "14px" }} />
                    </IconButton>
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>
                    Email
                    <IconButton onClick={(e) => handleOpenMenu(e, "email")}>
                      <MoreVertIcon sx={{ fontSize: "14px" }} />
                    </IconButton>
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Phone</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Location</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>
                    Company Name
                    <IconButton
                      onClick={(e) => handleOpenMenu(e, "company_name")}
                    >
                      <MoreVertIcon sx={{ fontSize: "14px" }} />
                    </IconButton>
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Website</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>
                    No of Orders
                    <IconButton
                      onClick={(e) => handleOpenMenu(e, "no_of_orders")}
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
                ) : filteredDealers.length > 0 ? (
                  filteredDealers
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((dealer) => (
                      <TableRow
                        key={dealer.id}
                        onClick={() => handleRowClick(dealer.id)}
                        style={{ cursor: "pointer" }}
                        sx={{
                          '&:hover': {
                            backgroundColor: '#6fb6fc38', // Customize your hover color here
                          },
                        }}
                      >
                        <TableCell>{dealer.username}</TableCell>
                        <TableCell>{dealer.email}</TableCell>
                        <TableCell>{dealer.contact}</TableCell>
                        <TableCell>
                          {dealer.location1}, {dealer.location2}
                        </TableCell>
                        <TableCell>{dealer.company_name}</TableCell>
                        <TableCell>{dealer.website}</TableCell>
                        <TableCell>
                          {dealer.no_of_orders >= 1 ? dealer.no_of_orders : "0"}
                        </TableCell>
                      </TableRow>
                    ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} style={{ color: '#888' }} align="center">
                      No Dealers Found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
        <TablePagination
          rowsPerPageOptions={[25, 50, 75]}
          component="div"
          count={filteredDealers.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleCloseMenu}
        >
          {/* Sorting for Price */}
          {currentColumn === "username" && (
            <>
              <MenuItem onClick={() => handleSelectSort("username", "asc")}>
                Sort A-Z
              </MenuItem>
              <MenuItem onClick={() => handleSelectSort("username", "desc")}>
                Sort Z-A
              </MenuItem>
            </>
          )}

          {currentColumn === "email" && (
            <>
              <MenuItem onClick={() => handleSelectSort("email", "asc")}>
                Sort A-Z
              </MenuItem>
              <MenuItem onClick={() => handleSelectSort("email", "desc")}>
                Sort Z-A
              </MenuItem>
            </>
          )}
          {currentColumn === "company_name" && (
            <>
              <MenuItem onClick={() => handleSelectSort("company_name", "asc")}>
                Sort A-Z
              </MenuItem>
              <MenuItem onClick={() => handleSelectSort("company_name", "desc")}>
                Sort Z-A
              </MenuItem>
            </>
          )}
          {currentColumn === "no_of_orders" && (
            <>
              <MenuItem onClick={() => handleSelectSort("no_of_orders", "asc")}>
                Sort Low to High
              </MenuItem>
              <MenuItem onClick={() => handleSelectSort("no_of_orders", "desc")}>
                Sort High to Low
              </MenuItem>
            </>
          )}
        </Menu>
      </Box>
    </div>
  );
}

export default DealerList;
