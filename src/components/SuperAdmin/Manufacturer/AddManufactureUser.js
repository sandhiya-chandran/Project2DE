// src/components/SuperAdmin/Manufacturer/AddManufactureUser.js

import React, { useEffect, useState,useRef  } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  Typography,
  IconButton,
} from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AddPageUser from './AddPageUser';
import ManufactureUserDetail from './ManufacutreUserDetial';
import ManufactureProductList from './ManufactureProductList';

function AddManufactureUser() {
  const { id } = useParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [dealers, setDealers] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [unit, setUnit] = useState(null);
  const navigate = useNavigate();
  const fetchUserRef = useRef(false); 
  const [view, setView] = useState('user'); // Set default view as 'user'

  const handleViewUser = () => {
    setView('user');
  };

  const handleViewProduct = () => {
    setView('product');
  };

  const fetchUnits = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_IP}obtainManufactureUnitList/`);
      const units = response.data.data.manufacture_unit_list;
      const matchedUnit = units.find((unit) => unit.id === id);
      setUnit(matchedUnit);
    } catch (error) {
      console.error("Error fetching units:", error);
    }
  };

  useEffect(() => {
    fetchUnits();
  }, [id]);

  const fetchUser = async () => {
    try {
      if (!id || fetchUserRef.current) return; // Guard against invalid `id` or repeat calls
      fetchUserRef.current = true; // Mark as called
      const response = await axios.get(`${process.env.REACT_APP_IP}obtainUserListForManufactureUnit/`, {
        params: { manufacture_unit_id: id }
      });
      setDealers(response.data.data || []);
    } catch (error) {
      console.error("Error fetching dealers:", error);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [id]);


  const handleOpen = (id) => {
    setSelectedId(id);
    setOpen(true);
  };

  

  const handleClose = () => {
    setOpen(false);
    setSelectedId(null);
  };



  return (
    <Box sx={{ p: 2, flexGrow: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        {/* Left side: Company name, logo, and "Add New User" button */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {/* Company Logo Section */}
            <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '25px',
              height: '25px',
              borderRadius: '50%',
              backgroundColor: '#f0f0f0',
              overflow: 'hidden',
              padding: '5px',
            }}
          >
            {unit?.logo ? (
              <img
                src={unit.logo}
                alt="Company Logo"
                style={{
                  width: '25px',
                  height: '25px',
                  objectFit: 'cover',
                }}
              />
            ) : (
              <p>No logo available</p>
            )}
          </Box>

          
          <Box sx={{ textAlign: 'left' }}>
            <h5>{unit?.name || 'N/A'}</h5>
          </Box>

        
         
        
        </Box>

        {/* Right side: "View User" and "View Product" buttons */}
        <Box sx={{ display: 'flex', gap: 1 ,}}>
          {/* Conditionally render the "Add New User" button based on the view */}
          {view === 'user' && (
            <Button
              sx={{ border: '1px solid #1976d2', textTransform: 'capitalize' }}
              onClick={() => handleOpen(id)}
            >
              Add New User
            </Button>
          )}    

          <Button
            sx={{
              border: '1px solid #1976d2',
              textTransform: 'capitalize',
            
              backgroundColor: view === 'user' ? '#e3f2fd' : 'transparent', // Highlight selected
            }}
            onClick={handleViewUser}
          >
            View User
          </Button>

          <Button
            sx={{
              border: '1px solid #1976d2',
              textTransform: 'capitalize',
             
              backgroundColor: view === 'product' ? '#e3f2fd' : 'transparent', // Highlight selected
            }}
            onClick={handleViewProduct}
          >
            View Product
          </Button>
        </Box>
      </Box>


      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
            <DialogContent>
            <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography variant="h6">Add New Manufacture</Typography>
                <IconButton onClick={handleClose}>
                  <CloseIcon />
                </IconButton>
              </Box>
              <AddPageUser id={selectedId} onClose={handleClose} reloadUser={fetchUser}/>
            </DialogContent>
          </Dialog>

      {/* Display Manufacture User and Product List */}
      {view === 'user' && <ManufactureUserDetail   fetchUser={fetchUser} dealers={dealers}/>}
      {view === 'product' && <ManufactureProductList />}
    </Box>
  );
}

export default AddManufactureUser;
