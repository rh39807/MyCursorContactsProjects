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
  CircularProgress,
  Theme
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Close as CloseIcon,
  DragIndicator as DragIndicatorIcon,
  Brightness4 as Brightness4Icon,
  Brightness7 as Brightness7Icon
} from '@mui/icons-material';
import axios from 'axios';
import {
  Contact,
  ContactTableProps,
  TableHeaderCellProps,
  ActionButtonsProps,
  StyledTableCellProps,
  FilterButtonProps,
  Column,
  Order,
  Filters,
  ColumnWidths
} from '../types';

// Styled components with TypeScript
const StyledTableCell = styled(TableCell)<StyledTableCellProps>(({ theme, isFixed }) => ({
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

// Add these styled components before the utility components
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

const ColumnHeader = styled(TableCell)(({ theme }) => ({
  fontWeight: 'bold',
  backgroundColor: theme.palette.background.paper,
  position: 'relative'
}));

const SortLabel = styled(TableSortLabel)(({ theme }) => ({
  '& .MuiTableSortLabel-icon': {
    opacity: 0.5
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

// Continue with other styled components...

// Utility Components
const ActionButtons: React.FC<ActionButtonsProps> = React.memo(({ onEdit, onDelete, contact }) => {
  const handleEdit = useCallback(() => {
    onEdit(contact);
  }, [onEdit, contact]);

  const handleDelete = useCallback(() => {
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
}, (prevProps, nextProps) => prevProps.contact._id === nextProps.contact._id);

const TableHeaderCell: React.FC<TableHeaderCellProps> = ({
  column,
  orderBy,
  order,
  onRequestSort,
  onStartResize,
  ...props
}) => (
  <ColumnHeader {...props}>
    <Box display="flex" alignItems="center" width="100%">
      {!column.fixed && <DragIndicatorIcon />}
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
        onMouseDown={(e: React.MouseEvent) => onStartResize(e, column.id)}
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      />
    )}
  </ColumnHeader>
);

const ContactTable: React.FC<ContactTableProps> = ({ onEdit, refreshTrigger }) => {
  // Define minimum widths based on content
  const minColumnWidths = {
    actions: 100,
    firstName: 150,
    lastName: 150,
    email: 200,
    phone: 150,
    company: 150,
    title: 150,
    tags: 200
  };

  const [darkMode, setDarkMode] = useState<boolean>(() => {
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
    }
  });

  const tableRef = useRef<HTMLTableElement>(null);

  // State declarations with proper types
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(5);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [orderBy, setOrderBy] = useState<string>('lastName');
  const [order, setOrder] = useState<Order>('asc');
  const [search, setSearch] = useState<string>('');
  const [pendingSearch, setPendingSearch] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [filterError, setFilterError] = useState<string>('');
  const [companies, setCompanies] = useState<string[]>([]);
  const [titles, setTitles] = useState<string[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [columnWidths, setColumnWidths] = useState<ColumnWidths>(() => ({
    actions: Math.max(100, minColumnWidths.actions),
    firstName: Math.max(150, minColumnWidths.firstName),
    lastName: Math.max(150, minColumnWidths.lastName),
    email: Math.max(200, minColumnWidths.email),
    phone: Math.max(150, minColumnWidths.phone),
    company: Math.max(150, minColumnWidths.company),
    title: Math.max(150, minColumnWidths.title),
    tags: Math.max(200, minColumnWidths.tags)
  }));

  // Add filters state
  const [filters, setFilters] = useState<Filters>({
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

  const [pendingFilters, setPendingFilters] = useState<Filters>({
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

  // Column ordering state
  const [columnOrder, setColumnOrder] = useState<string[]>(() => [
    'actions',
    'firstName',
    'lastName',
    'email',
    'phone',
    'company',
    'title',
    'tags'
  ]);

  const [draggedColumn, setDraggedColumn] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

  // Utility functions
  const loadState = useCallback(<T,>(key: string, defaultValue: T): T => {
    try {
      const saved = localStorage.getItem(`contactTable_${key}`);
      return saved ? JSON.parse(saved) : defaultValue;
    } catch (e) {
      console.error('Error loading state:', e);
      return defaultValue;
    }
  }, []);

  const saveState = useCallback((key: string, value: any): void => {
    try {
      localStorage.setItem(`contactTable_${key}`, JSON.stringify(value));
    } catch (e) {
      console.error('Error saving state:', e);
    }
  }, []);

  // Handlers
  const handleRequestSort = (property: string): void => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
    setPage(0);
  };

  const handleDragStart = (e: React.DragEvent, columnId: string): void => {
    if (columnId === 'actions') return;
    setDraggedColumn(columnId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, columnId: string): void => {
    e.preventDefault();
    if (columnId === 'actions' || columnId === draggedColumn) return;
    setDragOverColumn(columnId);
  };

  const handleDragEnd = (): void => {
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

  // Data fetching
  const fetchContacts = useCallback(async (): Promise<void> => {
    setLoading(true);
    setFilterError('');
    try {
      const response = await axios.get(`http://localhost:5001/api/contacts`, {
        params: {
          search,
          emailFilter: filters.email,
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

      setContacts(response.data.contacts);
      setTotalCount(response.data.totalCount);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data?.message === 'Invalid regex pattern') {
        setFilterError(error.response.data.details);
      }
      setContacts([]);
      setTotalCount(0);
      console.error('Error fetching contacts:', error);
    } finally {
      setLoading(false);
    }
  }, [search, filters, page, rowsPerPage, orderBy, order]);

  // Effects
  useEffect(() => {
    fetchContacts();
  }, [fetchContacts, refreshTrigger]);

  useEffect(() => {
    saveState('columnOrder', columnOrder);
  }, [columnOrder, saveState]);

  // Filter handlers
  const handleFilterClick = (event: React.MouseEvent<HTMLButtonElement>): void => {
    setAnchorEl(event.currentTarget);
    setPendingFilters(filters);
  };

  const handleFilterClose = (): void => {
    setAnchorEl(null);
    setPendingFilters(filters);
  };

  const handleApplyFilter = (): void => {
    setFilters(pendingFilters);
    saveState('filters', pendingFilters);
    setPage(0);
    handleFilterClose();
  };

  const handleClearFilter = (): void => {
    const clearedFilters: Filters = {
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
    setPage(0);
    handleFilterClose();
  };

  // Search handlers
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const newValue = e.target.value;
    setPendingSearch(newValue);
    setSearch(newValue);
    setPage(0);
  };

  const handleSearchClear = (): void => {
    setPendingSearch('');
    setSearch('');
    setPage(0);
  };

  // Filter status check
  const hasActiveFilters = useMemo(() => {
    return Object.entries(filters).some(([key, value]) => {
      if (Array.isArray(value)) {
        return value.length > 0;
      }
      if (typeof value === 'boolean') {
        return false; // Don't count regex switches as active filters
      }
      return Boolean(value);
    });
  }, [filters]);

  // Filter summary for tooltip
  const getFilterSummary = useMemo(() => {
    if (!hasActiveFilters) return 'No active filters';
    
    const parts: string[] = [];
    
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
      parts.push(`Email: "${filters.email}"`);
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
  }, [filters, hasActiveFilters]);

  // First, add the columns definition at the top of the component
  const columns: Column[] = [
    { id: 'actions', label: 'Actions', sortable: false, fixed: true },
    { id: 'firstName', label: 'First Name', sortable: true },
    { id: 'lastName', label: 'Last Name', sortable: true },
    { id: 'email', label: 'Email', sortable: true },
    { id: 'phone', label: 'Phone', sortable: true },
    { id: 'company', label: 'Company', sortable: true },
    { id: 'title', label: 'Title', sortable: true },
    { id: 'tags', label: 'Tags', sortable: false }
  ];

  // Add the startResize handler
  const startResize = (e: React.MouseEvent, columnId: string): void => {
    e.preventDefault();
    e.stopPropagation();
    
    const startX = e.pageX;
    const startWidth = columnWidths[columnId];
    const minWidth = minColumnWidths[columnId];

    const handleMouseMove = (e: MouseEvent) => {
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

  // Add missing styled components
  const TagChip = styled('span')(({ theme }) => ({
    backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.grey[200],
    padding: '2px 8px',
    borderRadius: '12px',
    marginRight: '4px',
    fontSize: '0.85rem',
    color: theme.palette.text.primary
  }));

  const EmptyRow = styled(TableRow)(({ theme }) => ({
    height: 53,
    '& td': {
      borderBottom: 'none'
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

  // Add missing handlers
  const handleDelete = useCallback(async (id: string): Promise<void> => {
    try {
      await axios.delete(`http://localhost:5001/api/contacts/${id}`);
      fetchContacts();
    } catch (error) {
      console.error('Error deleting contact:', error);
    }
  }, [fetchContacts]);

  // Add filter change handlers
  const handleCompanyChange = (event: React.ChangeEvent<{ value: unknown }>): void => {
    setPendingFilters(prev => ({
      ...prev,
      company: event.target.value as string[]
    }));
  };

  const handleTitleChange = (event: React.ChangeEvent<{ value: unknown }>): void => {
    setPendingFilters(prev => ({
      ...prev,
      title: event.target.value as string[]
    }));
  };

  const handleTagsChange = (event: React.ChangeEvent<{ value: unknown }>): void => {
    setPendingFilters(prev => ({
      ...prev,
      tags: event.target.value as string[]
    }));
  };

  // Start of render method
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
              {/* Header with title and dark mode toggle */}
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

              {/* Search and Filter Bar */}
              <Box 
                display="flex" 
                alignItems="center" 
                style={{ 
                  backgroundColor: darkMode ? '#121212' : '#ffffff',
                  padding: '8px',
                  borderRadius: '4px'
                }}
              >
                <Box flex={1} mr={1}>
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
                </Box>
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

              {/* Table Container */}
              <TableContainer>
                {loading && (
                  <LoadingOverlay>
                    <CircularProgress />
                  </LoadingOverlay>
                )}
                <Table ref={tableRef} sx={{ width: '100%' }}>
                  <TableHead>
                    <TableRow>
                      {columnOrder.map((columnId) => {
                        const column = columns.find(col => col.id === columnId);
                        if (!column) return null;
                        return (
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
                        );
                      })}
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
                        {columnOrder.map(columnId => (
                          <StyledTableCell 
                            key={columnId}
                            isFixed={columnId === 'actions'}
                            style={columnId !== 'actions' ? {
                              width: columnWidths[columnId],
                              minWidth: minColumnWidths[columnId]
                            } : undefined}
                            data-column={columnId}
                          >
                            {columnId === 'actions' ? (
                              <ActionButtons
                                contact={contact}
                                onEdit={loading ? () => {} : onEdit}
                                onDelete={loading ? () => {} : handleDelete}
                              />
                            ) : columnId === 'tags' ? (
                              contact.tags?.map((tag, index) => (
                                <TagChip key={index}>
                                  {tag}
                                </TagChip>
                              ))
                            ) : (
                              contact[columnId as keyof Contact]
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
                                  <Typography 
                                    variant="body1" 
                                    data-testid="no-contacts-message"
                                  >
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

              {/* Add Pagination */}
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

              {/* Add Filter Popover */}
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
                      value={pendingFilters.company}
                      onChange={handleCompanyChange}
                      SelectProps={{
                        multiple: true,
                        renderValue: (selected) => {
                          const selectedArray = selected as string[];
                          if (!selectedArray.length) return 'All Companies';
                          if (selectedArray.length === 1) return selectedArray[0];
                          return `${selectedArray.length} companies selected`;
                        }
                      }}
                    >
                      {companies.map((company) => (
                        <MenuItem key={company} value={company}>
                          <Checkbox checked={pendingFilters.company.indexOf(company) > -1} size="small" />
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
                      value={pendingFilters.title}
                      onChange={handleTitleChange}
                      SelectProps={{
                        multiple: true,
                        renderValue: (selected) => {
                          const selectedArray = selected as string[];
                          if (!selectedArray.length) return 'All Titles';
                          if (selectedArray.length === 1) return selectedArray[0];
                          return `${selectedArray.length} titles selected`;
                        }
                      }}
                    >
                      {titles.map((title) => (
                        <MenuItem key={title} value={title}>
                          <Checkbox checked={pendingFilters.title.indexOf(title) > -1} size="small" />
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
                      value={pendingFilters.tags}
                      onChange={handleTagsChange}
                      SelectProps={{
                        multiple: true,
                        renderValue: (selected) => {
                          const selectedArray = selected as string[];
                          if (!selectedArray.length) return 'All Tags';
                          if (selectedArray.length === 1) return selectedArray[0];
                          return `${selectedArray.length} tags selected`;
                        }
                      }}
                    >
                      {allTags.map((tag) => (
                        <MenuItem key={tag} value={tag}>
                          <Checkbox checked={pendingFilters.tags.indexOf(tag) > -1} size="small" />
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
            </Box>
          </StyledPaper>
        </MainContainer>
      </Root>
    </ThemeProvider>
  );
}; 