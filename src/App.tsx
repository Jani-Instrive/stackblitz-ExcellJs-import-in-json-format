import { FC } from 'react';
import {Box, Button, Grid, Typography} from '@mui/material'
import './style.css';

export const App: FC<{ name: string }> = ({ name }) => {
  const handleSubmit = (e) => {
    console.log('e---->',e.target.value)
  }
  return (
    <Box>
       <form onSubmit={handleSubmit}>
          <Typography>Upload Excel file</Typography>
          <input  type='file'
            style={{ maxWidth: '500px', margin: 'auto' }} accept='.xlsx' className='form-control'
             />
          <Grid style={{ marginTop: "2%" }}>
            <Button
              type='submit' className='btn btn-success'
            >Submit</Button>
          </Grid>
        </form>
    </Box>
  );
};
