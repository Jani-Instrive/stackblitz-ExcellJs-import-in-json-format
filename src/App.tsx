import { FC, useRef } from 'react';
import { Box, Button, Grid, Typography } from '@mui/material';
import * as ExcelJS from 'exceljs';
import './style.css';

export const App: FC<{ name: string }> = ({ name }) => {
  const fileInputRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (fileInputRef.current && fileInputRef.current.files.length > 0) {
      const file = fileInputRef.current.files[0];
      
      const reader = new FileReader();
      reader.readAsArrayBuffer(file);
      reader.onload = async () => {
        const buffer = reader.result as any;
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(buffer);
        const worksheet = workbook.worksheets[0];
        
        const jsonData = [];
        worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
          if (rowNumber === 1) {
          } else {
            const rowValues = row.values as any;
            const rowObject = {};
            rowValues.forEach((value, index) => {
              const headerCellValue = worksheet.getRow(1).getCell(index).value;
              if (headerCellValue && typeof headerCellValue === 'string') {
                const key = headerCellValue; // Ensure the key is a string
                let cellValue = value;
        
                // Convert cell value to string if necessary
                if (typeof cellValue === 'number' || cellValue instanceof Date || typeof cellValue === 'boolean') {
                  cellValue = cellValue.toString();
                } else if (typeof cellValue !== 'string') {
                  cellValue = ''; // Default to empty string for unsupported types
                }
        
                rowObject[key] = cellValue;
              }
            });
            jsonData.push(rowObject);
          }
        });

        console.log('JSON data:', jsonData);
      };
    }
  };

  return (
    <Box>
      <form onSubmit={handleSubmit}>
        <Typography>Upload Excel file</Typography>
        <input
          type='file'
          style={{ maxWidth: '500px', margin: 'auto' }}
          accept='.xlsx, .xls'
          className='form-control'
          ref={fileInputRef}
        />
        <Grid style={{ marginTop: "2%" }}>
          <Button
            type='submit'
            className='btn btn-success'
          >Submit</Button>
        </Grid>
      </form>
    </Box>
  );
};
