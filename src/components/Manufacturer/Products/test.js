// src\components\Manufacturer\Products\test.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link , useNavigate , useLocation } from 'react-router-dom';
import {
  InputAdornment,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, TextField, IconButton, CircularProgress, Box, MenuItem, Select, FormControl, Checkbox, Button, InputLabel,
  TablePagination, Tooltip, Menu
} from '@mui/material';
import { Visibility, VisibilityOff, MoreVert as MoreVertIcon, Discount } from '@mui/icons-material';
import PopupModal from './PopupModel';
import SearchIcon from "@mui/icons-material/Search";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import RefreshIcon from '@mui/icons-material/Refresh';
import 'react-toastify/dist/ReactToastify.css'; // Import the CSS file
import { ToastContainer, toast } from 'react-toastify';
import OutlinedInput from '@mui/material/OutlinedInput'; // Add this line
import soonImg from "../../assets/soon-img.png";
function ProductList() {
  const location = useLocation();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [filter, setFilter] = useState('');
  const [categories, setCategories] = useState([]);
  const [editedValues, setEditedValues] = useState({});
  const [editedVisibility, setEditedVisibility] = useState({});
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [filters, setFilters] = useState('all');
  const [anchorEl, setAnchorEl] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "asc" });
  const [currentColumn, setCurrentColumn] = useState("");
  const [open, setOpen] = useState(false); // Track the dropdown open state
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [discountValue, setDiscountValue] = useState("");
  const [isBulkEditing, setIsBulkEditing] = useState(false); // State for Bulk Edit mode
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [filteredItems, setFilteredItems] = useState([]);
  const [discountUnit, setDiscountUnit] = useState('%');
  const [data, setCategorySearch] = useState([]); // Initialize data state
  const [isAllSelected, setIsAllSelected] = useState(false);
  const [isSomeSelected, setIsSomeSelected] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All Categories"); 

  const getValidationMessage = (wasPrice, price) => {
    if (Number(price) > Number(wasPrice)) {
      return 'Price cannot be greater than Was Price';
    }
    return '';
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
  


  useEffect(() => {
    refreshData();
  }, []);

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
      fetchData("all");
    } catch (error) {
    }
  };


  const handleCategory = async (categoryId, isParent = false) => {
    if (isParent) {
      const userData = localStorage.getItem('user');
      let manufactureUnitId = '';
  
      if (userData) {
        const data = JSON.parse(userData);
        manufactureUnitId = data.manufacture_unit_id;
      }
  
      try {
        const categoryResponse = await axios.get(
          `${process.env.REACT_APP_IP}obtainProductCategoryList/?manufacture_unit_id=${manufactureUnitId}&product_category_id=${categoryId}`
        );
  
        const categoryData = categoryResponse.data.data || [];
        if (categoryData.length === 0) {
          fetchData('', categoryId, isParent); // Pass correct categoryId
        } else {
          const selectedCategory = categoryData.find((cat) => cat.id === categoryId) || categoryData[0]; // Ensure correct category is selected
          setCategories(categoryData);
          setCategorySearch(selectedCategory);
          fetchData('all', selectedCategory); // Pass the correct selectedCategory
        }
      } catch (error) {
        console.error('Error fetching category data:', error);
      }
    } else {
      fetchData('', categoryId, isParent); // For non-parent categories
    }
  };
  

  const handleCategorySelect = (categoryName) => {
    if(searchTerm){
      handleClearAll();
    }
    setSelectedCategory(categoryName);
    const selectedCategoryObj = categories.find((category) => category.name === categoryName);
  
    if (selectedCategoryObj) {
      if (!selectedCategoryObj.is_parent && !selectedCategoryObj.subCategories) {
        fetchData('', selectedCategoryObj); // Pass the correct selectedCategoryObj
      } else {
        handleCategory(selectedCategoryObj.id, selectedCategoryObj.is_parent); // Pass id and isParent
      }
    
  }
  };
  

  // Fetch data asynchronously with filters, category, and sorting
  const fetchData = async (
    filters = 'all', 
    selectedCategory = null, 
    key, 
    direction) => {
    const categoryId = selectedCategory?.id || ''; // Use selectedCategory.id safely
    const isParent = selectedCategory?.is_parent || false; // Ensure is_parent is handled
  
    setLoading(true);
    setError('');
  
    try {
      const userData = localStorage.getItem('user');
      let manufactureUnitId = '';
  
      if (userData) {
        const data = JSON.parse(userData);
        manufactureUnitId = data.manufacture_unit_id;
      }
  
      const sort_by_value = direction === "asc" ? 1 : direction === "desc" ? -1 : "";

      const payload = {
        manufacture_unit_id: manufactureUnitId,
        product_category_id: categoryId,
        filters: filters,
        sort_by: key || '',
        sort_by_value: sort_by_value,
        is_parent: isParent, // Correctly set is_parent
      };
  
      const response = await axios.post(
        `${process.env.REACT_APP_IP}obtainProductsList/`,
        payload
      );
  
      const products = response.data.data || [];
      setItems(products); // Update default product list
      setFilteredItems(products); // Initialize filtered items
    } catch (err) {
      setError('Failed to load items');
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }


  };

  // Fetch initial categories and products on mount
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const userData = localStorage.getItem('user');
        let manufactureUnitId = '';

        if (userData) {
          const data = JSON.parse(userData);
          manufactureUnitId = data.manufacture_unit_id;
        }

        // Fetch initial category list
        const categoryResponse = await axios.get(
          `${process.env.REACT_APP_IP}obtainProductCategoryList/?manufacture_unit_id=${manufactureUnitId}`
        );
        setCategories(categoryResponse.data.data || []);


        // Fetch initial product list for all categories
        await fetchData();
      } catch (error) {
     
      }
    };

    fetchInitialData();
  }, []);


  const handleOpenBulkEdit = async () => {

    if (selectedCategory && !searchTerm) {
      setSelectedCategory("All Categories");
      const userData = localStorage.getItem('user');
         let manufactureUnitId = '';
 
         if (userData) {
           const data = JSON.parse(userData);
           manufactureUnitId = data.manufacture_unit_id;
         }
     const categoryResponse = await axios.get(
       `${process.env.REACT_APP_IP}obtainProductCategoryList/?manufacture_unit_id=${manufactureUnitId}`
     );

     if (categoryResponse.data) {
      console.log('iiii',categoryResponse.data)
       setCategories(categoryResponse.data.data || []);
       fetchData()
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
      setDiscountValue('');
  
      if (searchTerm) {
        try {
          const userData = localStorage.getItem('user');
          let manufactureUnitId = '';
  
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
          console.error('Error searching products:', error);
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

  const handleClearAll = () => {
    if(searchTerm){
    setSearchTerm('');
    }else{
    fetchData('all','');
    setSelectedCategory("All Categories");
    refreshData();
    }
    setFilteredItems(items); // Reset to full product list (assuming `items` is your full product list)
    setPage(0); // Reset to the first page

    // Clear search query from location state and replace the history entry
  navigate(location.pathname, {
    replace: true, // Replace the current entry in the history stack
    state: {
      ...location.state, // Retain other location state if any
      searchQuery: '', // Clear the searchQuery in location.state
    },
  });
  };

  const handleSearchChange = async (event) => {
    try {
      const query = event.target.value.trim();
      setSearchTerm(query);
  
      // Fetch user data
      const userData = localStorage.getItem("user");
      let manufactureUnitId = "";
  
      if (userData) {
        const data = JSON.parse(userData);
        manufactureUnitId = data.manufacture_unit_id;
      }
  
      console.log("Selected Category:", selectedCategory);
  
      if (query) {
        // Perform product search
        const response = await axios.post(
          `${process.env.REACT_APP_IP}productSearch/`,
          {
            manufacture_unit_id: manufactureUnitId,
            search_query: query,
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
    setCurrentColumn(column);  // Set column to either "price" or "availability"
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
      setIsSomeSelected(updated.size > 0 && updated.size < filteredItems.length); // Partial selection
  
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
    setSortConfig({ key, direction });
    setPage(0);  // Reset page to 0 when sorting is applied
    fetchData('', '', key, direction);
    setAnchorEl(null);  // Close the menu after selection
  };

  const handleSelectAvailability = (status) => {
    setFilters(status);  // Set the filter to show the selected availability status
    fetchData(status);  // Fetch data with the new availability filter
    setAnchorEl(null);  // Close the menu after selection
  };

  const handleBulkEditSubmit = async () => {
    try {
      // Check if any price exceeds the was_price
      const hasError = Array.from(selectedItems).some((id) => {
        const editedFields = editedValues[id] || {};
        const originalItem = items.find((item) => item.id === id) || {};
  
        // Safely access properties with fallback values
        const wasPrice = Number(editedFields.was_price ?? originalItem.was_price ?? 0);
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
            editedFields.was_price !== undefined && editedFields.was_price !== ""
              ? Number(editedFields.was_price)
              : Number(originalItem.was_price ?? 0);
  
          updatedItem.msrp =
            editedFields.msrp !== undefined && editedFields.msrp !== ""
              ? Number(editedFields.msrp)
              : Number(originalItem.msrp ?? 0); // Default msrp to 0 if missing
  
          // Include visibility status only if edited
          if (
            editedVisibility[id] !== undefined &&
            editedVisibility[id] !== originalItem.visible
          ) {
            updatedItem.visible = editedVisibility[id];
          }
  
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

  if (error) return <div>{error}</div>;

  return (
    <div style={{ margin: '1%' ,  marginBottom:'25px'}}>

      <Box display="flex" alignItems="center" justifyContent="flex-end" mb={2}>
        {/* Filter Dropdown */}
        <div style={{ maxWidth: "500px", }}>
        <FormControl>
        <Select
  className="my-custom-class"
  value={selectedCategory}
  onChange={(e) => handleCategorySelect(e.target.value)}
  input={<OutlinedInput />}
  sx={{
    fontSize: '14px', // Customize font size
    padding: '0px',   // Customize padding inside Select
  }}
  MenuProps={{
    PaperProps: {
      style: {
        maxHeight: '250px', // Set the minimum height
      },
    },
  }}
>
  <MenuItem
    value="All Categories"
    onClick={(e) => {
      e.stopPropagation(); // Prevent closing dropdown when clicked
      setSelectedCategory("All Categories"); // Set dropdown title to All Categories
      refreshData(); // Refresh data to show all items
    }}
  >
    All Categories
  </MenuItem>
  {categories.length > 0 ? (
    categories.map((category) => (
      <MenuItem key={category.id} value={category.name}>
        {category.name}
      </MenuItem>
    ))
  ) : (
    <MenuItem disabled>No categories available</MenuItem>
  )}
</Select>

</FormControl>

        </div>
        {/* Bulk Edit Buttons */}
        <Button
          onClick={handleOpenBulkEdit}
          variant="outlined"
          color="primary"
          sx={{
            marginLeft: '10px',
            fontSize: '12px',
            textTransform: 'capitalize',
          }}
        >
          {isBulkEditing ? 'Cancel Edit' : 'Bulk Edit'}
        </Button>

        <Button
          onClick={handleBulkEditSubmit}
          variant="outlined"
          color="secondary"
          sx={{
            marginLeft: '10px',
            fontSize: '12px',
            textTransform: 'capitalize',
          }}
           disabled={selectedItems.size === 0 || loading || !isBulkEditing}  // Disable if loading or not in bulk editing mode
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
            marginLeft: '5px',
            fontSize: '12px',
            width: '70px',
            paddingRight: '6px',
          }}
          InputProps={{
            style: { fontSize: '12px' }, // Adjust font size for input text
          }}
        />
        <FormControl size="small" sx={{
          marginLeft: '5px', minWidth: 70, height: '31px',
          marginTop: '-2px',
          margin: '1px'
        }}>

          <Select
            value={discountUnit}
            onChange={handleDiscountUnitChange}
            sx={{ height: '33px' }}
            disabled={!isBulkEditing} // Disable if not in bulk edit mode
          >
            <MenuItem value="%">%</MenuItem>
            <MenuItem value="$">$</MenuItem>
          </Select>
        </FormControl>
        <Box display="flex" alignItems="center" sx={{ marginLeft: "10px" }}>
          {!isSearchOpen ? (
            <IconButton
              sx={{ width: "60px", height: "60px" }} // Increase button size
              onClick={handleSearchIconClick}
              aria-label="search"
            >
              <SearchIcon sx={{ fontSize: "36px" }} /> {/* Increase icon size */}
            </IconButton>
          ) : (
            <>
              <TextField
                variant="outlined"
                placeholder="Search..."
                value={searchTerm}
                onChange={handleSearchChange}  // Only use this handler
                onKeyPress={(event) => {
                  // Prevent space key press at the start or end
                  if (event.key === " " && (searchTerm.trim() === "" || searchTerm.startsWith(" ") || searchTerm.endsWith(" "))) {
                    event.preventDefault();
                  }
                }}
                size="small"
                onBlur={handleSearchBlur}
                autoFocus
                sx={{ width: 250 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ fontSize: "20px" }} /> {/* Adjust size in input */}
                    </InputAdornment>
                  ),
                  style: { fontSize: "11px" },
                }}
              />
     
       
            </>
          )}
       
        </Box>
  {/* Only show "Clear all" when search field is open */}
  <Box display="flex" alignItems="center" sx={{ marginLeft: "10px", width: '56px' }}>
                <Button
                  onClick={handleClearAll}
                  variant="contained"
                  sx={{
                    display: "flex",
                    width: '20px',
                    height: '30px',
                    fontSize: '10px',
                    alignItems: "center",
                    textTransform: 'capitalize',
                  }}
                >
                  Clear
                </Button>
              </Box>
           
        {/* Import File Button */}
        <Tooltip title="Import File" arrow>
          <IconButton
            color="primary"
            style={{ marginLeft: '10px' }}
            onClick={handleOpenPopup}
          >
            <FileDownloadOutlinedIcon
              sx={{
                fontSize: '40px',
                color: '#1976d2',
              }}
            />
          </IconButton>
        </Tooltip>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}><Button sx={{ p: 0, mb: 1, textTransform: 'none' }}>Total Products : {filteredItems.length}</Button></Box>
      <TableContainer component={Paper} sx={{ marginTop: 2  }}>
        <Table>
          <TableHead>
            <TableRow>
              {isBulkEditing && (
                <TableCell sx={{ textAlign: 'center' }}>
                  <Checkbox
                    checked={isAllSelected} // Check if all items are selected
                    indeterminate={isSomeSelected} // Show indeterminate state if some items are selected
                    onChange={handleSelectAll} // Handle the "Title" checkbox click
                    disabled={!isBulkEditing} // Disable when bulk edit is not active
                  />
                </TableCell>
              )}

              <TableCell sx={{ textAlign: 'center' }}>Image</TableCell>
              <TableCell sx={{ textAlign: 'center' }}>SKU
                <IconButton onClick={(e) => handleOpenMenu(e, "sku_number_product_code_item_number")}>
                  <MoreVertIcon sx={{ fontSize: "14px" }} />
                </IconButton>
              </TableCell>
              <TableCell sx={{ textAlign: 'center' }}>Product Name
                <IconButton onClick={(e) => handleOpenMenu(e, "product_name")}>
                  <MoreVertIcon sx={{ fontSize: "14px" }} />
                </IconButton>
              </TableCell>
              <TableCell sx={{ textAlign: 'center' }}>Brand
                <IconButton onClick={(e) => handleOpenMenu(e, "brand_name")}>
                  <MoreVertIcon sx={{ fontSize: "14px" }} />
                </IconButton>
              </TableCell>
              <TableCell sx={{ textAlign: 'center' }}>Category
                <IconButton onClick={(e) => handleOpenMenu(e, "end_level_category")}>
                  <MoreVertIcon sx={{ fontSize: "14px" }} />
                </IconButton>
              </TableCell>
              <TableCell sx={{ textAlign: 'center' }}>
                Availability
                <IconButton onClick={(e) => handleOpenMenu(e, "availability")}>
                  <MoreVertIcon sx={{ fontSize: "14px" }} />
                </IconButton>
              </TableCell>
              <TableCell sx={{ textAlign: 'center' }}>MPN</TableCell>
              <TableCell sx={{ textAlign: 'center' }}>MSRP</TableCell>
              <TableCell sx={{ textAlign: 'center' }}>Was Price</TableCell>
              <TableCell sx={{ textAlign: 'center' }}>Price
                <IconButton onClick={(e) => handleOpenMenu(e, "price")}>
                  <MoreVertIcon sx={{ fontSize: "14px" }} />
                </IconButton>
              </TableCell>
              <TableCell sx={{ textAlign: 'center' }}>Hide</TableCell>
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
                <TableCell colSpan={12} align="center" style={{ color: 'red' }}>
                  {error}
                </TableCell>
              </TableRow>
            ) : !Array.isArray(filteredItems) || filteredItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={12} align="center" sx={{ fontSize: '14px', color: '#888' }}>
                  No Products Found
                </TableCell>
              </TableRow>
            ) : (
              filteredItems.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((item) => {
                // Ensure item is defined and has the required properties
                if (!item) return null;
              
                const editedFields = editedValues[item.id] || {}; // Safe access to editedValues
                const wasPrice = editedFields.was_price ?? item.was_price; // Fallback to original item value if not defined
                const price = editedFields.price ?? item.price; // Fallback to original item value if not defined
              
                const errorMessage = Number(price) > Number(wasPrice) ? 'Price cannot exceed Was Price' : '';
                

                
                return (
                  <TableRow key={item.id}>
                    {isBulkEditing && (
                       <TableCell sx={{ textAlign: 'center' }}>
                       <Checkbox
                         checked={selectedItems.has(item.id)} // Check if the item is selected
                         onChange={() => handleSelectItem(item.id)} // Handle individual row selection
                         disabled={!isBulkEditing} // Disable when bulk editing is not active
                       />
                     </TableCell>
                    )}

<TableCell>
  <Link 
    style={{ textDecoration: 'none' }} 
    to={`/manufacturer/products/details/${item.id}`}
    state={{ searchQuery: searchTerm }}
  >
    {item.logo &&
    (item.logo.startsWith("http://example.com")
      ? (
        <img
          src={soonImg} // Replace `soonImg` with the variable or URL for the placeholder image
          alt="Placeholder Logo"
          style={{
            width: 30,
            height: 30,
            borderRadius: '50%',
            objectFit: 'cover',
          }}
        />
      )
      : ((item.logo.startsWith("http") || item.logo.startsWith("https")) ? (
        <img
          src={item.logo}
          alt="Product Logo"
          style={{
            width: 30,
            height: 30,
            borderRadius: '50%',
            objectFit: 'cover',
          }}
        />
      ) : (
        <img
          src={soonImg} // Placeholder for invalid URLs
          alt="Placeholder Logo"
          style={{
            width: 30,
            height: 30,
            borderRadius: '50%',
            objectFit: 'cover',
          }}
        />
      ))
    )}
  </Link>
</TableCell>

                    <TableCell>
                      <Link style={{ textDecoration: 'none', color: 'inherit' }} to={`/manufacturer/products/details/${item.id}`} state={{ searchQuery: searchTerm }}>
                        {item.sku_number_product_code_item_number}
                      </Link>
                    </TableCell>
                    <Tooltip title={item.product_name} arrow>
                    <TableCell>
                      <Link
                        to={`/manufacturer/products/details/${item.id}`}
                        state={{ searchQuery: searchTerm }}
                        style={{
                          display: 'inline-block',
                          textDecoration: 'none',
                          color: 'inherit',
                          maxWidth: '150px',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          fontSize: '12px',
                        }}
                      >
                        {item.product_name}
                      </Link>
                    </TableCell>
                    </Tooltip>
                    <TableCell>{item.brand_name}</TableCell>
                    <TableCell>{item.end_level_category}</TableCell>
                    <TableCell>{item.availability ? 'In-stock' : 'Out of stock'}</TableCell>
                    <TableCell>{item.mpn}</TableCell>

                    <TableCell>
        {isBulkEditing ? (
          <input
            style={{ width: '40px', fontSize: '10px' }}
            type="number"
            value={editedValues[item.id]?.msrp ?? item.msrp}
            onChange={(e) => handleFieldChange(item.id, 'msrp', e.target.value)}
            disabled={!selectedItems.has(item.id)} // Disable if the item is not selected
          />
        ) : (
          item.msrp
        )}
      </TableCell>

      <TableCell>
        {isBulkEditing ? (
          <input
            style={{ width: '40px', fontSize: '10px', color: errorMessage ? 'red' : 'inherit' }}
            type="number"
            value={wasPrice}
            onChange={(e) => handleFieldChange(item.id, 'was_price', e.target.value)}
            disabled={!selectedItems.has(item.id)} // Disable if the item is not selected
          />
        ) : (
          item.was_price
        )}
      </TableCell>

      <TableCell>
        <Tooltip title={errorMessage || ''} arrow>
          {isBulkEditing ? (
            <input
              style={{
                width: '40px',
                fontSize: '10px',
                color: errorMessage ? 'red' : 'inherit',
              }}
              type="number"
              value={price}
              onChange={(e) => handleFieldChange(item.id, 'price', e.target.value)}
              disabled={!selectedItems.has(item.id)} // Disable if the item is not selected
            />
          ) : (
            item.price
          )}
        </Tooltip>
      </TableCell>

      <TableCell onClick={() => handleToggleVisibility(item.id)}>
  {isBulkEditing ? (
    <IconButton disabled={!selectedItems.has(item.id)}>
      {editedVisibility[item.id] !== undefined ? (
        editedVisibility[item.id] ? <Visibility  /> : <VisibilityOff />
      ) : item.visible ? (
        <Visibility />
      ) : (
        <VisibilityOff />
      )}
    </IconButton>
  ) : item.visible ? (
    <Visibility />
  ) : (
    <VisibilityOff />
  )}
</TableCell>

                  </TableRow>
                );
              })
            )}
          </TableBody>

        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[10, 25, 50]}
        component="div"
        count={filteredItems.length}  // Set the total number of rows based on filteredItems
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
            <MenuItem sx={{ fontSize: '12px' }} onClick={() => handleSelectAvailability('all')}>
              All
            </MenuItem>
            <MenuItem sx={{ fontSize: '12px' }} onClick={() => handleSelectAvailability('In-stock')}>
              In Stock
            </MenuItem>
            <MenuItem sx={{ fontSize: '12px' }} onClick={() => handleSelectAvailability('Out of stock')}>
              Out of Stock
            </MenuItem>
          </>
        )}

        {/* Sorting for Brand */}
        {currentColumn === "brand_name" && (
          <>
            <MenuItem onClick={() => handleSelectSort("brand_name", "asc")}>
              Sort A-Z
            </MenuItem>
            <MenuItem onClick={() => handleSelectSort("brand_name", "desc")}>
              Sort Z-A
            </MenuItem>
          </>
        )}

        {currentColumn === "product_name" && (
          <>
            <MenuItem onClick={() => handleSelectSort("product_name", "asc")}>
              Sort A-Z
            </MenuItem>
            <MenuItem onClick={() => handleSelectSort("product_name", "desc")}>
              Sort Z-A
            </MenuItem>
          </>
        )}

        {currentColumn === "sku_number_product_code_item_number" && (
          <>
            <MenuItem onClick={() => handleSelectSort("sku_number_product_code_item_number", "asc")}>
              Sort A-Z
            </MenuItem>
            <MenuItem onClick={() => handleSelectSort("sku_number_product_code_item_number", "desc")}>
              Sort Z-A
            </MenuItem>
          </>
        )}

        {currentColumn === "end_level_category" && (
          <>
            <MenuItem onClick={() => handleSelectSort("end_level_category", "asc")}>
              Sort A-Z
            </MenuItem>
            <MenuItem onClick={() => handleSelectSort("end_level_category", "desc")}>
              Sort Z-A
            </MenuItem>
          </>
        )}

      </Menu>
      {isPopupOpen && <PopupModal onClose={() => setIsPopupOpen(false)} />}
      <PopupModal open={isPopupOpen} onClose={handleClosePopup} />
    </div>
  );
}

export default ProductList;