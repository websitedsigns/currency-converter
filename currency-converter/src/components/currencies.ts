export interface Currency {
    code: string;
    name: string;
    symbol: string;
    flag: string; // URL or emoji of the flag
  }
  
  export const currencies: Currency[] = [
    { code: 'USD', name: 'United States Dollar', symbol: '$', flag: '🇺🇸' },
    { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺' },
    { code: 'GBP', name: 'British Pound', symbol: '£', flag: '🇬🇧' },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥', flag: '🇯🇵' },
    { code: 'INR', name: 'Indian Rupee', symbol: '₹', flag: '🇮🇳' },
    // Add more currencies as needed
  ];