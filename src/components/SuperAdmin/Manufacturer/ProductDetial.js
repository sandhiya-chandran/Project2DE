import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams,  useNavigate } from 'react-router-dom';
import {
  CircularProgress,
  Dialog,
  DialogContent,
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
} from '@mui/material';
function ProductDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  // const location = useLocation();
  // const initialEditMode = new URLSearchParams(location.search).get('edit') === 'true';

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mainImage, setMainImage] = useState('');
  



 
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_IP}obtainProductDetails/?product_id=${id}`);
        const data = response.data.data || {};
        setProduct(data);
        setMainImage(data.logo || '');

      } catch (err) {
        setError('Failed to load product details');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleCancel = () => {
    navigate('/super_admin/manufacturerList');
  };

  // const handleSave = async () => {
  //   try {
  //     const updatedProduct = {
  //       id,
  //       sku_number_product_code_item_number: sku,
  //       model,
  //       mpn,
  //       discount: Number(discount),
  //       upc_ean: upcEan,
  //       quantity: Number(quantity),
  //       attributes: { Color: color, Size: size, Weight: weight },
  //       availability,
  //       currency: product.currency,
  //       long_description,
  //       product_name,
  //       list_price: product.list_price,
  //       images: product.images,
  //       features: product.features,
  //     };

  //     await axios.post(`${process.env.REACT_APP_IP}updateProduct/`, updatedProduct, {
  //       headers: { 'Content-Type': 'application/json' },
  //     });

  //     setProduct((prev) => ({ ...prev, ...updatedProduct }));
  //     // setIsEditMode(false);
  //   } catch (error) {
  //     setError('Failed to update product');
  //   }
  // };

  const handleImageClick = (image) => setMainImage(image);

  if (loading) return <CircularProgress />;
  if (error) return <div>{error}</div>;

  return (
    <Paper >
  
  
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        {/* <Button variant="outlined" onClick={handleCancel}>Back</Button> */}
        {/* <IconButton component={Link} to={`/manufacturer/products/details/${id}?edit=true`} onClick={() => setIsEditMode(true)}>
          <Edit />
        </IconButton> */}
      </Box>

      <Grid container spacing={4}>
        <Grid item xs={12} md={5}>
          <Card>
            <CardMedia component="img" height="300" image={mainImage} alt={product?.product_name} />
          </Card>
          {/* <Box display="flex" gap={1} mt={2}>
            {product?.product_image_list?.map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`Product ${index}`}
                style={{ width: '80px', height: '100px', cursor: 'pointer', border: '1px solid #ccc' }}
                onClick={() => handleImageClick(image)}
              />
            ))}
          </Box> */}
          <Box display="flex" gap={1} mt={2} flexWrap={'wrap'}>
            {product?.images?.map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`Product Image ${index}`}
                style={{ width: '76px', height: '80px', cursor: 'pointer', border: '1px solid #ccc' }}
                onClick={() => handleImageClick(image)}
              />
            ))}
          </Box>
          {/* <Box display="flex" gap={1} mt={2} flexWrap="wrap">
            {product?.product_image_list?.concat(product?.images || []).map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`Product ${index}`}
                style={{ width: '80px', height: '100px', cursor: 'pointer', border: '1px solid #ccc' }}
                onClick={() => handleImageClick(image)}
              />
            ))}
          </Box> */}
        </Grid>

        <Grid item xs={12} md={7}>
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h5" style={{fontSize: '19px'}} gutterBottom>{product?.product_name}</Typography>
              <Typography variant="h6" color="text.primary">
                {product?.currency}{product?.list_price}
              </Typography>
              <Typography variant="body1" sx={{ mt: 1, fontSize:'15px' }}>{product?.short_description}</Typography>
              <Box display="flex" gap={2} mt={2}>
                <Button
                  variant="contained"
                  style={{ pointerEvents: 'none' }}
                  color={product?.availability ? 'secondary' : 'primary'}
                >
                  {product?.availability ? 'In Stock' : 'Out Of Stock'}
                </Button>
              </Box>
            </CardContent>
          </Card>

          <Typography variant="h6">Product Details</Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>{product?.long_description}</Typography>

          {/* <Box sx={{ mt: 2 }}>
            {isEditMode ? (
              <>
                <TextField label="SKU" value={sku} onChange={(e) => setSku(e.target.value)} fullWidth />
                <TextField label="Model" value={model} onChange={(e) => setModel(e.target.value)} fullWidth />
                <TextField label="MPN" value={mpn} onChange={(e) => setMpn(e.target.value)} fullWidth />
                <TextField label="Discount (%)" value={discount} onChange={(e) => setDiscount(e.target.value)} fullWidth />
                <TextField label="UPC/EAN" value={upcEan} onChange={(e) => setUpcEan(e.target.value)} fullWidth />
                <TextField
                  label="Stock Quantity"
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  fullWidth
                />
                <TextField label="Color" value={color} onChange={(e) => setColor(e.target.value)} fullWidth />
                <TextField label="Weight" value={weight} onChange={(e) => setWeight(e.target.value)} fullWidth />
                <TextField label="Size" value={size} onChange={(e) => setSize(e.target.value)} fullWidth />
              </>
            ) : (
              <>
                <Typography variant="subtitle1">SKU: {sku}</Typography>
                <Typography variant="subtitle1">Model: {model}</Typography>
                <Typography variant="subtitle1">MPN: {mpn}</Typography>
                <Typography variant="subtitle1">Discount: {discount}%</Typography>
                <Typography variant="subtitle1">UPC/EAN: {upcEan}</Typography>
                <Typography variant="subtitle1">Stock Quantity: {quantity}</Typography>
                      </>
            )}
          </Box> */}

          {/* {isEditMode && (
            <Box mt={2}>
              <TextField label="Name" value={product_name} onChange={(e) => setName(e.target.value)} fullWidth />
              <TextField label="Description" value={long_description} onChange={(e) => setDescription(e.target.value)} fullWidth multiline />
              <Button variant="contained" color="primary" onClick={handleSave} sx={{ mr: 2 }}>Save</Button>
              <Button variant="outlined" onClick={handleCancel}>Cancel</Button>
            </Box>
          )} */}

<Typography variant="h6" sx={{ mt: 4 }}>Additional Information</Typography>
          <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table>
              <TableBody>
                {product?.attributes && Object.entries(product.attributes).map(([key, value]) => (
                  <TableRow key={key}>
                    <TableCell component="th" scope="row">{key}</TableCell>
                    <TableCell>{value}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>
    </Paper>
  );
}

export default ProductDetail;
