import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  TextField,
  TablePagination,
  Box,
  Typography,
  TableSortLabel,
  FormControlLabel,
  Switch,
  Popover,
  Button,
  MenuItem,
  Checkbox,
  Tooltip,
  ThemeProvider,
  createTheme,
  CssBaseline,
  Container,
  styled,
  InputAdornment,
  CircularProgress
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Close as CloseIcon,
  DragIndicator as DragIndicatorIcon,
  Brightness4 as Brightness4Icon,
  Brightness7 as Brightness7Icon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon
} from '@mui/icons-material';
import axios from 'axios';
import PropTypes from 'prop-types';


// Styled components
const StyledTableCell = styled(TableCell)(({ theme, isFixed }) => ({
  backgroundColor: theme.palette.background.paper,
  position: 'relative',
  ...(isFixed && {
    position: 'sticky',
    left: 0,
    zIndex: 2,
    backgroundColor: theme.palette.background.paper,
  })
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[900] : theme.palette.background.paper,
    '& input': {
      color: theme.palette.mode === 'dark' ? theme.palette.common.white : theme.palette.common.black,
    },
    '& fieldset': {
      borderColor: theme.palette.mode === 'dark' ? theme.palette.grey[700] : theme.palette.grey[300],
    },
    '&:hover fieldset': {
      borderColor: theme.palette.mode === 'dark' ? theme.palette.grey[500] : theme.palette.grey[400],
    },
    '&.Mui-focused fieldset': {
      borderColor: theme.palette.primary.main,
    },
  },
  '& .MuiInputAdornment-root': {
    color: theme.palette.mode === 'dark' ? theme.palette.grey[400] : theme.palette.grey[700],
  }
}));

const Root = styled('div')(({ theme }) => ({
  minHeight: '100vh',
  width: '100vw',
  margin: 0,
  padding: 0,
  backgroundColor: theme.palette.mode === 'dark' ? '#121212' : '#f5f5f5',
  overflowX: 'hidden',
  position: 'relative',
  left: 0,
  right: 0,
  '& .MuiContainer-root': {
    maxWidth: 'none',
    width: '100%',
    padding: 0
  }
}));

const MainContainer = styled(Container)(({ theme }) => ({
  padding: theme.spacing(2),
  margin: 0,
  maxWidth: 'none !important',
  width: '100vw',
  boxSizing: 'border-box',
  position: 'relative',
  left: 0
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1e1e1e' : theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.palette.mode === 'dark'
    ? '0 0 20px rgba(255,255,255,0.1)'
    : '0 0 20px rgba(0,0,0,0.1)',
  overflow: 'hidden',
  margin: '0 auto',
  width: '100%',
  maxWidth: 'none'
}));

const TableContainer = styled('div')(({ theme }) => ({
  position: 'relative',
  overflow: 'auto',
  width: '100%',
  backgroundColor: theme.palette.mode === 'dark' ? '#1e1e1e' : theme.palette.background.paper,
  '& .MuiTableCell-root': {
    backgroundColor: theme.palette.mode === 'dark' ? '#1e1e1e' : theme.palette.background.paper,
  }
}));

const ResizeHandle = styled('div')(({ theme }) => ({
  position: 'absolute',
  right: -4,
  top: 0,
  bottom: 0,
  width: 8,
  cursor: 'col-resize',
  zIndex: 1,
  '&:hover': {
    '&::after': {
      content: '""',
      position: 'absolute',
      right: 3,
      top: 0,
      bottom: 0,
      width: 2,
      backgroundColor: theme.palette.primary.main,
      opacity: 0.3
    }
  }
}));

const FilterButton = styled(Button, {
  shouldForwardProp: prop => prop !== 'active'
})(({ theme, active }) => ({
  marginLeft: theme.spacing(1),
  backgroundColor: active ? theme.palette.primary.main : theme.palette.background.paper,
  color: active ? theme.palette.primary.contrastText : theme.palette.text.primary,
  borderColor: theme.palette.divider,
  '&:hover': {
    backgroundColor: active ? theme.palette.primary.dark : theme.palette.action.hover,
  }
}));

const ActionButtonsContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  gap: theme.spacing(1),
  '& .MuiIconButton-root': {
    color: theme.palette.mode === 'dark' ? theme.palette.common.white : theme.palette.text.primary,
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
  },
}));

const FilterPopover = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  minWidth: 300,
  maxWidth: 400
}));

