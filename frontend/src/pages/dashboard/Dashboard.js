import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Grid, 
  Paper, 
  Typography, 
  Card, 
  CardContent, 
  CardHeader,
  Divider,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  IconButton,
  Tooltip,
  CircularProgress,
  useTheme
} from '@mui/material';
import { 
  Inventory as InventoryIcon,
  ShoppingCart as ShoppingCartIcon,
  LocalShipping as LocalShippingIcon,
  Warning as WarningIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  MoreVert as MoreVertIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, registerables } from 'chart.js';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

// Register ChartJS components
ChartJS.register(...registerables);

const Dashboard = () => {
  const theme = useTheme();
  const { currentUser, tenant } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    inventorySummary: {
      totalProducts: 0,
      lowStockItems: 0,
      outOfStockItems: 0,
      totalValue: 0
    },
    ordersSummary: {
      pendingPurchaseOrders: 0,
      pendingSalesOrders: 0,
      monthlyPurchases: 0,
      monthlySales: 0
    },
    recentActivities: [],
    lowStockItems: [],
    topSellingProducts: [],
    salesData: {
      labels: [],
      datasets: []
    },
    inventoryDistribution: {
      labels: [],
      datasets: []
    }
  });

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // In a real app, this would be an API call
        // const response = await axios.get('/api/dashboard');
        // setDashboardData(response.data);
        
        // Mock data for demonstration
        setTimeout(() => {
          setDashboardData({
            inventorySummary: {
              totalProducts: 156,
              lowStockItems: 12,
              outOfStockItems: 5,
              totalValue: 125750.50
            },
            ordersSummary: {
              pendingPurchaseOrders: 8,
              pendingSalesOrders: 15,
              monthlyPurchases: 45250.75,
              monthlySales: 78500.25
            },
            recentActivities: [
              { id: 1, type: 'sale', description: 'New sales order SO-2305-0012 created', timestamp: new Date(Date.now() - 1000 * 60 * 30) },
              { id: 2, type: 'purchase', description: 'Purchase order PO-2305-0008 received', timestamp: new Date(Date.now() - 1000 * 60 * 120) },
              { id: 3, type: 'inventory', description: 'Stock adjustment for Product XYZ', timestamp: new Date(Date.now() - 1000 * 60 * 240) },
              { id: 4, type: 'alert', description: 'Low stock alert for Product ABC', timestamp: new Date(Date.now() - 1000 * 60 * 360) },
              { id: 5, type: 'sale', description: 'Sales order SO-2305-0011 shipped', timestamp: new Date(Date.now() - 1000 * 60 * 480) }
            ],
            lowStockItems: [
              { id: 1, name: 'Product ABC', sku: 'ABC-123', currentStock: 5, reorderPoint: 10 },
              { id: 2, name: 'Product DEF', sku: 'DEF-456', currentStock: 3, reorderPoint: 8 },
              { id: 3, name: 'Product GHI', sku: 'GHI-789', currentStock: 0, reorderPoint: 5 },
              { id: 4, name: 'Product JKL', sku: 'JKL-012', currentStock: 2, reorderPoint: 7 },
              { id: 5, name: 'Product MNO', sku: 'MNO-345', currentStock: 4, reorderPoint: 12 }
            ],
            topSellingProducts: [
              { id: 1, name: 'Product XYZ', sku: 'XYZ-123', salesCount: 45, revenue: 12500 },
              { id: 2, name: 'Product UVW', sku: 'UVW-456', salesCount: 38, revenue: 9500 },
              { id: 3, name: 'Product RST', sku: 'RST-789', salesCount: 32, revenue: 8000 },
              { id: 4, name: 'Product NOP', sku: 'NOP-012', salesCount: 28, revenue: 7000 },
              { id: 5, name: 'Product HIJ', sku: 'HIJ-345', salesCount: 25, revenue: 6250 }
            ],
            salesData: {
              labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
              datasets: [
                {
                  label: 'Sales',
                  data: [65000, 59000, 80000, 81000, 56000, 78500],
                  fill: false,
                  borderColor: theme.palette.primary.main,
                  tension: 0.1
                },
                {
                  label: 'Purchases',
                  data: [48000, 42000, 65000, 71000, 49000, 45250],
                  fill: false,
                  borderColor: theme.palette.secondary.main,
                  tension: 0.1
                }
              ]
            },
            inventoryDistribution: {
              labels: ['Electronics', 'Clothing', 'Home Goods', 'Sports', 'Books', 'Others'],
              datasets: [
                {
                  data: [35, 25, 20, 10, 5, 5],
                  backgroundColor: [
                    '#2196f3',
                    '#f50057',
                    '#ff9800',
                    '#4caf50',
                    '#9c27b0',
                    '#607d8b'
                  ],
                  borderWidth: 1
                }
              ]
            }
          });
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [theme.palette.primary.main, theme.palette.secondary.main]);

  const handleRefresh = () => {
    setLoading(true);
    // In a real app, this would refetch the data
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: tenant?.settings?.currency || 'USD'
    }).format(value);
  };

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
      day: 'numeric',
      month: 'short'
    }).format(date);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Dashboard
        </Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={handleRefresh}
          disabled={loading}
        >
          Refresh
        </Button>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            elevation={2}
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 140,
              borderRadius: 2,
              bgcolor: 'background.paper',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: 100,
                height: 100,
                borderRadius: '0 0 0 100%',
                bgcolor: 'primary.light',
                opacity: 0.2,
                zIndex: 0
              }}
            />
            <Box sx={{ zIndex: 1 }}>
              <Typography color="text.secondary" variant="subtitle2" gutterBottom>
                Total Products
              </Typography>
              <Typography color="text.primary" variant="h4">
                {dashboardData.inventorySummary.totalProducts}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <InventoryIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  {dashboardData.inventorySummary.lowStockItems} low stock items
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            elevation={2}
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 140,
              borderRadius: 2,
              bgcolor: 'background.paper',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: 100,
                height: 100,
                borderRadius: '0 0 0 100%',
                bgcolor: 'secondary.light',
                opacity: 0.2,
                zIndex: 0
              }}
            />
            <Box sx={{ zIndex: 1 }}>
              <Typography color="text.secondary" variant="subtitle2" gutterBottom>
                Inventory Value
              </Typography>
              <Typography color="text.primary" variant="h4">
                {formatCurrency(dashboardData.inventorySummary.totalValue)}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <TrendingUpIcon color="success" sx={{ mr: 1 }} />
                <Typography variant="body2" color="success.main">
                  +5.3% from last month
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            elevation={2}
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 140,
              borderRadius: 2,
              bgcolor: 'background.paper',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: 100,
                height: 100,
                borderRadius: '0 0 0 100%',
                bgcolor: 'success.light',
                opacity: 0.2,
                zIndex: 0
              }}
            />
            <Box sx={{ zIndex: 1 }}>
              <Typography color="text.secondary" variant="subtitle2" gutterBottom>
                Monthly Sales
              </Typography>
              <Typography color="text.primary" variant="h4">
                {formatCurrency(dashboardData.ordersSummary.monthlySales)}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <ShoppingCartIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  {dashboardData.ordersSummary.pendingSalesOrders} pending orders
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            elevation={2}
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 140,
              borderRadius: 2,
              bgcolor: 'background.paper',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: 100,
                height: 100,
                borderRadius: '0 0 0 100%',
                bgcolor: 'warning.light',
                opacity: 0.2,
                zIndex: 0
              }}
            />
            <Box sx={{ zIndex: 1 }}>
              <Typography color="text.secondary" variant="subtitle2" gutterBottom>
                Monthly Purchases
              </Typography>
              <Typography color="text.primary" variant="h4">
                {formatCurrency(dashboardData.ordersSummary.monthlyPurchases)}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <LocalShippingIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  {dashboardData.ordersSummary.pendingPurchaseOrders} pending orders
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Charts and Lists */}
      <Grid container spacing={3}>
        {/* Sales Chart */}
        <Grid item xs={12} md={8}>
          <Card elevation={2} sx={{ borderRadius: 2 }}>
            <CardHeader
              title="Sales & Purchases Trend"
              action={
                <Tooltip title="More options">
                  <IconButton>
                    <MoreVertIcon />
                  </IconButton>
                </Tooltip>
              }
            />
            <Divider />
            <CardContent>
              <Box sx={{ height: 300 }}>
                <Line
                  data={dashboardData.salesData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'top',
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          callback: (value) => formatCurrency(value)
                        }
                      }
                    }
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Inventory Distribution */}
        <Grid item xs={12} md={4}>
          <Card elevation={2} sx={{ borderRadius: 2 }}>
            <CardHeader
              title="Inventory Distribution"
              action={
                <Tooltip title="More options">
                  <IconButton>
                    <MoreVertIcon />
                  </IconButton>
                </Tooltip>
              }
            />
            <Divider />
            <CardContent>
              <Box sx={{ height: 300, display: 'flex', justifyContent: 'center' }}>
                <Doughnut
                  data={dashboardData.inventoryDistribution}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom',
                      },
                    },
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Low Stock Items */}
        <Grid item xs={12} md={6}>
          <Card elevation={2} sx={{ borderRadius: 2 }}>
            <CardHeader
              title="Low Stock Items"
              action={
                <Button size="small" color="primary">
                  View All
                </Button>
              }
            />
            <Divider />
            <CardContent sx={{ p: 0 }}>
              <List>
                {dashboardData.lowStockItems.map((item) => (
                  <React.Fragment key={item.id}>
                    <ListItem
                      secondaryAction={
                        <Button size="small" variant="outlined" color="primary">
                          Reorder
                        </Button>
                      }
                    >
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: item.currentStock === 0 ? 'error.main' : 'warning.main' }}>
                          {item.currentStock === 0 ? <WarningIcon /> : <InventoryIcon />}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={item.name}
                        secondary={
                          <React.Fragment>
                            <Typography component="span" variant="body2" color="text.primary">
                              SKU: {item.sku}
                            </Typography>
                            {` — Current Stock: ${item.currentStock} (Reorder Point: ${item.reorderPoint})`}
                          </React.Fragment>
                        }
                      />
                    </ListItem>
                    <Divider variant="inset" component="li" />
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Activities */}
        <Grid item xs={12} md={6}>
          <Card elevation={2} sx={{ borderRadius: 2 }}>
            <CardHeader
              title="Recent Activities"
              action={
                <Button size="small" color="primary">
                  View All
                </Button>
              }
            />
            <Divider />
            <CardContent sx={{ p: 0 }}>
              <List>
                {dashboardData.recentActivities.map((activity) => {
                  let icon;
                  let color;
                  
                  switch (activity.type) {
                    case 'sale':
                      icon = <ShoppingCartIcon />;
                      color = 'primary.main';
                      break;
                    case 'purchase':
                      icon = <LocalShippingIcon />;
                      color = 'success.main';
                      break;
                    case 'inventory':
                      icon = <InventoryIcon />;
                      color = 'info.main';
                      break;
                    case 'alert':
                      icon = <WarningIcon />;
                      color = 'error.main';
                      break;
                    default:
                      icon = <InventoryIcon />;
                      color = 'primary.main';
                  }
                  
                  return (
                    <React.Fragment key={activity.id}>
                      <ListItem>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: color }}>
                            {icon}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={activity.description}
                          secondary={formatDate(activity.timestamp)}
                        />
                      </ListItem>
                      <Divider variant="inset" component="li" />
                    </React.Fragment>
                  );
                })}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;