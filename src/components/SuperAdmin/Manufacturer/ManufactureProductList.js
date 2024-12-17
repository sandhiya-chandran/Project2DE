import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link,useParams } from 'react-router-dom';
import { Accordion, AccordionDetails, AccordionSummary, Typography,InputAdornment ,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, List, ListItem, ListItemText, Divider ,
  Paper, TextField, IconButton, CircularProgress, Box, MenuItem, Select, FormControl, Checkbox, Button,
  TablePagination, Tooltip, Menu
} from '@mui/material';
import { Visibility, VisibilityOff, MoreVert as MoreVertIcon, Discount } from '@mui/icons-material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import SearchIcon from "@mui/icons-material/Search";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import RefreshIcon from '@mui/icons-material/Refresh';
const CategoryAccordion = ({ 
  category, 
  handleCategory, 
  parentCategoryId, 
  fetchData, 
  handleCategoryFalse 
}) => {
  const [expanded, setExpanded] = useState(null);
  const [categories, setCategories] = useState([]);
  const [open, setOpen] = useState(false); // Track the dropdown open state

  const handleExpandClick = (category, parentCategoryId = null) => {
    // Check if category is a parent or has subcategories before expanding or handling
    if (category.is_parent || (category.subCategories && category.subCategories.length > 0)) {
      setExpanded((prevExpanded) => (prevExpanded === category.id ? null : category.id));
    }

    // Handling for parent categories or categories with subcategories
    if (category.is_parent || (category.subCategories && category.subCategories.length > 0)) {
      handleCategory(category.id, parentCategoryId);
    } else {
      // If it's not a parent and has no subcategories, handle directly
      console.log('Category is not a parent and has no subcategories:', category);
      handleCategoryFalse(category.id, parentCategoryId); // Call handleCategoryFalse
      
      setOpen(false);  // Close the accordion if no subcategories
    }
  };

  return (
    <Accordion expanded={expanded === category.id}>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        onClick={() => handleExpandClick(category, category.id)} // Passing category and parentCategoryId
      >
        <Typography sx={{fontSize:'12px'}}>{category.name}</Typography>
      </AccordionSummary>
      <AccordionDetails>
  <List>
    {category.subCategories ? (
      category.subCategories.length > 0 ? (
        category.subCategories.map((subCategory) => (
          <Box key={subCategory.id}>
            <CategoryAccordion sx={{fontSize: '12px'}}
              key={subCategory.id}
              category={subCategory}
              handleCategory={handleCategory}
              handleCategoryFalse={handleCategoryFalse} // Pass it down recursively
              parentCategoryId={category.id}
              fetchData={fetchData}
            />
            <Divider />
          </Box>
        ))
      ) : null // If no subcategories, render nothing
    ) : (
      <Box sx={{ display: 'flex', justifyContent: 'center', padding: 2 }}>
        <CircularProgress />
      </Box>
    )}
  </List>
</AccordionDetails>
    </Accordion>
  );
};

function ManufactureProductList() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filter, setFilter] = useState('');
  const { id } = useParams();
  const [categories, setCategories] = useState([]);
  const [editedValues, setEditedValues] = useState({});
  const [editedVisibility, setEditedVisibility] = useState({});
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  // const [ setAvailabilityFilter] = useState('all');
  const [filters, setFilters] = useState('all');  // Initialize with a default value

  const [anchorEl, setAnchorEl] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "asc" });
  const [currentColumn, setCurrentColumn] = useState("");
  const [open, setOpen] = useState(false); // Track the dropdown open state
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [discountValue, setDiscountValue] = useState(""); 
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [expanded, setExpanded] = useState(null);

 // Fetch data asynchronously with filters, category, and sorting
 const fetchData = async (filters = 'all', selectedCategory = null, key, direction) => {
  console.log('Fetching data with filters:', filters, 'and selected category:', selectedCategory);
  const elementData = selectedCategory;
  const falseCondition = elementData?.is_parent; // Safely access is_parent

  console.log('Every data:', falseCondition);
  setLoading(true);
  
  try {
    const userData = localStorage.getItem('user');
    let manufactureUnitId = '';
    
    if (userData) {
      const data = JSON.parse(userData);
      manufactureUnitId = data.manufacture_unit_id;
    }

    const keyValue = key;
    const sort_by_value = direction === 'asc' ? 1 : direction === 'desc' ? -1 : '';

    // Ensure categoryId is correctly assigned from selectedCategory
    const categoryId = selectedCategory ? selectedCategory.id : '';

    console.log('Category ID to be sent:', categoryId);

    // Construct the API request payload with conditional is_parent
    const payload = {
      manufacture_unit_id: id,
      product_category_id: categoryId ? categoryId : elementData || '',
      filters: filters || 'all',
      sort_by: keyValue || '',
      sort_by_value: sort_by_value,
      is_parent: falseCondition ? true : false, // Conditional assignment
    };

    console.log('Request payload:', payload);

    // Fetch products for the selected category and sorting options
    const productResponse = await axios.post(
      `${process.env.REACT_APP_IP}obtainProductsList/`,
      payload
    );

    setItems(productResponse.data.data || []); // Update the product items
  } catch (err) {
    setError('Failed to load items');
    console.error(err);
  } finally {
    setLoading(false);
  }
};


