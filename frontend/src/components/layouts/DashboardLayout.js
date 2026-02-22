import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { styled, useTheme } from '@mui/material/styles';

import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  Tooltip,
  Badge,
  useMediaQuery,
  Collapse,
} from '@mui/material';
import {
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  Dashboard as DashboardIcon,
  Inventory as InventoryIcon,
  Warehouse as WarehouseIcon,
  ShoppingCart as ShoppingCartIcon,
  LocalShipping as LocalShippingIcon,
  Settings as SettingsIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Notifications as NotificationsIcon,
  ExpandLess,
  ExpandMore,
  Logout as LogoutIcon,
  AccountCircle,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

const drawerWidth = 260;

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    flexGrow: 1,
    padding: theme.spacing(3),
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: `-${drawerWidth}px`,
    ...(open && {
      transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
      marginLeft: 0,
    }),
  }),
);

const AppBarStyled = styled(AppBar, { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    ...(open && {
      width: `calc(100% - ${drawerWidth}px)`,
      marginLeft: `${drawerWidth}px`,
      transition: theme.transitions.create(['margin', 'width'], {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
    }),
  }),
);

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
  justifyContent: 'flex-end',
}));

const DashboardLayout = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, tenant, logout, isAdmin } = useAuth();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [open, setOpen] = useState(!isMobile);
  const [anchorElUser, setAnchorElUser] = useState(null);
  const [anchorElNotifications, setAnchorElNotifications] = useState(null);
  const [openSubMenu, setOpenSubMenu] = useState({
    inventory: false,
    orders: false,
    settings: false,
  });

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleOpenNotificationsMenu = (event) => {
    setAnchorElNotifications(event.currentTarget);
  };

  const handleCloseNotificationsMenu = () => {
    setAnchorElNotifications(null);
  };

  const handleLogout = async () => {
    handleCloseUserMenu();
    await logout();
  };

  const handleNavigate = (path) => {
    navigate(path);
    if (isMobile) {
      setOpen(false);
    }
  };

  const handleToggleSubMenu = (menu) => {
    setOpenSubMenu({
      ...openSubMenu,
      [menu]: !openSubMenu[menu],
    });
  };

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBarStyled position="fixed" open={open}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            sx={{ mr: 2, ...(open && { display: 'none' }) }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {tenant?.name || 'Inventory Management'}
          </Typography>
          
          {/* Notifications */}
          <Tooltip title="Notifications">
            <IconButton color="inherit" onClick={handleOpenNotificationsMenu}>
              <Badge badgeContent={3} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Tooltip>
          <Menu
            sx={{ mt: '45px' }}
            id="notifications-menu"
            anchorEl={anchorElNotifications}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(anchorElNotifications)}
            onClose={handleCloseNotificationsMenu}
          >
            <MenuItem onClick={handleCloseNotificationsMenu}>
              <Typography textAlign="center">Low stock alert: Product XYZ</Typography>
            </MenuItem>
            <MenuItem onClick={handleCloseNotificationsMenu}>
              <Typography textAlign="center">New order received: SO-2305-0001</Typography>
            </MenuItem>
            <MenuItem onClick={handleCloseNotificationsMenu}>
              <Typography textAlign="center">Purchase order delivered: PO-2305-0002</Typography>
            </MenuItem>
          </Menu>
          
          {/* User Menu */}
          <Box sx={{ flexGrow: 0, ml: 2 }}>
            <Tooltip title="Open settings">
              <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                <Avatar alt={currentUser?.firstName} src="/static/images/avatar/1.jpg">
                  {currentUser?.firstName?.charAt(0)}{currentUser?.lastName?.charAt(0)}
                </Avatar>
              </IconButton>
            </Tooltip>
            <Menu
              sx={{ mt: '45px' }}
              id="menu-appbar"
              anchorEl={anchorElUser}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}
            >
              <MenuItem onClick={() => { handleCloseUserMenu(); handleNavigate('/dashboard/settings/user'); }}>
                <ListItemIcon>
                  <PersonIcon fontSize="small" />
                </ListItemIcon>
                <Typography textAlign="center">Profile</Typography>
              </MenuItem>
              {isAdmin && (
                <MenuItem onClick={() => { handleCloseUserMenu(); handleNavigate('/dashboard/settings/tenant'); }}>
                  <ListItemIcon>
                    <BusinessIcon fontSize="small" />
                  </ListItemIcon>
                  <Typography textAlign="center">Tenant Settings</Typography>
                </MenuItem>
              )}
              <Divider />
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <LogoutIcon fontSize="small" />
                </ListItemIcon>
                <Typography textAlign="center">Logout</Typography>
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBarStyled>
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
        variant={isMobile ? 'temporary' : 'persistent'}
        anchor="left"
        open={open}
        onClose={handleDrawerClose}
      >
        <DrawerHeader>
          <Typography variant="h6" sx={{ flexGrow: 1, ml: 2 }}>
            Inventory SaaS
          </Typography>
          <IconButton onClick={handleDrawerClose}>
            <ChevronLeftIcon />
          </IconButton>
        </DrawerHeader>
        <Divider />
        <List>
          {/* Dashboard */}
          <ListItem disablePadding>
            <ListItemButton 
              onClick={() => handleNavigate('/dashboard')}
              selected={isActive('/dashboard')}
            >
              <ListItemIcon>
                <DashboardIcon color={isActive('/dashboard') ? 'primary' : 'inherit'} />
              </ListItemIcon>
              <ListItemText primary="Dashboard" />
            </ListItemButton>
          </ListItem>
          
          {/* Inventory Section */}
          <ListItem disablePadding>
            <ListItemButton onClick={() => handleToggleSubMenu('inventory')}>
              <ListItemIcon>
                <InventoryIcon color={openSubMenu.inventory ? 'primary' : 'inherit'} />
              </ListItemIcon>
              <ListItemText primary="Inventory" />
              {openSubMenu.inventory ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
          </ListItem>
          <Collapse in={openSubMenu.inventory} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              <ListItemButton 
                sx={{ pl: 4 }} 
                onClick={() => handleNavigate('/dashboard/products')}
                selected={isActive('/dashboard/products')}
              >
                <ListItemText primary="Products" />
              </ListItemButton>
              <ListItemButton 
                sx={{ pl: 4 }} 
                onClick={() => handleNavigate('/dashboard/inventory')}
                selected={isActive('/dashboard/inventory')}
              >
                <ListItemText primary="Stock Levels" />
              </ListItemButton>
              <ListItemButton 
                sx={{ pl: 4 }} 
                onClick={() => handleNavigate('/dashboard/warehouses')}
                selected={isActive('/dashboard/warehouses')}
              >
                <ListItemIcon>
                  <WarehouseIcon color={isActive('/dashboard/warehouses') ? 'primary' : 'inherit'} />
                </ListItemIcon>
                <ListItemText primary="Warehouses" />
              </ListItemButton>
            </List>
          </Collapse>
          
          {/* Orders Section */}
          <ListItem disablePadding>
            <ListItemButton onClick={() => handleToggleSubMenu('orders')}>
              <ListItemIcon>
                <ShoppingCartIcon color={openSubMenu.orders ? 'primary' : 'inherit'} />
              </ListItemIcon>
              <ListItemText primary="Orders" />
              {openSubMenu.orders ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
          </ListItem>
          <Collapse in={openSubMenu.orders} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              <ListItemButton 
                sx={{ pl: 4 }} 
                onClick={() => handleNavigate('/dashboard/purchase-orders')}
                selected={isActive('/dashboard/purchase-orders')}
              >
                <ListItemIcon>
                  <LocalShippingIcon color={isActive('/dashboard/purchase-orders') ? 'primary' : 'inherit'} />
                </ListItemIcon>
                <ListItemText primary="Purchase Orders" />
              </ListItemButton>
              <ListItemButton 
                sx={{ pl: 4 }} 
                onClick={() => handleNavigate('/dashboard/sales-orders')}
                selected={isActive('/dashboard/sales-orders')}
              >
                <ListItemIcon>
                  <ShoppingCartIcon color={isActive('/dashboard/sales-orders') ? 'primary' : 'inherit'} />
                </ListItemIcon>
                <ListItemText primary="Sales Orders" />
              </ListItemButton>
            </List>
          </Collapse>
          
          {/* Settings Section */}
          <ListItem disablePadding>
            <ListItemButton onClick={() => handleToggleSubMenu('settings')}>
              <ListItemIcon>
                <SettingsIcon color={openSubMenu.settings ? 'primary' : 'inherit'} />
              </ListItemIcon>
              <ListItemText primary="Settings" />
              {openSubMenu.settings ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
          </ListItem>
          <Collapse in={openSubMenu.settings} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              <ListItemButton 
                sx={{ pl: 4 }} 
                onClick={() => handleNavigate('/dashboard/settings/user')}
                selected={isActive('/dashboard/settings/user')}
              >
                <ListItemIcon>
                  <AccountCircle color={isActive('/dashboard/settings/user') ? 'primary' : 'inherit'} />
                </ListItemIcon>
                <ListItemText primary="User Profile" />
              </ListItemButton>
              {isAdmin && (
                <ListItemButton 
                  sx={{ pl: 4 }} 
                  onClick={() => handleNavigate('/dashboard/settings/tenant')}
                  selected={isActive('/dashboard/settings/tenant')}
                >
                  <ListItemIcon>
                    <BusinessIcon color={isActive('/dashboard/settings/tenant') ? 'primary' : 'inherit'} />
                  </ListItemIcon>
                  <ListItemText primary="Tenant Settings" />
                </ListItemButton>
              )}
            </List>
          </Collapse>
        </List>
        <Divider />
        <Box sx={{ p: 2, mt: 'auto' }}>
          <Typography variant="body2" color="text.secondary" align="center">
            {`${currentUser?.firstName} ${currentUser?.lastName}`}
          </Typography>
          <Typography variant="caption" color="text.secondary" align="center" display="block">
            {currentUser?.role.charAt(0).toUpperCase() + currentUser?.role.slice(1)}
          </Typography>
        </Box>
      </Drawer>
      <Main open={open}>
        <DrawerHeader />
        <Outlet />
      </Main>
    </Box>
  );
};

export default DashboardLayout;
