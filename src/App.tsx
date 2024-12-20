import React, { useState } from 'react';
import { Box, Fab, Button } from '@mui/material';
import { Add } from '@mui/icons-material';
import ContactTable from './components/ContactTable';
import ContactForm from './components/ContactForm';
import { Contact } from './types';

const App: React.FC = () => {
  const [formOpen, setFormOpen] = useState<boolean>(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [refreshKey, setRefreshKey] = useState<number>(0);

  const handleFormClose = (): void => {
    setFormOpen(false);
    setSelectedContact(null);
  };

  const handleFormSave = (): void => {
    setRefreshKey(prev => prev + 1);
  };

  const handleEdit = (contact: Contact): void => {
    setSelectedContact(contact);
    setFormOpen(true);
  };

  const handleAdd = (): void => {
    setSelectedContact(null);
    setFormOpen(true);
  };

  return (
    <Box 
      sx={{ 
        width: '100%',
        minWidth: '100%',
        margin: 0,
        padding: '32px 16px',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        '& > *': {
          width: '100%'
        }
      }}
    >
      <Box mb={4}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Add />}
          onClick={handleAdd}
        >
          Add New Contact
        </Button>
      </Box>
      
      <Box sx={{ width: '100%' }}>
        <ContactTable onEdit={handleEdit} refreshTrigger={refreshKey} />
      </Box>
      
      <Fab 
        color="primary" 
        onClick={handleAdd}
        aria-label="add contact"
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16
        }}
      >
        <Add />
      </Fab>

      <ContactForm 
        open={formOpen}
        onClose={handleFormClose}
        onSave={handleFormSave}
        contact={selectedContact}
      />
    </Box>
  );
};

export default App; 