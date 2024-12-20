import React, { useState, useEffect } from 'react';
import {
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  CircularProgress,
  Snackbar,
  IconButton,
  Collapse,
  Box,
  Typography,
  Paper
} from  '@mui/material';
import { Close } from '@mui/icons-material';
import axios from 'axios';

const ContactForm = ({ open, onClose, onSave, contact = null }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    company: '',
    title: '',
    notes: '',
    tags: []
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [errorDetailsOpen, setErrorDetailsOpen] = useState(false);

  useEffect(() => {
    if (contact) {
      setFormData(contact);
    } else {
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        company: '',
        title: '',
        notes: '',
        tags: []
      });
    }
    setError(null);
    setErrorDetailsOpen(false);
  }, [contact, open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      if (contact) {
        await axios.put(`http://localhost:5001/api/contacts/${contact._id}`, formData);
      } else {
        await axios.post('http://localhost:5001/api/contacts', formData);
      }
      onSave && onSave();
      onClose(true);
    } catch (error) {
      const userMessage = error.response?.data?.message || 'An error occurred while saving the contact';
      const technicalMessage = error.response?.data?.details || error.message;
      setError({ userMessage, technicalMessage });
    } finally {
      setSaving(false);
    }
  };

  const handleCloseError = () => {
    setError(null);
    setErrorDetailsOpen(false);
  };

  return (
    <>
      <Dialog open={open} onClose={() => !saving && onClose(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {contact ? 'Edit Contact' : 'Add Contact'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  required
                  multiline
                  rows={2}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Company"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  multiline
                  rows={3}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Tags (comma-separated)"
                  value={formData.tags.join(', ')}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag)
                  })}
                  helperText="Enter tags separated by commas"
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => onClose(false)} disabled={saving}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              color="primary" 
              variant="contained"
              disabled={saving}
              startIcon={saving ? <CircularProgress size={20} /> : null}
            >
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={handleCloseError}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        style={{ top: '24px' }}
      >
        <div>
          <Alert 
            severity="error"
            variant="filled"
            action={
              <>
                <Button
                  color="inherit"
                  size="small"
                  onClick={() => setErrorDetailsOpen(!errorDetailsOpen)}
                >
                  {errorDetailsOpen ? 'Hide Details' : 'Show Details'}
                </Button>
                <IconButton
                  size="small"
                  aria-label="close"
                  color="inherit"
                  onClick={handleCloseError}
                >
                  <Close fontSize="small" />
                </IconButton>
              </>
            }
          >
            {error?.userMessage}
          </Alert>
          <Collapse in={errorDetailsOpen}>
            <Paper>
              <Box p={2} mt={1} bgcolor="grey.100">
                <Typography variant="caption" component="pre" style={{ 
                  whiteSpace: 'pre-wrap',
                  fontFamily: 'monospace',
                  fontSize: '0.85rem'
                }}>
                  {error?.technicalMessage}
                </Typography>
              </Box>
            </Paper>
          </Collapse>
        </div>
      </Snackbar>
    </>
  );
};

export default ContactForm; 