const ColumnHeader = styled(TableCell)(({ theme, isDragging }) => ({
  fontWeight: 'bold',
  backgroundColor: theme.palette.background.paper,
  position: 'relative',
  ...(isDragging && {
    opacity: 0.5,
    cursor: 'move'
  })
}));

const DragHandleIcon = styled(DragIndicatorIcon)(({ theme }) => ({
  cursor: 'move',
  opacity: 0.3,
  marginRight: theme.spacing(1),
  '&:hover': {
    opacity: 0.7
  }
}));

const SortLabel = styled(TableSortLabel)(({ theme }) => ({
  '& .MuiTableSortLabel-icon': {
    opacity: 0.5
  }
}));

const EmptyRow = styled(TableRow)(({ theme }) => ({
  height: 53,
  '& td': {
    borderBottom: 'none'
  }
}));

const TagChip = styled('span')(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.grey[200],
  padding: '2px 8px',
  borderRadius: '12px',
  marginRight: '4px',
  fontSize: '0.85rem',
  color: theme.palette.text.primary
}));

const FilterField = styled(TextField)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  '& .MuiOutlinedInput-root': {
    backgroundColor: theme.palette.background.paper
  }
}));

const LoadingOverlay = styled('div')(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.1)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1,
  '& .MuiCircularProgress-root': {
    color: theme.palette.primary.main
  }
}));

const ErrorMessage = styled(Typography)(({ theme }) => ({
  color: theme.palette.error.main,
  fontSize: '0.75rem',
  marginTop: theme.spacing(0.5),
}));

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ContactTable error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box p={3} textAlign="center">
          <Typography color="error">
            Something went wrong. Please refresh the page.
          </Typography>
        </Box>
      );
    }

    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired
};

// Move these before the ContactTable component definition
const ActionButtons = React.memo(({ onEdit, onDelete, contact }) => {
  const handleEdit = React.useCallback(() => {
    onEdit(contact);
  }, [onEdit, contact]);

  const handleDelete = React.useCallback(() => {
    onDelete(contact._id);
  }, [onDelete, contact._id]);

  return (
    <ActionButtonsContainer>
      <IconButton size="small" onClick={handleEdit}>
        <EditIcon />
      </IconButton>
      <IconButton size="small" onClick={handleDelete}>
        <DeleteIcon />
      </IconButton>
    </ActionButtonsContainer>
  );
}, (prevProps, nextProps) => {
  return prevProps.contact._id === nextProps.contact._id;
});

const TableHeaderCell = ({ 
  column, 
  orderBy,
  order,
  onRequestSort,
  onStartResize,
  ...props 
}) => (
  <ColumnHeader
    {...props}
  >
    <Box display="flex" alignItems="center" width="100%">
      {!column.fixed && <DragHandleIcon />}
      {column.sortable ? (
        <SortLabel
          active={orderBy === column.id}
          direction={orderBy === column.id ? order : 'asc'}
          onClick={() => onRequestSort(column.id)}
          hideSortIcon={orderBy !== column.id}
          sx={{
            '& .MuiTableSortLabel-icon': {
              opacity: orderBy === column.id ? 1 : 0
            }
          }}
        >
          {column.label}
        </SortLabel>
      ) : (
        column.label
      )}
    </Box>
    {!column.fixed && (
      <ResizeHandle
        onMouseDown={(e) => onStartResize(e, column.id)}
        onClick={(e) => e.stopPropagation()}
      />
    )}
  </ColumnHeader>
);

TableHeaderCell.propTypes = {
  column: PropTypes.shape({
    id: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    sortable: PropTypes.bool,
    fixed: PropTypes.bool
  }).isRequired,
  orderBy: PropTypes.string.isRequired,
  order: PropTypes.oneOf(['asc', 'desc']).isRequired,
  onRequestSort: PropTypes.func.isRequired,
  onStartResize: PropTypes.func.isRequired,
  isDragging: PropTypes.bool,
  style: PropTypes.object,
  'data-column': PropTypes.string,
  draggable: PropTypes.bool,
  onDragStart: PropTypes.func,
  onDragOver: PropTypes.func,
  onDragEnd: PropTypes.func
};