// Handle category expansion logic
const handleExpandClick = (category, parentCategoryId = null) => {
 
  // Allow expansion only if the category is a parent and has subcategories
  if (category.is_parent || (category.subCategories && category.subCategories.length > 0)) {
    setExpanded((prevExpanded) => (prevExpanded === category.id ? null : category.id));
  }

  // If the category is a parent or has subcategories, we should fetch data
  if (category.is_parent || (category.subCategories && category.subCategories.length > 0)) {
    handleCategory(category.id, parentCategoryId); // Handle category click to fetch subcategories or perform other actions
    fetchData('all', category);  // Call fetchData for the parent category or category with subcategories
  }

  // If it's not a parent category (no subcategories), fetch data for that category
  if (!category.is_parent && (!category.subCategories || category.subCategories.length === 0)) {
    console.log('Product is parent:', category.is_parent);
    fetchData('all', category);  // Call fetchData for non-parent categories (without subcategories)
  }
};

const handleCategoryFalse = async (categoryId, parentCategoryId = null) => {
  console.log('Fetching data for category ID:', categoryId);

  if (!categoryId) {
    console.error('Invalid categoryId:', categoryId);
    return; // Exit if categoryId is invalid
  }

  try {
    // Retrieve user data from localStorage
    const userData = localStorage.getItem('user');
    let manufactureUnitId = '';

    if (userData) {
      const data = JSON.parse(userData);
      manufactureUnitId = data.manufacture_unit_id;
    }
const firstCategory = categoryId
    console.log('Manufacture Unit ID:', firstCategory);
    fetchData('all', firstCategory); 
    // Call the API only if categoryId is valid
    // const productResponse = await axios.post(
    //   `${process.env.REACT_APP_IP}obtainProductsList/`,
    //   {
    //     manufacture_unit_id: manufactureUnitId,
    //     product_category_id: categoryId, // Correct category ID
    //     filters: filters || 'all', // Ensure filters are defined
    //     sort_by: '',
    //     sort_by_value: 1,
    //     is_parent: false, // Static is_parent flag
    //   }
    // );
    setOpen(false);
    // console.log('Product response data:', productResponse.data);
  } catch (error) {
    console.error('Error fetching products:', error);
  }
};





const handleCategory = async (categoryId, parentCategoryId = null, listParent = null) => {
  console.log('Fetching data for category ID:', categoryId, 'Parent:', parentCategoryId);

  const userData = localStorage.getItem('user');
  let manufactureUnitId = '';

  if (userData) {
    const data = JSON.parse(userData);
    manufactureUnitId = data.manufacture_unit_id;
  }

  try {
    // Fetch products if `categoryId` exists and `is_parent` is false
    const categoryResponse = await axios.get(
      `${process.env.REACT_APP_IP}obtainProductCategoryList/?manufacture_unit_id=${id}&product_category_id=${categoryId}`
    );

    const categoryData = categoryResponse.data.data || [];
    console.log('Fetched category data:', categoryData);

    if (categoryData.length > 0) {
      // If the category is not a parent and has no subcategories, close it
      if (!categoryData[0].is_parent && !(categoryData[0].subCategories?.length > 0)) {
        setOpen(false); // Close the accordion
      }

      // Update categories with subcategories
      const updatedCategories = categoryData.map((category) => ({
        ...category,
        subCategories: category.is_parent ? category.subCategories || [] : undefined,
      }));

      setCategories(updatedCategories);

      // Fetch data for the first category if required
      const firstCategory = categoryData[0];
      if (categoryId) {
        console.log('Fetching data for first category:', firstCategory);
        fetchData('all', firstCategory); // Ensure fetchData is defined and works
      }
    } else {
      console.log('No categories found.');
    }
  } catch (error) {
    console.error('Error in handleCategory:', error);
  }
};


