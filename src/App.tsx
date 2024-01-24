

import { FC, useRef } from 'react';
import { Box, Button, Grid, Typography } from '@mui/material';
import * as ExcelJS from 'exceljs';
import './style.css';
import {dataArray} from './formData'

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

        const toSnakeCase = (str) => {
          return str.toLowerCase().replace(/[\s]+/g, '_').replace(/[^\w_]+/g, '');
        };
        
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
              name: question ? toSnakeCase(question.toString()) : '',
              question: question ? question.toString() : '',
              acceptance: acceptanceCellValue ? true : false,
              comment: comment ? comment.toString() : ''
            };
            sheetData.push(rowData);
          });
          return sheetData;
        };
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
        ];
        const scopeOfWork = scopeOfWorkSheets.map(sheetName => {
          return {
            [sheetName]: workbook.getWorksheet(sheetName) ? processSheet(workbook.getWorksheet(sheetName)) : []
          };
        });

        // const updateJsonDataWithArrayKeys = (jsonData, dataArray) => {
        //   const updatedJsonData = JSON.parse(JSON.stringify(jsonData)); // Deep copy jsonData to avoid direct mutation
        //   for (const section in updatedJsonData) {
        //     if (Array.isArray(updatedJsonData[section])) {
        //       updatedJsonData[section].forEach(item => {
        //         const matchedDataArrayItem = dataArray.find(data => data.label === item.question);
        //         if (matchedDataArrayItem) {
        //           item.name = matchedDataArrayItem.key;
        //         }else{
        //           item.name = ""
        //         }
        //       });
        //     }
        //   }
        //   return updatedJsonData;
        // };

        const updateJsonDataWithArrayKeys = (jsonData, dataArray) => {
          const updatedJsonData = JSON.parse(JSON.stringify(jsonData)); // Deep copy jsonData to avoid direct mutation
      
          const updateSection = (section) => {
            section.forEach(item => {
              const matchedDataArrayItem = dataArray.find(data => data.label === item.question);
              if (matchedDataArrayItem) {
                item.name = matchedDataArrayItem.key;
              } else {
                item.name = ""
              }
            });
          };
      
          for (const section in updatedJsonData) {
            if (Array.isArray(updatedJsonData[section])) {
              updateSection(updatedJsonData[section]);
              updatedJsonData[section].forEach(obj => {
                Object.values(obj).forEach(innerArray => {
                  if (Array.isArray(innerArray)) {
                    updateSection(innerArray);
                  }
                });
              });
            }
          }
      
          return updatedJsonData;
        };
      
      

        const jsonData = {
          preliminary_info: preliminaryInfo,
          pricing: pricing,
          other_key_info: otherKeyInfo,
          scope_of_work: [
            ...scopeOfWork
          ]
        };
        const updatedJsonData = updateJsonDataWithArrayKeys(jsonData, dataArray);
        console.log('JSON data:', updatedJsonData);
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
