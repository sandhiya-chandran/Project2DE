// src\components\Dealer\Products\ProductList.js
import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import Tooltip from "@mui/material/Tooltip";
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

const ProductList = ({ fetchCartCount }) => {
  const location = useLocation();
  const navigate = useNavigate();

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

  const userData = localStorage.getItem("user");
  const [debounceTimer, setDebounceTimer] = useState(null);
  const debounceTimerRef = useRef(null);

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

          const productResponse = await axios.get(
            `${process.env.REACT_APP_IP}obtainProductsListForDealer/?manufacture_unit_id=${manufactureUnitId}&product_category_id=${selectedCategoryId ? selectedCategoryId : ""}&industry_id=${industry?.id || ""}&skip=${(page - 1) * productsPerPage}&limit=${productsPerPage}&sort_by=price&sort_by_value=${sortByValue}&filters=all`
          );
          setProducts(productResponse.data.data || []);
          console.log(productResponse.data);
        } catch (err) {
          setError("Failed to load items");
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }
  }, [sortByValue, selectedCategoryId, industry, page]);

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

          const productCountForDealerResponse = await axios.get(
            `${process.env.REACT_APP_IP}productCountForDealer/?manufacture_unit_id=${manufactureUnitId}&product_category_id=${selectedCategoryId ? selectedCategoryId : ""}&industry_id=${industry?.id || ""}&filters=all`
          );
          // setProductsCount(productCountForDealerResponse.data.data || []);
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
  }, [selectedCategoryId, industry]);

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
    setSelectedCategoryId(null); // Store the full industry object
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

  const handleAddToWishList = async (product) => {
    try {
      const userData = localStorage.getItem("user");
      if (!userData) {
        console.error("No user logged in");
        return;
      }
  
      const user = JSON.parse(userData);
      const userId = user.id;
  
      // Optimistically update the wishlist state before the API call
      setWishlistProducts((prev) => [...prev, product.id]);
  
      // Send POST request to add the product to the wishlist
      const response = await axios.post(
        `${process.env.REACT_APP_IP}createWishList/`,
        {
          user_id: userId,
          product_id: product.id,
        }
      );
  
      console.log("Product added to wishlist", response.data);
    } catch (error) {
      console.error("Error adding item to WishList:", error);
  
      // If the API call fails, remove the product from the wishlist state
      setWishlistProducts((prev) => prev.filter((id) => id !== product.id));
    }
  };
  
  const handleRemoveFromWishList = async (product) => {
    try {
      // Optimistically update the wishlist state before the API call
      setWishlistProducts((prev) => prev.filter((id) => id !== product.id));
  
      // Send GET request to delete the product from the wishlist
      const response = await axios.get(
        `${process.env.REACT_APP_IP}deleteWishlist/?wish_list_id=${product.wishlist_id}`
      );
  
      console.log("Product removed from wishlist", response.data);
    } catch (error) {
      console.error("Error removing item from WishList:", error);
  
      // If the API call fails, add the product back to the wishlist state
      setWishlistProducts((prev) => [...prev, product.id]);
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
    <div style={{ margin: "10px" }}>
      <Box sx={{ maxWidth: "80vw", margin: "0 auto" }}>
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
                    borderColor: value === index ? "primary.main" : "grey.400",
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
      >
        <Box display="flex" flexWrap="wrap" justifyContent="flex-start" gap={1}>
          <Button
            onClick={() => handleSortChange(1)}
            sx={{
              fontSize: "11px",
              fontWeight: 500,
              padding: "3px 10px",
              textTransform: "none",
              backgroundColor: sortByValue === 1 ? "primary.main" : "#d3d3d38c",
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
            Total {searchQuery ? searchResults.length : productsCount} Products
          </Button>
        </Box>
      </Box>

      <Box display="flex" flexWrap="wrap" gap={3} justifyContent="flex-start">
        {searchLoading ? (
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
          <Typography variant="h6" color="text.secondary" align="center">
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
          <Typography variant="h6" color="text.secondary" align="center">
            No products found under this category.
          </Typography>
        ) : industry &&
          (searchQuery ? searchResults : products).length === 0 ? (
          // Show message if no products are found for the selected category
          <Typography variant="h6" color="text.secondary" align="center">
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
                      <CompareArrowsOutlinedIcon sx={{ color: "#615e5e" }} />
                    </Tooltip>
                  </Box>

                  <Box position="absolute" bottom={4} right={8}>
                    <Tooltip
                      title={
                        wishlistProducts.includes(product.id)
                          ? "Remove from wishlist"
                          : "Add to wishlist"
                      }
                      arrow
                    >
                      {wishlistProducts.includes(product.id) ||
                      product.is_wishlist ? (
                        <FavoriteIcon
                          sx={{ color: "#ff4081", cursor: "pointer" }} // Pink color for wishlist items
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent card click
                            handleRemoveFromWishList(product); // Remove from wishlist
                          }}
                        />
                      ) : (
                        <FavoriteBorderIcon
                          sx={{ color: "#615e5e", cursor: "pointer" }} // Gray color for non-wishlist items
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent card click
                            handleAddToWishList(product); // Add to wishlist
                          }}
                        />
                      )}
                    </Tooltip>
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
                          handleAddToCart(product, quantity[product.id] || 1);
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
    </div>
  );
};

export default ProductList;
