import React, { useState, useEffect } from 'react';
import {
    Typography,
    Box,
    Grid,
    List,
    ListItem,
    ListItemText,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import * as XLSX from 'xlsx';
import axios from 'axios';

const PersonalImport = () => {
    const [userData, setUserData] = useState([]);
    const [ setGeneralColumns] = useState([]);
    const [userColumns, setUserColumns] = useState([]);
    const [error, setError] = useState('');
    const [mappedData, setMappedData] = useState([]);

    const columnMapping = {
        "Model_number": "model",
        "SKU_number": "sku_number_product_code_item_number",
        "Upc": "upc_ean",
        "Breadcrumbs": "breadcrumb",
        "Product_name": "product_name",
        "Price": "msrp",
        "Price_currency": "currency",
        "Brand_name": "brand_name",
        "Product_img": "images",
        "Short_descriptions": "short_description",
        "Long_description": "long_description",
        "Highlighted_points": "features",
        "Rating": "tags", // Example placeholder, adjust as needed
        "Review_count": "quantity", // Example placeholder, adjust as needed
        "URL": "attributes", // Example placeholder, adjust as needed
        "Return_policy_days": "return_applicable",
        "Specification": "attributes", // Example placeholder, adjust as needed
        "Availability": "availability"
    };
    

    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = async (e) => {
                const binaryStr = e.target.result;
                const workbook = XLSX.read(binaryStr, { type: 'binary' });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];

                if (worksheet && XLSX.utils.sheet_to_json(worksheet, { header: 1 }).length > 0) {
                    const jsonData = XLSX.utils.sheet_to_json(worksheet);
                    setUserData(jsonData);
                    await fetchDatabaseData(file, jsonData);
                    setError('');
                } else {
                    setError('The uploaded file is empty. Please upload a valid Excel file.');
                    setUserData([]);
                }
            };
            reader.readAsBinaryString(file);
        }
    };

    const fetchDatabaseData = async (file, jsonData) => {
        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await axios.post(`${process.env.REACT_APP_IP}getColumnFormExcel/`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            const dbData = response.data.data;
            setGeneralColumns(dbData.general_columns || []);
            setUserColumns(dbData.user_columns || []);
            console.log('database', dbData.general_columns)
            console.log('userdb', dbData.user_columns)
            
        
            const mapped = mapUserDataWithDbData(jsonData, dbData.general_columns);
            setMappedData(mapped);
        } catch (error) {
            console.error('Error fetching database data:', error);
            setError('Failed to fetch data from the database.');
        }
    };

    // const mapUserDataWithDbData = (userData, generalColumns) => {
    //     console.log(userData,"mappedRow");
    //     console.log(generalColumns,"generalColumns");

    //     return userData.map(userRow => {
    //         const mappedRow = {};
    //         for (const userField of userColumns) {
    //             const generalField = columnMapping[userField];
    //             if (generalField) {
    //                 mappedRow[generalField] = userRow[userField] || null;
    //             }
    //         }
    //               return mappedRow;
    //     });
    // };


    const mapUserDataWithDbData = (userData) => {
        return userData.map((userRow) => {
            const mappedRow = {};
            
            // For each key in columnMapping, map userRow data to the general field
            Object.keys(columnMapping).forEach((userField) => {
                const generalField = columnMapping[userField];
                
                // Map the data only if the field exists in userRow
                if (userRow[userField] !== undefined) {
                    mappedRow[generalField] = userRow[userField];
                }
            });
            
            return mappedRow;
        });
    };
    
    useEffect(() => {
        if (userData.length > 0) {
            const mapped = mapUserDataWithDbData(userData);
            setMappedData(mapped);
        }
    }, [userData]); 
    return (
        <Box sx={{ padding: 2 }}>
            <Typography variant="h6">Upload an Excel File</Typography>
            <Box display="flex" alignItems="center" gap={2} mb={3}>
                <label htmlFor="file-upload" style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                    <CloudUploadIcon
                        sx={{
                            fontSize: '2rem',
                            color: (theme) => theme.palette.primary.main,
                            marginRight: '8px',
                            width: '150px',
                            height: '150px'
                        }}
                    />
                    <span style={{ color: 'grey', fontSize: '12px' }}>Please upload an Excel file (.xls or .xlsx)</span>
                    <input
                        id="file-upload"
                        type="file"
                        style={{ border: 'none', outline: 'none', display: 'none' }}
                        onChange={handleFileChange}
                    />
                </label>
            </Box>
            {error && <Typography color="error">{error}</Typography>}
            <Grid container spacing={2} mt={2}>
                <Grid item xs={6}>
                    <Typography variant="h6">User Columns</Typography>
                    <List>
                        {userColumns.map((col, index) => (
                            <ListItem key={index}>
                                <ListItemText primary={col} />
                            </ListItem>
                        ))}
                    </List>
                   
                </Grid>
                <Grid item xs={6}>
                    <Typography variant="h6">General Columns</Typography>
                    <List>
                   
                    {Object.keys(mappedData[0]).map((header) => (
                                    <ListItem key={header}>{header}</ListItem>
                                ))}
                
                    </List>
                </Grid>
            </Grid>

            {mappedData.length > 0 && (
                <TableContainer component={Paper} sx={{ mt: 2 }}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                {Object.keys(mappedData[0]).map((header) => (
                                    <TableCell key={header}>{header}</TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                         
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </Box>
    );
};

export default PersonalImport;

