import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Paper,
  Typography,
} from "@mui/material";

const ProductTable = () => {
  // Sample product data
  const initialProducts = [
    { id: 1, name: "Product A", category: "Electronics", price: 100 },
    { id: 2, name: "Product B", category: "Clothing", price: 50 },
    { id: 3, name: "Product C", category: "Home Appliances", price: 200 },
    { id: 4, name: "Product D", category: "Electronics", price: 150 },
  ];

  const [products, setProducts] = useState(initialProducts);
  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState("name");

  // Handle sorting
  const handleSort = (property) => {
    const isAscending = orderBy === property && order === "asc";
    setOrder(isAscending ? "desc" : "asc");
    setOrderBy(property);
    const sortedProducts = [...products].sort((a, b) => {
      if (a[property] < b[property]) return isAscending ? 1 : -1;
      if (a[property] > b[property]) return isAscending ? -1 : 1;
      return 0;
    });
    setProducts(sortedProducts);
  };

  return (
    <Paper sx={{ width: "80%", margin: "20px auto", padding: "20px" }}>
      <Typography variant="h5" align="center" gutterBottom>
        Product Table
      </Typography>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <TableSortLabel
                  active={orderBy === "name"}
                  direction={orderBy === "name" ? order : "asc"}
                  onClick={() => handleSort("name")}
                >
                  Product Name
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === "category"}
                  direction={orderBy === "category" ? order : "asc"}
                  onClick={() => handleSort("category")}
                >
                  Category
                </TableSortLabel>
              </TableCell>
              <TableCell align="right">
                <TableSortLabel
                  active={orderBy === "price"}
                  direction={orderBy === "price" ? order : "asc"}
                  onClick={() => handleSort("price")}
                >
                  Price ($)
                </TableSortLabel>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>{product.name}</TableCell>
                <TableCell>{product.category}</TableCell>
                <TableCell align="right">{product.price}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default ProductTable;
