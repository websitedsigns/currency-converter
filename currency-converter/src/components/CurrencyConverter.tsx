import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
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
  TextField,
  MenuItem,
  Button,
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import AddIcon from '@mui/icons-material/Add';
import SettingsIcon from '@mui/icons-material/Settings';
import Loading from './Loading';
import logo from '../assets/Currency.png'; // Import the logo

interface Currency {
  code: string;
  name: string;
  symbol: string;
  flag: string;
}

const CurrencyConverter: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [fromCurrency, setFromCurrency] = useState<string>('USD');
  const [toCurrency, setToCurrency] = useState<string>('EUR');
  const [amount, setAmount] = useState<number>(1);
  const [convertedAmount, setConvertedAmount] = useState<number | null>(null);
  const [exchangeRates, setExchangeRates] = useState<{ [key: string]: number }>({});
  const [isSwitched, setIsSwitched] = useState<boolean>(false);
  const [darkMode, setDarkMode] = useState<boolean>(false);
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
        console.error('Failed to fetch data. Please try again later.');
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
        symbol: '', // Add a default symbol
        flag: '',   // Add a default flag
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
      setLastUpdated(new Date().toLocaleString());
    } catch (error) {
      console.error('Failed to fetch exchange rates. Please try again later.');
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
      <Box display="flex" justifyContent="flex-end" mt={1}>
        <FormControlLabel
          control={<Switch checked={darkMode} onChange={() => setDarkMode(!darkMode)} />}
          label="Dark Mode"
          labelPlacement="start"
        />
      </Box>
      <Container maxWidth="sm" sx={{ paddingBottom: '56px', paddingTop: '8px' }}>
        {/* Header with Logo */}
        <Box display="flex" justifyContent="center" alignItems="center" mt={1}>
          <img
            src={logo}
            alt="Currency Converter Logo"
            style={{ width: '250px', height: '200px', marginBottom: '8px' }}
          />
        </Box>
        
        {/* Conversion Results */}
        {convertedAmount !== null && (
          <Box mt={1} mb={1}>
            <Typography variant="body1" align="center">
              {amount} {fromCurrency} = {convertedAmount.toFixed(2)} {toCurrency}
            </Typography>
          </Box>
        )}

        {/* Input Fields */}
        <Grid container spacing={1}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(parseFloat(e.target.value))}
              inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              select
              fullWidth
              label="From"
              value={fromCurrency}
              onChange={(e) => setFromCurrency(e.target.value)}
              size="small"
            >
              {currencies.map((currency) => (
                <MenuItem key={currency.code} value={currency.code}>
                  <Box display="flex" alignItems="center">
                    <Typography variant="body2" mr={1}>
                      {currency.flag}
                    </Typography>
                    <Typography variant="body2">
                      {currency.name} ({currency.code})
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
              size="small"
            >
              {currencies.map((currency) => (
                <MenuItem key={currency.code} value={currency.code}>
                  <Box display="flex" alignItems="center">
                    <Typography variant="body2" mr={1}>
                      {currency.flag}
                    </Typography>
                    <Typography variant="body2">
                      {currency.name} ({currency.code})
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
            <Button fullWidth variant="contained" color="primary" onClick={handleConvert}>
              Convert
            </Button>
          </Grid>
          {lastUpdated && (
            <Grid item xs={12}>
              <Typography variant="body2" align="center">
                Last updated: {lastUpdated}
              </Typography>
            </Grid>
          )}
        </Grid>
      </Container>
      <BottomNavigation
        value={navValue}
        onChange={(event, newValue) => setNavValue(newValue)}
        showLabels
        sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }}
      >
        <BottomNavigationAction label="Home" icon={<HomeIcon />} />
        <BottomNavigationAction label="Add Currency" icon={<AddIcon />} />
        <BottomNavigationAction label="Settings" icon={<SettingsIcon />} />
      </BottomNavigation>
    </ThemeProvider>
  );
};

export default CurrencyConverter;