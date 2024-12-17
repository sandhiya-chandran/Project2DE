import React from "react";
import {
  Box,
  Typography,
  FormGroup,
  FormControlLabel,
  Checkbox,
  TextField,
  Button,
} from "@mui/material";

const ProductSidebar = () => {
  return (
    <Box
      sx={{
        padding: 2,
        borderRight: "1px solid #ccc",
      }}
    >
      {/* Brand Section */}
      <Box mb={4}>
        <Typography variant="h6" gutterBottom sx={{ fontSize: "14px" }}>
          Brand Name
        </Typography>
        <FormGroup>
          <FormControlLabel
            control={<Checkbox />}
            label="Arrow (5)"
            sx={{ "& .MuiTypography-root": { fontSize: "14px" } }}
          />
          <FormControlLabel
            control={<Checkbox />}
            label="Build-Well (5)"
            sx={{ "& .MuiTypography-root": { fontSize: "14px" } }}
          />
          <FormControlLabel
            control={<Checkbox />}
            label="Shelterlogic (3)"
            sx={{ "& .MuiTypography-root": { fontSize: "14px" } }}
          />
          <FormControlLabel
            control={<Checkbox />}
            label="Suncast (33)"
            sx={{ "& .MuiTypography-root": { fontSize: "14px" } }}
          />
        </FormGroup>
      </Box>

      {/* Price Section */}
      <Box>
        <Typography variant="h6" gutterBottom sx={{ fontSize: "14px" }}>
          Price
        </Typography>
        <Box display="flex" gap={1} alignItems="center" mb={2}>
          <TextField
            variant="outlined"
            size="small"
            placeholder="Min."
            sx={{
              width: "20%",
              "& .MuiInputBase-root": {
                fontSize: "12px", // Font size for input text
                height: "32px", // Reducing the height
              },
              "& .MuiOutlinedInput-notchedOutline": {
                borderWidth: "1px", // Optional: Make border thinner
              },
            }}
          />
          <TextField
            variant="outlined"
            size="small"
            placeholder="Max."
            sx={{
              width: "20%",
              "& .MuiInputBase-root": {
                fontSize: "12px", // Font size for input text
                height: "32px", // Reducing the height
              },
              "& .MuiOutlinedInput-notchedOutline": {
                borderWidth: "1px", // Optional: Make border thinner
              },
            }}
          />
          <Button
            variant="contained"
            color="primary"
            sx={{
              minWidth: "32px", // Smaller button size
              height: "32px", // Matching text field height
              fontSize: "12px", // Font size for button text
              padding: "0", // Reducing padding for compact design
              backgroundColor: "#007BFF", // Example button background color
              "&:hover": {
                backgroundColor: "#0056b3", // Hover state color
              },
            }}
          >
            →
          </Button>
        </Box>
        <FormGroup>
          <FormControlLabel
            control={<Checkbox />}
            label="$0 – $25 (1)"
            sx={{ "& .MuiTypography-root": { fontSize: "14px" } }}
          />
          <FormControlLabel
            control={<Checkbox />}
            label="$25 – $50 (1)"
            sx={{ "& .MuiTypography-root": { fontSize: "14px" } }}
          />
          <FormControlLabel
            control={<Checkbox />}
            label="$50 – $100 (3)"
            sx={{ "& .MuiTypography-root": { fontSize: "14px" } }}
          />
          <FormControlLabel
            control={<Checkbox />}
            label="$100 – $250 (14)"
            sx={{ "& .MuiTypography-root": { fontSize: "14px" } }}
          />
          <FormControlLabel
            control={<Checkbox />}
            label="$250 – $500 (12)"
            sx={{ "& .MuiTypography-root": { fontSize: "14px" } }}
          />
          <FormControlLabel
            control={<Checkbox />}
            label="$500 – $1000 (10)"
            sx={{ "& .MuiTypography-root": { fontSize: "14px" } }}
          />
        </FormGroup>
      </Box>
    </Box>
  );
};

export default ProductSidebar;
