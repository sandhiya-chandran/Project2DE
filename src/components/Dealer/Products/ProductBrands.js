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

const ProductBrand = ({ industryId , onBrandChange}) => {
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
        let manufactureUnitId = "";

        if (userData) {
          const data = JSON.parse(userData);
          manufactureUnitId = data.manufacture_unit_id;
        }

        const response = await axios.get(
          `${process.env.REACT_APP_IP}obtainbrandList/?manufacture_unit_id=${manufactureUnitId}&industry_id=${industryId || ""}&filters=all`
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
  }, [industryId]);

  // Handle dialog visibility
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleBrandSelection = (brandId) => {
    const updatedBrands = selectedBrands.includes(brandId)
      ? selectedBrands.filter((id) => id !== brandId)
      : [...selectedBrands, brandId];
    setSelectedBrands(updatedBrands);
    console.log("Selected Brands:", updatedBrands);

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
                      checked={selectedBrands.includes(brand.id)}
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
                            checked={selectedBrands.includes(brand.id)}
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