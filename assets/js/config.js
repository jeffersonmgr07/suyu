window.SUYU_CONFIG = {
  API_URL: 'https://script.google.com/macros/s/AKfycbxL1p4ZrQvOyHITHysayjkidYPh1UzLBcxa5Qv6-Hw_wdJhP9ylHq-NPm3cahgpZZ6k/exec',
  CACHE_MINUTES: 10,
  DEFAULT_CURRENCY: 'USD',
  SHIPPING_FREE_FROM_USD: 120,
  SHIPPING_USD: 12,
  PAYPAL_ENABLED: true,
  MERCADOPAGO_ENABLED: true,
  MERCADOPAGO_COUNTRIES: ['PE','AR','BR','CL','CO','MX','UY'],
  CURRENCIES: {
    USD: { symbol: 'US$', rate: 1, decimals: 2 },
    PEN: { symbol: 'S/', rate: 3.72, decimals: 2 },
    CLP: { symbol: '$', rate: 940, decimals: 0 },
    ARS: { symbol: '$', rate: 1200, decimals: 0 },
    COP: { symbol: '$', rate: 4100, decimals: 0 },
    MXN: { symbol: '$', rate: 18.5, decimals: 2 },
    BRL: { symbol: 'R$', rate: 5.45, decimals: 2 },
    UYU: { symbol: '$U', rate: 40, decimals: 0 },
    EUR: { symbol: '€', rate: 0.93, decimals: 2 }
  }
};
