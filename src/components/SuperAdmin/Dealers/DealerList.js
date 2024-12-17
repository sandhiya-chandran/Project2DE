// src/components/Manufacturer/Dealers/DealerList.js

import React, { useEffect, useState } from 'react';
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
  Paper,
} from "@mui/material";
import AddNewDealer from "./AddNewDealer";
import { useNavigate } from 'react-router-dom';
import { styled } from '@mui/material/styles';

// Styled TextField
const CustomTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      borderRadius: '5px',
    },
    '& input': {
      height: '20px',
      padding: '8px', // Set custom padding
      fontSize: '12px', // Adjust font size for input
    },
  }
}));

function DealerList() {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [dealers] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const user = JSON.parse(localStorage.getItem('user'));
  const navigate = useNavigate();

  useEffect(() => {
    // fetchDealers();
  }, [user.manufacture_unit_id]);

  // const fetchDealers = async () => {
  //   // try {
  //   //   const response = await axios.get(`${process.env.REACT_APP_IP}obtainDealerlist/`, {
  //   //     params: { manufacture_unit_id: user.manufacture_unit_id }
  //   //   });
  //     setDealers(response.data.data.map(dealer => ({
  //       id: dealer.id,
  //       username: dealer.username,
  //     })) || []);
  //   } catch (error) {
  //     console.error("Error fetching dealers:", error);
  //   }
  // };

  const handleRowClick = (username) => {
    navigate(`/dealerList/dealer-details/${username}`); 
  };
  

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Box sx={{ p: 2, flexGrow: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom:'20px' , gap:2 }}>
        <Box>
          <Button
            sx={{ border: '1px solid #1976d2', textTransform: 'capitalize' }}
            onClick={handleOpen}
          >
            Add New Dealer
          </Button>
          <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
            <DialogContent>
              <AddNewDealer />
            </DialogContent>
          </Dialog>
        </Box>
        <CustomTextField
          variant="outlined"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{
            flexGrow: 0,
            width: '300px',
          }}
          placeholder="Search by Dealer ID or Dealer Name"
        />
      </Box>

      {/* Dealer Listing table with horizontal scroll */}
      <Box sx={{ overflowX: 'auto' }}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Phone</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Location</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Company Name</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Website</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>No of Orders</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {dealers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((dealer) => (
                <TableRow key={dealer.id} onClick={() => handleRowClick(dealer.username)} style={{ cursor: 'pointer' }}>
                  <TableCell>dealername</TableCell>
                  <TableCell>dealer@gmail.com</TableCell>
                  <TableCell>9884514686</TableCell>
                  <TableCell>Tamil Nadu</TableCell>
                  <TableCell>Abcd</TableCell>
                  <TableCell>www.abc.in</TableCell>
                  <TableCell>5</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={dealers.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Box>
  );
}

export default DealerList;
