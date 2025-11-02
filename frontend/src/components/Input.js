import React from 'react';
import { TextField, Grid } from '@mui/material';

const Input = ({ name, label, handleChange, type, autoFocus, half }) => {
  return (
    <Grid item xs={12} sm={half ? 6 : 12}>
      <TextField
        name={name}
        label={label}
        onChange={handleChange}
        variant="outlined"
        required
        fullWidth
        autoFocus={autoFocus}
        type={type}
      />
    </Grid>
  );
};

export default Input;
