import React, { useEffect, useState } from "react";
import axios from "axios";
import { Box, FormControl, MenuItem, Select, Typography } from "@mui/material";

function CategoryDropdowns() {
  const [categories, setCategories] = useState([]); // Parent categories
  const [selectedParent, setSelectedParent] = useState(""); // Selected parent category ID
  const [childCategories, setChildCategories] = useState([]); // Child categories
  const [selectedChild, setSelectedChild] = useState(""); // Selected child category ID

  // Fetch initial parent categories on mount
  useEffect(() => {
    const fetchParentCategories = async () => {
      try {
        const userData = localStorage.getItem("user");
        let manufactureUnitId = "";

        if (userData) {
          const data = JSON.parse(userData);
          manufactureUnitId = data.manufacture_unit_id;
        }

        // Fetch parent categories
        const response = await axios.get(
          `${process.env.REACT_APP_IP}obtainProductCategoryList/?manufacture_unit_id=${manufactureUnitId}`
        );
        const parentCategories = response.data.data.filter(
          (category) => category.is_parent
        );
        setCategories(parentCategories);
      } catch (error) {
        console.error("Error fetching parent categories:", error);
      }
    };

    fetchParentCategories();
  }, []);

  // Fetch child categories when a parent is selected
  useEffect(() => {
    const fetchChildCategories = async () => {
      if (!selectedParent) {
        setChildCategories([]); // Reset child categories if no parent selected
        return;
      }

      try {
        const userData = localStorage.getItem("user");
        let manufactureUnitId = "";

        if (userData) {
          const data = JSON.parse(userData);
          manufactureUnitId = data.manufacture_unit_id;
        }

        const response = await axios.get(
          `${process.env.REACT_APP_IP}obtainProductCategoryList/?manufacture_unit_id=${manufactureUnitId}&product_category_id=${selectedParent}&is_parent=true`
        );
        setChildCategories(response.data.data || []);
      } catch (error) {
        console.error("Error fetching child categories:", error);
      }
    };

    fetchChildCategories();
  }, [selectedParent]);

  return (
    <Box sx={{ display: "flex", gap: "20px", flexWrap: "wrap", p: 2 }}>
      {/* Parent Category Dropdown */}
      <Box sx={{ marginRight: "10px" }}>
        <FormControl fullWidth sx={{ minWidth: "200px" }}>
          <Select
            sx={{ fontSize: "14px" }}
            id="parent-category-select"
            value={selectedParent}
            onChange={(e) => {
              setSelectedParent(e.target.value);
              setSelectedChild(""); // Reset child selection
            }}
            displayEmpty
          >
            <MenuItem disabled sx={{ fontSize: "14px" }} value="">
              Category Level 1
            </MenuItem>
            {categories.length > 0 ? (
              categories.map((category) => (
                <MenuItem
                  sx={{ fontSize: "14px" }}
                  key={category.id}
                  value={category.id}
                >
                  {category.name}
                </MenuItem>
              ))
            ) : (
              <MenuItem disabled>
                <em>No parent categories available</em>
              </MenuItem>
            )}
          </Select>
        </FormControl>
      </Box>
     {/* Child Category Dropdown */}
<Box sx={{ marginRight: "10px" }}>
  <FormControl fullWidth sx={{ minWidth: "200px" }}>
    <Select
      sx={{ fontSize: "14px" }}
      id="child-category-select"
      value={selectedChild || ""} // Default to an empty string if no value is selected
      onChange={(e) => setSelectedChild(e.target.value)} // Update state correctly
      displayEmpty
      disabled={!selectedParent} // Disable if no parent is selected
    >
      {/* Placeholder option */}
      <MenuItem disabled sx={{ fontSize: "14px" }} value="">
      Category Level 2
      </MenuItem>

      {/* Render child categories */}
      {childCategories.length > 0 ? (
        childCategories.map((category) => (
          <MenuItem
            sx={{ fontSize: "14px" }}
            key={category.id}
            value={category.id}
          >
            {category.name}
          </MenuItem>
        ))
      ) : (
        <MenuItem disabled>
          <em>No child categories available</em>
        </MenuItem>
      )}
    </Select>
  </FormControl>
</Box>

    </Box>
  );
}

export default CategoryDropdowns;
