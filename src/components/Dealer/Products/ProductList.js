// src\components\Dealer\Products\ProductList.js
import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import Tooltip from "@mui/material/Tooltip";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  Button,
  Box,
  IconButton,
  TextField,
  CircularProgress,
  InputAdornment,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  Stack,
  Pagination,
  MenuItem,
  Grid,
} from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";
import CompareArrowsOutlinedIcon from "@mui/icons-material/CompareArrowsOutlined";
import PostAddIcon from "@mui/icons-material/PostAdd";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import ProductModal from "./ProductModal";
import soonImg from "../../assets/soon-img.png";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { tabsClasses } from "@mui/material/Tabs";
import { useNavigate } from "react-router-dom";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ProductBrand from "./ProductBrands";
import PriceRangeFilter from './PriceRangeFilter';

const ProductList = ({ fetchCartCount }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const userData = localStorage.getItem("user");

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState({});
  const [cartItems, setCartItems] = useState([]);
  const [sortByValue, setSortByValue] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [value, setValue] = useState(-1); // Tracks the active tab
  const [categories, setCategories] = useState([]); // Stores the fetched category list
  const [industryList, setIndustryList] = useState([]); // Stores all available industries
  const [selectedCategoryId, setSelectedCategoryId] = useState(null); // Tracks the selected category ID
  const [industry, setIndustry] = useState(null); // Stores the selected industry object
  const [Category, setCategory] = useState(null); // Stores the selected Category object
  const [page, setPage] = useState(1); // Current page
  const [productsCount, setProductsCount] = useState([]);
  const [totalPages, setTotalPages] = useState(1); // Total pages
  const productsPerPage = 100; // Number of products per page
  const [wishlistProducts, setWishlistProducts] = useState([]);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [selectedBrandIds, setSelectedBrandIds] = useState([]);
  const [debounceTimer, setDebounceTimer] = useState(null);
  const debounceTimerRef = useRef(null);
  const [priceRange, setPriceRange] = useState({ price_from: 0, price_to: '' });
  const [selectedBrandNames, setSelectedBrandNames] = useState([]); // For Tags
  const [noProductsFound, setNoProductsFound] = useState(false); // No products found state


  const handlePriceChange = (newRange) => {
    setPriceRange(newRange);
    setPage(1);
  };
  
  const handleReload = () => {
    window.location.reload(); // Reloads the current browser window
  };

 // Handle brand selection changes from ProductBrand
 const handleBrandChange = ({ updatedBrands }) => {
  // Extract IDs and names from the updated list
  const ids = updatedBrands.map((brand) => brand.id);
  const names = updatedBrands.map((brand) => brand.name);

  setSelectedBrandIds(ids); // Update IDs for API
  setSelectedBrandNames(names); // Update names for tags
  setPage(1);
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

  // Fetch Products
  useEffect(() => {
    if (
      selectedCategoryId ||
      industry ||
      selectedCategoryId === null ||
      industry === null
    ) {
      const fetchData = async () => {
        try {
          const userData = localStorage.getItem("user");

          let manufactureUnitId = "";

          if (userData) {
            const data = JSON.parse(userData);
            manufactureUnitId = data.manufacture_unit_id;
          }

          // Create the request payload
          const requestData = {
            manufacture_unit_id: manufactureUnitId,
            product_category_id: selectedCategoryId || "",
            industry_id: industry?.id || "",
            skip: (page - 1) * productsPerPage,
            limit: productsPerPage,
            sort_by: "price",
            sort_by_value: sortByValue,
            filters: "all",
            brand_id_list: selectedBrandIds,
            price_from: priceRange.price_from,
            price_to: priceRange.price_to, 
          };

          const productResponse = await axios.post(
            `${process.env.REACT_APP_IP}obtainProductsListForDealer/`, // POST request
            requestData
          );

          const products = productResponse.data.data || [];
        setProducts(products);

        if (products.length === 0) {
          setNoProductsFound(true);
        } else {
          setNoProductsFound(false);
        }
  
          console.log(productResponse.data);
          console.log("Selected Brand Ids:", selectedBrandIds);
        } catch (err) {
          setError("Failed to load items");
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }
  }, [sortByValue, selectedCategoryId, industry, page, selectedBrandIds , priceRange]);

  // productCountForDealer
  useEffect(() => {
    if (
      selectedCategoryId ||
      industry ||
      selectedCategoryId === null ||
      industry === null
    ) {
      const productCountForDealer = async () => {
        try {
          const userData = localStorage.getItem("user");

          let manufactureUnitId = "";

          if (userData) {
            const data = JSON.parse(userData);
            manufactureUnitId = data.manufacture_unit_id;
          }

          // Create the request payload
          const requestData = {
            manufacture_unit_id: manufactureUnitId,
            product_category_id: selectedCategoryId || "",
            industry_id: industry?.id || "",
            filters: "all",
            price_from: priceRange.price_from,
            price_to: priceRange.price_to, 
            brand_id_list: selectedBrandIds || [], // Add selectedBrandIds to the request body
          };

          const productCountForDealerResponse = await axios.post(
            `${process.env.REACT_APP_IP}productCountForDealer/`, // POST request
            requestData
          );

          // Set product count and calculate total pages
          const productCount = productCountForDealerResponse.data.data || 0;
          setProductsCount(productCount);
          const calculatedTotalPages = Math.ceil(
            productCount / productsPerPage
          );
          setTotalPages(calculatedTotalPages);

          console.log(productCountForDealerResponse.data);
        } catch (err) {
          setError("Failed to load items");
        } finally {
          setLoading(false);
        }
      };

      productCountForDealer();
    }
  }, [selectedCategoryId, industry, selectedBrandIds,priceRange]); // Added selectedBrandIds as dependency

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

  const fetchCategories = async () => {
    try {
      let manufactureUnitId = "";

      if (userData) {
        const data = JSON.parse(userData);
        manufactureUnitId = data.manufacture_unit_id;
      }

      const categoryResponse = await axios.get(
        `${process.env.REACT_APP_IP}obtainProductCategoryListForDealer/?manufacture_unit_id=${manufactureUnitId}&industry_id=${industry ? industry.id : ""}`
      );

      setCategories(categoryResponse.data.data || []); // Set categories in state
    } catch (err) {
      console.error("Error fetching categories:", err); // Log any errors
    }
  };

  // Fetch categories based on selected industry
  useEffect(() => {
    if (industry || industry === null) {
      fetchCategories(); // Trigger the API call for categories
    }
  }, [industry]);

  useEffect(() => {
    // Check if the state contains searchQuery and set it
    if (location.state && location.state.searchQuery) {
      setSearchQuery(location.state.searchQuery); // Set the search query from location.state
    }
  }, [location.state]); // Depend on location.state to update when navigating back

  useEffect(() => {
    // Handle pre-selection of filters when returning from ProductDetails
    if (location.state) {
      const { industry, category } = location.state;

      console.log("Returned industry:", industry);
      console.log("Returned category:", category);

      if (industry) {
        setIndustry(industry); // Set industry
      }

      if (category) {
        setSelectedCategoryId(category.id); // Set category ID
        setCategory(category); // Set full category object
      }
    }
  }, [location.state]); // This ensures pre-selection happens when navigating back

  useEffect(() => {
    if (searchQuery) {
      handleSearch(searchQuery, sortByValue);
    }
  }, [searchQuery, sortByValue]);

  const handleIndustryChange = (event) => {
    setValue(-1);
    const selectedIndustryId = event.target.value;
    const selectedIndustry = industryList.find(
      (item) => item.id === selectedIndustryId
    );
    setIndustry(selectedIndustry);
    setSelectedCategoryId(null);
    setSelectedBrandIds([]); 
      setSelectedBrandNames([]);
  };

  const handleChange = (event, newValue) => {
    setSearchQuery("");
    setValue(newValue); // Update the active tab index
    if (categories[newValue]) {
      const categoryId = categories[newValue].id; // Get the clicked category's ID
      const selectedCategoryItem = {
        id: categories[newValue].id, // Get the category's ID
        name: categories[newValue].name, // Get the category's name
      };

      setSelectedCategoryId(categoryId); // Store the ID in state
      setCategory(selectedCategoryItem);
      setSelectedBrandIds([]);
      setSelectedBrandNames([]);
      console.log("Selected Category ID:", categoryId); // Log the ID to the console
    }
  };

  const handleOpen = (product) => {
    setSelectedProduct(product);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedProduct(null);
  };

  const handleQuantityChange = (productId, newQuantity) => {
    setQuantity((prevQuantity) => ({
      ...prevQuantity,
      [productId]: Math.max(1, newQuantity),
    }));
  };

  const handleAddToCart = async (product, quantity) => {
    try {
      const userData = localStorage.getItem("user");
      const user = JSON.parse(userData); // Assuming user data is stored in localStorage
      const userId = user.id; // Extract user ID

      // Check if the product already exists in the cart
      const existingItem = cartItems.find(
        (item) => item.product_id === product.id
      );

      if (existingItem) {
        // Update quantity if product is already in the cart
        const updatedCartItems = cartItems.map((item) =>
          item.product_id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
        setCartItems(updatedCartItems);

        // Send API request to update the cart
        await axios.post(
          `${process.env.REACT_APP_IP}createOrUpdateUserCartItem/`,
          {
            user_id: userId,
            product_id: product.id,
            quantity: existingItem.quantity + quantity,
            price: product.price,
          }
        );

        toast.success("Product quantity updated."); // Show success toast for quantity update
      } else {
        // Add new item to the cart
        const newCartItem = {
          product_id: product.id,
          quantity: quantity,
          price: product.price,
        };
        setCartItems([...cartItems, newCartItem]);

        // Send API request to create or update the cart item
        await axios.post(
          `${process.env.REACT_APP_IP}createOrUpdateUserCartItem/`,
          {
            user_id: userId,
            product_id: product.id,
            quantity: quantity,
            price: product.price,
          }
        );

        toast.success("Product added successfully."); // Show success toast for new addition
      }

      console.log("Cart updated successfully!");
      fetchCartCount();
      console.log("Cart count updated successfully!");
    } catch (error) {
      console.error("Error adding item to cart:", error);
    }
  };

  const handleSortChange = (value) => {
    setSortByValue(value);

    if (searchQuery) {
      // Trigger search again with the updated sorting value
      handleSearch(searchQuery, value);
    }
  };

  const handleSearchChange = (e) => {
    e.preventDefault();

    const query = e.target.value;
    setSearchQuery(query);

    // Clear the selected category when a search is initiated
    setSelectedCategoryId(null);

    // Reset the active tab (category highlight)
    setValue(-1);

    // Clear previous debounce timeout
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new debounce timer
    debounceTimerRef.current = setTimeout(() => {
      handleSearch(query, sortByValue); // Call the search after a delay
    }, 3000);
  };

  const handleSearch = async (query, sortByValue) => {
    const normalizedQuery = query.trim(); // Remove leading and trailing spaces
    if (!normalizedQuery) return; // Avoid empty searches

    setSearchLoading(true); // Set loading to true when starting the search
    setError(""); // Clear any previous errors
    setSearchResults([]); // Clear previous search results before fetching new ones

    try {
      const userData = JSON.parse(localStorage.getItem("user"));
      const { manufacture_unit_id, role_name } = userData;
      const response = await axios.post(
        `${process.env.REACT_APP_IP}productSearch/`,
        {
          search_query: normalizedQuery, // Use normalized query without spaces
          manufacture_unit_id,
          role_name,
          skip: 1,
          limit: 100,
          sort_by: "price",
          sort_by_value: sortByValue, // Use the value you need for sorting
          filters: "all",
        }
      );

      console.log("Search Result:", response.data);

      if (
        response.data.status &&
        Array.isArray(response.data.data) &&
        response.data.data.length > 0
      ) {
        setSearchResults(response.data.data); // Update results with the new search data
      } else {
        setSearchResults([]); // Empty results if no data
      }
    } catch (err) {
      console.error("Error fetching search results:", err);
      setError("Failed to fetch search results.");
    } finally {
      setSearchLoading(false); // Set loading to false after search completes
    }
  };

  const handleProductClick = (productId) => {
    // console.log("Product clicked:", productId);
    // console.log("Current industry:", industry);
    // console.log("Current category:", categories[value]);
    // console.log("searchQuery", searchQuery);
    navigate(`/dealer/products/${productId}`, {
      state: {
        searchQuery: searchQuery,
        industry,
        category: categories[value],
      },
    });
  };

  const addToWishlist = async (productId) => {
    const user = JSON.parse(userData);
    const userId = user.id;

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_IP}createWishList/`,
        { user_id: userId, product_id: productId }
      );

      const updatedProducts = products.map((product) =>
        product.id === productId
          ? {
              ...product,
              is_wishlist: true, // Set is_wishlist to true
              wishlist_id: response.data.data.wishlist_id || null, // Update with the wishlist ID from the response
            }
          : product
      );

      setProducts(updatedProducts); // Update the state with the updated product

      console.log("Wishlist ID:", response.data.data.wishlist_id);
      console.log("Wishlist Boolean:", response.data.data.is_created);
      console.log("Wishlist added:", response.data);
      console.log("Wishlist products:", updatedProducts);
    } catch (err) {
      console.error("Error adding to wishlist:", err);
      alert("Failed to add item to wishlist. Please try again.");
    }
  };

  const removeFromWishlist = async (wishlistId, productId) => {
    try {
      await axios.get(`${process.env.REACT_APP_IP}deleteWishlist/`, {
        params: { wish_list_id: wishlistId },
      });
      const updatedProducts = products.map((product) =>
        product.id === productId
          ? { ...product, is_wishlist: false, wishlist_id: null }
          : product
      );
      setProducts(updatedProducts); // Update product state without wishlist ID
    } catch (err) {
      console.error("Error removing from wishlist:", err);
      alert("Failed to remove item from wishlist. Please try again.");
    }
  };

  if (loading)
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );

  if (error) return <div>{error}</div>;

  // src\components\Dealer\Products\ProductList.js - Continue

  return (
    <div>
     
      <Grid container spacing={1}>
        <Grid item xs={12} md={1.8}>
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
              selectedCategoryId={selectedCategoryId}
              selectedBrandsProp={selectedBrandIds}
            />

           <PriceRangeFilter onPriceChange={handlePriceChange} />

           {/* <ProductList price_from={priceRange.price_from} price_to={priceRange.price_to} /> */}

          </Box>
        </Grid>
        <Grid item xs={12} md={10.2}>
          <Box>
            <Box
              sx={{
                backgroundColor: "white",
                position: "sticky",
                top: "56px",
                padding: "10px 0px",
                zIndex: 9,
              }}
            >
              <Box sx={{ maxWidth: "85vw" }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-end",
                    gap: "10px",
                    mt: 2,
                    mb: 2,
                  }}
                >
                  <Tabs
                    value={value}
                    onChange={handleChange}
                    variant="scrollable"
                    scrollButtons
                    TabIndicatorProps={{ style: { display: "none" } }}
                    sx={{
                      [`& .${tabsClasses.scrollButtons}`]: {
                        "&.Mui-disabled": { opacity: 0.3 },
                        width: "20px",
                      },
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    {categories.length > 0 ? (
                      categories.map((tab, index) => (
                        <Tab
                          key={tab.id}
                          disableRipple
                          label={tab.name}
                          sx={{
                            fontSize: "12px",
                            textTransform: "capitalize",
                            borderRadius: "50px",
                            padding: "0px 15px",
                            border: "1px solid",
                            borderColor:
                              value === index ? "primary.main" : "grey.400",
                            color: value === index ? "white" : "text.primary",
                            transition: "all 0.3s",
                            margin: "0px 5px",
                            minHeight: "30px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        />
                      ))
                    ) : (
                      <Typography variant="body2" sx={{ padding: "10px" }}>
                        No category and products available under this Industry
                      </Typography>
                    )}
                  </Tabs>

                  <Box>
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
                </Box>
              </Box>

              <Box
                display="flex"
                flexWrap="wrap"
                justifyContent="space-between"
                marginBottom={"25px"}
                gap={1}
                sx={{ margin: "0px 10px" }}
              >
                <Box
                  display="flex"
                  flexWrap="wrap"
                  justifyContent="flex-start"
                  gap={1}
                >
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
                  <Button
                    onClick={() => handleSortChange(1)}
                    sx={{
                      fontSize: "11px",
                      fontWeight: 500,
                      padding: "3px 10px",
                      textTransform: "none",
                      backgroundColor:
                        sortByValue === 1 ? "primary.main" : "#d3d3d38c",
                      borderRadius: "25px",
                      color: sortByValue === 1 ? "white" : "black",
                    }}
                  >
                    Price Low to High
                  </Button>
                  <Button
                    onClick={() => handleSortChange(-1)}
                    sx={{
                      fontSize: "11px",
                      fontWeight: 500,
                      padding: "3px 10px",
                      textTransform: "none",
                      backgroundColor:
                        sortByValue === -1 ? "primary.main" : "#d3d3d38c",
                      borderRadius: "25px",
                      color: sortByValue === -1 ? "white" : "black",
                    }}
                  >
                    Price High to Low
                  </Button>
                  
                </Box>

                <Box
                  display="flex"
                  flexWrap="wrap"
                  gap={1}
                  justifyContent="space-between"
                >
                  <TextField
                    placeholder="Search Products"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon sx={{ fontSize: "20px" }} />{" "}
                          {/* Adjust size in input */}
                        </InputAdornment>
                      ),
                      endAdornment: searchQuery && (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => {
                              setSearchQuery(""); // Clear the search query state

                              // Navigate to the same page without passing the searchQuery in location.state
                              navigate(location.pathname, {
                                replace: true, // Ensures that the current entry in history is replaced
                                state: {
                                  ...location.state, // Retain other location state values if any
                                  searchQuery: "", // Clear the searchQuery in location.state
                                },
                              });
                            }}
                            size="small"
                          >
                            <ClearIcon />
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      width: "250px",
                      "& .MuiOutlinedInput-input": {
                        padding: "5px 10px",
                        fontSize: "12px",
                      },
                      "& .MuiOutlinedInput-root": {
                        paddingRight: 0, // Removes padding-right
                      },
                    }}
                  />
                  <Button sx={{ p: 0, textTransform: "none", color: "black" }}>
                    Total {searchQuery ? searchResults.length : productsCount}{" "}
                    Products
                  </Button>
                </Box>
              </Box>

              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 , margin: "10px"}}>
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
            <Typography sx={{ fontSize: "10px",
                      fontWeight: 500,
                      textTransform: "none",
                    
                      color: "black", }}>{name}</Typography>
            <CloseIcon
              sx={{ fontSize: "12px", cursor: "pointer" , marginLeft: "5px"}}
              onClick={() => handleTagRemove(selectedBrandIds[index])}
            />
          </Box>
        ))}
               </Box>
            </Box>
            <Box
              display="flex"
              flexWrap="wrap"
              gap={3}
              justifyContent="flex-start"
              sx={{ margin: "0px 10px" }}
            >
              {noProductsFound ? (
       <Typography variant="h6" color="text.secondary" align="center" justifyContent={"center"}>
       No products found
     </Typography>
    ) : searchLoading ? (
                // Show a loading spinner for search results while data is being fetched
                <Box
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  width="100%"
                >
                  <CircularProgress />
                </Box>
              ) : searchQuery && searchResults.length === 0 ? (
                <Typography variant="h6" color="text.secondary" align="center" justifyContent={"center"}>
                  No products found for "{searchQuery}"
                </Typography>
              ) : error ? (
                // Show errors if any API issues occurred
                <Typography variant="h6" color="error" align="center">
                  {error}
                </Typography>
              ) : selectedCategoryId &&
                (searchQuery ? searchResults : products).length === 0 ? (
                // Show message if no products are found for the selected category
                <Typography variant="h6" color="text.secondary" align="center" justifyContent={"center"}>
                  No products found under this category.
                </Typography>
              ) : industry &&
                (searchQuery ? searchResults : products).length === 0 ? (
                // Show message if no products are found for the selected category
                <Typography variant="h6" color="text.secondary" align="center" justifyContent={"center"}>
                  No products found under this Industry.
                </Typography>
              ) : (
                // Render filtered products based on selected category or search query
                (searchQuery ? searchResults : products).map((product) => (
                  <Box
                    key={product.id}
                    width={{
                      xs: "100%",
                      sm: "calc(50% - 24px)",
                      md: "calc(25% - 24px)",
                    }}
                    mb={3}
                  >
                    <Card
                      onClick={() => handleProductClick(product.id)}
                      style={{
                        height: "350px",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "flex-start",
                        cursor: "pointer",
                      }}
                    >
                      <Box position="relative">
                        <CardMedia
                          component="img"
                          height="150"
                          image={
                            product.logo &&
                            (product.logo.startsWith("http://example.com")
                              ? soonImg
                              : product.logo.startsWith("http") ||
                                  product.logo.startsWith("https")
                                ? product.logo
                                : soonImg)
                          }
                          alt={product.name}
                          sx={{
                            objectFit: "contain",
                            boxShadow: "0px 0px 2px rgba(0, 0, 0, 0.1)", // Light shadow
                          }}
                        />

                        {product.discount > 0 &&
                          product.price.toFixed(2) !==
                            product.was_price.toFixed(2) && (
                            <Box
                              position="absolute"
                              top={8}
                              left={8}
                              bgcolor="primary.main"
                              color="white"
                              px={1}
                              py={0.5}
                              borderRadius={1}
                              zIndex={1}
                              fontSize={8}
                            >
                              {`${product.discount}% OFF`}
                            </Box>
                          )}

                        <Box position="absolute" bottom={4} left={8}>
                          <Tooltip title="Compare Products" arrow>
                            <CompareArrowsOutlinedIcon
                              sx={{ color: "#615e5e" }}
                            />
                          </Tooltip>
                        </Box>

                        <Box position="absolute" bottom={4} right={8}>
                          <IconButton
                            onClick={(e) => {
                              e.stopPropagation();
                              if (product.is_wishlist) {
                                removeFromWishlist(
                                  product.wishlist_id,
                                  product.id
                                );
                              } else {
                                addToWishlist(product.id);
                              }
                            }}
                          >
                            {product.is_wishlist ? (
                              <FavoriteIcon
                                sx={{ color: "#f2419b", fontSize: "20px" }}
                              />
                            ) : (
                              <FavoriteBorderIcon sx={{ fontSize: "20px" }} />
                            )}
                          </IconButton>
                        </Box>

                        <Tooltip title="Quick View" arrow>
                          <PostAddIcon
                            fontSize="inherit"
                            style={{
                              fontSize: "25px",
                              position: "absolute",
                              top: 8,
                              right: 8,
                              backgroundColor: "#fff",
                              color: "#615e5e",
                              zIndex: 1,
                              cursor: "pointer",
                            }}
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent card click
                              handleOpen(product);
                            }}
                          />
                        </Tooltip>
                      </Box>

                      <CardContent
                        sx={{
                          padding: "8px !important",
                          height: "100%",
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "space-between",
                        }}
                      >
                        <Box>
                          <Tooltip title={product.name}>
                            <Typography
                              variant="subtitle1"
                              style={{
                                lineHeight: "22px",
                                marginBottom: "10px",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                display: "-webkit-box", // Required for line clamping
                                WebkitBoxOrient: "vertical", // Sets the orientation of the box
                                WebkitLineClamp: 2, // Limits text to 2 lines
                              }}
                            >
                              {product.name}
                              {/* {product.name.length > 15
                  ? `${product.name.slice(0, 100)}`
                  : product.name} */}
                            </Typography>
                          </Tooltip>

                          <Box
                            sx={{
                              mt: 1,
                              display: "flex",
                              gap: "10px",
                              alignItems: "center",
                              flexWrap: "wrap",
                            }}
                          >
                            <Typography sx={{ fontSize: "12px" }}>
                              SKU: {product.sku_number}
                            </Typography>
                            <Typography sx={{ fontSize: "12px" }}>
                              MPN: {product.mpn}
                            </Typography>
                          </Box>

                          <Typography sx={{ mt: 1, fontSize: "12px" }}>
                            MSRP : {product.currency}
                            {product.msrp.toFixed(2)}
                          </Typography>

                          <Box
                            sx={{
                              mt: 1,
                              display: "flex",
                              gap: "10px",
                              alignItems: "center",
                              flexWrap: "wrap",
                            }}
                          >
                            <Typography variant="body1" color="text.primary">
                              {product.currency}
                              {product.price.toFixed(2)}
                            </Typography>

                            <Typography
                              variant="body2"
                              color="text.secondary"
                              style={
                                product.price.toFixed(2) ===
                                product.was_price.toFixed(2)
                                  ? { textDecoration: "none" }
                                  : { textDecoration: "line-through" }
                              }
                            >
                              Was:{product.currency}
                              {product.was_price.toFixed(2)}
                            </Typography>
                          </Box>
                        </Box>

                        <Box
                          display="flex"
                          justifyContent="space-between"
                          alignItems="flex-end"
                          gap={"8px"}
                          mt={2}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              gap: "10px",
                              alignItems: "flex-end",
                              justifyContent: "flex-end",
                            }}
                          >
                            <TextField
                              type="number"
                              variant="outlined"
                              size="small"
                              value={quantity[product.id] || 1}
                              onClick={(e) => e.stopPropagation()}
                              onChange={(e) => {
                                e.stopPropagation(); // Prevent card click
                                handleQuantityChange(
                                  product.id,
                                  parseInt(e.target.value) || 1
                                );
                              }}
                              inputProps={{
                                min: 1,
                                style: {
                                  padding: "4px 8px",
                                  fontSize: "10px",
                                },
                              }}
                              style={{ width: "50px" }}
                            />

                            <IconButton
                              sx={{
                                backgroundColor: "none",
                                color: "#615e5e",
                                padding: "0",
                              }}
                              onClick={(e) => {
                                e.stopPropagation(); // Prevent card click
                                handleAddToCart(
                                  product,
                                  quantity[product.id] || 1
                                );
                              }}
                            >
                              <ShoppingCartOutlinedIcon sx={{ padding: "0" }} />
                            </IconButton>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Box>
                ))
              )}
            </Box>

            {/* Pagination Component */}
            <Stack
              spacing={2}
              sx={{ mt: 3, justifyContent: "center", alignItems: "center" }}
            >
              <Pagination
                count={totalPages} // The total number of pages
                page={page} // Current page
                onChange={(_, value) => setPage(value)} // Change page when a new page is selected
                color="primary"
                shape="rounded"
                size="large"
              />
            </Stack>

            <ToastContainer
              position="bottom-right"
              autoClose={1000}
              hideProgressBar
              newestOnTop
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
            />

            <ProductModal
              open={open}
              onClose={handleClose}
              product={selectedProduct}
              handleAddToCart={handleAddToCart}
            />
          </Box>
        </Grid>
      </Grid>
    </div>
  );
};

export default ProductList;
