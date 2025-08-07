import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  TextField,
  Tooltip,
  Typography,
  CircularProgress,
  Stepper,
  Step,
  StepLabel
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  FilterList as FilterListIcon,
  MoreVert as MoreVertIcon,
  LocalShipping as ShippingIcon,
  Receipt as ReceiptIcon,
  Print as PrintIcon,
  Email as EmailIcon,
  Cancel as CancelIcon,
  CheckCircle as CheckCircleIcon,
  AccessTime as PendingIcon,
  Inventory as InventoryIcon,
  Payment as PaymentIcon,
  Business as BusinessIcon,
  CalendarToday as CalendarIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const PurchaseOrderList = () => {
  const { currentUser, tenant } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [order, setOrder] = useState('desc');
  const [orderBy, setOrderBy] = useState('createdAt');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDateRange, setFilterDateRange] = useState('all');
  const [openFilterDialog, setOpenFilterDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [openOrderDialog, setOpenOrderDialog] = useState(false);

  // Fetch orders data
  useEffect(() => {
    const fetchOrdersData = async () => {
      try {
        setLoading(true);
        // In a real app, this would be an API call
        // const response = await axios.get('/api/purchase-orders');
        // setOrders(response.data);
        
        // Mock data for demonstration
        setTimeout(() => {
          const statuses = ['Draft', 'Pending', 'Ordered', 'Partially Received', 'Received', 'Cancelled'];
          const paymentStatuses = ['Unpaid', 'Partially Paid', 'Paid'];
          const suppliers = [
            { id: 1, name: 'Global Supplies Inc.', email: 'orders@globalsupplies.com', contactPerson: 'John Manager' },
            { id: 2, name: 'Tech Components Ltd.', email: 'sales@techcomponents.com', contactPerson: 'Sarah Tech' },
            { id: 3, name: 'Office Solutions Co.', email: 'orders@officesolutions.com', contactPerson: 'Mike Office' },
            { id: 4, name: 'Industrial Parts Corp.', email: 'sales@industrialparts.com', contactPerson: 'Lisa Industrial' },
            { id: 5, name: 'Quality Materials Inc.', email: 'orders@qualitymaterials.com', contactPerson: 'David Quality' }
          ];
          
          const mockOrders = Array.from({ length: 50 }, (_, index) => {
            const createdAt = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);
            const status = statuses[Math.floor(Math.random() * statuses.length)];
            const paymentStatus = paymentStatuses[Math.floor(Math.random() * paymentStatuses.length)];
            const supplier = suppliers[Math.floor(Math.random() * suppliers.length)];
            
            // Generate random items
            const itemCount = Math.floor(Math.random() * 5) + 1;
            const items = Array.from({ length: itemCount }, (_, itemIndex) => {
              const cost = parseFloat((Math.random() * 100 + 10).toFixed(2));
              const quantity = Math.floor(Math.random() * 20) + 1;
              const receivedQuantity = status === 'Received' ? quantity : 
                                      status === 'Partially Received' ? Math.floor(quantity * Math.random()) : 0;
              
              return {
                id: itemIndex + 1,
                productId: Math.floor(Math.random() * 1000) + 1,
                sku: `SKU-${1000 + Math.floor(Math.random() * 1000)}`,
                name: `Product ${1000 + Math.floor(Math.random() * 1000)}`,
                cost,
                quantity,
                receivedQuantity,
                discount: Math.random() > 0.7 ? parseFloat((cost * 0.1).toFixed(2)) : 0,
                tax: parseFloat((cost * 0.08).toFixed(2)),
                total: parseFloat((cost * quantity).toFixed(2))
              };
            });
            
            // Calculate totals
            const subtotal = items.reduce((sum, item) => sum + item.total, 0);
            const totalDiscount = items.reduce((sum, item) => sum + (item.discount * item.quantity), 0);
            const totalTax = items.reduce((sum, item) => sum + (item.tax * item.quantity), 0);
            const shippingCost = parseFloat((Math.random() * 20 + 5).toFixed(2));
            const total = parseFloat((subtotal - totalDiscount + totalTax + shippingCost).toFixed(2));
            
            // Calculate received percentage
            const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
            const totalReceivedQuantity = items.reduce((sum, item) => sum + item.receivedQuantity, 0);
            const receivedPercentage = totalQuantity > 0 ? (totalReceivedQuantity / totalQuantity) * 100 : 0;
            
            return {
              id: index + 1,
              orderNumber: `PO-${new Date().getFullYear().toString().substr(-2)}${(createdAt.getMonth() + 1).toString().padStart(2, '0')}-${(1000 + index).toString()}`,
              supplierId: supplier.id,
              supplierName: supplier.name,
              supplierEmail: supplier.email,
              supplierContactPerson: supplier.contactPerson,
              status,
              paymentStatus,
              createdAt,
              updatedAt: new Date(createdAt.getTime() + Math.random() * 5 * 24 * 60 * 60 * 1000),
              orderedAt: status !== 'Draft' ? new Date(createdAt.getTime() + Math.random() * 2 * 24 * 60 * 60 * 1000) : null,
              expectedDeliveryDate: status !== 'Draft' ? new Date(createdAt.getTime() + Math.random() * 14 * 24 * 60 * 60 * 1000) : null,
              receivedAt: status === 'Received' ? new Date(createdAt.getTime() + Math.random() * 10 * 24 * 60 * 60 * 1000) : null,
              items,
              subtotal,
              discount: totalDiscount,
              tax: totalTax,
              shippingCost,
              total,
              currency: tenant?.settings?.currency || 'USD',
              receivedPercentage,
              notes: Math.random() > 0.7 ? 'Please deliver to loading dock B' : '',
              paymentTerms: Math.random() > 0.5 ? 'Net 30' : 'Net 15',
              paymentMethod: Math.random() > 0.5 ? 'Bank Transfer' : 'Credit Card',
              warehouseId: Math.floor(Math.random() * 3) + 1,
              warehouseName: ['Main Warehouse', 'East Coast Fulfillment', 'West Coast Distribution'][Math.floor(Math.random() * 3)],
              shippingAddress: {
                street: `${Math.floor(Math.random() * 1000) + 1} Main St`,
                city: 'Anytown',
                state: 'CA',
                zipCode: `9${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
                country: 'USA'
              }
            };
          });
          
          setOrders(mockOrders);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching orders data:', error);
        setLoading(false);
      }
    };

    fetchOrdersData();
  }, [tenant?.settings?.currency]);

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const handleFilterStatusChange = (event) => {
    setFilterStatus(event.target.value);
    setPage(0);
  };

  const handleFilterDateRangeChange = (event) => {
    setFilterDateRange(event.target.value);
    setPage(0);
  };

  const handleOpenFilterDialog = () => {
    setOpenFilterDialog(true);
  };

  const handleCloseFilterDialog = () => {
    setOpenFilterDialog(false);
  };

  const handleOrderClick = (order) => {
    setSelectedOrder(order);
    setOpenOrderDialog(true);
  };

  const handleCloseOrderDialog = () => {
    setOpenOrderDialog(false);
  };

  const handleCreateOrder = () => {
    // In a real app, this would navigate to the order creation page
    // navigate('/orders/purchase/new');
    console.log('Navigate to create purchase order page');
  };

  const handleRefresh = () => {
    setLoading(true);
    // In a real app, this would refetch the data
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: tenant?.settings?.currency || 'USD'
    }).format(value);
  };

  // Filter orders based on search term, status, and date range
  const filteredOrders = orders.filter((order) => {
    const matchesSearch = searchTerm === '' ||
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.supplierName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    
    let matchesDateRange = true;
    const now = new Date();
    const orderDate = new Date(order.createdAt);
    
    if (filterDateRange === 'today') {
      matchesDateRange = orderDate.toDateString() === now.toDateString();
    } else if (filterDateRange === 'yesterday') {
      const yesterday = new Date(now);
      yesterday.setDate(now.getDate() - 1);
      matchesDateRange = orderDate.toDateString() === yesterday.toDateString();
    } else if (filterDateRange === 'thisWeek') {
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      matchesDateRange = orderDate >= startOfWeek;
    } else if (filterDateRange === 'thisMonth') {
      matchesDateRange = orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear();
    } else if (filterDateRange === 'lastMonth') {
      const lastMonth = new Date(now);
      lastMonth.setMonth(now.getMonth() - 1);
      matchesDateRange = orderDate.getMonth() === lastMonth.getMonth() && orderDate.getFullYear() === lastMonth.getFullYear();
    }
    
    return matchesSearch && matchesStatus && matchesDateRange;
  });

  // Sort orders
  const sortedOrders = filteredOrders.sort((a, b) => {
    const isAsc = order === 'asc';
    
    if (orderBy === 'createdAt' || orderBy === 'updatedAt' || orderBy === 'orderedAt' || orderBy === 'receivedAt' || orderBy === 'expectedDeliveryDate') {
      if (!a[orderBy]) return isAsc ? 1 : -1;
      if (!b[orderBy]) return isAsc ? -1 : 1;
      return isAsc
        ? new Date(a[orderBy]) - new Date(b[orderBy])
        : new Date(b[orderBy]) - new Date(a[orderBy]);
    } else if (orderBy === 'total' || orderBy === 'receivedPercentage') {
      return isAsc ? a[orderBy] - b[orderBy] : b[orderBy] - a[orderBy];
    } else {
      return isAsc
        ? a[orderBy] < b[orderBy] ? -1 : a[orderBy] > b[orderBy] ? 1 : 0
        : a[orderBy] > b[orderBy] ? -1 : a[orderBy] < b[orderBy] ? 1 : 0;
    }
  });

  const paginatedOrders = sortedOrders.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'Draft':
        return 'default';
      case 'Pending':
        return 'warning';
      case 'Ordered':
        return 'info';
      case 'Partially Received':
        return 'primary';
      case 'Received':
        return 'success';
      case 'Cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'Paid':
        return 'success';
      case 'Partially Paid':
        return 'warning';
      case 'Unpaid':
        return 'error';
      default:
        return 'default';
    }
  };

  const getOrderStatusStep = (status) => {
    switch (status) {
      case 'Draft':
        return 0;
      case 'Pending':
      case 'Ordered':
        return 1;
      case 'Partially Received':
        return 2;
      case 'Received':
        return 3;
      case 'Cancelled':
        return -1;
      default:
        return 0;
    }
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
          Purchase Orders
        </Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            sx={{ mr: 1 }}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            color="primary"
            onClick={handleCreateOrder}
          >
            Create Order
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12}>
          <Card elevation={2}>
            <CardContent>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Search Orders"
                    variant="outlined"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={filterStatus}
                      onChange={handleFilterStatusChange}
                      label="Status"
                    >
                      <MenuItem value="all">All Statuses</MenuItem>
                      <MenuItem value="Draft">Draft</MenuItem>
                      <MenuItem value="Pending">Pending</MenuItem>
                      <MenuItem value="Ordered">Ordered</MenuItem>
                      <MenuItem value="Partially Received">Partially Received</MenuItem>
                      <MenuItem value="Received">Received</MenuItem>
                      <MenuItem value="Cancelled">Cancelled</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel>Date Range</InputLabel>
                    <Select
                      value={filterDateRange}
                      onChange={handleFilterDateRangeChange}
                      label="Date Range"
                    >
                      <MenuItem value="all">All Time</MenuItem>
                      <MenuItem value="today">Today</MenuItem>
                      <MenuItem value="yesterday">Yesterday</MenuItem>
                      <MenuItem value="thisWeek">This Week</MenuItem>
                      <MenuItem value="thisMonth">This Month</MenuItem>
                      <MenuItem value="lastMonth">Last Month</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={2}>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                      variant="outlined"
                      startIcon={<FilterListIcon />}
                      onClick={handleOpenFilterDialog}
                      sx={{ mr: 1 }}
                    >
                      More Filters
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper elevation={2} sx={{ width: '100%', mb: 2, borderRadius: 1 }}>
        <TableContainer>
          <Table sx={{ minWidth: 750 }} aria-labelledby="tableTitle">
            <TableHead>
              <TableRow>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'orderNumber'}
                    direction={orderBy === 'orderNumber' ? order : 'asc'}
                    onClick={() => handleRequestSort('orderNumber')}
                  >
                    Order #
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'supplierName'}
                    direction={orderBy === 'supplierName' ? order : 'asc'}
                    onClick={() => handleRequestSort('supplierName')}
                  >
                    Supplier
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'status'}
                    direction={orderBy === 'status' ? order : 'asc'}
                    onClick={() => handleRequestSort('status')}
                  >
                    Status
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'receivedPercentage'}
                    direction={orderBy === 'receivedPercentage' ? order : 'asc'}
                    onClick={() => handleRequestSort('receivedPercentage')}
                  >
                    Received
                  </TableSortLabel>
                </TableCell>
                <TableCell align="right">
                  <TableSortLabel
                    active={orderBy === 'total'}
                    direction={orderBy === 'total' ? order : 'asc'}
                    onClick={() => handleRequestSort('total')}
                  >
                    Total
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'createdAt'}
                    direction={orderBy === 'createdAt' ? order : 'asc'}
                    onClick={() => handleRequestSort('createdAt')}
                  >
                    Date
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'expectedDeliveryDate'}
                    direction={orderBy === 'expectedDeliveryDate' ? order : 'asc'}
                    onClick={() => handleRequestSort('expectedDeliveryDate')}
                  >
                    Expected Delivery
                  </TableSortLabel>
                </TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedOrders.map((order) => (
                <TableRow
                  hover
                  key={order.id}
                  onClick={() => handleOrderClick(order)}
                  sx={{ cursor: 'pointer' }}
                >
                  <TableCell>{order.orderNumber}</TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2">{order.supplierName}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {order.supplierContactPerson}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={order.status}
                      color={getStatusColor(order.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {order.status === 'Draft' || order.status === 'Pending' ? (
                      <Typography variant="body2">-</Typography>
                    ) : (
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box sx={{ width: '100%', mr: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            {Math.round(order.receivedPercentage)}%
                          </Typography>
                        </Box>
                      </Box>
                    )}
                  </TableCell>
                  <TableCell align="right">{formatCurrency(order.total)}</TableCell>
                  <TableCell>{formatDate(order.createdAt)}</TableCell>
                  <TableCell>{formatDate(order.expectedDeliveryDate)}</TableCell>
                  <TableCell align="right">
                    <Tooltip title="Print Order">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Handle print action
                        }}
                      >
                        <PrintIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Email Supplier">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Handle email action
                        }}
                      >
                        <EmailIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="More Options">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Handle more options
                        }}
                      >
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={filteredOrders.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {/* Filter Dialog */}
      <Dialog open={openFilterDialog} onClose={handleCloseFilterDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Advanced Filters</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Min Total"
                type="number"
                variant="outlined"
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Max Total"
                type="number"
                variant="outlined"
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Payment Status</InputLabel>
                <Select
                  label="Payment Status"
                  value=""
                >
                  <MenuItem value="">All Payment Statuses</MenuItem>
                  <MenuItem value="Paid">Paid</MenuItem>
                  <MenuItem value="Partially Paid">Partially Paid</MenuItem>
                  <MenuItem value="Unpaid">Unpaid</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Warehouse</InputLabel>
                <Select
                  label="Warehouse"
                  value=""
                >
                  <MenuItem value="">All Warehouses</MenuItem>
                  <MenuItem value="1">Main Warehouse</MenuItem>
                  <MenuItem value="2">East Coast Fulfillment</MenuItem>
                  <MenuItem value="3">West Coast Distribution</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="From Date"
                type="date"
                variant="outlined"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="To Date"
                type="date"
                variant="outlined"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseFilterDialog}>Cancel</Button>
          <Button variant="contained" color="primary" onClick={handleCloseFilterDialog}>
            Apply Filters
          </Button>
        </DialogActions>
      </Dialog>

      {/* Order Detail Dialog */}
      {selectedOrder && (
        <Dialog open={openOrderDialog} onClose={handleCloseOrderDialog} maxWidth="md" fullWidth>
          <DialogTitle>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">Purchase Order {selectedOrder.orderNumber}</Typography>
              <Chip
                label={selectedOrder.status}
                color={getStatusColor(selectedOrder.status)}
                size="small"
              />
            </Box>
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={3}>
              {/* Order Status Timeline */}
              {getOrderStatusStep(selectedOrder.status) !== -1 && (
                <Grid item xs={12}>
                  <Stepper activeStep={getOrderStatusStep(selectedOrder.status)} alternativeLabel>
                    <Step>
                      <StepLabel>Draft/Pending</StepLabel>
                    </Step>
                    <Step>
                      <StepLabel>Ordered</StepLabel>
                    </Step>
                    <Step>
                      <StepLabel>Partially Received</StepLabel>
                    </Step>
                    <Step>
                      <StepLabel>Fully Received</StepLabel>
                    </Step>
                  </Stepper>
                </Grid>
              )}
              
              {/* Order Details */}
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Order Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <Typography variant="body2" color="text.secondary">
                      Order Number
                    </Typography>
                  </Grid>
                  <Grid item xs={8}>
                    <Typography variant="body2">
                      {selectedOrder.orderNumber}
                    </Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography variant="body2" color="text.secondary">
                      Created Date
                    </Typography>
                  </Grid>
                  <Grid item xs={8}>
                    <Typography variant="body2">
                      {formatDate(selectedOrder.createdAt)}
                    </Typography>
                  </Grid>
                  {selectedOrder.orderedAt && (
                    <>
                      <Grid item xs={4}>
                        <Typography variant="body2" color="text.secondary">
                          Ordered Date
                        </Typography>
                      </Grid>
                      <Grid item xs={8}>
                        <Typography variant="body2">
                          {formatDate(selectedOrder.orderedAt)}
                        </Typography>
                      </Grid>
                    </>
                  )}
                  <Grid item xs={4}>
                    <Typography variant="body2" color="text.secondary">
                      Expected Delivery
                    </Typography>
                  </Grid>
                  <Grid item xs={8}>
                    <Typography variant="body2">
                      {formatDate(selectedOrder.expectedDeliveryDate)}
                    </Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography variant="body2" color="text.secondary">
                      Status
                    </Typography>
                  </Grid>
                  <Grid item xs={8}>
                    <Chip
                      label={selectedOrder.status}
                      color={getStatusColor(selectedOrder.status)}
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <Typography variant="body2" color="text.secondary">
                      Payment Status
                    </Typography>
                  </Grid>
                  <Grid item xs={8}>
                    <Chip
                      label={selectedOrder.paymentStatus}
                      color={getPaymentStatusColor(selectedOrder.paymentStatus)}
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <Typography variant="body2" color="text.secondary">
                      Payment Terms
                    </Typography>
                  </Grid>
                  <Grid item xs={8}>
                    <Typography variant="body2">
                      {selectedOrder.paymentTerms}
                    </Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography variant="body2" color="text.secondary">
                      Payment Method
                    </Typography>
                  </Grid>
                  <Grid item xs={8}>
                    <Typography variant="body2">
                      {selectedOrder.paymentMethod}
                    </Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography variant="body2" color="text.secondary">
                      Warehouse
                    </Typography>
                  </Grid>
                  <Grid item xs={8}>
                    <Typography variant="body2">
                      {selectedOrder.warehouseName}
                    </Typography>
                  </Grid>
                  {selectedOrder.notes && (
                    <>
                      <Grid item xs={4}>
                        <Typography variant="body2" color="text.secondary">
                          Notes
                        </Typography>
                      </Grid>
                      <Grid item xs={8}>
                        <Typography variant="body2">
                          {selectedOrder.notes}
                        </Typography>
                      </Grid>
                    </>
                  )}
                </Grid>
              </Grid>
              
              {/* Supplier Details */}
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Supplier Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <Typography variant="body2" color="text.secondary">
                      Supplier Name
                    </Typography>
                  </Grid>
                  <Grid item xs={8}>
                    <Typography variant="body2">
                      {selectedOrder.supplierName}
                    </Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography variant="body2" color="text.secondary">
                      Contact Person
                    </Typography>
                  </Grid>
                  <Grid item xs={8}>
                    <Typography variant="body2">
                      {selectedOrder.supplierContactPerson}
                    </Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography variant="body2" color="text.secondary">
                      Email
                    </Typography>
                  </Grid>
                  <Grid item xs={8}>
                    <Typography variant="body2">
                      {selectedOrder.supplierEmail}
                    </Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography variant="body2" color="text.secondary">
                      Shipping Address
                    </Typography>
                  </Grid>
                  <Grid item xs={8}>
                    <Typography variant="body2">
                      {selectedOrder.shippingAddress.street}, {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.zipCode}, {selectedOrder.shippingAddress.country}
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
              
              {/* Order Items */}
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Order Items
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Product</TableCell>
                        <TableCell>SKU</TableCell>
                        <TableCell align="right">Cost</TableCell>
                        <TableCell align="right">Quantity</TableCell>
                        <TableCell align="right">Received</TableCell>
                        <TableCell align="right">Discount</TableCell>
                        <TableCell align="right">Tax</TableCell>
                        <TableCell align="right">Total</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedOrder.items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.name}</TableCell>
                          <TableCell>{item.sku}</TableCell>
                          <TableCell align="right">{formatCurrency(item.cost)}</TableCell>
                          <TableCell align="right">{item.quantity}</TableCell>
                          <TableCell align="right">
                            {item.receivedQuantity} / {item.quantity}
                          </TableCell>
                          <TableCell align="right">{formatCurrency(item.discount)}</TableCell>
                          <TableCell align="right">{formatCurrency(item.tax)}</TableCell>
                          <TableCell align="right">{formatCurrency(item.total)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
              
              {/* Order Summary */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                  <Grid container spacing={1} sx={{ maxWidth: 300 }}>
                    <Grid item xs={6}>
                      <Typography variant="body2" align="right">
                        Subtotal:
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" align="right">
                        {formatCurrency(selectedOrder.subtotal)}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" align="right">
                        Discount:
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" align="right">
                        -{formatCurrency(selectedOrder.discount)}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" align="right">
                        Tax:
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" align="right">
                        {formatCurrency(selectedOrder.tax)}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" align="right">
                        Shipping:
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" align="right">
                        {formatCurrency(selectedOrder.shippingCost)}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="subtitle1" align="right">
                        <strong>Total:</strong>
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="subtitle1" align="right">
                        <strong>{formatCurrency(selectedOrder.total)}</strong>
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseOrderDialog}>Close</Button>
            {selectedOrder.status === 'Draft' && (
              <Button
                variant="outlined"
                startIcon={<ShippingIcon />}
                color="primary"
                onClick={handleCloseOrderDialog}
              >
                Submit Order
              </Button>
            )}
            {(selectedOrder.status === 'Ordered' || selectedOrder.status === 'Partially Received') && (
              <Button
                variant="outlined"
                startIcon={<InventoryIcon />}
                color="primary"
                onClick={handleCloseOrderDialog}
              >
                Receive Items
              </Button>
            )}
            {(selectedOrder.status === 'Draft' || selectedOrder.status === 'Pending' || selectedOrder.status === 'Ordered') && (
              <Button
                variant="outlined"
                startIcon={<CancelIcon />}
                color="error"
                onClick={handleCloseOrderDialog}
              >
                Cancel Order
              </Button>
            )}
            <Button
              variant="contained"
              startIcon={<PrintIcon />}
              color="primary"
              onClick={handleCloseOrderDialog}
            >
              Print Order
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
};

export default PurchaseOrderList;