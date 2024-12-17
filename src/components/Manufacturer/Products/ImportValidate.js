import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  IconButton,Tooltip
} from '@mui/material';
import { Close } from '@mui/icons-material';

function ImportValidate() {
  const location = useLocation();
  const navigate = useNavigate();
  const validationData = location.state?.validationData;

  const handleClose = () => {
    navigate(-1); // Navigate back to the previous page
  };

  return (
    <Box sx={{ p: 2, backgroundColor: '#f5f5f5' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5" gutterBottom>
          Import Validation Results
        </Typography>
        <Tooltip title="Close">
          <IconButton onClick={handleClose} aria-label="close">
            <Close />
          </IconButton>
        </Tooltip>
      </Box>
      {validationData && validationData.validation_error ? (
        <div>
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="validation results table">
              <TableHead>
                <TableRow>
                  <TableCell align="center">
                    <strong>Row</strong>
                  </TableCell>
                  <TableCell align="center">
                    <strong>Error Count</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Errors</strong>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {validationData.validation_error.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell align="center">{item.row}</TableCell>
                    <TableCell align="center">
                      {item.error.length > 0 ? item.error.length : '0'}
                    </TableCell>
                    <TableCell>
                      {item.error.length > 0 ? (
                        <ul>
                          {item.error.map((error, errorIndex) => (
                            <li key={errorIndex}>
                              <Typography variant="body2" color="error">
                                {error}
                              </Typography>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <Typography variant="body2">No errors in this row.</Typography>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      ) : (
        <Typography variant="body1">No validation data available.</Typography>
      )}
    </Box>
  );
}

export default ImportValidate;
