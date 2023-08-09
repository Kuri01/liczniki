import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableRow, Select, MenuItem, TableSortLabel, TextField, Grid } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import licznikiData from './liczniki-db.json';
import './App.css';

function App() {
  const [selectedId, setSelectedId] = useState("WSZYSTKIE");
  const [sortConfig, setSortConfig] = useState(null);
  const [dateRange, setDateRange] = useState([null, null]);
  const [searchId, setSearchId] = useState(""); // Nowy stan dla wyszukiwania ID licznika

  const data = licznikiData.MeterData.flatMap(meter =>
    meter.readings.flatMap(reading =>
      Object.entries(reading).flatMap(([date, readings]) =>
        Object.entries(readings).map(([time, value]) => ({
          id: meter.id,
          date,
          time,
          value: parseFloat(value) / 1000
        }))
      )
    )
  );

  const handleStartDateChange = (date) => {
    setDateRange([date, dateRange[1]]);
  };

  const handleEndDateChange = (date) => {
    if (date) {
      date.setHours(23, 59, 59, 999);
    }
    setDateRange([dateRange[0], date]);
  };

  const availableDates = [...new Set(data.map(entry => entry.date))];

  function subtractOneDayFromDate(dateObj) {
    dateObj.setTime(dateObj.getTime() + (24 * 60 * 60 * 1000));
    return dateObj;
  }

  const isDateAvailable = (date) => {
    const newDate = subtractOneDayFromDate(new Date(date));
    const dateStr = newDate.toISOString().split('T')[0];
    return availableDates.includes(dateStr);
  };




  const sortedData = [...data]
    .filter(entry =>
      (dateRange[0] ? new Date(entry.date) >= dateRange[0] : true) &&
      (dateRange[1] ? new Date(entry.date) <= dateRange[1] : true))
    .sort((a, b) => {
      if (!sortConfig) return 0;
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  }

  const filteredData = sortedData.filter(entry =>
    (selectedId === "WSZYSTKIE" || entry.id === selectedId) &&
    (searchId === "" || entry.id.includes(searchId))
  );

  return (
    <div className="App">
      <Grid container spacing={3} justifyContent="center">
        <Grid item>
          <TextField
            label="Wyszukaj ID licznika"
            value={searchId}
            onChange={e => setSearchId(e.target.value)}
          />
        </Grid>
        <Grid item>
          <Select value={selectedId} onChange={e => setSelectedId(e.target.value)}>
            <MenuItem value="WSZYSTKIE">WSZYSTKIE</MenuItem>
            {licznikiData.MeterData.map(meter => (
              <MenuItem key={meter.id} value={meter.id}>{meter.id}</MenuItem>
            ))}
          </Select>
        </Grid>
      </Grid>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Grid container spacing={3} justifyContent="center">
          <Grid item>
            <DatePicker
              label="Od"
              value={dateRange[0]}
              disableFuture
              onChange={handleStartDateChange}
              shouldDisableDate={(date) => !isDateAvailable(date)}
              textField={(params) => <TextField {...params} />}
            />
          </Grid>
          <Grid item>
            <DatePicker
              label="Do"
              value={dateRange[1]}
              disableFuture
              onChange={handleEndDateChange}
              shouldDisableDate={(date) => !isDateAvailable(date)}
              textField={(params) => <TextField {...params} />}
            />
          </Grid>
        </Grid>
      </LocalizationProvider>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>
              <TableSortLabel
                active={sortConfig?.key === 'date'}
                direction={sortConfig?.direction || 'asc'}
                onClick={() => handleSort('date')}>
                Data
              </TableSortLabel>
            </TableCell>
            <TableCell>
              <TableSortLabel
                active={sortConfig?.key === 'time'}
                direction={sortConfig?.direction || 'asc'}
                onClick={() => handleSort('time')}>
                Godzina
              </TableSortLabel>
            </TableCell>
            <TableCell>
              <TableSortLabel
                active={sortConfig?.key === 'value'}
                direction={sortConfig?.direction || 'asc'}
                onClick={() => handleSort('value')}>
                Wartość (MWh)
              </TableSortLabel>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredData.map(entry => (
            <TableRow key={`${entry.id}-${entry.date}-${entry.time}`}>
              <TableCell>{entry.date}</TableCell>
              <TableCell>{entry.time}</TableCell>
              <TableCell>{entry.value}</TableCell>
              <TableCell>{entry.id}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default App;
