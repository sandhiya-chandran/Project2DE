// src/components/SuperAdmin/Manufacturer/ManufacutreUserDetial.js

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
import { Link } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import AddPageUser from './AddPageUser';

const CustomTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      borderRadius: '5px',
    },
    '& input': {
      height: '20px',
      padding: '8px',
      fontSize: '12px',
    },
  }
}));

// Helper function to format text in camel case
const toCamelCase = (text) => {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/_/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

function ManufactureUserDetail({ fetchUser, dealers }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    if (fetchUser) {
      fetchUser();  // You can still call fetchUser when necessary
    }
  }, [fetchUser]);

  // Filter dealers based on the camel-case formatted search term
  const filteredDealers = dealers.filter((dealer) => {
    const username = dealer.username ? dealer.username.toLowerCase() : '';
    const email = dealer.email ? dealer.email.toLowerCase() : '';
    const roleName = dealer.role_name ? toCamelCase(dealer.role_name).toLowerCase() : '';
    const companyName = dealer.company_name ? dealer.company_name.toLowerCase() : '';
    
    return (
      username.includes(searchTerm.toLowerCase()) ||
      email.includes(searchTerm.toLowerCase()) ||
      roleName.includes(searchTerm.toLowerCase()) ||
      companyName.includes(searchTerm.toLowerCase())
    );
  });

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginTop: 2 }}>
        <CustomTextField
          variant="outlined"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ width: '300px' }}
          placeholder="Search by User Name, Email, Role Name...."
        />
      </Box>

      <TableContainer component={Paper} sx={{ marginTop: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Phone</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Role Name</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Location</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Company Name</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
  {filteredDealers.length === 0 ? (
    <TableRow>
      <TableCell colSpan={6} style={{ textAlign: 'center'}}>
        No users found
      </TableCell>
    </TableRow>
  ) : (
    filteredDealers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((dealer) => (
      <TableRow style={{ cursor: 'pointer' }} key={dealer.id}>
        <TableCell>{dealer.username}</TableCell>
        <TableCell>{dealer.email}</TableCell>
        <TableCell>{dealer.mobile_number}</TableCell>
        <TableCell>{toCamelCase(dealer.role_name)}</TableCell>
        <TableCell>{dealer.address ? `${dealer.address.city}, ${dealer.address.state}` : 'N/A'}</TableCell>
        <TableCell>{dealer.company_name}</TableCell>
      </TableRow>
    ))
  )}
</TableBody>

        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={filteredDealers.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Box>
  );
}

export default ManufactureUserDetail;
