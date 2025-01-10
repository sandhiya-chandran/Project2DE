// src\components\Dealer\Products\ProductList.js
import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import Tooltip from "@mui/material/Tooltip";
import {
  Card,
  CardMedia,
  Typography,
  Box,
  CircularProgress,
  IconButton,
} from "@mui/material";
import soonImg from "../../assets/soon-img.png";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";

const ProductList = ({ fetchCartCount, selectedBrandIds }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [sortByValue, setSortByValue] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [value, setValue] = useState(-1); // Tracks the active tab
  const [categories, setCategories] = useState([]); 
  const [selectedCategoryId, setSelectedCategoryId] = useState(null); // Tracks the selected category ID
  const [industry, setIndustry] = useState(null); // Stores the selected industry object
  const [Category, setCategory] = useState(null); // Stores the selected Category object
 
  const [page, setPage] = useState(1); // Current page
  const productsPerPage = 100; // Number of products per page

  const userData = localStorage.getItem("user");
  


  console.log("Received Selected Brand IDs in ProductList:", selectedBrandIds);
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
            `${process.env.REACT_APP_IP}obtainProductsListForDealer/?manufacture_unit_id=${manufactureUnitId}&product_category_id=${selectedCategoryId ? selectedCategoryId : ""}&industry_id=${industry?.id || ""}&brand_id_list=${selectedBrandIds || ""}&skip=${(page - 1) * productsPerPage}&limit=${productsPerPage}&sort_by=price&sort_by_value=${sortByValue}&filters=all`
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
  }, [sortByValue, selectedCategoryId, industry, page, selectedBrandIds]);

 

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
      const response = await axios.post(`${process.env.REACT_APP_IP}createWishList/`, { user_id: userId, product_id: productId });
      
      const updatedProducts = products.map((product) =>
        product.id === productId
          ? {
              ...product, 
              is_wishlist: true, // Set is_wishlist to true
              wishlist_id: response.data.data.wishlist_id || null // Update with the wishlist ID from the response
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
  


  // const addToWishlist = async (productId) => {

  //   const user = JSON.parse(userData);
  //   const userId = user.id;

  //   try {
  //     const response = await axios.post(`${process.env.REACT_APP_IP}createWishList/`, { user_id: userId, product_id: productId });
  //     const updatedProducts = products.map((product) =>
  //       product.id === productId ? { ...product, is_wishlist: true, wishlist_id: response.data.data.id } : product
  //     );
  //     setProducts(updatedProducts); 
  //     console.log("Wishlist ID:", response.data.data.wishlist_id);
  //     console.log("Wishlist Boolean:", response.data.data.is_created);
  //     console.log("Wishlist added:", response.data);
  //     console.log("Wishlist products:", products);
  //   } catch (err) {
  //     console.error("Error adding to wishlist:", err);
  //     alert("Failed to add item to wishlist. Please try again.");
  //   }
  // };

  

  // Remove from wishlist
  const removeFromWishlist = async (wishlistId, productId) => {
    try {
      await axios.get(`${process.env.REACT_APP_IP}deleteWishlist/`, { params: { wish_list_id: wishlistId } });
      const updatedProducts = products.map((product) =>
        product.id === productId ? { ...product, is_wishlist: false, wishlist_id: null } : product
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
      <Box
        display="flex"
        flexWrap="wrap"
        gap={3}
        justifyContent="flex-start"
        sx={{ margin: "20px 20px" }}
      >
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

               
                  <Box position="absolute" bottom={4} right={8}>
                  <IconButton
                  onClick={(e) => {
                    e.stopPropagation();
                    if (product.is_wishlist) {
                      removeFromWishlist(product.wishlist_id, product.id);
                    } else {
                      addToWishlist(product.id);
                    }
                  }}
                >
                  {product.is_wishlist ? (
                    <FavoriteIcon sx={{ color: '#f2419b' }} />
                  ) : (
                    <FavoriteBorderIcon />
                  )}
                </IconButton>
                  </Box>
                </Box>
              </Card>
            </Box>
          ))
        )}
      </Box>
    </div>
  );
};

export default ProductList;
