// src\components\Manufacturer\Settings\EmailTemplatePopUp.js
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  TextField,
} from '@mui/material';
import axios from 'axios';

function EmailTemplatePopUp({ open, onClose, template, setEmailTemplates }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editedTemplate, setEditedTemplate] = useState({
    code: template?.code || '',
    subject: template?.subject || '',
    default_template: template?.default_template || '',
  });

  // Function to handle changes in the text fields
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedTemplate((prevTemplate) => ({
      ...prevTemplate,
      [name]: value,
    }));
  };

  // Function to handle API call for updating the template
  const handleUpdateTemplate = async () => {
    try {
      setIsLoading(true);
      const response = await axios.post(
        `${process.env.REACT_APP_IP}updateMailTemplate/`,
        {
          update_obj: {
            code: editedTemplate.code,
            subject: editedTemplate.subject,
            default_template: editedTemplate.default_template,
            id: template?.id,
          },
        }
      );
      
      if (response) {
        // Fetch the updated email templates after successful update
        fetchEmailTemplates();
      }

      console.log('Template updated:', response.data);
      onClose(); // Close the popup after successful update
    } catch (error) {
      console.error('Error updating template:', error);
      setError('An error occurred while updating the template.');
    } finally {
      setIsLoading(false);
    }
  };

  // Function to fetch email templates
  const fetchEmailTemplates = async () => {
    try {
      const userData = localStorage.getItem('user');
      let manufactureUnitId = '';
  
      if (userData) {
        const data = JSON.parse(userData);
        manufactureUnitId = data.manufacture_unit_id;
      }
  
      const response = await axios.get(
        `${process.env.REACT_APP_IP}obtainAllMailTemplateForManufactureUnit/`,
        {
          params: { manufacture_unit_id: manufactureUnitId },
        }
      );
      setEmailTemplates(response.data.data || []); // Set the templates in the parent component
    } catch (error) {
      console.error('Error fetching email templates:', error);
    }
  };

  // Effect to fetch email templates when the component is mounted
  useEffect(() => {
    if (open) {
      fetchEmailTemplates(); // Fetch templates when popup opens
    }
  }, [open]); // Re-fetch when the popup opens

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Edit Email Template</DialogTitle>
      <DialogContent>
        {error && <Typography color="error">{error}</Typography>}
        
        <TextField
  fullWidth
  label="Code"
  name="code"
  value={editedTemplate.code}
  onChange={handleInputChange}
  sx={{ marginBottom: '16px', marginTop: '10px' }}
  InputProps={{
    readOnly: true,
  }}
/>

        
        <TextField
          fullWidth
          label="Subject"
          name="subject"
          value={editedTemplate.subject}
          onChange={handleInputChange}
          sx={{ marginBottom: '16px' }}
        />
        <Typography  sx={{ marginBottom: "8px", fontSize:'12px', color: "red" }}>
  *{`{} Curly Phases`} - are mandatory fields. They should not be edited.*
</Typography>

        <TextField
          fullWidth
          label="Template Body"
          name="default_template"
          value={editedTemplate.default_template}
          onChange={handleInputChange}
          multiline
          rows={6}
          sx={{ marginBottom: '16px' }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Close
        </Button>
        <Button
          onClick={handleUpdateTemplate}
          color="primary"
          disabled={isLoading}
        >
          {isLoading ? 'Updating...' : 'Save Changes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default EmailTemplatePopUp;
