import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  TextField,
  MenuItem,
  Button,
  Container,
  Typography,
  Grid,
  Switch,
  FormControlLabel,
  BottomNavigation,
  BottomNavigationAction,
  createTheme,
  ThemeProvider,
  CssBaseline,
  Box,
} from '@mui/material';
import { motion } from 'framer-motion';
import AddCurrencyForm from './AddCurrencyForm';
import HomeIcon from '@mui/icons-material/Home';
import AddIcon from '@mui/icons-material/Add';
import SettingsIcon from '@mui/icons-material/Settings';
import { currencies as initialCurrencies, Currency } from './currencies';
import Loading from './Loading';

const CurrencyConverter: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [currencies, setCurrencies] = useState<Currency[]>(initialCurrencies);
  const [fromCurrency, setFromCurrency] = useState<string>('USD');
  const [toCurrency, setToCurrency] = useState<string>('EUR');
  const [amount, setAmount] = useState<number>(1);
  const [convertedAmount, setConvertedAmount] = useState<number | null>(null);
  const [exchangeRates, setExchangeRates] = useState<{ [key: string]: number }>({});
  const [isSwitched, setIsSwitched] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [showAddCurrency, setShowAddCurrency] = useState<boolean>(false);
  const [navValue, setNavValue] = useState<number>(0);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const cachedRates = localStorage.getItem('exchangeRates');
        if (cachedRates) {
          setExchangeRates(JSON.parse(cachedRates));
          setLastUpdated(localStorage.getItem('lastUpdated'));
        } else {
          await fetchExchangeRates();
        }
        await fetchCurrencies();
      } catch (error) {
        setError('Failed to fetch data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (Object.keys(exchangeRates).length > 0) {
      localStorage.setItem('exchangeRates', JSON.stringify(exchangeRates));
      localStorage.setItem('lastUpdated', lastUpdated || '');
    }
  }, [exchangeRates, lastUpdated]);

  const fetchCurrencies = async () => {
    try {
      const response = await axios.get('https://open.er-api.com/v6/latest/USD');
      const currencyList = Object.keys(response.data.rates).map((code) => ({
        code,
        name: code,
        symbol: '', // Add appropriate symbol if available
        flag: '', // Add appropriate flag if available
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
      // Set the last updated time and date
      setLastUpdated(new Date().toLocaleString());
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
    if (!currencies.some((currency: Currency) => currency.code === code)) {
      setCurrencies([...currencies, { code, name: code, symbol: '', flag: '' }]);
    }
  };

  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: '#1976d2',
      },
      secondary: {
        main: '#dc004e',
      },
      background: {
        default: darkMode ? '#121212' : '#f5f5f5',
        paper: darkMode ? '#1e1e1e' : '#ffffff',
      },
    },
    typography: {
      fontFamily: 'Roboto, sans-serif',
    },
  });

  if (loading) {
    return <Loading />;
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="sm" sx={{ paddingBottom: '56px' }}>
        <Typography variant="h4" align="center" gutterBottom sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}>
          Currency Converter
        </Typography>
        <FormControlLabel
          control={<Switch checked={darkMode} onChange={() => setDarkMode(!darkMode)} />}
          label="Dark Mode"
        />
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(parseFloat(e.target.value))}
              inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
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
              {currencies.map((currency: Currency) => (
                <MenuItem key={currency.code} value={currency.code}>
                  <Box display="flex" alignItems="center">
                    <Typography variant="body1" mr={1}>
                      {currency.flag}
                    </Typography>
                    <Typography variant="body1">
                      {currency.name} ({currency.symbol})
                    </Typography>
                  </Box>
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
              {currencies.map((currency: Currency) => (
                <MenuItem key={currency.code} value={currency.code}>
                  <Box display="flex" alignItems="center">
                    <Typography variant="body1" mr={1}>
                      {currency.flag}
                    </Typography>
                    <Typography variant="body1">
                      {currency.name} ({currency.symbol})
                    </Typography>
                  </Box>
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
            <Button fullWidth variant="contained" color="primary" onClick={handleConvert} sx={{ padding: '12px' }}>
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
                  {amount} {currencies.find((c: Currency) => c.code === fromCurrency)?.flag} {fromCurrency} ={' '}
                  {convertedAmount.toFixed(2)} {currencies.find((c: Currency) => c.code === toCurrency)?.flag} {toCurrency}
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
            <Button
              fullWidth
              variant="outlined"
              onClick={fetchExchangeRates}
              sx={{ marginTop: 2 }}
            >
              Update Currencies
            </Button>
          </Grid>
          {lastUpdated && (
            <Grid item xs={12}>
              <Typography variant="body2" align="center" sx={{ marginTop: 2 }}>
                Last updated: {lastUpdated}
              </Typography>
            </Grid>
          )}
          <Grid item xs={12}>
            <Button fullWidth variant="outlined" onClick={() => setShowAddCurrency(!showAddCurrency)}>
              {showAddCurrency ? 'Hide Add Currency' : 'Add New Currency'}
            </Button>
            {showAddCurrency && <AddCurrencyForm onAddCurrency={handleAddCurrency} />}
          </Grid>
        </Grid>
      </Container>
      <BottomNavigation
        value={navValue}
        onChange={(event, newValue) => setNavValue(newValue)}
        showLabels
        sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }}
      >
        <BottomNavigationAction label="Home" icon={<HomeIcon />} />
        <BottomNavigationAction label="Add Currency" icon={<AddIcon />} onClick={() => setShowAddCurrency(true)} />
        <BottomNavigationAction label="Settings" icon={<SettingsIcon />} />
      </BottomNavigation>
    </ThemeProvider>
  );
};

export default CurrencyConverter;