// Recursive function to update categories with subcategories
const updateCategoriesRecursively = (categories, categoryId, subCategories) => {
  return categories.map((category) => {
    if (category.id === categoryId) {
      return { ...category, subCategories };
    } else if (category.subCategories) {
      return { ...category, subCategories: updateCategoriesRecursively(category.subCategories, categoryId, subCategories) };
    }
    return category;
  });
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
          `${process.env.REACT_APP_IP}obtainProductCategoryList/?manufacture_unit_id=${id}`
        );
        setCategories(categoryResponse.data.data || []);

      
        // Fetch initial product list for all categories
        await fetchData();
      } catch (error) {
        console.error('Error fetching initial data', error);
      }
    };

    fetchInitialData();
  }, []);


  //Import open popup
  const handleOpenPopup = () => {
    setIsPopupOpen(true);
  };

  //Close popup
  const handleClosePopup = () => {
    setIsPopupOpen(false);
  };
  const handleSearchChange = async (event) => {
    const query = event.target.value; // Assign the search term
    setSearchTerm(query);
  
    const userData = localStorage.getItem('user');
    let manufactureUnitId = '';
  
    if (userData) {
      const data = JSON.parse(userData);
      manufactureUnitId = data.manufacture_unit_id;
    }
  
    try {
      if (query) {
        const categoryResponse = await axios.post(
          `${process.env.REACT_APP_IP}productSearch/`,
          {
            manufacture_unit_id: manufactureUnitId,
            search_query: query,
          }
        );
        console.log("Search Results:", categoryResponse.data);
        // Handle the API response data as needed
      }
    } catch (error) {
      console.error("Error fetching search results:", error);
    }
  };
  
  

  const handleSearchIconClick = () => {
    setIsSearchOpen(true);
  };

  const handleSearchBlur = () => {
    if (searchTerm.trim() === "") {
      setIsSearchOpen(false);
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

  // Availability filter
  // const handleSelectAvailability = async (availability) => {
  //   setAvailabilityFilter(availability);
  //   handleCloseMenu();
  //   await fetchData(availability === 'In-stock' ? 'true' : availability === 'Out of stock' ? 'false' : 'all');
  // };

  //pagination page change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  const handleSelectItem = (id) => {
    setSelectedItems((prevSelected) => {
      const updatedSelected = new Set(prevSelected);
      if (updatedSelected.has(id)) {
        updatedSelected.delete(id); // Unselect the item
      } else {
        updatedSelected.add(id); // Select the item
      }
      return updatedSelected;
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

  // const handleSort = (key, direction) => {
  //   console.log('Sorting with:', key, direction); 
  //   setSortConfig({ key, direction });
  //   setPage(0);
  //   fetchData();
  //   setAnchorEl(null);
  // };

  const handleSelectSort = (key, direction) => {
    console.log('Sorting with:', key, direction);
    setSortConfig({ key, direction });
    console.log(sortConfig, 'assigned value')
    setPage(0);  // Reset page to 0 when sorting is applied
    fetchData('','',key,direction);
    setAnchorEl(null);  // Close the menu after selection
  };
  
  const handleSelectAvailability = (status) => {
    setFilters(status);  // Set the filter to show the selected availability status
    fetchData(status);  // Fetch data with the new availability filter
    setAnchorEl(null);  // Close the menu after selection
  };
  
  // API request to fetch product data based on sorting and other filters






  const refreshData = async () => {
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
      fetchData('all')  // Update the categories state
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };
  
  
  
  const filteredItems = items.filter(item => {
    const matchesSearch =
      (item.product_name && item.product_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.sku_number_product_code_item_number && item.sku_number_product_code_item_number.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.brand_name && item.brand_name.toLowerCase().includes(searchTerm.toLowerCase()));
  
    const matchesFilter = filter ? item.category === filter : true;
  
    return matchesSearch && matchesFilter;
  });
  
  if (error) return <div>{error}</div>;

  return (
    <div>
      
      <Box display="flex" alignItems="center" justifyContent="flex-end" mb={2}>

 
      <FormControl
  sx={{
    minWidth: 120,
    width: "200px",
    height: "40px", // Set height to match TextField
    marginLeft: 2,
    marginRight: 2, // Adjust as needed for spacing
  }}
>
  <Select
    value={filter}
    onChange={handleFilterChange}
    displayEmpty
    size="small"
    open={open}
    onOpen={() => setOpen(true)}
    onClose={() => setOpen(false)}
    sx={{
      width: "200px",
      height: "40px", // Ensure height consistency
      fontSize: "12px", // Consistent font size
    }}
  >
    {/* "All Categories" Option */}
    <MenuItem
      value=""
      sx={{
        padding: "4px 10px",
        fontWeight: filter === "" ? "bold" : "normal",
        backgroundColor: filter === "" ? "rgba(0, 0, 0, 0.1)" : "transparent",
        display: "flex",
        alignItems: "center",
      }}
      onClick={() => {
        refreshData();
        setFilter("");
      }}
    >
      <span style={{ fontSize: "12px", flex: 1 }}>All Categories</span>
      {open && <RefreshIcon sx={{ fontSize: 16, marginLeft: 1 }} />}
    </MenuItem>

    {/* Categories List */}
    <Box sx={{ width: "200px", padding: 2 }}>
      {categories.length > 0 ? (
        categories.map((category) => (
          <Box key={category.id} sx={{ marginBottom: 2, fontSize: "12px" }}>
            <CategoryAccordion
              category={category}
              handleCategoryFalse={handleCategoryFalse}
              handleCategory={handleCategory}
              parentCategoryId={null}
              isParent={category.is_parent}
              subCategories={category.subCategories || []}
              handleExpandClick={handleExpandClick}
              disabled={
                !category.is_parent &&
                !(category.subCategories && category.subCategories.length > 0)
              }
            />
          </Box>
        ))
      ) : (
        <Typography>No categories available</Typography>
      )}
    </Box>
  </Select>
</FormControl>

<Box
  display="flex"
  alignItems="center"
  sx={{
    marginLeft: 2,
  }}
>
  <TextField
    variant="outlined"
    placeholder="Search..."
    value={searchTerm}
    onChange={handleSearchChange}
    size="small"
    onBlur={handleSearchBlur}
    autoFocus
    sx={{
      width: "200px", // Match width with Select
      height: "40px", // Match height with Select
      fontSize: "12px", // Ensure consistent font size
    }}
    InputProps={{
      startAdornment: (
        <InputAdornment position="start">
          <SearchIcon sx={{ fontSize: "20px" }} />
        </InputAdornment>
      ),
    }}
  />
</Box>


       
      </Box>



      <TableContainer component={Paper} sx={{ marginTop: 2 }}>
        <Table>
          <TableHead>
          <TableRow>
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
                  <span style={{ paddingLeft: '45%' }} align="center">
                    <CircularProgress />
                  </span>
                </TableCell>
              </TableRow>
                ) : filteredItems.length === 0 ? ( // Check if there are no filtered items
                  <TableRow>
                    <TableCell colSpan={12} align="center" sx={{ fontSize: '14px', textAlign: 'center', color: '#888' }}>
                      No Products Found
                    </TableCell>
                  </TableRow>
                ) : 
           (
              filteredItems.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((item) => (
                <TableRow key={item.id}>
             

                  
    
        

<TableCell>
  <Link to={`/manufacturer/products/details/${item.id}`}>
    {item.logo ? (
      <img 
        src={item.logo} 
        alt="Product Logo" 
        style={{ 
          width: 30, 
          height: 30, 
          borderRadius: '50%', // Make image circular
          objectFit: 'cover',  // Ensure image fills the circle without distortion
        }} 
      />
    ) : (
      <div 
        style={{
          width: 25,
          height: 25,
          display: 'flex', // Flexbox to center text
          alignItems: 'center', // Center text vertically
          justifyContent: 'center', // Center text horizontally
          backgroundColor: '#f0f0f0', // Light gray background for the placeholder
          color: '#999', // Gray color for "No Image" text
          fontSize: '6px', // Smaller font size for text
          borderRadius: '50%', // Make the "No Image" placeholder circular
          textAlign: 'center', // Ensure text is centered in the circle
          border: '1px solid #ddd', // Optional border for the circle
        }}
      >
        No Image
      </div>
    )}
  </Link>
</TableCell>



                  <TableCell>
                    <Link style={{ textDecoration: 'none', color: 'inherit' }} to={`/manufacturer/products/details/${item.id}`}>
                      {item.sku_number_product_code_item_number}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Link
                      to={`/manufacturer/products/details/${item.id}`}
                      style={{
                        display: 'inline-block',
                        textDecoration: 'none',
                        color: 'inherit',
                        maxWidth: '150px',  // Adjust based on your design
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        fontSize: '12px'  // Optional for consistent font size
                      }}
                    >
                      {item.product_name}
                    </Link>
                  </TableCell>
                  <TableCell>{item.brand_name}</TableCell>
                  <TableCell>{item.end_level_category}</TableCell>
                  <TableCell>{item.availability ? 'In-stock' : 'Out of stock'}</TableCell>
                  <TableCell>{item.mpn}
                  </TableCell>

                  <TableCell>
                  {item.msrp
                    }
                  </TableCell>

                  <TableCell>{
                      item.was_price
                   }
                  </TableCell>

                  <TableCell> {item.price}
                  </TableCell>

                  <TableCell>{item.visible ? <Visibility /> : <VisibilityOff />
                    }
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>

        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[10, 25, 50]}
        component="div"
        count={filteredItems.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={(event) => setRowsPerPage(parseInt(event.target.value, 10))}
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


    

   
    </div>
  );
}


export default ManufactureProductList;