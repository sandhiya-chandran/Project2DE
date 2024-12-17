import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Paper,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Select,
  MenuItem,
  CircularProgress,
  FormHelperText,
  FormControl,
  InputLabel,
} from "@mui/material";

import { toast, ToastContainer } from "react-toastify"; // Importing toast and ToastContainer
import "react-toastify/dist/ReactToastify.css"; // Importing styles for react-toastify
import axios from "axios";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import AddIcon from "@mui/icons-material/Add";
import { Link } from "react-router-dom";
// const DEFAULT_LOGO = 'path/to/default/user/avatar.svg';
import DEFAULT_LOGO from "../../assets/user-logo.jpg";

const ManufacturerList = () => {
  const [manufacturerData, setManufacturerData] = useState({
    name: "",
    location: "",
    description: "",
    logo: "",
  });

  const [industriesEdit, setIndustriesEdit] = useState([]);
  const [industries, setIndustries] = useState([]);
  const [id, setId] = useState(null); // Store the manufacturer ID
  const [editingManufacturer, setEditingManufacturer] = useState(false); // Track if we are editing
  const [units, setUnits] = useState([]); // All manufacturer data
  const [filteredUnits, setFilteredUnits] = useState([]); // Filtered manufacturer data
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [searchTerm, setSearchTerm] = useState(""); // If editing or adding new
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false); // State to track loading

  const [isLoading, setIsLoading] = useState(false); // Loading state
  // const [isInputVisible, setInputVisible] = useState(false);
  const [isInputVisible, setIsInputVisible] = useState(false); // State to manage visibility of input field
  // State to toggle input visibility
  const [inputVisible, setInputVisible] = useState(false); // State to manage input visibility
  const [validationTriggered, setValidationTriggered] = useState(false);
  const [inputValue, setInputValue] = useState(""); // State to hold the input value
  const [locationError, setLocationError] = useState(false);
  const [fetchedIndustries, setFetchedIndustries] = useState([]);
  const [errors, setErrors] = useState({ name: false });
  // const handleFieldChange = (field, value) => {
  //   setManufacturerData((prev) => ({ ...prev, [field]: value }));
  // };
  const handleAddClick = () => {
    setIsInputVisible(true); // Show the input field when the Add button is clicked
  };
  const handleSaveClick = async () => {
    try {
      // Validate input value
      if (!inputValue.trim()) {
        alert("Please enter a value for the industry");
        return; // Exit if input is empty
      }

      // Send POST request to API
      const response = await axios.post(
        `${process.env.REACT_APP_IP}createIndustry/`,
        { name: inputValue }
      );

      // Handle the response from the API
      if (response.status === 200) {
        console.log("Industry saved:", response.data);
        // Reset the input field after saving
        setInputValue("");
        fetchIndustries();
        setIsInputVisible(false); // Hide the input field
      } else {
        console.error("Failed to save industry", response);
      }
    } catch (error) {
      // Handle errors (e.g., network issues, server errors)
      console.error("Error saving industry:", error);
      alert("An error occurred while saving the industry.");
    }
  };

  const handleFieldChange = (field, value) => {
    setManufacturerData((prev) => ({ ...prev, [field]: value }));
    if (field === "name") {
      setErrors((prevErrors) => ({
        ...prevErrors,
        name: value.trim() === "", // Re-check if the field is empty
      }));
    }
    if (field === "industries") {
      setIndustriesEdit(value);
      setLocationError(value.length === 0); // Show error if no industries are selected
    }
  };

  const handleLogoChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setManufacturerData((prev) => ({ ...prev, logo: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    let isValid = true;

    // Validate name
    // if (!manufacturerData.name.trim()) {
    //   isValid = false;
    // }
    if (!industriesEdit || industriesEdit.length === 0) {
      setLocationError(true);
      isValid = false;
    } else {
      setLocationError(false);
    }

    const fieldErrors = {
      name: !manufacturerData.name.trim(), // true if name is empty
    };

    setErrors(fieldErrors);
    return !Object.values(fieldErrors).includes(true); // Return true if no errors

    // Validate industries

    return isValid;
  };

  const handleSave = async () => {
    setLoading(true);
    setValidationTriggered(true); // Trigger validation messages

    if (!validateForm()) {
      return; // Prevent submission if form is invalid
    }

    const industryList = manufacturerData.industries;

    const data = {
      manufacture_unit_id: id,
      manufacture_unit_obj: {
        name: manufacturerData.name,
        description: manufacturerData.description,
        location: manufacturerData.location,
        logo: manufacturerData.logo || DEFAULT_LOGO,
      },
      industry_list: industryList ? industryList : industriesEdit,
    };

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_IP}createORUpdateManufactureUnit/`,
        data,
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      // Show success toaster notification
      toast.success(
        editingManufacturer
          ? "Manufacturer updated successfully!"
          : "Manufacturer added successfully!",
        {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
        }
      );

      fetchUnits();
      handleCancel();
      handleClose();
    } catch (err) {
      console.error("Error saving manufacturer:", err);
      toast.error("An error occurred while saving the manufacturer.", {
        position: "top-right",
        autoClose: 5000,
      });
    } finally {
      setLoading(false); // Stop loading indicator
    }
  };

  const fetchIndustries = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_IP}obtainIndustryList/`
      );
      console.log("Industry data:", response.data);
      setIndustries(response.data.data); // Set fetched industries to state
    } catch (err) {
      console.error("Error fetching industry list:", err);
    }
  };

  useEffect(() => {
    fetchIndustries(); // Fetch industries on component mount
  }, []);

  // const handleEdit = (manufacturer) => {
  //   setId(manufacturer.id); // Set the manufacturer ID
  //   setManufacturerData({
  //     name: manufacturer.name,
  //     location: manufacturer.location,
  //     description: manufacturer.description,
  //     logo: manufacturer.logo || DEFAULT_LOGO,
  //   });
  //   setEditingManufacturer(true); // Set to editing mode
  // };

  useEffect(() => {
    if (id) {
      // Fetch manufacturer details when ID changes
      const fetchManufacturer = async () => {
        try {
          const response = await axios.get(
            `${process.env.REACT_APP_IP}obtainManufactureUnitDetails/?manufacture_unit_id=${id}`
          );
          const productData = response.data.data.manufacture_unit_obj || {};
          setManufacturerData(productData); // Set manufacturer data for editing
        } catch (err) {
          console.error("Error fetching manufacturer details:", err);
        }
      };
      fetchManufacturer();
    }
  }, [id]);

  const handleCancel = () => {
    setEditingManufacturer(false); // Reset the editing state
    setManufacturerData({
      name: "",
      location: "",
      description: "",
      logo: DEFAULT_LOGO,
    }); // Clear the data
    setId(null); // Reset the manufacturer ID
    setOpen(false); // Close the popup (dialog)
  };

  const fetchUnits = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_IP}obtainManufactureUnitList/`
      );
      setUnits(response.data.data.manufacture_unit_list || []);
      setFilteredUnits(response.data.data.manufacture_unit_list || []); // Set filtered units initially
    } catch (error) {
      console.error("Error fetching units:", error);
    } finally {
      setIsLoading(false); // Hide loading
    }
  };

  useEffect(() => {
    fetchUnits();
  }, []);

  // Handle search term and filter data
  useEffect(() => {
    const filtered = units.filter(
      (unit) =>
        (unit.name &&
          unit.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (unit.location &&
          unit.location.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (unit.description &&
          unit.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    setFilteredUnits(filtered); // Update filtered units
    setPage(0); // Reset pagination to the first page when search term changes
  }, [searchTerm, units]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Reset to first page when rows per page changes
  };

  const handleOpen = (manufacturer) => {
    if (manufacturer) {
      setId(manufacturer.id); // Set the manufacturer ID for editing
      setManufacturerData({
        name: manufacturer.name,
        location: manufacturer.location,
        description: manufacturer.description,
        logo: manufacturer.logo || DEFAULT_LOGO,
      });
      const selectedIndustries = manufacturer.industry_list.map(
        (industry) => industry.id
      );
      setIndustriesEdit(selectedIndustries); // Set selected industries for editing
      setEditingManufacturer(true); // Set to editing mode
    } else {
      setEditingManufacturer(false); // Set to add mode for new manufacturer
      setManufacturerData({
        name: "",
        location: "",
        description: "",
        logo: DEFAULT_LOGO,
      });
      setIndustriesEdit([]); // Ensure industriesEdit is empty for new unit
    }
    setOpen(true); // Open the dialog
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleProductPage = () => {};

  return (
    <Box sx={{ p: 2 }}>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>
          {editingManufacturer ? "Edit Manufacturer" : "Add New Manufacturer"}
        </DialogTitle>
        <DialogContent>
        <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Name"
                  variant="outlined"
                  size="small"
                  fullWidth
                  value={manufacturerData.name}
                  onChange={(e) => handleFieldChange("name", e.target.value)}
                  error={validationTriggered && errors.name} // Highlight in red if there's an error
                  helperText={
                    validationTriggered && errors.name ? "Name is required" : ""
                  } // Show error message
                  InputProps={{ sx: { fontSize: "12px" } }}
                  InputLabelProps={{ sx: { fontSize: "12px" } }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Location"
                  variant="outlined"
                  size="small"
                  fullWidth
                  value={manufacturerData.location}
                  onChange={(e) =>
                    handleFieldChange("location", e.target.value)
                  }
                  InputProps={{ sx: { fontSize: "12px" } }}
                  InputLabelProps={{
                    shrink: !!manufacturerData.location, // Ensure the label shrinks if there's a value
                    sx: { fontSize: "12px" }, // Adjust label font size
                  }}
                />
              </Grid>

              {/* Industries Select */}
              <Grid container spacing={2} alignItems="center"></Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth error={locationError}>
                  <InputLabel>Industries</InputLabel>
                  <Select
                    label="Industries"
                    multiple
                    value={industriesEdit || []} // Set empty array for new unit
                    onChange={(e) =>
                      handleFieldChange("industries", e.target.value)
                    }
                    renderValue={(selected) =>
                      selected.length > 0
                        ? `${selected.length} selected`
                        : "Select industries"
                    }
                    size="small"
                  >
                    {industries.map((industry) => (
                      <MenuItem key={industry.id} value={industry.id}>
                        {industry.name}
                      </MenuItem>
                    ))}
                  </Select>
                  {locationError && (
                    <FormHelperText> industry must be selected</FormHelperText>
                  )}
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Grid
                  container
                  alignItems="center"
                  spacing={2}
                  style={{
                    marginLeft: "2px",
                    marginLeft: "-7px",
                    marginTop: "-32px",
                  }}
                >
                  <Grid item>
                    <Button
                      onClick={handleAddClick}
                      variant="contained"
                      color="primary"
                      size="small"
                      sx={{
                        minWidth: "20px",
                        padding: "0px",
                        marginTop: "27px",
                      }}
                    >
                      <AddIcon sx={{ fontSize: "16px" }} />
                    </Button>
                  </Grid>

                  {isInputVisible && (
                    <>
                      <Grid item>
                        <TextField
                          label="Enter Item"
                          variant="outlined"
                          size="small"
                          value={inputValue}
                          onChange={(e) => setInputValue(e.target.value)}
                          sx={{
                            width: 150,
                            fontSize: "12px",
                            marginTop: "19px",
                          }}
                        />
                      </Grid>

                      <Grid item>
                        <IconButton
                          onClick={handleSaveClick}
                          color="primary"
                          size="small"
                          sx={{ padding: "6px", marginTop: "19px" }}
                        >
                          <SaveIcon sx={{ fontSize: "16px" }} />
                        </IconButton>
                      </Grid>
                    </>
                  )}
                </Grid>
              </Grid>
              <Grid item xs={12}>
                <Box
                  sx={{
                    display: "flex",
                    height: "55px",
                    alignItems: "center",
                    gap: 2,
                  }}
                >
                  <TextField
                    label="Description"
                    variant="outlined"
                    size="small"
                    fullWidth
                    multiline
                    rows={1}
                    value={manufacturerData.description}
                    onChange={(e) =>
                      handleFieldChange("description", e.target.value)
                    }
                    InputLabelProps={{
                      shrink: !!manufacturerData.description, // Ensure the label shrinks if there's a value
                      sx: { fontSize: "12px" }, // Adjust label font size
                    }}
                  />
                  <Button
                    variant="text"
                    component="label"
                    sx={{
                      display: "flex",
                      textTransform: "capitalize",
                      fontSize: "12px",
                      alignItems: "center",
                      backgroundColor: "transparent",
                      boxShadow: "none",
                      padding: 0,
                      border: "none",
                    }}
                  >
                    <Avatar
                      src={
                        manufacturerData.logo
                          ? manufacturerData.logo
                          : DEFAULT_LOGO
                      } // Default to DEFAULT_LOGO if no logo
                      alt="Logo"
                      sx={{ width: 56, height: 56, mr: 1 }}
                    />
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={handleLogoChange}
                    />
                  </Button>
                </Box>
              </Grid>
        </Grid>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCancel}
            color="secondary"
            sx={{ textTransform: "capitalize", fontSize: "12px" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            color="primary"
            disabled={loading} // Disable the button while loading
            sx={{
              textTransform: "capitalize",
              fontSize: "12px",
              position: "relative",
            }}
          >
            {loading ? (
              <CircularProgress size={20} color="inherit" />
            ) : editingManufacturer ? (
              "Update"
            ) : (
              "Save"
            )}
          </Button>
        </DialogActions>
        {/* <ToastContainer    position="bottom-right"
        autoClose={1000}
        hideProgressBar
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover/> */}
      </Dialog>
      
      
      <ToastContainer />
      
      
      {/* Manufacturer Listing Table */}
     
      <Box style={{ justifyContent: "flex-end", display: "flex" , marginBottom:'20px'}}>
        <Button
          sx={{ border: "1px solid #1976d2", textTransform: "capitalize" }}
          onClick={() => {
            setManufacturerData({
              name: "",
              location: "",
              description: "",
              logo: "",
            });
            setIndustriesEdit([]);
            setValidationTriggered(false); // Reset validation state
            handleOpen(null); // Open dialog
          }}
        >
          Add New Unit
        </Button>
        <TextField
          variant="outlined"
          placeholder="Search by Name"
          size="small"
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
          sx={{ width: 300, marginLeft: 2 }}
          InputProps={{ style: { fontSize: "13px" } }}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </Box>

      <TableContainer component={Paper}>
        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", padding: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Logo</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Industry</TableCell>

                <TableCell>Location</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUnits
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((unit) => (
                  <TableRow key={unit.id}>
                    <TableCell style={{ padding: "10px", textAlign: "center" }}>
                      <Avatar style={{width:'25px', height:'25px'}} src={unit.logo || DEFAULT_LOGO} alt={unit.name} />
                    </TableCell>
                    <TableCell style={{ padding: "10px" }}>
                      <Link
                        style={{
                          textDecoration: "none",
                          textTransform: "inherit",
                          color: "black", // Replace 'black' with your desired color
                        }}
                        to={`/super_admin/manufacturerList/userDetails/${unit.id}`}
                      >
                        {unit.name}
                      </Link>
                    </TableCell>

                    <TableCell style={{ padding: "10px" }}>
                      {unit.industry_list && unit.industry_list.length > 0
                        ? unit.industry_list[0].name.length > 40
                          ? `${unit.industry_list[0].name.slice(0, 40)}...`
                          : unit.industry_list[0].name
                        : "N/A"}
                    </TableCell>

                    <TableCell style={{ padding: "10px" }}>
                      {unit.location && unit.location.trim() !== ""
                        ? unit.location
                        : "N/A"}
                    </TableCell>
                    <TableCell style={{ padding: "10px", textAlign: "center" }}>
                      <IconButton size="small" onClick={() => handleOpen(unit)}>
                        <EditIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        )}
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={filteredUnits.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />

      {/* </Box> */}
    </Box>
  );
};

export default ManufacturerList;
