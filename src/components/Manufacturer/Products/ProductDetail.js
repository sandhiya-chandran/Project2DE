import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import {
  CircularProgress,
  Typography,
  Paper,
  Button,
  Box,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Container,
  ToastContainer, Tooltip
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import soonImg from "../../assets/soon-img.png";
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';



import { Visibility, VisibilityOff, MoreVert as MoreVertIcon, Discount } from '@mui/icons-material';

function ProductDetail() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [RelatedProducts, setRelatedProducts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mainImage, setMainImage] = useState("");
  const [isOpen, setIsOpen] = useState(false); // State for Modal
  const [currentProduct, setCurrentProduct] = useState(product); // Local state for product

  const { searchQuery} = location.state || {};
  console.log("searchQuery-Details:", searchQuery);


  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_IP}obtainProductDetails/?product_id=${id}`
        );
        const data = response.data.data || {};
        setProduct(data);
        setMainImage(data.logo || "");

        const userData = localStorage.getItem("user");

          let manufactureUnitId = "";

          if (userData) {
            const data = JSON.parse(userData);
            manufactureUnitId = data.manufacture_unit_id;
          }

        const relatedResponse = await axios.get(
          `${process.env.REACT_APP_IP}get_related_products/?product_id=${id}&manufacture_unit_id=${manufactureUnitId}`
        );
        
        const relatedData = relatedResponse.data.data || [];
        setRelatedProducts(relatedData);

      } catch (err) {
        setError("Failed to load product details");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleCancel = () => {
    navigate("/manufacturer/products", { state: { searchQuery } });
  };


  const handleVisibleChange = async () => {
    try {
      const newVisibility = !currentProduct?.visible;

      // Send API request to update visibility
      const response = await axios.post(
        `${process.env.REACT_APP_IP}updateProduct/`,
        {
          id: id,
          visible: newVisibility,
        }
      );

      // If successful, update local product visibility
      if (response.status === 200) {
        setCurrentProduct((prev) => ({
          ...prev,
          visible: newVisibility,
        }));
      }
    } catch (error) {
      console.error("Error updating visibility:", error);
    }
  };

  // Modal styles (Material-UI)
  const modalStyle = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 400,
    bgcolor: "background.paper",
    border: "2px solid #000",
    boxShadow: 24,
    p: 4,
  };
  const handleMouseDownPassword = (event) => {
    event.preventDefault(); // Prevent default behavior (e.g., focusing on the input field)
  };
  

  const handleImageClick = (image) => setMainImage(image);

  const handleProductClick = (productId) => {
    const url = `/manufacturer/products/details/${productId}?searchQuery=${encodeURIComponent(searchQuery)}`;
    const newTab = window.open(url, '_blank');
    if (newTab) {
      newTab.focus();
    }
  };

   

  if (loading) return <CircularProgress />;
  if (error) return <div>{error}</div>;

  return (
    <Box sx={{ padding: 2 }}>
      <Box display="flex" alignItems="center" gap={2} mb={3}>
      <Button
          startIcon={<ArrowBackIcon />}
          onClick={handleCancel}
          variant="text"
          sx={{textTransform:'capitalize'}}
        >
           Back to Products
        </Button>
      </Box>

      <Grid container spacing={4}>
        <Grid item xs={12} md={5}>
          <Card>
            <CardMedia
              component="img"
              sx={{ objectFit: "contain" }}
              image={
               
                  mainImage &&
                      (mainImage.startsWith("http://example.com")
                        ? soonImg
                        : (mainImage.startsWith("http") || mainImage.startsWith("https"))
                          ? mainImage
                          : soonImg)

              }
              alt={product?.product_name}
            />
          </Card>

          <Box display="flex" gap={1} mt={2} flexWrap={"wrap"}>
            {product?.images?.map((image, index) => (
              <img
                key={index}
                src={
                
                    image &&
                    (image.startsWith("http://example.com")
                      ? soonImg
                      : (image.startsWith("http") || image.startsWith("https"))
                        ? image
                        : soonImg)
                    
                }
                alt={`Product Image ${index}`}
                style={{
                  width: "50px",
                  height: "50px",
                  cursor: "pointer",
                  border: "1px solid #ccc",
                }}
                onClick={() => handleImageClick(image)}
              />
            ))}
          </Box>
        </Grid>

        <Grid item xs={12} md={7}>
          <Card sx={{ mb: 2, boxShadow: "none"}}>
            <CardContent>
              {product.brand_logo ? (
                <img
                  src={product.brand_logo}
                  alt={product.brand_name}
                  style={{ width: "30px", height: "30px" }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.style.display = "none";
                  }}
                />
              ) : (

                <Typography
                variant="h5"
                style={{ fontSize: "19px" }}
                gutterBottom
              >
                {product.brand_name}
              </Typography>
                   )}

              <Typography
                variant="h5"
                style={{ fontSize: "19px" }}
                gutterBottom
              >
                {product?.product_name}
              </Typography>
              <Typography variant="body1" sx={{ mt: 1, fontSize: "15px" }}>
                {product?.short_description}
              </Typography>
              <Typography variant="body1" sx={{ mt: 1, fontSize: "15px" }}>
                SKU Number: {product.sku_number_product_code_item_number}
              </Typography>
              <Typography variant="body1" sx={{ mt: 1, fontSize: "15px" }}>
                MPN Number: {product.mpn}
              </Typography>
              <Typography variant="body1" sx={{ mt: 1, fontSize: "15px"}}>
                UPC Number: {product.upc_ean}
              </Typography>
              <Typography variant="body1" sx={{ mt: 1, fontSize: "15px" ,mb:2}}>
              MSRP : {product.msrp.toFixed(2)}
              </Typography>

             

              {/* Price */}
              <Box sx={{ display: "flex", gap: "20px", alignItems: "center" }}>
              {product.discount !== "0%" && (
                  <p
                    style={{
                      color: "#CC0C39",
                      fontSize: "28px",
                      fontWeight: 400,
                    }}
                  >
                    {product.discount} OFF
                  </p>
                )}
                <p
                  style={{
                    color: "#0F1111",
                    fontSize: "36px",
                    fontWeight: 700,
                    position: "relative",
                  }}
                >
                  <span
                    style={{
                      fontSize: "14px",
                      margin: "2px",
                      position: "absolute",
                      top: "3px",
                      left: "-12px",
                    }}
                  >
                    {product.currency}
                  </span>
                  {product.list_price.toFixed(2)}
                </p>
              </Box>

              <Typography
                variant="h6"
                style={{
                  fontSize: "18px",
                  textDecoration:
                    product.list_price.toFixed(2) ===
                    product.was_price.toFixed(2)
                      ? "none"
                      : "line-through",
                  color: "gray",
                }}
              >
                Was: {product.was_price.toFixed(2)}
              </Typography>

              <Box display="flex" gap={2} mt={2}>
                <Button
                  variant="contained"
                  style={{ pointerEvents: "none" }}
                  color={product?.availability ? "secondary" : "primary"}
                >
                  {product?.availability ? "In Stock" : "Out Of Stock"}
                </Button>

                <InputAdornment position="end">
        <Tooltip
          title={currentProduct?.visible ? "Hide Product" : "Show Product"}
          arrow
        >
          <IconButton
            onClick={handleVisibleChange}
            edge="end"
          >
            {currentProduct?.visible ? (
              <Visibility
                style={{
                  backgroundColor: "transparent",
                  width: "25px",
                  height: "31px",
                }}
              />
            ) : (
              <VisibilityOff
                style={{
                  backgroundColor: "transparent",
                  width: "25px",
                  height: "31px",
                }}
              />
            )}
          </IconButton>
        </Tooltip>
      </InputAdornment>

  



              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

       <Grid container spacing={4} style={{ marginTop: "16px" }}>
        <Grid item xs={12} md={6}>
        <Box sx={{ marginY: "50px" }}>
          <Typography variant="h5" color="textSecondary">
            Product Information
          </Typography>

          {/* Product Info */}
          <TableContainer sx={{ marginTop: "10px" }}>
            <Table
              sx={{
                "& .MuiTableCell-root": {
                  border: "1px solid rgba(224, 224, 224, 1)",
                },
              }}
            >
              <TableBody>
                <TableRow>
                  <TableCell sx={{ width: "120px" ,  fontWeight:'bold' }}>Model Name</TableCell>
                  <TableCell>{product.model}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ width: "120px" , fontWeight:'bold'}}>Brand Name</TableCell>
                  <TableCell>{product.brand_name}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ width: "120px", fontWeight: "bold" }}>
                    Product Category
                  </TableCell>
                  <TableCell>{product.end_level_category}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ width: "120px", fontWeight: "bold" }}>
                    Industry
                  </TableCell>
                  <TableCell>{product.industry_name}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ width: "120px" ,  fontWeight:'bold' }}>
                    Product Description
                  </TableCell>
                  <TableCell>{product.long_description}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>

          {/* Product Attributes Table */}
          <Box sx={{ marginTop: "20px" }}>
            <Typography variant="h5" color="textSecondary">
              Product Attributes
            </Typography>
            <TableContainer
              sx={{
                marginTop: "10px",
              }}
            >
              <Table
                sx={{
                  "& .MuiTableCell-root": {
                    border: "1px solid rgba(224, 224, 224, 1)",
                  },
                }}
              >
                <TableBody>
                  {Object.entries(product.attributes).map(([key, value]) => (
                    <TableRow key={key}>
                      <TableCell sx={{ width: "250px" , fontWeight:'bold' }}>{key}</TableCell>
                      <TableCell>{value}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>

          {/* Features Table */}
          <Box sx={{ marginTop: "30px" }}>
            <Typography sx={{ mb: 1 }} variant="h5" color="textSecondary">
              Features
            </Typography>
            {
  product.features && product.features.length > 0 ? (
    product.features.map((feature, index) => (
      <ul
        style={{ paddingLeft: "20px", color: "rgba(0, 0, 0, 0.87)" }}
        key={index}
      >
        <li
          style={{
            fontSize: "14px",
            lineHeight: 1.43,
            fontFamily: '"Roboto","Helvetica","Arial",sans-serif',
          }}
        >
          {feature}
        </li>
      </ul>
    ))
  ) : (
    <Typography
    variant="p"
    color="textSecondary"
    sx={{ textAlign: "left" }}
  >
    No data available for features
  </Typography>
 
  )
}
          </Box>

         
        </Box>
        </Grid>
        <Grid item xs={12} md={6} direction="column">
        <Box sx={{ p: 0 }}>
        <Typography variant="h5" color="textSecondary">
            Related Products
          </Typography>
        </Box>
       <Box sx={{ marginTop: "10px" }}>
       {RelatedProducts.map((product) => (
          <Grid item key={product.id}>
            <Card 
            onClick={() => handleProductClick(product.id)}
            elevation={2} sx={{ display: 'flex', p: 1 , mb:2 , cursor: 'pointer'}} >
              {/* Product Image */}
             
               <CardMedia
              component="img"
              sx={{ width: 120, height: 120, objectFit: 'contain', mr: 2 , pointerEvents: 'none' }}
              image={
                product.logo && product.logo.startsWith("http://example.com")
                  ? soonImg // Use `soonImg` if the URL is `http://example.com`
                  : product.logo.startsWith("http") || product.logo.startsWith("https")
                  ? product.logo // Use `product.logo` if it's a valid URL
                  : soonImg // Fallback to `soonImg` for all other cases
              }
              alt={product?.name}
            />
              {/* Product Info */}
              <CardContent sx={{ flex: 1  , p:0 , pb:0}} style={{paddingBottom:0}}>
                <Typography variant="body2" fontWeight="bold">
                {product.name} </Typography>
              <Box sx={{display:'flex' , columnGap:'10px' , flexWrap:'wrap' , margin:'5px 0px'}}>
              <Typography variant="body2" color="textSecondary">
                  SKU: {product.sku_number}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  MPN: {product.mpn}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  UPC: {product.upc_ean}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  MSRP: ${product.msrp}
                </Typography>
              </Box>
                <Box sx={{display:'flex' , gap:'10px' , flexWrap:'wrap'}}>
                <Typography variant="body2" color="error" fontWeight="bold">
                {product.currency}{product.price} ({product.discount}%)
                </Typography>

                <Typography variant="body2" sx={{ textDecoration: 'line-through' }}>
                  Was Price: ${product.was_price}
                </Typography>
                </Box>
                
              </CardContent>
            </Card>
          
          </Grid>
        ))}
       </Box>
        </Grid>
       </Grid>

    


       {/* From The Manufacturer */}
       <Box sx={{ marginY: "20px" }}>
            <Typography variant="h6" color="textSecondary">
              From The Manufacturer
            </Typography>
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-start",
                marginTop: "10px",
              }}
            >
              {product.from_the_manufacture ? (
                <img
                  src={product.from_the_manufacture}
                  alt="Manufacturer"
                  style={{ width: "100%", height: "auto" }}
                />
              ) : (
                <Typography
                  variant="p"
                  color="textSecondary"
                  sx={{ textAlign: "left" }}
                >
                  Image will get uploaded soon
                </Typography>
              )}
            </Box>
          </Box>
    </Box>
  );
}

export default ProductDetail;