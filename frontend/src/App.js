import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Auth Components
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';

// Layout Components
import DashboardLayout from './components/layouts/DashboardLayout';

// Dashboard Pages
import Dashboard from './pages/dashboard/Dashboard';

// Inventory Pages
import ProductList from './pages/inventory/ProductList';
import ProductDetail from './pages/inventory/ProductDetail';
import ProductForm from './pages/inventory/ProductForm';
import InventoryList from './pages/inventory/InventoryList';
import WarehouseList from './pages/inventory/WarehouseList';
import WarehouseForm from './pages/inventory/WarehouseForm';

// Order Pages
import PurchaseOrderList from './pages/orders/PurchaseOrderList';
import PurchaseOrderDetail from './pages/orders/PurchaseOrderDetail';
import PurchaseOrderForm from './pages/orders/PurchaseOrderForm';
import SalesOrderList from './pages/orders/SalesOrderList';
import SalesOrderDetail from './pages/orders/SalesOrderDetail';
import SalesOrderForm from './pages/orders/SalesOrderForm';

// Settings Pages
import UserSettings from './pages/settings/UserSettings';
import TenantSettings from './pages/settings/TenantSettings';

// Context
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider as CustomThemeProvider } from './contexts/ThemeContext';

// Guards
import PrivateRoute from './components/guards/PrivateRoute';
import GuestRoute from './components/guards/GuestRoute';

// Not Found
import NotFound from './pages/NotFound';

const App = () => {
  return (
    <CustomThemeProvider>
      <ThemeWrapper>
        <Router>
          <AuthProvider>
            <Routes>
              {/* Auth Routes */}
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
              <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
              <Route path="/forgot-password" element={<GuestRoute><ForgotPassword /></GuestRoute>} />
              <Route path="/reset-password" element={<GuestRoute><ResetPassword /></GuestRoute>} />
              
              {/* Dashboard Routes */}
              <Route path="/dashboard" element={<PrivateRoute><DashboardLayout /></PrivateRoute>}>
                <Route index element={<Dashboard />} />
                
                {/* Inventory Routes */}
                <Route path="products" element={<ProductList />} />
                <Route path="products/new" element={<ProductForm />} />
                <Route path="products/:id" element={<ProductDetail />} />
                <Route path="products/:id/edit" element={<ProductForm />} />
                <Route path="inventory" element={<InventoryList />} />
                <Route path="warehouses" element={<WarehouseList />} />
                <Route path="warehouses/new" element={<WarehouseForm />} />
                <Route path="warehouses/:id/edit" element={<WarehouseForm />} />
                
                {/* Order Routes */}
                <Route path="purchase-orders" element={<PurchaseOrderList />} />
                <Route path="purchase-orders/new" element={<PurchaseOrderForm />} />
                <Route path="purchase-orders/:id" element={<PurchaseOrderDetail />} />
                <Route path="purchase-orders/:id/edit" element={<PurchaseOrderForm />} />
                <Route path="sales-orders" element={<SalesOrderList />} />
                <Route path="sales-orders/new" element={<SalesOrderForm />} />
                <Route path="sales-orders/:id" element={<SalesOrderDetail />} />
                <Route path="sales-orders/:id/edit" element={<SalesOrderForm />} />
                
                {/* Settings Routes */}
                <Route path="settings/user" element={<UserSettings />} />
                <Route path="settings/tenant" element={<TenantSettings />} />
              </Route>
              
              {/* Not Found */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </Router>
        <ToastContainer position="top-right" autoClose={5000} />
      </ThemeWrapper>
    </CustomThemeProvider>
  );
};

// Theme wrapper component that uses the theme from context
const ThemeWrapper = ({ children }) => {
  const [mode, setMode] = React.useState('light');
  
  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: {
            main: '#2196f3',
          },
          secondary: {
            main: '#f50057',
          },
          background: {
            default: mode === 'light' ? '#f5f5f5' : '#121212',
            paper: mode === 'light' ? '#ffffff' : '#1e1e1e',
          },
        },
        typography: {
          fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
          fontSize: 14,
          fontWeightLight: 300,
          fontWeightRegular: 400,
          fontWeightMedium: 500,
          fontWeightBold: 700,
        },
        components: {
          MuiButton: {
            styleOverrides: {
              root: {
                borderRadius: 8,
                textTransform: 'none',
                fontWeight: 500,
              },
            },
          },
          MuiCard: {
            styleOverrides: {
              root: {
                borderRadius: 12,
                boxShadow: mode === 'light' 
                  ? '0px 2px 4px rgba(0, 0, 0, 0.05), 0px 4px 6px rgba(0, 0, 0, 0.05)' 
                  : '0px 2px 4px rgba(0, 0, 0, 0.2), 0px 4px 6px rgba(0, 0, 0, 0.2)',
              },
            },
          },
        },
      }),
    [mode],
  );
  
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
};

export default App;