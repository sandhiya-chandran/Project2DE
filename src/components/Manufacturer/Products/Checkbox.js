import React from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField
} from '@mui/material';

function Checkbox({ open, handleClose, selectedItems, handleBulkEditSubmit, handlePriceChange, editedPrices, paginatedItems }) {
  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Bulk Edit Prices</DialogTitle>
      <DialogContent>
        {paginatedItems.map(item => (
          <TextField
            key={item.id}
            label={item.name}
            type="number"
            defaultValue={item.price}
            onChange={(e) => handlePriceChange(item.id, e.target.value)}
            size="small"
            sx={{ width: '100%', marginBottom: 1 }}
          />
        ))}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary">Cancel</Button>
        <Button onClick={handleBulkEditSubmit} color="primary">Save</Button>
      </DialogActions>
    </Dialog>
  );
}

export default Checkbox;
