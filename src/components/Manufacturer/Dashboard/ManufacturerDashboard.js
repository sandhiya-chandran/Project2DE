// src/components/Manufacturer/Dashboard/ManufacturerDashboard.js
import React, { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import Box from "@mui/material/Box";
import Sidebar from "../sidebar";
import ManufacturerHome from "./ManufacturerHome";
import Orders from "../Orders/OrderList";
import Products from "../Products/ProductList";
import AddNewDealer from "../Dealers/AddNewDealer";
import DealerList from "../Dealers/DealerList";
import "../../Manufacturer/manufacturer.css";
import NotificationBar from "../NotificationBar";
import ProductDetail from "../Products/ProductDetail";
import Import from "../Products/Import";
import PersonalImport from "../Products/PersonalImport";
import ImportValidate from "../Products/ImportValidate";
import DealerDetail from "../Dealers/DealerDetail";
import OrderDetail from "../Orders/OrderDetail";
import UserProfile from "./UserProfile";
import SettingsPage from "../Settings/Settingspage";
import { Button , Tooltip } from "@mui/material";
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';

const ManufacturerDashboard = () => {
  const [isVisible, setIsVisible] = useState(false);

  const handleScroll = () => {
    if (window.scrollY > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  // Scroll to the top of the page
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // Add event listener to handle scroll
  useEffect(() => {
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <Box sx={{ display: "flex" }}>
      <Sidebar />
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <NotificationBar />
        <Routes>
          <Route path="/" element={<ManufacturerHome />} />
          <Route path="userProfile" element={<UserProfile />} />
          <Route path="orders" element={<Orders />} />
          <Route path="order-details/:id" element={<OrderDetail />} />

          <Route path="AddNewDealer" element={<AddNewDealer />} />
          <Route path="dealerList" element={<DealerList />} />
          <Route path="dealer-details/:id" element={<DealerDetail />} />

          <Route path="products" element={<Products />} />
          <Route path="products/details/:id" element={<ProductDetail />} />
          <Route path="products/import" element={<Import />} />

          <Route path="products/validate" element={<ImportValidate />} />
          <Route path="products/personalimport" element={<PersonalImport />} />
          <Route path="settings" element={<SettingsPage />} />
        </Routes>
      </Box>

      {/* Back to top button */}
      {isVisible && (
        <Tooltip title="Back to Top" arrow>
          <Button
            onClick={scrollToTop}
            style={{
              position: "fixed",
              bottom: "20px",
              right: "20px",
              backgroundColor: "#1976d2",
              color: "white",
              zIndex: 9,
              padding: "5px",
              boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
            }}
          >
            <ArrowUpwardIcon />
          </Button>
        </Tooltip>
      )}
    </Box>
  );
};

export default ManufacturerDashboard;
