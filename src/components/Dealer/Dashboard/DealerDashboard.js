// src\components\Dealer\DealerDashboard.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Routes, Route } from 'react-router-dom';
import Box from '@mui/material/Box';
import Sidebar from '../../Dealer/sidebar';
import NotificationBar from '../../Dealer/NotificationBar';
import DealerHome from './DealerHome';
import Products from '../Products/ProductList';
import Orders from '../orders/orderList';
import Settings from '../settings/settings';
import CartPage from '../Products/CartPage';
import CheckoutPage from '../Products/CheckoutPage';
import PaymentConfirmationPage from '../Products/PaymentConfirmationPage';
import OrderDetailPage from '../orders/orderDetails';
import ProductDetailPage from '../Products/ProductDetailPage';
import DealerProfile from '../Dashboard/DealerProfile';
import OrdersRedirect from '../Products/OrdersRedirect';
import WishList from '../Products/Wishlist';
import { Button , Tooltip } from "@mui/material";
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';



const DealerDashboard = () => {

  const [cartCount, setCartCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [userData, setUserData] = useState(null);
  
  const user = JSON.parse(localStorage.getItem("user"));

  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Default to closed

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

 
  useEffect(() => {
    fetchUserDetails(); // Call the function inside useEffect
  }, [user.id]);
  
  // Move fetchUserDetails outside the useEffect
  const fetchUserDetails = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_IP}obtainUserDetailsForProfile/?user_id=${user.id}`
      );
      setUserData(response.data.data.user_obj);
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  };

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
      behavior: 'smooth',
    });
  };

  // Add event listener to handle scroll
  useEffect(() => {
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);



  const fetchCartCount = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_IP}totalCheckOutAmount/?user_id=${user.id}`
      );
      console.log(response.data); // Add this to inspect the structure
      setCartCount(response.data.data.cart_count || 0); // Update state with cart count
      // console.log("Cart Items Count:", response.data.data.cart_count);
    } catch (error) {
      console.error("Error fetching order list:", error);
    }
  };

  useEffect(() => {
    fetchCartCount();
  }, []);

 
  
  return (
    <Box sx={{ display: 'flex' }}>
    <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
         <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
         <NotificationBar toggleSidebar={toggleSidebar}  userData={userData} cartCount={cartCount} fetchCartCount={fetchCartCount} className="sticky-notification-bar"/>
           
        

           <Routes>
             <Route path="/" element={<DealerHome/>} />
             <Route path="orders" element={<Orders />} />
             <Route path="settings" element={<Settings/>} />
             <Route path="cart" element={<CartPage fetchCartCount={fetchCartCount} />} />
             <Route path="checkout" element={<CheckoutPage fetchCartCount={fetchCartCount} />} />
             <Route path="paymentConfirm" element={<PaymentConfirmationPage/>} />
            
             <Route path="OrderDetail" element={<OrderDetailPage/>} />
             <Route path="products" element={<Products fetchCartCount={fetchCartCount} />} />
             <Route path="products/:id" element={<ProductDetailPage fetchCartCount={fetchCartCount} />} />

             <Route path="profile" element={<DealerProfile  userData={userData}
                      fetchUserDetails={fetchUserDetails} setUserData={setUserData}/>} />
             <Route path="checkoutRedirect" element={<OrdersRedirect/>} />

             <Route path="WishList" element={<WishList fetchCartCount={fetchCartCount} />} />



           </Routes>
         </Box>

 {/* Back to top button */}
 {isVisible && (
        <Tooltip title="Back to Top" arrow>
          <Button
            onClick={scrollToTop}
            style={{
              position: 'fixed',
              bottom: '20px',
              right: '20px',
              backgroundColor: '#1976d2',
              color: 'white',
              zIndex:9,
              padding: '5px',
              boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
            }}
          >
            <ArrowUpwardIcon />
          </Button>
        </Tooltip>
      )}
         
       </Box>
  );
};

export default DealerDashboard;
