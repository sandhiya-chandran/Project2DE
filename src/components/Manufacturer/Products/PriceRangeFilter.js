// Import necessary modules
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Box, Slider,Button, TextField, Typography } from '@mui/material';

const PriceRangeFilter = ({ onPriceChange , PriceClear }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [priceRange, setPriceRange] = useState({ price_from: 0, price_to: '' });
  const [maxPrice, setMaxPrice] = useState(0); // State to hold the maximum price
  const [currency, setCurrency] = useState();

  const MaxPrice = async () => {
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
        `${process.env.REACT_APP_IP}get_highest_priced_product/?manufacture_unit_id=${manufactureUnitId}&role_name=${role_name}`
      );

      const responseData = response.data?.data || {};
      setMaxPrice(responseData.price || 1000); // Set the maximum price from the response
      setPriceRange({ price_from: 0, price_to: responseData.price }); // Update the price range
      setCurrency(responseData.currency);
    
    } catch (err) {
      console.error("API Error:", err);
      setError("Failed to load brands. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    MaxPrice();
  }, []);
  

  
  const handleSliderChange = (event, newValue) => {
    setPriceRange({ price_from: newValue[0], price_to: newValue[1] });
  };
  
  const handleSliderChangeCommitted = (event, newValue) => {
    onPriceChange({ price_from: newValue[0], price_to: newValue[1] });
  };

  const ClearPrice = () => {
    setPriceRange({ price_from: 0, price_to: maxPrice }); // Reset to default range
  };

  // Pass the clearPrice function to the parent component
  useEffect(() => {
    PriceClear(ClearPrice);
  }, [PriceClear]);

  

  return (
    <Box sx={{
        padding: 2,
        maxWidth: '100%', // Ensure it doesn't extend beyond the container
        overflow: 'hidden', // Prevent horizontal scroll
      }}>
      <Typography variant="h6" gutterBottom sx={{ fontSize: "14px", fontWeight: 600 }}>
        Price Range
      </Typography>
      <Slider
       value={[priceRange.price_from, priceRange.price_to]}
       onChange={handleSliderChange}
       onChangeCommitted={handleSliderChangeCommitted}
        valueLabelDisplay="auto"
        min={0}
        max={maxPrice} // Use the dynamic maximum price
        step={100}
        sx={{
            marginRight: 2,
            marginBottom: 1,
            height: 2, // Reduce the height to make the slider thinner
            '& .MuiSlider-thumb': {
              width: 10, // Reduce the size of the thumb
              height: 10, // Make the thumb smaller
              '&:hover': {
                boxShadow: 'none', // Remove hover effect
              },
              '&:focus, &:focus-visible': {
                boxShadow: 'none', // Remove focus effect
              },
            },
            '& .MuiSlider-track': {
              height: 2, // Adjust track height to match slider height
            },
            '& .MuiSlider-rail': {
              height: 2, // Adjust rail height to match slider height
            },
          }}
      />
      <Box>
      <Typography variant="h6" sx={{ fontSize: "13px"}} >
        {currency}{priceRange.price_from} - {currency}{priceRange.price_to}
      </Typography>
      </Box>
    </Box>
  );
};

export default PriceRangeFilter;