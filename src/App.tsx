

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

        // Function to process a worksheet
        const processSheet = (worksheet) => {
          const sheetData = [];
          worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
            if (rowNumber === 1) {
              return;
            }

            const question = row.getCell(1).value;
            if (question === 'Rfp questions' || question === 'Terms & Conditions' || question === 'Expenses' || question === 'Travel / Hotel categories:' || question === 'Travel class' || question === 'Hotel' || question === 'Taxes' || question === 'Assumptions & Exclusions' || question === 'Outsourcing') {
              return;
            }
            const acceptanceCellValue = row.getCell(2).value;
            const comment = row.getCell(3).value;

            const rowData = {
              question: question ? question.toString() : '',
              acceptance: acceptanceCellValue ? true : false,
              comment: comment ? comment.toString() : ''
            };
            sheetData.push(rowData);
          });
          return sheetData;
        };

        // Process each required worksheet
        const preliminaryInfo = workbook.getWorksheet('Preliminary Information') ? processSheet(workbook.getWorksheet('Preliminary Information')) : [];
        const pricing = workbook.getWorksheet('Pricing') ? processSheet(workbook.getWorksheet('Pricing')) : [];
        const otherKeyInfo = workbook.getWorksheet('Other Key Information') ? processSheet(workbook.getWorksheet('Other Key Information')) : [];
        const scopeOfWorkSheets = [
          "Commercial Contents",
          "Competition",
          "Corporate M&A",
          "Data protection & privacy",
          "Employment",
          "Financing & capital markets",
          "(Infrastructure) projects & fin",
          "Fund formation",
          "Fund investment",
          "IP",
          "IT",
          "Litigation",
          "Arbitration",
          "Restructuring",
          "Insolvency",
          "Regulatory",
          "Tax",
          "Other"
        ]; // Replace with actual sheet names
        const scopeOfWork = scopeOfWorkSheets.map(sheetName => {
          return {
            [sheetName]: workbook.getWorksheet(sheetName) ? processSheet(workbook.getWorksheet(sheetName)) : []
          };
        });
        const templateValue = {
          preliminary_info: preliminaryInfo,
          pricing: pricing,
          other_key_info: otherKeyInfo,
          scope_of_work: [
            ...scopeOfWork
          ]
        };
        console.log('JSON data:', templateValue);
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
