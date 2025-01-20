// src\components\Dealer\Products\ProductBrands.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  Checkbox,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  TextField,
  FormGroup,
  Grid,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const ProductBrand = ({ industryId , onBrandChange , selectedCategoryId , selectedBrandsProp   }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [brands, setBrands] = useState([]);
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBrands, setSelectedBrands] = useState([]);

  

  useEffect(() => {
    const fetchBrands = async () => {
      setLoading(true);
      setError(null);
      try {
        const userData = localStorage.getItem("user");
        console.log("userData", userData);
        let manufactureUnitId = "";
        let role_name = "";

        if (userData) {
          const data = JSON.parse(userData);
          manufactureUnitId = data.manufacture_unit_id;
          role_name = data.role_name;
        }

        const response = await axios.get(
          `${process.env.REACT_APP_IP}obtainbrandList/?manufacture_unit_id=${manufactureUnitId}&role_name=${role_name}&industry_id=${industryId || ""}&product_category_id=${selectedCategoryId || ""}&filters=all`
        );

        const responseData = response.data?.data || [];

        // Filter out invalid or duplicate brand names
        const filteredBrands = responseData.filter(
          (item, index, self) =>
            item.name &&
            item.name !== "null" &&
            index === self.findIndex((t) => t.name === item.name)
        );

        setBrands(filteredBrands);
      } catch (err) {
        console.error("API Error:", err);
        setError("Failed to load brands. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchBrands();
  }, [industryId , selectedCategoryId]);

  // Handle dialog visibility
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  
  useEffect(() => {
    if (selectedBrandsProp) {
      // Sync selectedBrands state with selectedBrandsProp
      const updatedSelectedBrands = brands.filter((brand) =>
        selectedBrandsProp.includes(brand.id)
      );
      setSelectedBrands(updatedSelectedBrands);
    }
  }, [selectedBrandsProp, brands]);
  

  const handleBrandSelection = (brandId) => {
    const selectedBrand = brands.find((brand) => brand.id === brandId);
    const updatedBrands = selectedBrands.some((brand) => brand.id === brandId)
      ? selectedBrands.filter((brand) => brand.id !== brandId)
      : [...selectedBrands, { id: selectedBrand.id, name: selectedBrand.name }];

    setSelectedBrands(updatedBrands);

    if (onBrandChange) {
      onBrandChange({
        updatedBrands,
      });
    }
  };
  

  


  // Filter brands for search
  const filteredBrands = brands.filter((b) =>
    b.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group brands by first letter
  const groupBrandsByLetter = () => {
    const grouped = {};
    filteredBrands.forEach((brand) => {
      const firstLetter = brand.name.charAt(0).toUpperCase();
      if (!grouped[firstLetter]) {
        grouped[firstLetter] = [];
      }
      grouped[firstLetter].push(brand);
    });
    return grouped;
  };

  // Sorted brand groups
  const sortedGroups = Object.keys(groupBrandsByLetter()).sort();

  return (
    <Box
      sx={{
        padding: 2,
      }}
    >
      {/* Brand Section */}
      <Box>
        <Typography variant="h6" gutterBottom sx={{ fontSize: "14px", fontWeight: 600 }}>
          Brand
        </Typography>
        {loading ? (
          <Typography>Loading...</Typography>
        ) : error ? (
          <Typography>{error}</Typography>
        ) : brands.length > 0 ? (
          <>
            <FormGroup>
              {/* Show only the first 5 brands */}
              {brands.slice(0, 5).map((brand) => (
                <FormControlLabel
                  key={brand.id}
                  control={
                    <Checkbox
                    checked={selectedBrands.some((selectedBrand) => selectedBrand.id === brand.id)}
                    onChange={() => handleBrandSelection(brand.id)}
                    />
                  }
                  label={`${brand.name} (${brand.products_count || 0})`}
                  sx={{ "& .MuiTypography-root": { fontSize: "14px" } }}
                />
              ))}
            </FormGroup>

            {/* Show the remaining brand count */}
            {brands.length > 5 && (
              <Typography
                sx={{ fontSize: "14px", marginTop: "10px", cursor: "pointer" }}
                onClick={handleOpen}
              >
                +{brands.length - 5} More
              </Typography>
            )}
          </>
        ) : (
          <Typography>No brands available</Typography>
        )}
      </Box>

      {/* Dialog for all brands */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Brands (A-Z)</Typography>
            <Box display="flex" alignItems="center" gap={2}>
              <TextField
                size="small"
                placeholder="Search Brand"
                variant="outlined"
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{ width: "250px" }}
              />
              <CloseIcon
                onClick={handleClose}
                color="primary"
                sx={{
                  cursor: "pointer",
                  fontSize: "24px",
                  "&:hover": { color: "#d32f2f" },
                }}
                tabIndex={0}
                aria-label="Close dialog"
              />
            </Box>
          </Box>
        </DialogTitle>

        <DialogContent dividers sx={{ maxHeight: "400px", overflowY: "auto" }}>
          {sortedGroups.length > 0 ? (
            sortedGroups.map((letter) => (
              <Box key={letter} mb={2}>
                <Typography variant="h6">{letter}</Typography>
                <Divider sx={{ marginBottom: 1 }} />
                <Grid container spacing={2}>
                  {groupBrandsByLetter()[letter].map((brand) => (
                    <Grid item xs={12} sm={6} md={4} key={brand.id}>
                      <FormControlLabel
                        control={
                          <Checkbox
                          checked={selectedBrands.some((selectedBrand) => selectedBrand.id === brand.id)}
                            onChange={() => handleBrandSelection(brand.id)}
                          />
                        }
                        label={`${brand.name} (${brand.products_count || 0})`}
                        sx={{ "& .MuiTypography-root": { fontSize: "14px" } }}
                      />
                    </Grid>
                  ))}
                </Grid>
              </Box>
            ))
          ) : (
            <Typography>No brands match your search.</Typography>
          )}
        </DialogContent>
      </Dialog>

    </Box>
  );
};

export default ProductBrand;