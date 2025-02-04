import React, { useState, useEffect } from "react";
import {
  Tabs,
  Tab,
  Box,
  TableBody,
  Table,
  TableCell,
  TableHead,
  TableRow,
  Grid,
  Typography,
  TextField,
  Paper,
  Card,
  CardContent,
  FormControlLabel,
  Switch,
  Button,
  IconButton,
  InputAdornment,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import axios from "axios";
import { useParams } from "react-router-dom";
import EmailTemplatePopUp from "../../Manufacturer/Settings/EmailTemplatePopUp";
import GeneralInfo from "./GeneralInfo";

function Settingspage() {
  const [selectedTab, setSelectedTab] = useState(0);
  const { id } = useParams();
  const [emailTemplates, setEmailTemplates] = useState([]);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [enabled, setEnabled] = useState(false);
  const [companyInfo, setCompanyInfo] = useState({
    companyName: "",
    contactName: "",
    email: "",
    phone: "",
    address: "",
    bankName: "",
    bankAccount: "",
  });

  useEffect(() => {
    console.log("Selected Tab: ", selectedTab);  // Log to check the tab state
  }, [selectedTab]);
  
  // Fetch email templates on component load
  useEffect(() => {
    const fetchEmailTemplates = async () => {
      try {
        const userData = localStorage.getItem("user");
        let manufactureUnitId = "";

        if (userData) {
          const data = JSON.parse(userData);
          manufactureUnitId = data.manufacture_unit_id;
        }
        const response = await axios.get(
          `${process.env.REACT_APP_IP}obtainAllMailTemplateForManufactureUnit/`,
          {
            params: { manufacture_unit_id: manufactureUnitId },
          }
        );
        setEmailTemplates(response.data.data || []);
      } catch (error) {
        console.error("Error fetching email templates:", error);
      }
    };

    fetchEmailTemplates();
  }, [id]);

  // Tab change handler
  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const handleOpenPopup = (template) => {
    setSelectedTemplate(template); // Set the clicked template
    setIsPopupOpen(true); // Open the popup
  };

  const handleToggle = (event) => {
    setEnabled(event.target.checked); // Toggle the state
  };  

  // Close popup handler
  const handleClosePopup = () => {
    setIsPopupOpen(false);
    setSelectedTemplate(null); // Reset the selected template
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCompanyInfo((prevInfo) => ({
      ...prevInfo,
      [name]: value,
    }));
  };

  return (
    <div>
      {/* Tabs at the top */}
      <Paper
        elevation={3}
        sx={{
          marginBottom: "20px",
          boxShadow: "none",
          backgroundColor: "white",
          position: "sticky",
          top: "56px",
          padding: "10px 0px",
          zIndex: 9,
        }}
      >
        <Tabs
          value={selectedTab}
          onChange={handleTabChange}
          textColor="primary"
          indicatorColor="primary"
          variant="fullWidth"
          sx={{ textTransform: "capitalize" }}
        >
          <Tab sx={{ textTransform: "capitalize" }} label="General Info" />
          <Tab sx={{ textTransform: "capitalize" }} label="Email Template" />
          <Tab sx={{ textTransform: "capitalize" }} label="Notifications" />
        </Tabs>
      </Paper>

      <Box sx={{ margin: "10px" }}>
        {/* Tab Content */}
        <Grid container spacing={2}>
          <Grid item xs={12}>
            {/* General Info Tab */}
     {/* General Info Tab */}
     <Box sx={{ display: selectedTab === 0 ? "block" : "none" }}>
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
                <GeneralInfo companyInfo={companyInfo} /> {/* Pass companyInfo as a prop */}
              </Box>
            </Box>


            {/* Email Template Tab */}
            <Box hidden={selectedTab !== 1}>
              {/* <Typography variant="h6" gutterBottom>
              Email Templates
            </Typography> */}
              <Paper elevation={3} sx={{ padding: "16px", overflowX: "auto" }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell align="center" sx={{ fontWeight: "bold" }}>
                        No
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: "bold" }}>
                        Code
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: "bold" }}>
                        Subject
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: "bold" }}>
                        Content
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: "bold" }}>
                        Actions
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {emailTemplates.map((template, index) => (
                      <TableRow key={template.id}>
                        <TableCell align="center">{index + 1}</TableCell>
                        <TableCell align="center">{template.code}</TableCell>
                        <TableCell align="center">{template.subject}</TableCell>
                        <TableCell align="center">
                          {template.default_template}
                        </TableCell>
                        <TableCell align="center">
                          <IconButton
                            onClick={() => handleOpenPopup(template)}
                            color="primary"
                          >
                            <EditIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Paper>
            </Box>

            {/* Notifications Tab */}
            <Box hidden={selectedTab !== 2}>
     
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
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Popup Component */}
      {isPopupOpen && selectedTemplate && (
        <EmailTemplatePopUp
          open={isPopupOpen}
          onClose={handleClosePopup}
          template={selectedTemplate}
          setEmailTemplates={setEmailTemplates} // Pass setEmailTemplates here
        />
      )}
    </div>
  );
}

export default Settingspage;