const ContactTable = ({ onEdit, refreshTrigger }) => {
  // Define minimum widths based on content
  const minColumnWidths = {
    actions: 100,    // Edit + Delete buttons
    firstName: 150,  // "First Name" + sort icon
    lastName: 150,   // "Last Name" + sort icon
    email: 200,      // Typical email length
    phone: 150,      // Phone number + sort icon
    company: 150,    // "Company" + sort icon
    title: 150,      // "Title" + sort icon
    tags: 200        // Room for multiple tags
  };

  // Initialize darkMode from localStorage with default to true
  const [darkMode, setDarkMode] = useState(() => {
    try {
      const saved = localStorage.getItem('contactTable_darkMode');
      return saved !== null ? JSON.parse(saved) : true;
    } catch (e) {
      console.error('Error loading dark mode state:', e);
      return true;
    }
  });

  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: '#1976d2',
      },
      background: {
        default: darkMode ? '#121212' : '#f5f5f5',
        paper: darkMode ? '#1e1e1e' : '#ffffff',
      },
      text: {
        primary: darkMode ? '#ffffff' : '#000000',
        secondary: darkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)',
      }
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: 'background.default',
            margin: 0,
            padding: 0,
          }
        }
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundColor: 'background.paper',
          }
        }
      },
      MuiTableContainer: {
        styleOverrides: {
          root: {
            backgroundColor: 'background.paper',
          }
        }
      }
    }
  });

  // Load initial state from localStorage
  const loadState = (key, defaultValue) => {
    try {
      const saved = localStorage.getItem(`contactTable_${key}`);
      return saved ? JSON.parse(saved) : defaultValue;
    } catch (e) {
      console.error('Error loading state:', e);
      return defaultValue;
    }
  };

  // Save state to localStorage
  const saveState = useCallback((key, value) => {
    try {
      localStorage.setItem(`contactTable_${key}`, JSON.stringify(value));
    } catch (e) {
      console.error('Error saving state:', e);
    }
  }, []);

  // Add filters and useRegex state declarations here, before they're used
  const [filters, setFilters] = useState(loadState('filters', {
    email: '',
    company: [],
    title: [],
    tags: [],
    firstName: '',
    lastName: '',
    phone: '',
    firstNameRegex: false,
    lastNameRegex: false,
    phoneRegex: false
  }));

  const [useRegex, setUseRegex] = useState(loadState('useRegex', false));

  // Save filters and useRegex to localStorage
  useEffect(() => {
    saveState('filters', filters);
    saveState('useRegex', useRegex);
  }, [filters, useRegex, saveState]);

  // Move rowsPerPage state declaration up here
  const [rowsPerPage, setRowsPerPage] = useState(loadState('rowsPerPage', 5));

  
  const tableRef = useRef(null);

  // Other state declarations
  const [contacts, setContacts] = useState([]);
  const [page, setPage] = useState(loadState('page', 0));
  const [search, setSearch] = useState(loadState('search', ''));
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [orderBy, setOrderBy] = useState(loadState('orderBy', 'lastName'));
  const [order, setOrder] = useState(loadState('order', 'asc'));
  const [anchorEl, setAnchorEl] = useState(null);
  const [filterError, setFilterError] = useState('');
  const [companies, setCompanies] = useState([]);
  const [columnWidths, setColumnWidths] = useState(loadState('columnWidths', {
    actions: Math.max(100, minColumnWidths.actions),
    firstName: Math.max(150, minColumnWidths.firstName),
    lastName: Math.max(150, minColumnWidths.lastName),
    email: Math.max(200, minColumnWidths.email),
    phone: Math.max(150, minColumnWidths.phone),
    company: Math.max(150, minColumnWidths.company),
    title: Math.max(150, minColumnWidths.title),
    tags: Math.max(200, minColumnWidths.tags)
  }));

  // Update localStorage when state changes
  useEffect(() => {
    saveState('page', page);
    saveState('rowsPerPage', rowsPerPage);
    saveState('search', search);
    saveState('orderBy', orderBy);
    saveState('order', order);
    saveState('columnWidths', columnWidths);
  }, [page, rowsPerPage, search, orderBy, order, columnWidths, saveState]);

  // Apply column widths to DOM elements
  useEffect(() => {
    const table = tableRef.current;
    if (table) {
      Object.entries(columnWidths).forEach(([columnId, width]) => {
        const cells = table.querySelectorAll(`td[data-column="${columnId}"], th[data-column="${columnId}"]`);
        cells.forEach(cell => {
          cell.style.width = `${width}px`;
          cell.style.minWidth = `${width}px`;
        });
      });
    }
  }, [columnWidths, contacts]); // Re-apply when contacts change (after sort)

  // Add missing column definitions
  const columns = [
    { id: 'actions', label: 'Actions', sortable: false, fixed: true },
    { id: 'firstName', label: 'First Name', sortable: true },
    { id: 'lastName', label: 'Last Name', sortable: true },
    { id: 'email', label: 'Email', sortable: true },
    { id: 'phone', label: 'Phone', sortable: true },
    { id: 'company', label: 'Company', sortable: true },
    { id: 'title', label: 'Title', sortable: true },
    { id: 'tags', label: 'Tags', sortable: false }
  ];

  // Add column order state
  const [columnOrder, setColumnOrder] = useState(loadState('columnOrder', 
    columns.map(col => col.id)
  ));

  // Add drag state
  const [draggedColumn, setDraggedColumn] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);

  // Save column order to localStorage
  useEffect(() => {
    saveState('columnOrder', columnOrder);
  }, [columnOrder, saveState]);

  const handleDragStart = (e, columnId) => {
    if (columnId === 'actions') return; // Prevent dragging the actions column
    setDraggedColumn(columnId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, columnId) => {
    e.preventDefault();
    if (columnId === 'actions' || columnId === draggedColumn) return;
    setDragOverColumn(columnId);
  };

  const handleDragEnd = () => {
    if (!draggedColumn || !dragOverColumn || draggedColumn === dragOverColumn) {
      setDraggedColumn(null);
      setDragOverColumn(null);
      return;
    }

    const newOrder = [...columnOrder];
    const draggedIdx = newOrder.indexOf(draggedColumn);
    const dropIdx = newOrder.indexOf(dragOverColumn);

    newOrder.splice(draggedIdx, 1);
    newOrder.splice(dropIdx, 0, draggedColumn);

    setColumnOrder(newOrder);
    setDraggedColumn(null);
    setDragOverColumn(null);
  };

  // Update columns to use the order
  const orderedColumns = columnOrder.map(id => 
    columns.find(col => col.id === id)
  );

  // Update filter handlers
  const handleFilterClick = (event) => {
    setAnchorEl(event.currentTarget);
    setPendingFilters(filters);
  };

  const handleFilterClose = () => {
    setAnchorEl(null);
    setPendingFilters(filters);
  };

  const handleApplyFilter = () => {
    setFilters(pendingFilters);
    saveState('filters', pendingFilters);
    setPage(0);
    handleFilterClose();
  };

  const handleClearFilter = () => {
    const clearedFilters = {
      email: '',
      company: [],
      title: [],
      tags: [],
      firstName: '',
      lastName: '',
      phone: '',
      firstNameRegex: false,
      lastNameRegex: false,
      phoneRegex: false
    };
    setFilters(clearedFilters);
    setPendingFilters(clearedFilters);
    setUseRegex(false);
    setPage(0);
    handleFilterClose();
  };

  // Update the filter button text and active state check
  const hasActiveFilters = Object.entries(filters).some(([key, value]) => {
    if (Array.isArray(value)) {
      return value.length > 0;
    }
    if (typeof value === 'boolean') {
      return false; // Don't count regex switches as active filters
    }
    return Boolean(value);
  });

  // Create filter summary for tooltip
  const getFilterSummary = useMemo(() => {
    if (!hasActiveFilters) return 'No active filters';
    
    const parts = [];
    
    if (filters.firstName) {
      parts.push(`First name: "${filters.firstName}"${filters.firstNameRegex ? ' (regex)' : ''}`);
    }
    if (filters.lastName) {
      parts.push(`Last name: "${filters.lastName}"${filters.lastNameRegex ? ' (regex)' : ''}`);
    }
    if (filters.phone) {
      parts.push(`Phone: "${filters.phone}"${filters.phoneRegex ? ' (regex)' : ''}`);
    }
    if (filters.email) {
      parts.push(`Email: "${filters.email}"${useRegex ? ' (regex)' : ''}`);
    }
    if (filters.company.length) {
      parts.push(`Companies: ${filters.company.join(', ')}`);
    }
    if (filters.title.length) {
      parts.push(`Titles: ${filters.title.join(', ')}`);
    }
    if (filters.tags.length) {
      parts.push(`Tags: ${filters.tags.join(', ')}`);
    }

    return parts.join('\n');
  }, [filters, useRegex, hasActiveFilters]);

  // Add missing handleSearchClear function
  const handleSearchClear = useCallback(() => {
    setPendingSearch('');
    setSearch('');
    setPage(0);
  }, []);

  // Add missing handleRequestSort function
  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
    setPage(0);
  };

  // Add missing startResize function
  const startResize = (e, columnId) => {
    e.preventDefault();
    e.stopPropagation();
    
    const startX = e.pageX;
    const startWidth = columnWidths[columnId];
    const minWidth = minColumnWidths[columnId];

    const handleMouseMove = (e) => {
      const width = Math.max(minWidth, startWidth + (e.pageX - startX));
      setColumnWidths(prev => ({
        ...prev,
        [columnId]: width
      }));
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const [pendingSearch, setPendingSearch] = useState(search);

  // Update search handlers
  const handleSearchChange = (e) => {
    const newValue = e.target.value;
    setPendingSearch(newValue);
    setSearch(newValue);
    setPage(0);
  };

  // Add email filter clear handler
  const handleEmailFilterClear = () => {
    setPendingFilters(prev => ({ ...prev, email: '' }));
  };

  // Update company filter handler
  const handleCompanyChange = (event) => {
    setPendingFilters(prev => ({
      ...prev,
      company: event.target.value
    }));
  };

  // Add state for unique titles and tags
  const [titles, setTitles] = useState([]);
  const [allTags, setAllTags] = useState([]);

  // Fetch unique titles and tags
  const fetchUniqueValues = useCallback(async () => {
    try {
      const response = await axios.get(`http://localhost:5001/api/contacts`, {
        params: {
          limit: 100000
        }
      });
      const uniqueTitles = [...new Set(response.data.contacts.map(contact => contact.title))].sort();
      const uniqueTags = [...new Set(response.data.contacts.flatMap(contact => contact.tags || []))].sort();
      setTitles(uniqueTitles);
      setAllTags(uniqueTags);
    } catch (error) {
      console.error('Error fetching unique values:', error);
    }
  }, []);

  // Fetch unique values when component mounts
  useEffect(() => {
    fetchUniqueValues();
  }, [fetchUniqueValues]);

  // Add handlers for new filters
  const handleTitleChange = (event) => {
    setPendingFilters(prev => ({
      ...prev,
      title: event.target.value
    }));
  };

  const handleTagsChange = (event) => {
    setPendingFilters(prev => ({
      ...prev,
      tags: event.target.value
    }));
  };

  // Add missing fetchContacts implementation
  const fetchContacts = useCallback(async () => {
    setLoading(true);
    setFilterError('');
    try {
      const response = await axios.get(`http://localhost:5001/api/contacts`, {
        params: {
          search,
          emailFilter: filters.email,
          emailRegex: useRegex,
          companyFilter: filters.company,
          titleFilter: filters.title,
          tagsFilter: filters.tags,
          firstName: filters.firstName,
          lastName: filters.lastName,
          phone: filters.phone,
          firstNameRegex: filters.firstNameRegex,
          lastNameRegex: filters.lastNameRegex,
          phoneRegex: filters.phoneRegex,
          page: page + 1,
          limit: rowsPerPage,
          sort: `${orderBy}:${order}`
        }
      });

      const newContacts = response.data.contacts;
      const newTotalCount = response.data.totalCount;

      setContacts(newContacts);
      setTotalCount(newTotalCount);
      setLoading(false);
    } catch (error) {
      if (error.response?.data?.message === 'Invalid regex pattern') {
        setFilterError(error.response.data.details);
      }
      setContacts([]);
      setTotalCount(0);
      setLoading(false);
      console.error('Error fetching contacts:', error);
    }
  }, [search, filters, useRegex, page, rowsPerPage, orderBy, order]);

  // Add missing useEffect for fetching contacts
  useEffect(() => {
    fetchContacts();
  }, [fetchContacts, refreshTrigger]);

  // Add handleDelete implementation
  const handleDelete = useCallback(async (id) => {
    try {
      await axios.delete(`http://localhost:5001/api/contacts/${id}`);
      fetchContacts();
    } catch (error) {
      console.error('Error deleting contact:', error);
    }
  }, [fetchContacts]);

  // Add fetchUniqueCompanies implementation
  const fetchUniqueCompanies = useCallback(async () => {
    try {
      const response = await axios.get(`http://localhost:5001/api/contacts`, {
        params: { limit: 100000 }
      });
      const uniqueCompanies = [...new Set(response.data.contacts
        .map(contact => contact.company)
        .filter(Boolean))]
        .sort();
      setCompanies(uniqueCompanies);
    } catch (error) {
      console.error('Error fetching companies:', error);
    }
  }, []);

  // Add useEffect to fetch companies
  useEffect(() => {
    fetchUniqueCompanies();
  }, [fetchUniqueCompanies]);

  // Add this near the top with other state declarations
  const [pendingFilters, setPendingFilters] = useState({
    email: '',
    company: [],
    title: [],
    tags: [],
    firstName: '',
    lastName: '',
    phone: '',
    firstNameRegex: false,
    lastNameRegex: false,
    phoneRegex: false
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Root>
        <MainContainer>
          <StyledPaper>
            <Box 
              p={2} 
              sx={{ 
                bgcolor: 'background.default',
                color: 'text.primary'
              }}
            >
              <Box 
                display="flex" 
                justifyContent="space-between" 
                alignItems="center" 
                mb={2}
                sx={{ 
                  bgcolor: 'background.default',
                  color: 'text.primary'
                }}
              >
                <Typography 
                  variant="h6" 
                  sx={{ 
                    color: 'text.primary',
                    fontWeight: 500
                  }}
                >
                  Contacts
                </Typography>
                <IconButton 
                  onClick={() => setDarkMode(!darkMode)} 
                  sx={{ color: 'text.primary' }}
                >
                  {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
                </IconButton>
              </Box>
              <Box 
                display="flex" 
                alignItems="center" 
                style={{ 
                  backgroundColor: darkMode ? '#121212' : '#ffffff',
                  padding: '8px',
                  borderRadius: '4px'
                }}
              >
                <div style={{ flex: 1, marginRight: theme.spacing(1) }}>
                  <StyledTextField
                    variant="outlined"
                    placeholder="Search contacts..."
                    value={search}
                    onChange={handleSearchChange}
                    fullWidth
                    size="small"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon />
                        </InputAdornment>
                      ),
                      endAdornment: pendingSearch && (
                        <InputAdornment position="end">
                          <IconButton
                            size="small"
                            onClick={handleSearchClear}
                          >
                            <CloseIcon />
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </div>
                <Tooltip 
                  title={getFilterSummary}
                  placement="bottom"
                  enterDelay={500}
                >
                  <FilterButton
                    active={hasActiveFilters}
                    variant={hasActiveFilters ? "contained" : "outlined"}
                    startIcon={<FilterListIcon />}
                    onClick={handleFilterClick}
                  >
                    {hasActiveFilters ? 'Filters Active' : 'Filter'}
                  </FilterButton>
                </Tooltip>
              </Box>

              <Popover
                open={Boolean(anchorEl)}
                anchorEl={anchorEl}
                onClose={handleFilterClose}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
              >
                <FilterPopover>
                  <Typography variant="subtitle1" gutterBottom>
                    Filters
                  </Typography>
                  
                  {/* Name Filters */}
                  <Box mb={3}>
                    <Typography variant="subtitle2" gutterBottom>
                      Name Filters
                    </Typography>
                    <FilterField
                      fullWidth
                      variant="outlined"
                      size="small"
                      label="First Name"
                      value={pendingFilters.firstName}
                      onChange={(e) => setPendingFilters(prev => ({ ...prev, firstName: e.target.value }))}
                      InputProps={{
                        endAdornment: pendingFilters.firstName && (
                          <IconButton
                            size="small"
                            onClick={() => setPendingFilters(prev => ({ ...prev, firstName: '' }))}
                            edge="end"
                          >
                            <CloseIcon />
                          </IconButton>
                        )
                      }}
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={pendingFilters.firstNameRegex}
                          onChange={(e) => setPendingFilters(prev => ({ ...prev, firstNameRegex: e.target.checked }))}
                          color="primary"
                          size="small"
                        />
                      }
                      label="Use Regex"
                    />
                    <FilterField
                      fullWidth
                      variant="outlined"
                      size="small"
                      label="Last Name"
                      value={pendingFilters.lastName}
                      onChange={(e) => setPendingFilters(prev => ({ ...prev, lastName: e.target.value }))}
                      InputProps={{
                        endAdornment: pendingFilters.lastName && (
                          <IconButton
                            size="small"
                            onClick={() => setPendingFilters(prev => ({ ...prev, lastName: '' }))}
                            edge="end"
                          >
                            <CloseIcon />
                          </IconButton>
                        )
                      }}
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={pendingFilters.lastNameRegex}
                          onChange={(e) => setPendingFilters(prev => ({ ...prev, lastNameRegex: e.target.checked }))}
                          color="primary"
                          size="small"
                        />
                      }
                      label="Use Regex"
                    />
                  </Box>

                  {/* Phone Filter */}
                  <Box mb={3}>
                    <Typography variant="subtitle2" gutterBottom>
                      Phone Filter
                    </Typography>
                    <FilterField
                      fullWidth
                      variant="outlined"
                      size="small"
                      label="Phone"
                      value={pendingFilters.phone}
                      onChange={(e) => setPendingFilters(prev => ({ ...prev, phone: e.target.value }))}
                      InputProps={{
                        endAdornment: pendingFilters.phone && (
                          <IconButton
                            size="small"
                            onClick={() => setPendingFilters(prev => ({ ...prev, phone: '' }))}
                            edge="end"
                          >
                            <CloseIcon />
                          </IconButton>
                        )
                      }}
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={pendingFilters.phoneRegex}
                          onChange={(e) => setPendingFilters(prev => ({ ...prev, phoneRegex: e.target.checked }))}
                          color="primary"
                          size="small"
                        />
                      }
                      label="Use Regex"
                    />
                  </Box>

                  {/* Email Filter */}
                  <Box mb={3}>
                    <Typography variant="subtitle2" gutterBottom>
                      Email Filter
                    </Typography>
                    <FilterField
                      fullWidth
                      variant="outlined"
                      size="small"
                      value={pendingFilters.email}
                      onChange={(e) => setPendingFilters(prev => ({ ...prev, email: e.target.value }))}
                      error={!!filterError}
                      helperText={
                        filterError ? (
                          <ErrorMessage>{filterError}</ErrorMessage>
                        ) : (
                          useRegex ? 'Using regex pattern' : 'Normal text search'
                        )
                      }
                      InputProps={{
                        endAdornment: pendingFilters.email && (
                          <IconButton
                            size="small"
                            onClick={handleEmailFilterClear}
                            edge="end"
                          >
                            <CloseIcon />
                          </IconButton>
                        )
                      }}
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={useRegex}
                          onChange={(e) => setUseRegex(e.target.checked)}
                          color="primary"
                          size="small"
                        />
                      }
                      label="Use Regex"
                    />
                  </Box>

                  {/* Company Filter */}
                  <Box mb={3}>
                    <Typography variant="subtitle2" gutterBottom>
                      Company
                    </Typography>
                    <TextField
                      select
                      fullWidth
                      variant="outlined"
                      size="small"
                      value={pendingFilters.company || []}
                      onChange={handleCompanyChange}
                      SelectProps={{
                        multiple: true,
                        MenuProps: {
                          anchorOrigin: {
                            vertical: "bottom",
                            horizontal: "left"
                          },
                          transformOrigin: {
                            vertical: "top",
                            horizontal: "left"
                          },
                          renderValue: (selected) => {
                            if (!selected || selected.length === 0) return 'All Companies';
                            if (selected.length === 1) return selected[0];
                            return `${selected.length} companies selected`;
                          }
                        }
                      }}
                    >
                      {companies.map((company) => (
                        <MenuItem key={company} value={company}>
                          <Checkbox 
                            checked={pendingFilters.company?.indexOf(company) > -1}
                            size="small"
                          />
                          <Box component="span" ml={1}>{company}</Box>
                        </MenuItem>
                      ))}
                    </TextField>
                  </Box>

                  {/* Title Filter */}
                  <Box mb={3}>
                    <Typography variant="subtitle2" gutterBottom>
                      Title
                    </Typography>
                    <TextField
                      select
                      fullWidth
                      variant="outlined"
                      size="small"
                      value={pendingFilters.title || []}
                      onChange={handleTitleChange}
                      SelectProps={{
                        multiple: true,
                        MenuProps: {
                          anchorOrigin: {
                            vertical: "bottom",
                            horizontal: "left"
                          },
                          transformOrigin: {
                            vertical: "top",
                            horizontal: "left"
                          },
                          renderValue: (selected) => {
                            if (!selected || selected.length === 0) return 'All Titles';
                            if (selected.length === 1) return selected[0];
                            return `${selected.length} titles selected`;
                          }
                        }
                      }}
                    >
                      {titles.map((title) => (
                        <MenuItem key={title} value={title}>
                          <Checkbox 
                            checked={pendingFilters.title?.indexOf(title) > -1}
                            size="small"
                          />
                          <Box component="span" ml={1}>{title}</Box>
                        </MenuItem>
                      ))}
                    </TextField>
                  </Box>

                  {/* Tags Filter */}
                  <Box mb={3}>
                    <Typography variant="subtitle2" gutterBottom>
                      Tags
                    </Typography>
                    <TextField
                      select
                      fullWidth
                      variant="outlined"
                      size="small"
                      value={pendingFilters.tags || []}
                      onChange={handleTagsChange}
                      SelectProps={{
                        multiple: true,
                        MenuProps: {
                          anchorOrigin: {
                            vertical: "bottom",
                            horizontal: "left"
                          },
                          transformOrigin: {
                            vertical: "top",
                            horizontal: "left"
                          },
                          renderValue: (selected) => {
                            if (!selected || selected.length === 0) return 'All Tags';
                            if (selected.length === 1) return selected[0];
                            return `${selected.length} tags selected`;
                          }
                        }
                      }}
                    >
                      {allTags.map((tag) => (
                        <MenuItem key={tag} value={tag}>
                          <Checkbox 
                            checked={pendingFilters.tags?.indexOf(tag) > -1}
                            size="small"
                          />
                          <Box component="span" ml={1}>{tag}</Box>
                        </MenuItem>
                      ))}
                    </TextField>
                  </Box>

                  <Box display="flex" justifyContent="space-between" mt={2}>
                    <Button 
                      onClick={handleClearFilter}
                      disabled={!hasActiveFilters}
                    >
                      Clear All
                    </Button>
                    <Button 
                      onClick={handleApplyFilter} 
                      color="primary" 
                      variant="contained"
                      disabled={!Object.values(pendingFilters).some(v => 
                        Array.isArray(v) ? v.length > 0 : Boolean(v)
                      )}
                    >
                      Apply Filters
                    </Button>
                  </Box>
                </FilterPopover>
              </Popover>

              <TableContainer>
                {loading && (
                  <LoadingOverlay>
                    <CircularProgress />
                  </LoadingOverlay>
                )}
                <Table ref={tableRef} sx={{ width: '100%' }}>
                  <TableHead>
                    <TableRow>
                      {orderedColumns.map((column) => (
                        <TableHeaderCell
                          key={column.id}
                          column={column}
                          orderBy={orderBy}
                          order={order}
                          onRequestSort={handleRequestSort}
                          onStartResize={startResize}
                          isDragging={dragOverColumn === column.id}
                          style={{
                            ...(column.fixed ? {} : {
                              width: columnWidths[column.id],
                              minWidth: minColumnWidths[column.id]
                            })
                          }}
                          data-column={column.id}
                          draggable={!column.fixed}
                          onDragStart={(e) => handleDragStart(e, column.id)}
                          onDragOver={(e) => handleDragOver(e, column.id)}
                          onDragEnd={handleDragEnd}
                        />
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {contacts.map((contact) => (
                      <TableRow 
                        key={contact._id}
                        sx={{
                          opacity: loading ? 0.5 : 1,
                          transition: 'opacity 0.2s'
                        }}
                      >
                        {orderedColumns.map(column => (
                          <StyledTableCell 
                            key={column.id}
                            isFixed={column.fixed}
                            style={!column.fixed ? {
                              width: columnWidths[column.id],
                              minWidth: minColumnWidths[column.id]
                            } : undefined}
                            data-column={column.id}
                          >
                            {column.id === 'actions' ? (
                              <ActionButtons
                                contact={contact}
                                onEdit={loading ? () => {} : onEdit}
                                onDelete={loading ? () => {} : handleDelete}
                              />
                            ) : column.id === 'tags' ? (
                              contact.tags?.map((tag, index) => (
                                <TagChip key={index}>
                                  {tag}
                                </TagChip>
                              ))
                            ) : (
                              contact[column.id]
                            )}
                          </StyledTableCell>
                        ))}
                      </TableRow>
                    ))}
                    {contacts.length === 0 && (
                      <>
                        {[...Array(rowsPerPage)].map((_, index) => (
                          <EmptyRow key={index}>
                            <TableCell 
                              colSpan={columns.length}
                              style={{ 
                                border: index === 0 ? undefined : 'none',
                                height: '53px',
                                padding: index === 0 ? undefined : 0
                              }}
                            >
                              {index === 0 && (
                                <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                                  <Typography variant="body1" color="textSecondary">
                                    No contacts found
                                  </Typography>
                                </Box>
                              )}
                            </TableCell>
                          </EmptyRow>
                        ))}
                      </>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                component="div"
                count={totalCount}
                page={page}
                onPageChange={(e, newPage) => setPage(newPage)}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={(e) => {
                  setRowsPerPage(parseInt(e.target.value, 10));
                  setPage(0);
                }}
                rowsPerPageOptions={[5, 10, 25, 50]}
              />
            </Box>
          </StyledPaper>
        </MainContainer>
      </Root>
    </ThemeProvider>
  );
};

ContactTable.propTypes = {
  onEdit: PropTypes.func.isRequired,
  refreshTrigger: PropTypes.number,
};

ActionButtons.propTypes = {
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  contact: PropTypes.shape({
    _id: PropTypes.string.isRequired,
  }).isRequired,
};

export default function ContactTableWithErrorBoundary(props) {
  return (
    <ErrorBoundary>
      <ContactTable {...props} />
    </ErrorBoundary>
  );
} 