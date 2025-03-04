import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { TextField, MenuItem, Button, Container, Typography, Grid, Switch, FormControlLabel, createTheme, CssBaseline, ThemeProvider } from '@mui/material';
import { motion } from 'framer-motion';
import AddCurrencyForm from './AddCurrencyForm';

interface Currency {
  code: string;
  name: string;
}

const CurrencyConverter: React.FC = () => {
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [fromCurrency, setFromCurrency] = useState<string>('USD');
  const [toCurrency, setToCurrency] = useState<string>('EUR');
  const [amount, setAmount] = useState<number>(1);
  const [convertedAmount, setConvertedAmount] = useState<number | null>(null);
  const [exchangeRates, setExchangeRates] = useState<{ [key: string]: number }>({});
  const [isSwitched, setIsSwitched] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState<boolean>(false);

  useEffect(() => {
    const cachedRates = localStorage.getItem('exchangeRates');
    if (cachedRates) {
      setExchangeRates(JSON.parse(cachedRates));
    } else {
      fetchExchangeRates();
    }
    fetchCurrencies();
  }, []);

  useEffect(() => {
    if (Object.keys(exchangeRates).length > 0) {
      localStorage.setItem('exchangeRates', JSON.stringify(exchangeRates));
    }
  }, [exchangeRates]);

  const fetchCurrencies = async () => {
    try {
      const response = await axios.get('https://open.er-api.com/v6/latest/USD');
      const currencyList = Object.keys(response.data.rates).map((code) => ({
        code,
        name: code,
      }));
      setCurrencies(currencyList);
    } catch (error) {
      console.error('Error fetching currencies:', error);
    }
  };

  const fetchExchangeRates = async () => {
    try {
      const response = await axios.get('https://open.er-api.com/v6/latest/USD');
      if (response.data.result === 'error') {
        throw new Error(response.data['error-type']);
      }
      setExchangeRates(response.data.rates);
      setError(null);
    } catch (error) {
      setError('Failed to fetch exchange rates. Please try again later.');
    }
  };

  const handleConvert = () => {
    if (exchangeRates[fromCurrency] && exchangeRates[toCurrency]) {
      const rate = exchangeRates[toCurrency] / exchangeRates[fromCurrency];
      setConvertedAmount(amount * rate);
    }
  };

  const handleSwitch = () => {
    setIsSwitched(!isSwitched);
    const temp = fromCurrency;
    setFromCurrency(toCurrency);
    setToCurrency(temp);
  };

  const handleAddCurrency = (code: string) => {
    if (!currencies.some((currency) => currency.code === code)) {
      setCurrencies([...currencies, { code, name: code }]);
    }
  };

  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="sm">
        <Typography variant="h4" align="center" gutterBottom>
          Currency Converter
        </Typography>
        <FormControlLabel
          control={<Switch checked={darkMode} onChange={() => setDarkMode(!darkMode)} />}
          label="Dark Mode"
        />
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(parseFloat(e.target.value))}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              select
              fullWidth
              label="From"
              value={fromCurrency}
              onChange={(e) => setFromCurrency(e.target.value)}
            >
              {currencies.map((currency) => (
                <MenuItem key={currency.code} value={currency.code}>
                  {currency.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              select
              fullWidth
              label="To"
              value={toCurrency}
              onChange={(e) => setToCurrency(e.target.value)}
            >
              {currencies.map((currency) => (
                <MenuItem key={currency.code} value={currency.code}>
                  {currency.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={<Switch checked={isSwitched} onChange={handleSwitch} />}
              label="Switch Currencies"
            />
          </Grid>
          <Grid item xs={12}>
            <Button fullWidth variant="contained" color="primary" onClick={handleConvert}>
              Convert
            </Button>
          </Grid>
          {convertedAmount !== null && (
            <Grid item xs={12}>
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Typography variant="h6" align="center">
                  {amount} {fromCurrency} = {convertedAmount.toFixed(2)} {toCurrency}
                </Typography>
              </motion.div>
            </Grid>
          )}
          {error && (
            <Grid item xs={12}>
              <Typography color="error" align="center">
                {error}
              </Typography>
            </Grid>
          )}
          <Grid item xs={12}>
            <AddCurrencyForm onAddCurrency={handleAddCurrency} />
          </Grid>
        </Grid>
      </Container>
    </ThemeProvider>
  );
};

export default CurrencyConverter;