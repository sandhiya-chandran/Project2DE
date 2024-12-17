// src\components\SuperAdmin\Dashboard\SuperAdminDashboard.js
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Box from '@mui/material/Box';
import Sidebar from '../sidebar';
import SuperAdminHome from './SuperAdminHome';
import  NotificationBar from '../NotificationBar';
import ManufacturerList from '../Manufacturer/ManufacturerList';
import SettingHome from '../Settings/SettingHome';
import DealerList from '../Dealers/DealerList';
// import ManufacutreUserDetial from '../Manufacturer/ManufacutreUserDetial';
// src/components/SuperAdmin/Dashboard/SuperAdminDashboard.js
import ManufacutreUserDetial from '../../SuperAdmin/Manufacturer/ManufacutreUserDetial';
import DealerDetail from '../../SuperAdmin/Dealers/DealerDetail';
import AddManufactureUser from '../Manufacturer/AddManufactureUser';
import ManufactureProductList from '../Manufacturer/ManufactureProductList';
import ProductDetail from '../../SuperAdmin/Manufacturer/ProductDetial';
import SuperAdminUserProfile from './SuperAdminUserProfile';
const SuperAdminDashboard = () => {
  return (
    <Box sx={{ display: 'flex' }}>
    <Sidebar />
    <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
    <NotificationBar />
      <Routes>
        <Route path="/" element={<SuperAdminHome/>} />
        <Route path="adminUserProfile" element={<SuperAdminUserProfile />} />
        <Route path="manufacturerList" element={<ManufacturerList/>} />
        <Route path="manufacturerList/userDetails/:id" element={<AddManufactureUser/>} />
        <Route path="manufacturerList/userDetails/productList/:id" element={<ManufactureProductList/>}/>
        <Route path="manufacturerList/productdetails/:id" element={<ProductDetail />} /> 
         <Route path="manufacturerList/userDetails/userpage/:id" element={< ManufacutreUserDetial/>} /> 
       {/* <Route path="manufacturerList/details/" element={< ManufacutreUserDetial/>} />  */}
        <Route path="dealerList/details/:id" element={<DealerDetail/>} />
        <Route path="dealerList/details/:id" element={<DealerDetail/>} />
        <Route path="dealerList" element={<DealerList/>}/>
        <Route path="settings" element={<SettingHome/>} />
      </Routes>
    </Box>
  </Box>
  );
};

export default SuperAdminDashboard;
