import React, { useState } from 'react';
import { TextField, Button, Typography } from '@mui/material';

const AddCurrencyForm: React.FC<{ onAddCurrency: (code: string) => void }> = ({ onAddCurrency }) => {
  const [newCurrency, setNewCurrency] = useState<string>('');

  const handleAddCurrency = () => {
    if (newCurrency.trim()) {
      onAddCurrency(newCurrency.trim().toUpperCase());
      setNewCurrency('');
    }
  };

  return (
    <div>
      <Typography variant="h6" gutterBottom>
        Add New Currency
      </Typography>
      <TextField
        label="Currency Code"
        value={newCurrency}
        onChange={(e) => setNewCurrency(e.target.value)}
        placeholder="e.g., JPY"
      />
      <Button variant="contained" color="primary" onClick={handleAddCurrency}>
        Add Currency
      </Button>
    </div>
  );
};

export default AddCurrencyForm;