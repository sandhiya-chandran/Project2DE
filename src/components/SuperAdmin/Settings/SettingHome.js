import React, { useState, useEffect } from 'react';
import { Tabs, Tab, Box, TableBody, Table, TableCell, TableRow, Grid, Typography, Switch, FormControlLabel, TextField, Button, Card, CardContent, Paper, MenuItem } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import IconButton from '@mui/material/IconButton';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const textFieldStyles = {
  marginBottom: '16px',
};

function SettingHome() {
  const [selectedTab, setSelectedTab] = useState(0);
  const { id } = useParams();
  const [enabled, setEnabled] = useState(false);
  const [emailTemplates, setEmailTemplates] = useState([]);
  console.log('9090',id)
  useEffect(() => {
    const fetchEmailTemplates = async () => {
      try {
        const userData = localStorage.getItem('user');
        console.log('----',userData)
        let manufactureUnitId = '';
    
        if (userData) {
          const data = JSON.parse(userData);
          manufactureUnitId = data.manufacture_unit_id;
          console.log('990099',manufactureUnitId)
        }
    
        const response = await axios.get(`${process.env.REACT_APP_IP}obtainAllMailTemplateForManufactureUnit/`, {
          params: { manufacture_unit_id: manufactureUnitId },
        });
        setEmailTemplates(response.data.data || []);
      } catch (error) {
        console.error("Error fetching email templates:", error);
      }
    };

    fetchEmailTemplates();
  }, [id]);

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const handleToggle = (event) => {
    setEnabled(event.target.checked);
  };
  const handleEdit = (template) => {
    console.log("Edit template:", template);
    // Implement your edit functionality here
  };

  return (
//     <div style={{ padding: '20px' }}>
//       <Tabs value={selectedTab} onChange={handleTabChange} centered>
//         <Tab label="General Info" />
//         <Tab label="Email Template" />
//         <Tab label="Notifications" />
//       </Tabs>

//       <Box hidden={selectedTab !== 0}>
//         {/* General Info Form */}
//         <Grid container spacing={3}>
//           <Typography variant="h4" gutterBottom sx={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px' }}>
//             Settings
//           </Typography>

//           <Grid container spacing={4}>
//             {/* Edit Profile Section */}
//             <Grid item xs={12} md={6}>
//               <Paper elevation={3} sx={{ padding: '20px' }}>
//                 <Typography variant="h6" sx={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '20px' }}>
//                   Edit Profile
//                 </Typography>
//                 <TextField
//                   fullWidth
//                   label="Your Name"
//                   sx={textFieldStyles}
//                   InputProps={{
//                     placeholder: 'Enter your name',
//                   }}
//                 />
//                 <TextField
//                   fullWidth
//                   label="Store Name"
//                   sx={textFieldStyles}
//                   InputProps={{
//                     placeholder: 'Enter your store name',
//                   }}
//                 />
//                 <TextField
//                   select
//                   fullWidth
//                   label="Location"
//                   defaultValue="United States"
//                   sx={textFieldStyles}
//                 >
//                   <MenuItem value="United States">United States</MenuItem>
//                   <MenuItem value="Canada">Canada</MenuItem>
//                 </TextField>
//                 <TextField
//                   select
//                   fullWidth
//                   label="Currency"
//                   defaultValue="US Dollar ($)"
//                   sx={textFieldStyles}
//                 >
//                   <MenuItem value="US Dollar ($)">US Dollar ($)</MenuItem>
//                   <MenuItem value="Euro (€)">Euro (€)</MenuItem>
//                 </TextField>
//                 <TextField
//                   fullWidth
//                   label="Email"
//                   defaultValue="kim@gmail.com"
//                   sx={textFieldStyles}
//                   InputProps={{
//                     placeholder: 'Enter your email',
//                   }}
//                 />
//                 <TextField
//                   fullWidth
//                   label="Phone"
//                   defaultValue="01978536547"
//                   sx={textFieldStyles}
//                   InputProps={{
//                     placeholder: 'Enter your phone number',
//                   }}
//                 />
               
//               </Paper>
//             </Grid>

//             {/* Change Password Section */}
//             {/* <Grid item xs={12} md={6}>
//               <Paper elevation={3} sx={{ padding: '20px' }}>
//                 <Typography variant="h6" sx={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '20px' }}>
//                   Change Password
//                 </Typography>
//                 <TextField
//                   fullWidth
//                   label="Current Password"
//                   type="password"
//                   sx={textFieldStyles}
//                   InputProps={{
//                     placeholder: 'Enter current password',
//                   }}
//                 />
//                 <TextField
//                   fullWidth
//                   label="New Password"
//                   type="password"
//                   sx={textFieldStyles}
//                   InputProps={{
//                     placeholder: 'Enter new password',
//                   }}
//                 />
//                 <TextField
//                   fullWidth
//                   label="Confirm Password"
//                   type="password"
//                   sx={textFieldStyles}
//                   InputProps={{
//                     placeholder: 'Confirm new password',
//                   }}
//                 />
//               </Paper>
//             </Grid> */}
//           </Grid>
//         </Grid>
//       </Box>

//       <Box hidden={selectedTab !== 1}>
//         {/* Email Template Table */}
//         <Typography variant="h6" gutterBottom>Email Templates</Typography>
//         <Table>
//   <TableBody>
//     {emailTemplates.map((template, index) => (
//       <TableRow key={index}>
//         <TableCell>{index + 1}</TableCell>
//         <TableCell>{template.code}</TableCell>
//         <TableCell>{template.subject}</TableCell>
//         <TableCell>
//           <IconButton onClick={() => handleEdit(template)}>
//             <EditIcon />
//           </IconButton>
//         </TableCell>
//       </TableRow>
//     ))}
//   </TableBody>
// </Table>

//       </Box>

//       <Box hidden={selectedTab !== 2}>
//         {/* Notifications Settings */}
//         <Grid item xs={12} md={6}>
//           <Card>
//             <CardContent>
//               <Typography variant="h6">Notifications</Typography>
//               <FormControlLabel
//                 control={<Switch checked={enabled} onChange={handleToggle} />}
//                 label="Enable Notifications"
//               />
//             </CardContent>
//           </Card>
//         </Grid>
//         <Button variant="contained" color="primary">Save Settings</Button>
//       </Box>
//     </div>

<Box
sx={{
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  minHeight: "200px",
  textAlign: "center",
  flexDirection: "column",
}}
>
<Typography variant="h6" color="textSecondary">
  This feature will be available soon!
</Typography>
<Typography variant="body2" color="textSecondary">
  We're working on it. Stay tuned!
</Typography>
</Box>
  );
}

export default SettingHome;
