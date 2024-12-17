

import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  IconButton,
  Divider,
  CircularProgress,
  Alert,
  AlertTitle, Grid, FormControl, InputLabel, Select, MenuItem, FormHelperText 
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CancelIcon from '@mui/icons-material/Cancel';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ValidatePopup from './ValidatePopup'; // Import the ValidatePopup component

function Import() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [validationMessage, setValidationMessage] = useState('');
  const [canSubmit, setCanSubmit] = useState(false);
  const [validationData, setValidationData] = useState(null);
  const [xlData, setXlData] = useState(null);
  const [duplicateProducts, setDuplicateProducts] = useState([]); // State for duplicate products
  const [openPopup, setOpenPopup] = useState(false); // State for popup visibility
  const [industries, setIndustries] = useState([]);
  const [industriesEdit, setIndustriesEdit] = useState([]);
  const [locationError, setLocationError] = useState(false);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      const fileType = selectedFile.type;
      const fileName = selectedFile.name;

      if (!isValidExcelFile(fileType, fileName)) {
        setError('Please select a valid Excel file (.xls or .xlsx)');
        setFile(null);
      } else {
        setError('');
        setFile(selectedFile);
      }
    }
  };

  const isValidExcelFile = (fileType, fileName) => {
    return (
      fileType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      fileType === 'application/vnd.ms-excel' ||
      fileName.endsWith('.xls') ||
      fileName.endsWith('.xlsx')
    );
  };

  const handleCancel = () => {
    resetState();
    navigate('/manufacturer/products');
  };

  const resetState = () => {
    setFile(null);
    setError('');
    setValidationMessage('');
    setCanSubmit(false);
    setXlData(null);
  };

  const handleFieldChange = (field, value) => {
    if (field === 'industries') {
      setIndustriesEdit(value);
    }
  };

  const fetchIndustries = async () => {
    try {
      const manufactureUnitId = getManufactureUnitId();

      // Ensure your API URL is correct
      const response = await axios.get(`${process.env.REACT_APP_IP}obtainIndustryForManufactureUnit/?manufacture_unit_id=${manufactureUnitId}`);
      console.log('Industry data:', response.data);
      setIndustries(response.data.data); // Set fetched industries to state
    } catch (err) {
      console.error('Error fetching industry list:', err);
    }
  };

  // Fetch industries on component mount
  useEffect(() => {
    fetchIndustries();
  }, []);
  useEffect(() => {
    fetchIndustries(); // Fetch industries on component mount
  }, []);

  const handleSubmit = async () => {
    if (!xlData) return;
  
    const manufactureUnitId = getManufactureUnitId(); // Fetch Manufacture Unit ID
    const industryId = industriesEdit; // Single selected industry ID
  
    if (!industryId) {
      setLocationError(true); // Show error if industry is not selected
      return;
    }
  
    try {
      setLoading(true); 
      const response = await axios.post(
        `${process.env.REACT_APP_IP}save_file/`,
        {
          xl_data: xlData,
          manufacture_unit_id: manufactureUnitId,
          industry_id: industryId, // Send selected industry ID
        }
      );
  
      if (response.data.status) {
        const duplicates = response.data.data.duplicate_products;
        const industryIdFromResponse = response.data.data; // Get industry_id from the response

        if (duplicates.length > 0) {
          // If duplicates exist, open the popup
          setDuplicateProducts(industryIdFromResponse);
          setOpenPopup(true);
        } else {
          // Navigate to the product list if no duplicates
          navigate("/manufacturer/products");
        }
      } else {
        console.error("Failed to submit file:", response.data.message);
      }
    } catch (err) {
      console.error("Error submitting file:", err.message);
    }
    finally {
      setLoading(false); // Stop loading spinner
    }
  };
  
  const getManufactureUnitId = () => {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData).manufacture_unit_id : '';
  };

  const handleValidate = async () => {
    if (!file) return;

    setLoading(true);
    setValidationMessage('');
    setCanSubmit(false);

    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await axios.post(
        `${process.env.REACT_APP_IP}upload_file/`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      handleValidationResponse(response);
    } catch (err) {
      setError('Failed to validate the file: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleValidationResponse = (response) => {
    if (response.data.status) {
      const { xl_contains_error, xl_data } = response.data.data;

      if (xl_contains_error) {
        setValidationMessage('File contains errors. Please correct and revalidate.');
        setCanSubmit(false);
        setValidationData(response.data.data);
      } else {
        setValidationMessage('File is valid and ready for submission.');
        setCanSubmit(true);
        setXlData(xl_data);
      }
    } else {
      setValidationMessage('Validation failed: ' + response.data.message);
    }
  };

  useEffect(() => {
    if (validationData) {
      navigate('/manufacturer/products/validate', { state: { validationData } });
    }
  }, [validationData, navigate]);

  return (
    <Paper elevation={3} sx={{ padding: 4, maxWidth: 600, height:'400px', margin: 'auto', mt: 5, position: 'relative' }}>
      <Typography variant="h5" gutterBottom>
        General Import File
      </Typography>
      <IconButton color="error" onClick={handleCancel} sx={{ position: 'absolute', top: 16, right: 16 }}>
        <CancelIcon />
      </IconButton>
      <Divider sx={{ mb: 3 }} />

      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <label htmlFor="file-upload" style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
          <CloudUploadIcon sx={{ fontSize: '2rem', color: (theme) => theme.palette.primary.main, mr: 2 }} />
          <span style={{ color: 'grey', fontSize: '12px' }}>Please upload an Excel file (.xls or .xlsx)</span>
        
          <input
            id="file-upload"
            type="file"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
         
        </label>
        <Box>
        <FormControl fullWidth error={locationError}>
  <InputLabel>Industry</InputLabel>
  <Select
    label="Industry"
    value={industriesEdit || ""} // Selected industry ID
    onChange={(e) => {
      setIndustriesEdit(e.target.value); // Update the selected industry
      setLocationError(false); // Clear error if an industry is selected
    }}
    size="small"
    sx={{
      width: "300px", // Increase the width of the select field
      height: "35px", // Reduce the height of the dropdown
    }}
  >
    {industries.map((industry) => (
      <MenuItem key={industry.id} value={industry.id}>
        {industry.name}
      </MenuItem>
    ))}
  </Select>
  {locationError && <FormHelperText>Industry must be selected</FormHelperText>}
</FormControl>


</Box>


      </Box>
  <Box sx={{marginTop: '56px'}}>
      <TextField
        disabled
        fullWidth
        placeholder="No file selected"
        value={file ? file.name : ''}
        sx={{ flexGrow: 1 }}
      />
</Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          <AlertTitle>Error</AlertTitle>
          {error}
        </Alert>
      )}

      {validationMessage && (
        <Alert severity={canSubmit ? "success" : "error"} sx={{ mb: 2 }}>
          <AlertTitle>{canSubmit ? "Success" : "Error"}</AlertTitle>
          {validationMessage}
        </Alert>
      )}

<Box display="flex" justifyContent="center" mt={3}>
  {!canSubmit && (
    <Button
      variant="outlined"
      color="warning"
      onClick={handleValidate}
      disabled={loading}
      sx={{ textTransform: 'capitalize' }} // Capitalize the text
    >
      {loading ? <CircularProgress size={24} color="inherit" /> : 'Validate'}
    </Button>
  )}
  {canSubmit && (
    <Button
      variant="contained"
      color="primary"
      onClick={handleSubmit}
      disabled={loading}
      sx={{ textTransform: 'capitalize' }} // Capitalize the text
    >
      {loading ? <CircularProgress size={24} color="inherit" /> : 'Submit'}
    </Button>
  )}
</Box>


      <ValidatePopup
  open={openPopup}
  onClose={() => setOpenPopup(false)}
  data={duplicateProducts} // Pass duplicate products data to the popup
  sx={{
    '& .MuiDialog-paper': {
      height: '80%', // Adjust the height to your desired value
      maxHeight: 'none', // Ensure no constraints on height
    },
  }}
/>

    </Paper>
  );
}

export default Import;