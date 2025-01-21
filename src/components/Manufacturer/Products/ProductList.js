// src\components\Manufacturer\Products\ProductList.js
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  IconButton,
  CircularProgress,
  Box,
  MenuItem,
  Select,
  FormControl,
  Checkbox,
  Button,
  InputLabel,
  TablePagination,
  Tooltip,
  Menu,
  Grid,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

import {
  Visibility,
  VisibilityOff,
  MoreVert as MoreVertIcon,
  Discount,
} from "@mui/icons-material";
import PopupModal from "./PopupModel";
import SearchIcon from "@mui/icons-material/Search";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import "react-toastify/dist/ReactToastify.css"; // Import the CSS file
import { ToastContainer, toast } from "react-toastify";
import soonImg from "../../assets/soon-img.png";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import ProductBrand from "./ProductBrands";

function ProductList() {
  const location = useLocation();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [filter, setFilter] = useState("");
  const [categories, setCategories] = useState([]);
  const [editedValues, setEditedValues] = useState({});
  const [editedVisibility, setEditedVisibility] = useState({});
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [filters, setFilters] = useState("all");
  const [anchorEl, setAnchorEl] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "asc" });
  const [currentColumn, setCurrentColumn] = useState("");
  const [open, setOpen] = useState(false); // Track the dropdown open state
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [discountValue, setDiscountValue] = useState("");
  const [isBulkEditing, setIsBulkEditing] = useState(false); // State for Bulk Edit mode
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [filteredItems, setFilteredItems] = useState([]);
  const [discountUnit, setDiscountUnit] = useState("%");
  const [data, setCategorySearch] = useState([]); // Initialize data state
  const [isAllSelected, setIsAllSelected] = useState(false);
  const [isSomeSelected, setIsSomeSelected] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const searchTimeout = useRef(null);
  const [industryList, setIndustryList] = useState([]); // Stores all available industries
  const [industry, setIndustry] = useState(null);
  const [value, setValue] = useState(-1);
  const [selectedBrandIds, setSelectedBrandIds] = useState([]);
  const [selectedParent, setSelectedParent] = useState(""); // Selected parent category ID
  const [childCategories, setChildCategories] = useState([]); // Child categories
  const [selectedChild, setSelectedChild] = useState(""); // Selected child category ID
  const [selectedBrandNames, setSelectedBrandNames] = useState([]); // For Tags

  const userData = localStorage.getItem("user");

  const handleReload = () => {
    window.location.reload(); // Reloads the current browser window
  };

  const handleClearAll = () => {
    setSelectedBrandIds([]);

    if (searchTerm) {
      setSearchTerm("");
    } else {
      // fetchData("all", "");
      setSelectedCategory("");
      setSelectedParent("");
      setSelectedChild("");
      setIndustry(null);
      refreshData();
    }
    setFilteredItems(items); // Reset to full product list (assuming `items` is your full product list)
    setPage(0); // Reset to the first page

    // Clear search query from location state and replace the history entry
    navigate(location.pathname, {
      replace: true, // Replace the current entry in the history stack
      state: {
        ...location.state, // Retain other location state if any
        searchQuery: "", // Clear the searchQuery in location.state
      },
    });
  };

  const refreshData = async () => {
    try {
      const userData = localStorage.getItem("user");
      let manufactureUnitId = "";
      if (userData) {
        const data = JSON.parse(userData);
        manufactureUnitId = data.manufacture_unit_id;
      }
      const categoryResponse = await axios.get(
        `${process.env.REACT_APP_IP}obtainProductCategoryList/?manufacture_unit_id=${manufactureUnitId}`
      );
      setCategories(categoryResponse.data.data || []);
      // Fetch items
      // fetchData("all");
    } catch (error) {}
  };

  useEffect(() => {
    refreshData();
  }, []);

  // Fetch data asynchronously with filters, category, and sorting
  const fetchData = async (
    filters = "all",
    selectedCategory = null,
    industry = null,
  ) => {
    console.log("Selected Brand IDs inside fetchData:", selectedBrandIds);
    const industryId = industry?.id || "";
    const categoryId = selectedCategory?.id || ""; // Use selectedCategory.id safely
    const isParent = selectedCategory?.is_parent || false; // Ensure is_parent is handled
  
    setLoading(true);
    setError("");
  
    try {
      const userData = localStorage.getItem("user");
      let manufactureUnitId = "";
  
      if (userData) {
        const data = JSON.parse(userData);
        manufactureUnitId = data.manufacture_unit_id;
      }
  
       const payload = {
        manufacture_unit_id: manufactureUnitId,
        product_category_id: categoryId,
        industry_id: industryId,
        filters: filters,
        sort_by: sortConfig.key,
        sort_by_value: sortConfig.direction === "asc" ? 1 : -1,
        is_parent: isParent, // Correctly set is_parent
        brand_id_list: selectedBrandIds,
      };
  
      console.log("Payload being sent to server:", payload);
  
      const response = await axios.post(
        `${process.env.REACT_APP_IP}obtainProductsList/`,
        payload
      );
  
      console.log("Response from server:", response);
  
      const products = response.data.data || [];
      setItems(products); // Update default product list
      setFilteredItems(products); // Initialize filtered items
    } catch (err) {
      setError("Failed to load items");
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(
      filters,
      selectedCategory,
      industry,
    );
  }, [
    filters,
    selectedCategory,
    industry,
    sortConfig,
    selectedBrandIds,
  ]);

  // Handle brand selection changes from ProductBrand
  const handleBrandChange = ({ updatedBrands }) => {
    // Extract IDs and names from the updated list
    const ids = updatedBrands.map((brand) => brand.id);
    const names = updatedBrands.map((brand) => brand.name);

    setSelectedBrandIds(ids); // Update IDs for API
    setSelectedBrandNames(names); // Update names for tags
  };

  // Handle tag removal
  const handleTagRemove = (id) => {
    // Update IDs and names based on the removed tag
    const updatedIds = selectedBrandIds.filter((brandId) => brandId !== id);
    const updatedNames = selectedBrandNames.filter(
      (_, index) => selectedBrandIds[index] !== id
    );

    setSelectedBrandIds(updatedIds);
    setSelectedBrandNames(updatedNames);
  };

  // Fetch industries on component mount
  useEffect(() => {
    const fetchIndustry = async () => {
      try {
        let manufactureUnitId = "";

        if (userData) {
          const data = JSON.parse(userData);
          manufactureUnitId = data.manufacture_unit_id;
        }

        const IndustryResponse = await axios.get(
          `${process.env.REACT_APP_IP}obtainIndustryForManufactureUnit/?manufacture_unit_id=${manufactureUnitId}`
        );

        setIndustryList(IndustryResponse.data.data || []); // Set industries in state
      } catch (err) {
        console.error("Error fetching Industry:", err); // Log any errors
      }
    };

    fetchIndustry(); // Trigger the API call
  }, []);

  const handleIndustryChange = (event) => {
    setValue(-1);
    const selectedIndustryId = event.target.value;
    const selectedIndustry = industryList.find(
      (item) => item.id === selectedIndustryId
    );
    setIndustry(selectedIndustry);
    setSelectedBrandIds([]);

    setSelectedCategory(null);
    setSelectedParent("");
    setSelectedChild("");
    setSelectedBrandIds([]);
    setSelectedBrandNames([]);
  };

  const getValidationMessage = (wasPrice, price) => {
    if (Number(price) > Number(wasPrice)) {
      return "Price cannot be greater than Was Price";
    }
    return "";
  };

  useEffect(() => {
    // Check if the state contains searchQuery and set it
    if (location.state && location.state.searchQuery) {
      setSearchTerm(location.state.searchQuery); // Set the search query from location.state
    }
  }, [location.state]);

  useEffect(() => {
    console.log("Updated searchTerm:", searchTerm); // This will log every time searchTerm changes
    if (searchTerm) {
      handleSearchChange({ target: { value: searchTerm } }); // Directly call handleSearchChange
    }
  }, [searchTerm]); // This effect runs when searchTerm state changes

  // Fetch initial categories and products on mount
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const userData = localStorage.getItem("user");
        let manufactureUnitId = "";

        if (userData) {
          const data = JSON.parse(userData);
          manufactureUnitId = data.manufacture_unit_id;
        }

        // Fetch initial category list
        const categoryResponse = await axios.get(
          `${process.env.REACT_APP_IP}obtainProductCategoryList/?manufacture_unit_id=${manufactureUnitId}`
        );

        const parentCategories = categoryResponse.data.data.filter(
          (category) => category.is_parent
        );

        setCategories(parentCategories);
        setSelectedBrandIds([]);
        setSelectedBrandNames([]);

        // Fetch initial product list for all categories
        await fetchData();
      } catch (error) {}
    };

    fetchInitialData();
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
        setSelectedBrandIds([]);
        setSelectedBrandNames([]);
      } catch (error) {
        console.error("Error fetching child categories:", error);
      }
    };

    fetchChildCategories();
  }, [selectedParent]);

  const handleOpenBulkEdit = async () => {
    if (selectedCategory && !searchTerm) {
      setSelectedCategory("All Categories");
      const userData = localStorage.getItem("user");
      let manufactureUnitId = "";

      if (userData) {
        const data = JSON.parse(userData);
        manufactureUnitId = data.manufacture_unit_id;
      }
      const categoryResponse = await axios.get(
        `${process.env.REACT_APP_IP}obtainProductCategoryList/?manufacture_unit_id=${manufactureUnitId}`
      );

      if (categoryResponse.data) {
        console.log("iiii", categoryResponse.data);
        setCategories(categoryResponse.data.data || []);
        fetchData();
      }

      // Reset the dropdown to show "All Categories"
    }

    setIsBulkEditing(!isBulkEditing);

    if (!isBulkEditing) {
      // Reset when enabling bulk edit
      setSelectedItems(new Set());
      setIsAllSelected(false);
      setIsSomeSelected(false);
    } else {
      // Reset discount value when canceling bulk edit
      setDiscountValue("");

      if (searchTerm) {
        try {
          const userData = localStorage.getItem("user");
          let manufactureUnitId = "";

          if (userData) {
            const data = JSON.parse(userData);
            manufactureUnitId = data.manufacture_unit_id;
          }

          const response = await axios.post(
            `${process.env.REACT_APP_IP}productSearch/`,
            {
              manufacture_unit_id: manufactureUnitId,
              search_query: searchTerm, // Use searchTerm instead of query
            }
          );

          const result = response.data.data || [];
          setFilteredItems(result);
          setPage(0); // Reset pagination to the first page if search is applied
        } catch (error) {
          console.error("Error searching products:", error);
        }
      }
    }
  };

  //Import open popup
  const handleOpenPopup = () => {
    setIsPopupOpen(true);
  };

  //Close popup
  const handleClosePopup = () => {
    setIsPopupOpen(false);
  };

  const handleSearchChange = async (event) => {
    if (event && event.stopPropagation) {
      event.stopPropagation();
    }

    const query = event.target.value;
    setSearchTerm(query);

    // Clear the previous timeout to reset the delay
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    searchTimeout.current = setTimeout(async () => {
      try {
        // const query = event.target.value.trim();

        const trimmedQuery = query.trim();

        // Fetch user data
        const userData = localStorage.getItem("user");
        let manufactureUnitId = "";

        if (userData) {
          const data = JSON.parse(userData);
          manufactureUnitId = data.manufacture_unit_id;
        }

        console.log("Selected Category:", selectedCategory);

        if (trimmedQuery) {
          // Perform product search
          const response = await axios.post(
            `${process.env.REACT_APP_IP}productSearch/`,
            {
              manufacture_unit_id: manufactureUnitId,
              search_query: trimmedQuery,
            }
          );

          if (response.data) {
            console.log("Search Results:", response.data);
            const result = response.data.data || [];
            setFilteredItems(result);
            setPage(0);

            // If productCategoryList API was triggered, reset selected category
            if (selectedCategory) {
              const categoryResponse = await axios.get(
                `${process.env.REACT_APP_IP}obtainProductCategoryList/?manufacture_unit_id=${manufactureUnitId}`
              );

              if (categoryResponse.data) {
                setCategories(categoryResponse.data.data || []);
              }

              // Reset the dropdown to show "All Categories"
              setSelectedCategory("All Categories");
            }
          }
        } else {
          // Reset to initial state
          setFilteredItems(items);
          setPage(0);

          // If no query, fetch product categories and reset dropdown
          if (selectedCategory) {
            const categoryResponse = await axios.get(
              `${process.env.REACT_APP_IP}obtainProductCategoryList/?manufacture_unit_id=${manufactureUnitId}`
            );

            if (categoryResponse.data) {
              setCategories(categoryResponse.data.data || []);
            }

            setSelectedCategory("All Categories");
          }
        }
      } catch (error) {
        console.error("Error during search:", error);
      }
    }, 1000);
  };

  const handleSearchIconClick = () => {
    setIsSearchOpen(true);
  };

  const handleSearchBlur = () => {
    if (searchTerm.trim() === "") {
      setIsSearchOpen(false);
      setSelectedCategory("All Categories"); // Reset category selection to "All Categories"
    }
  };

  //dropdown open menu
  const handleOpenMenu = (event, column) => {
    setAnchorEl(event.currentTarget);
    setCurrentColumn(column); // Set column to either "price" or "availability"
  };

  //Categories
  const handleFilterChange = async (event) => {
    const selectedCategory = event.target.value;
    setFilter(selectedCategory);
    await fetchData(selectedCategory);
  };

  //pagination page change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleSelectAll = () => {
    if (isAllSelected) {
      // Deselect all items
      setSelectedItems(new Set());
      setIsAllSelected(false);
      setIsSomeSelected(false);
    } else {
      // Select all items
      const allItemIds = new Set(filteredItems.map((item) => item.id)); // Assuming `filteredItems` contains the data to be displayed
      setSelectedItems(allItemIds);
      setIsAllSelected(true);
      setIsSomeSelected(false);
    }
  };

  const handleSelectItem = (id) => {
    setSelectedItems((prev) => {
      const updated = new Set(prev);
      if (updated.has(id)) {
        updated.delete(id); // Deselect item
      } else {
        updated.add(id); // Select item
      }

      // Update header checkbox states based on selected items
      setIsAllSelected(updated.size === filteredItems.length); // All items selected
      setIsSomeSelected(
        updated.size > 0 && updated.size < filteredItems.length
      ); // Partial selection

      return updated;
    });
  };

  //bulk edit price
  const handleFieldChange = (id, field, value) => {
    setEditedValues((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
      },
    }));
  };

  //bulk edit visibility status change
  const handleToggleVisibility = (id) => {
    setEditedVisibility((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleSelectSort = (key, direction) => {
    console.log('army',key, direction)
    setSortConfig({ key, direction });
    setPage(0);  // Reset page to 0 when sorting is applied
    // fetchData( key, direction);
    setAnchorEl(null);  // Close the menu after selection
  };

  

  const handleSelectAvailability = (status) => {
    setFilters(status); // Set the filter to show the selected availability status
    fetchData(status); // Fetch data with the new availability filter
    setAnchorEl(null); // Close the menu after selection
  };

  const handleBulkEditSubmit = async (key, direction) => {
    try {
      // Check if any price exceeds the was_price
      const hasError = Array.from(selectedItems).some((id) => {
        const editedFields = editedValues[id] || {};
        const originalItem = items.find((item) => item.id === id) || {};

        // Safely access properties with fallback values
        const wasPrice = Number(
          editedFields.was_price ?? originalItem.was_price ?? 0
        );
        const price = Number(editedFields.price ?? originalItem.price ?? 0);

        return price > wasPrice; // Price exceeds Was Price
      });

      if (hasError) {
        toast.error("Price is Greater than Was Price.", {
          position: "top-right",
          autoClose: 3000,
        });
        return;
      }

      const productList = Array.from(selectedItems)
        .map((id) => {
          const editedFields = editedValues[id] || {};
          const originalItem = items.find((item) => item.id === id) || {};

          const updatedItem = { id }; // Start with the ID

          // Handle discount logic
          if (discountValue) {
            if (discountUnit === "%") {
              updatedItem.discount_percentage = Number(discountValue);
            } else if (discountUnit === "$") {
              updatedItem.discount_price = Number(discountValue);
            }
          }

          // Safely include all price fields with fallback values
          updatedItem.list_price =
            editedFields.price !== undefined && editedFields.price !== ""
              ? Number(editedFields.price)
              : Number(originalItem.price ?? 0);

          updatedItem.was_price =
            editedFields.was_price !== undefined &&
            editedFields.was_price !== ""
              ? Number(editedFields.was_price)
              : Number(originalItem.was_price ?? 0);

          updatedItem.msrp =
            editedFields.msrp !== undefined && editedFields.msrp !== ""
              ? Number(editedFields.msrp)
              : Number(originalItem.msrp ?? 0); // Default msrp to 0 if missing

              // Determine visibility based on direction
            const visibility = direction === "asc" ? true : direction === "desc" ? false : "";
            console.log('Visibility', visibility);
    
            updatedItem.visible = visibility ? visibility : originalItem.visible; // Use the original value if not updated

          // Include visibility status only if edited
          // if (
          //   editedVisibility[id] !== undefined &&
          //   editedVisibility[id] !== originalItem.visible
          // ) {
          //   updatedItem.visible = editedVisibility[id];
          // }

          // Include only updated fields (skip if identical to the original values)
          return Object.keys(updatedItem).length > 1 ? updatedItem : null;
        })
        .filter((item) => item !== null); // Filter out items with no changes

      // Prevent submission if no changes are made
      if (productList.length === 0 && !discountValue) {
        toast.info("No changes were made.", {
          position: "top-right",
          autoClose: 3000,
        });
        return;
      }

      setLoading(true); // Set loading to true before making the API call

      // Bulk edit API call
      const response = await axios.post(
        `${process.env.REACT_APP_IP}updateBulkProduct/`,
        {
          ...(discountUnit === "%" && discountValue
            ? { discount_percentage: Number(discountValue) }
            : {}),
          ...(discountUnit === "$" && discountValue
            ? { discount_price: Number(discountValue) }
            : {}),
          product_list: productList,
        }
      );

      if (response.data.data.is_updated === true) {
        console.log("Bulk edit successful, updating product list");

        // Refresh the product list
        const userData = localStorage.getItem("user");
        let manufactureUnitId = "";

        if (userData) {
          const data = JSON.parse(userData);
          manufactureUnitId = data.manufacture_unit_id;
        }

        const payload = {
          manufacture_unit_id: manufactureUnitId,
          product_category_id: "",
          filters: "all",
          sort_by: "",
          sort_by_value: "",
          is_parent: "",
        };

        const productListResponse = await axios.post(
          `${process.env.REACT_APP_IP}obtainProductsList/`,
          payload
        );

        const products = productListResponse.data.data || [];
        setItems(products);
        setFilteredItems(products);

        if (searchTerm) {
          const searchResponse = await axios.post(
            `${process.env.REACT_APP_IP}productSearch/`,
            {
              manufacture_unit_id: manufactureUnitId,
              search_query: searchTerm,
            }
          );

          const searchResults = searchResponse.data.data || [];
          const matchedItems = products.filter((product) =>
            searchResults.some((searchItem) => searchItem.id === product.id)
          );

          setFilteredItems(matchedItems);
        }
      }

      setSelectedItems(new Set());
      setIsAllSelected(false);
      setIsSomeSelected(false);
    } catch (err) {
      setError("Failed to update products");
      console.error("Error during bulk edit:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDiscountValueChange = (e) => {
    const { value } = e.target;
    setDiscountValue(value); // Update discount value when input changes
  };

  const handleDiscountUnitChange = (e) => {
    setDiscountUnit(e.target.value); // Update discount unit when dropdown value changes
  };


  const handleSelectVisible = (key, direction) => {
    console.log('Selected Items:', selectedItems, items);
  
    // Create a new array to avoid mutating the state directly
    const updatedItems = items.map((item) => {
      if (selectedItems.has(item.id)) { // Only affect selected items
        // Hide or unhide based on direction
        if (direction === "visibleOff" && item.visible) {
          return { ...item, visible: false }; // Hide item, but keep it in the list
        }
        if (direction === "visibleOn" && !item.visible) {
          return { ...item, visible: true }; // Unhide item, but keep it in the list
        }
      }
      return item; // Keep item unchanged if it's not selected
    });
  
    // Update the items state immediately (keep all items in the list)
    setItems(updatedItems);
  
    // Now update the visibility icon state (editedVisibility)
    const updatedVisibility = { ...editedVisibility };
    selectedItems.forEach(id => {
      updatedVisibility[id] = direction === "visibleOff" ? false : true;
    });
  
    setEditedVisibility(updatedVisibility);
  
    // Optionally, reset the sorting configuration and close the menu after selection
    setSortConfig({ key, direction });
    setPage(0); // Reset page to 0 when sorting is applied
    setAnchorEl(null); // Close the menu after selection
  };
  

  if (error) return <div>{error}</div>;

  return (
    <div>
      <Grid container spacing={1}>
        <Grid item xs={12} md={1.5}>
          <Box
            sx={{
              position: "sticky",
              top: "56px", // Adjust this value based on the height of your header or top bar
              height: "calc(100vh - 56px)", // Ensure it occupies the full height below the header
              overflowY: "auto", // Allow scrolling inside if needed
              boxShadow: "0px 0px 2px rgba(0, 0, 0, 0.1)", // Light shadow
            }}
          >
            <ProductBrand
              industryId={industry?.id}
              onBrandChange={handleBrandChange}
              selectedCategoryId={selectedCategory?.id} // Pass selected category ID
              isParent={selectedCategory?.is_parent || false} // Pass isParent based on selectedCategory
              selectedBrandsProp={selectedBrandIds}
            />
          </Box>
        </Grid>
        <Grid item xs={12} md={10.5} p={0}>
          <div style={{ marginBottom: "25px" }}>
            <Box
              sx={{
                backgroundColor: "white",
                position: "sticky",
                top: "55px",
                padding: "10px 15px",
                zIndex: 9,
              }}
            >
              <Box display="flex" alignItems="center" justifyContent="flex-end">
                {/* Parent Category Dropdown  */}
                <Box sx={{ marginRight: "10px" }}>
                  <FormControl fullWidth sx={{ minWidth: "200px" }}>
                    <Select
                      sx={{ fontSize: "14px" }}
                      id="parent-category-select"
                      value={selectedParent}
                      onChange={(e) => {
                        const selectedParentCategory = categories.find(
                          (category) => category.id === e.target.value
                        );
                        setSelectedParent(e.target.value);
                        setSelectedChild(""); // Reset child selection
                        setSelectedCategory(selectedParentCategory); // Set selected category to selected parent category
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
                      onChange={(e) => {
                        setSelectedChild(e.target.value); // Update state correctly
                        const selectedChildCategory = childCategories.find(
                          (category) => category.id === e.target.value
                        );
                        setSelectedCategory(selectedChildCategory); // Set selected category to selected child category
                      }}
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

                {/* Industry Dropdown */}
                <Box sx={{ marginRight: "10px" }}>
                  <FormControl fullWidth sx={{ minWidth: "200px" }}>
                    <Select
                      sx={{ fontSize: "14px" }}
                      id="industry-select"
                      value={industry ? industry.id : ""}
                      onChange={handleIndustryChange}
                      displayEmpty
                      placeholder="Select Industry" // This will act as a placeholder
                    >
                      <MenuItem disabled sx={{ fontSize: "14px" }} value="">
                        Select Industry
                      </MenuItem>
                      {industryList.length > 0 ? (
                        industryList.map((item) => (
                          <MenuItem
                            sx={{ fontSize: "14px" }}
                            key={item.id}
                            value={item.id}
                          >
                            {item.name}
                          </MenuItem>
                        ))
                      ) : (
                        <MenuItem disabled>
                          <em>No industry available</em>
                        </MenuItem>
                      )}
                    </Select>
                  </FormControl>
                </Box>

                {/* Bulk Edit Buttons */}
                <Button
                  onClick={handleOpenBulkEdit}
                  variant="outlined"
                  color="primary"
                  sx={{
                    marginLeft: "10px",
                    fontSize: "12px",
                    textTransform: "capitalize",
                  }}
                >
                  {isBulkEditing ? "Cancel Edit" : "Bulk Edit"}
                </Button>

                <Button
                  onClick={handleBulkEditSubmit}
                  variant="outlined"
                  color="secondary"
                  sx={{
                    marginLeft: "10px",
                    fontSize: "12px",
                    textTransform: "capitalize",
                  }}
                  disabled={
                    selectedItems.size === 0 || loading || !isBulkEditing
                  } // Disable if loading or not in bulk editing mode
                >
                  Submit Edit
                </Button>

                <ToastContainer />
                <TextField
                  variant="outlined"
                  placeholder="Discount"
                  size="small"
                  disabled={!isBulkEditing} // Disabled if not in bulk edit mode
                  value={discountValue} // Controlled input, value from state
                  onChange={handleDiscountValueChange} // Update state when input changes
                  sx={{
                    marginLeft: "5px",
                    fontSize: "12px",
                    width: "70px",
                    paddingRight: "6px",
                  }}
                  InputProps={{
                    style: { fontSize: "12px" }, // Adjust font size for input text
                  }}
                />
                <FormControl
                  size="small"
                  sx={{
                    marginLeft: "5px",
                    minWidth: 70,
                    height: "31px",
                    marginTop: "-2px",
                    margin: "1px",
                  }}
                >
                  <Select
                    value={discountUnit}
                    onChange={handleDiscountUnitChange}
                    sx={{ height: "33px" }}
                    disabled={!isBulkEditing} // Disable if not in bulk edit mode
                  >
                    <MenuItem value="%">%</MenuItem>
                    <MenuItem value="$">$</MenuItem>
                  </Select>
                </FormControl>

                {/* Only show "Clear all" when search field is open */}
                {/* <Box
                  display="flex"
                  alignItems="center"
                  sx={{ marginLeft: "10px", width: "56px" }}
                >
                  <Button
                    onClick={handleClearAll}
                    variant="contained"
                    sx={{
                      display: "flex",
                      width: "20px",
                      height: "30px",
                      fontSize: "10px",
                      alignItems: "center",
                      textTransform: "capitalize",
                    }}
                  >
                    Clear
                  </Button>
                </Box> */}

                {/* Import File Button */}
                <Tooltip title="Import File" arrow>
                  <IconButton
                    color="primary"
                    style={{ padding: 0 }}
                    onClick={handleOpenPopup}
                  >
                    <FileDownloadOutlinedIcon
                      sx={{
                        fontSize: "40px",
                        color: "#1976d2",
                      }}
                    />
                  </IconButton>
                </Tooltip>
              </Box>

              <Box display="flex" justifyContent="space-between" alignItems="center" mt={1}>
                <Box>
                  <Button
                    sx={{
                      fontSize: "11px",
                      fontWeight: 500,
                      padding: "3px 10px",
                      textTransform: "none",
                      backgroundColor: "#d3d3d38c",
                      borderRadius: "25px",
                      color: "black",
                    }}
                    onClick={handleReload}
                  >
                    Clear filters
                  </Button>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Box
                    display="flex"
                    alignItems="center"
                    sx={{ marginRight: "10px" }}
                  >
                    <TextField
                      variant="outlined"
                      placeholder="Search..."
                      value={searchTerm}
                      onChange={handleSearchChange} // Only use this handler
                      // onKeyPress={(event) => {
                      //   // Prevent space key press at the start or end
                      //   if (
                      //     event.key === " " &&
                      //     (searchTerm.trim() === "" ||
                      //       searchTerm.startsWith(" ") ||
                      //       searchTerm.endsWith(" "))
                      //     // (!searchTerm || searchTerm.trim() === "")
                      //   ) {
                      //     event.preventDefault();
                      //   }
                      // }}
                      size="small"
                      onBlur={handleSearchBlur}
                      autoFocus
                      sx={{ width: 250 }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon sx={{ fontSize: "20px" }} />{" "}

                          </InputAdornment>
                        ),
                        style: { fontSize: "11px" },
                      }}
                    />
                  </Box>
                  <Button sx={{ p: 0, textTransform: "none" }}>
                    Total Products : {filteredItems.length}
                  </Button>
                </Box>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 1,
                  margin: "10px",
                }}
              >
                {selectedBrandNames.map((name, index) => (
                  <Box
                    key={selectedBrandIds[index]}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      padding: "3px 9px",
                      backgroundColor: "#d3d3d38c",
                      borderRadius: "25px",
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: "10px",
                        fontWeight: 500,
                        textTransform: "none",

                        color: "black",
                      }}
                    >
                      {name}
                    </Typography>
                    <CloseIcon
                      sx={{
                        fontSize: "12px",
                        cursor: "pointer",
                        marginLeft: "5px",
                      }}
                      onClick={() => handleTagRemove(selectedBrandIds[index])}
                    />
                  </Box>
                ))}
              </Box>
            </Box>

            <Box sx={{ margin: "0px 15px" }}>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      {isBulkEditing && (
                        <TableCell sx={{ textAlign: "center" }}>
                          <Checkbox
                            checked={isAllSelected} // Check if all items are selected
                            indeterminate={isSomeSelected} // Show indeterminate state if some items are selected
                            onChange={handleSelectAll} // Handle the "Title" checkbox click
                            disabled={!isBulkEditing} // Disable when bulk edit is not active
                          />
                        </TableCell>
                      )}

                      <TableCell sx={{ textAlign: "center" }}>Image</TableCell>
                      <TableCell sx={{ textAlign: "center" }}>
                        SKU
                        <IconButton
                          onClick={(e) =>
                            handleOpenMenu(
                              e,
                              "sku_number_product_code_item_number"
                            )
                          }
                        >
                          <MoreVertIcon sx={{ fontSize: "14px" }} />
                        </IconButton>
                      </TableCell>
                      <TableCell sx={{ textAlign: "center" }}>MPN</TableCell>
                      <TableCell sx={{ textAlign: "center" }}>
                        Product Name
                        <IconButton
                          onClick={(e) => handleOpenMenu(e, "product_name")}
                        >
                          <MoreVertIcon sx={{ fontSize: "14px" }} />
                        </IconButton>
                      </TableCell>
                      <TableCell sx={{ textAlign: "center" }}>
                        Brand
                        <IconButton
                          onClick={(e) => handleOpenMenu(e, "brand_name")}
                        >
                          <MoreVertIcon sx={{ fontSize: "14px" }} />
                        </IconButton>
                      </TableCell>
                      <TableCell sx={{ textAlign: "center" }}>
                        Category
                        <IconButton
                          onClick={(e) =>
                            handleOpenMenu(e, "end_level_category")
                          }
                        >
                          <MoreVertIcon sx={{ fontSize: "14px" }} />
                        </IconButton>
                      </TableCell>
                      <TableCell sx={{ textAlign: "center" }}>
                        Stock
                        <IconButton
                          onClick={(e) => handleOpenMenu(e, "availability")}
                        >
                          <MoreVertIcon sx={{ fontSize: "14px" }} />
                        </IconButton>
                      </TableCell>

                      <TableCell sx={{ textAlign: "center" }}>MSRP</TableCell>
                      <TableCell sx={{ textAlign: "center" }}>
                        Was Price
                      </TableCell>
                      <TableCell sx={{ textAlign: "center" }}>
                        Price
                        <IconButton onClick={(e) => handleOpenMenu(e, "price")}>
                          <MoreVertIcon sx={{ fontSize: "14px" }} />
                        </IconButton>
                      </TableCell>
                      <TableCell sx={{ textAlign: "center" }}>Visibility
                <IconButton onClick={(e) => handleOpenMenu(e, "visible")}>
                    <MoreVertIcon sx={{ fontSize: "14px" }} />
                  </IconButton></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={12} align="center">
                          <CircularProgress />
                        </TableCell>
                      </TableRow>
                    ) : error ? (
                      <TableRow>
                        <TableCell
                          colSpan={12}
                          align="center"
                          style={{ color: "red" }}
                        >
                          {error}
                        </TableCell>
                      </TableRow>
                    ) : !Array.isArray(filteredItems) ||
                      filteredItems.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={12}
                          align="center"
                          sx={{ fontSize: "14px", color: "#888" }}
                        >
                          No Products Found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredItems
                        .slice(
                          page * rowsPerPage,
                          page * rowsPerPage + rowsPerPage
                        )
                        .map((item) => {
                          // Ensure item is defined and has the required properties
                          if (!item) return null;

                          const editedFields = editedValues[item.id] || {}; // Safe access to editedValues
                          const wasPrice =
                            editedFields.was_price ?? item.was_price; // Fallback to original item value if not defined
                          const price = editedFields.price ?? item.price; // Fallback to original item value if not defined

                          const errorMessage =
                            Number(price) > Number(wasPrice)
                              ? "Price cannot exceed Was Price"
                              : "";

                          return (
                            <TableRow key={item.id}>
                              {isBulkEditing && (
                                <TableCell sx={{ textAlign: "center" }}>
                                  <Checkbox
                                    checked={selectedItems.has(item.id)} // Check if the item is selected
                                    onChange={() => handleSelectItem(item.id)} // Handle individual row selection
                                    disabled={!isBulkEditing} // Disable when bulk editing is not active
                                  />
                                </TableCell>
                              )}

                              <TableCell>
                                <Link
                                  style={{ textDecoration: "none" }}
                                  to={`/manufacturer/products/details/${item.id}`}
                                  state={{ searchQuery: searchTerm }}
                                >
                                  {item.logo &&
                                    (item.logo.startsWith(
                                      "http://example.com"
                                    ) ? (
                                      <img
                                        src={soonImg} // Replace `soonImg` with the variable or URL for the placeholder image
                                        alt="Placeholder Logo"
                                        style={{
                                          width: 30,
                                          height: 30,
                                          borderRadius: "50%",
                                          objectFit: "cover",
                                        }}
                                      />
                                    ) : item.logo.startsWith("http") ||
                                      item.logo.startsWith("https") ? (
                                      <img
                                        src={item.logo}
                                        alt="Product Logo"
                                        style={{
                                          width: 30,
                                          height: 30,
                                          borderRadius: "50%",
                                          objectFit: "cover",
                                        }}
                                      />
                                    ) : (
                                      <img
                                        src={soonImg} // Placeholder for invalid URLs
                                        alt="Placeholder Logo"
                                        style={{
                                          width: 30,
                                          height: 30,
                                          borderRadius: "50%",
                                          objectFit: "cover",
                                        }}
                                      />
                                    ))}
                                </Link>
                              </TableCell>

                              <TableCell>
                                <Link
                                  style={{
                                    textDecoration: "none",
                                    color: "inherit",
                                  }}
                                  to={`/manufacturer/products/details/${item.id}`}
                                  state={{ searchQuery: searchTerm }}
                                >
                                  {item.sku_number_product_code_item_number}
                                </Link>
                              </TableCell>
                              <TableCell>
                                <Link
                                  style={{
                                    textDecoration: "none",
                                    color: "inherit",
                                  }}
                                  to={`/manufacturer/products/details/${item.id}`}
                                  state={{ searchQuery: searchTerm }}
                                >
                                  {item.mpn}
                                </Link>
                              </TableCell>

                              <TableCell sx={{ width: "250px" }}>
                                <Link
                                  to={`/manufacturer/products/details/${item.id}`}
                                  state={{ searchQuery: searchTerm }}
                                  style={{
                                    display: "inline-block",
                                    textDecoration: "none",
                                    color: "inherit",
                                    maxWidth: "240px", // Optional: limit width for better control
                                    overflowWrap: "break-word", // Allow wrapping of long words
                                    wordWrap: "break-word", // For compatibility
                                    fontSize: "12px",
                                  }}
                                >
                                  {item.product_name}
                                </Link>
                              </TableCell>

                              <TableCell>{item.brand_name}</TableCell>
                              <TableCell>{item.end_level_category}</TableCell>
                              <TableCell>
                                <TableCell sx={{ border: "none" }}>
                                  {item.availability ? (
                                    <Tooltip title="In-stock">
                                      <CheckCircleIcon
                                        style={{ color: "green" }}
                                      />
                                    </Tooltip>
                                  ) : (
                                    <Tooltip title="Out of stock">
                                      <CancelIcon style={{ color: "red" }} />
                                    </Tooltip>
                                  )}
                                </TableCell>
                              </TableCell>

                              <TableCell>
                                {isBulkEditing ? (
                                  <input
                                    style={{ width: "40px", fontSize: "10px" }}
                                    type="number"
                                    value={
                                      editedValues[item.id]?.msrp ?? item.msrp
                                    }
                                    onChange={(e) =>
                                      handleFieldChange(
                                        item.id,
                                        "msrp",
                                        e.target.value
                                      )
                                    }
                                    disabled={!selectedItems.has(item.id)} // Disable if the item is not selected
                                  />
                                ) : (
                                  item.msrp
                                )}
                              </TableCell>

                              <TableCell>
                                {isBulkEditing ? (
                                  <input
                                    style={{
                                      width: "40px",
                                      fontSize: "10px",
                                      color: errorMessage ? "red" : "inherit",
                                    }}
                                    type="number"
                                    value={wasPrice}
                                    onChange={(e) =>
                                      handleFieldChange(
                                        item.id,
                                        "was_price",
                                        e.target.value
                                      )
                                    }
                                    disabled={!selectedItems.has(item.id)} // Disable if the item is not selected
                                  />
                                ) : (
                                  item.was_price
                                )}
                              </TableCell>

                              <TableCell>
                                <Tooltip title={errorMessage || ""} arrow>
                                  {isBulkEditing ? (
                                    <input
                                      style={{
                                        width: "40px",
                                        fontSize: "10px",
                                        color: errorMessage ? "red" : "inherit",
                                      }}
                                      type="number"
                                      value={price}
                                      onChange={(e) =>
                                        handleFieldChange(
                                          item.id,
                                          "price",
                                          e.target.value
                                        )
                                      }
                                      disabled={!selectedItems.has(item.id)} // Disable if the item is not selected
                                    />
                                  ) : (
                                    item.price
                                  )}
                                </Tooltip>
                              </TableCell>

                              <TableCell>
                                {isBulkEditing ? (
                                  <IconButton
                                    disabled={!selectedItems.has(item.id)}
                                  >
                                    {editedVisibility[item.id] !== undefined ? (
                                      editedVisibility[item.id] ? (
                                        <Tooltip title="Hide it">
                                          <Visibility
                                            sx={{
                                              fontSize: "18px",
                                              color: "inherit",
                                              "&:hover": {
                                                color: "blue", // Change to blue on hover
                                              },
                                              cursor: "pointer",
                                            }}
                                          />
                                        </Tooltip>
                                      ) : (
                                        <Tooltip title="Visible it">
                                          <VisibilityOff
                                            sx={{
                                              fontSize: "18px",
                                              color: "inherit",
                                              "&:hover": {
                                                color: "blue",
                                              },
                                              cursor: "pointer",
                                            }}
                                          />
                                        </Tooltip>
                                      )
                                    ) : item.visible ? (
                                      <Tooltip title="Hide it">
                                        <Visibility
                                          sx={{
                                            fontSize: "18px",
                                            color: "inherit",
                                            "&:hover": {
                                              color: "blue",
                                            },
                                            cursor: "pointer",
                                          }}
                                        />
                                      </Tooltip>
                                    ) : (
                                      <Tooltip title="Visible it">
                                        <VisibilityOff
                                          sx={{
                                            fontSize: "18px",
                                            color: "inherit",
                                            "&:hover": {
                                              color: "blue",
                                            },
                                            cursor: "pointer",
                                          }}
                                        />
                                      </Tooltip>
                                    )}
                                  </IconButton>
                                ) : item.visible ? (
                                  <Tooltip title="Hide it">
                                    <Visibility
                                      sx={{
                                        fontSize: "18px",
                                        color: "inherit",
                                        "&:hover": {
                                          color: "blue",
                                        },
                                        cursor: "pointer",
                                      }}
                                    />
                                  </Tooltip>
                                ) : (
                                  <Tooltip title="Visible it">
                                    <VisibilityOff
                                      sx={{
                                        fontSize: "18px",
                                        color: "inherit",
                                        "&:hover": {
                                          color: "blue",
                                        },
                                        cursor: "pointer",
                                      }}
                                    />
                                  </Tooltip>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
            <TablePagination
              rowsPerPageOptions={[10, 25, 50]}
              component="div"
              count={filteredItems.length} // Set the total number of rows based on filteredItems
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage} // Handle page change
              onRowsPerPageChange={(event) => {
                setRowsPerPage(parseInt(event.target.value, 10)); // Update rows per page
                setPage(0); // Reset to first page when rows per page change
              }}
            />

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleCloseMenu}
            >
              {/* Sorting for Price */}
              {currentColumn === "price" && (
                <>
                  <MenuItem onClick={() => handleSelectSort("price", "asc")}>
                    Sort Low to High
                  </MenuItem>
                  <MenuItem onClick={() => handleSelectSort("price", "desc")}>
                    Sort High to Low
                  </MenuItem>
                </>
              )}

              {/* Sorting for Availability */}
              {currentColumn === "availability" && (
                <>
                  <MenuItem
                    sx={{ fontSize: "12px" }}
                    onClick={() => handleSelectAvailability("all")}
                  >
                    All
                  </MenuItem>
                  <MenuItem
                    sx={{ fontSize: "12px" }}
                    onClick={() => handleSelectAvailability("In-stock")}
                  >
                    In Stock
                  </MenuItem>
                  <MenuItem
                    sx={{ fontSize: "12px" }}
                    onClick={() => handleSelectAvailability("Out of stock")}
                  >
                    Out of Stock
                  </MenuItem>
                </>
              )}

              {/* Sorting for Brand */}
              {currentColumn === "brand_name" && (
                <>
                  <MenuItem
                    onClick={() => handleSelectSort("brand_name", "asc")}
                  >
                    Sort A-Z
                  </MenuItem>
                  <MenuItem
                    onClick={() => handleSelectSort("brand_name", "desc")}
                  >
                    Sort Z-A
                  </MenuItem>
                </>
              )}

              {currentColumn === "product_name" && (
                <>
                  <MenuItem
                    onClick={() => handleSelectSort("product_name", "asc")}
                  >
                    Sort A-Z
                  </MenuItem>
                  <MenuItem
                    onClick={() => handleSelectSort("product_name", "desc")}
                  >
                    Sort Z-A
                  </MenuItem>
                </>
              )}

              {currentColumn === "sku_number_product_code_item_number" && (
                <>
                  <MenuItem
                    onClick={() =>
                      handleSelectSort(
                        "sku_number_product_code_item_number",
                        "asc"
                      )
                    }
                  >
                    Sort A-Z
                  </MenuItem>
                  <MenuItem
                    onClick={() =>
                      handleSelectSort(
                        "sku_number_product_code_item_number",
                        "desc"
                      )
                    }
                  >
                    Sort Z-A
                  </MenuItem>
                </>
              )}

              {currentColumn === "end_level_category" && (
                <>
                  <MenuItem
                    onClick={() =>
                      handleSelectSort("end_level_category", "asc")
                    }
                  >
                    Sort A-Z
                  </MenuItem>
                  <MenuItem
                    onClick={() =>
                      handleSelectSort("end_level_category", "desc")
                    }
                  >
                    Sort Z-A
                  </MenuItem>
                </>
              )}

{currentColumn === "visible" && (
  <>
    <MenuItem onClick={() => handleSelectVisible("visible", "visibleOff")}>
      Hide
    </MenuItem>
    <MenuItem onClick={() => handleSelectVisible("visible", "visibleOn")}>
      Unhide
    </MenuItem>
  </>
)}
            </Menu>
            {isPopupOpen && (
              <PopupModal onClose={() => setIsPopupOpen(false)} />
            )}
            <PopupModal open={isPopupOpen} onClose={handleClosePopup} />
          </div>
        </Grid>
      </Grid>
    </div>
  );
}

export default ProductList;
