/**
 * APP BOOTSTRAP
 * Inisialisasi tema global & event bus antar service.
 */
document.addEventListener('DOMContentLoaded', () => {
  
  // 1. Apply tema global dari setting
  const theme = window.settingService.getTheme();
  window.settingService.applyTheme(theme);

  // 2. Listen perubahan tema (realtime)
  window.settingService.onChange((config) => {
    window.settingService.applyTheme(config.theme);
  });

  // 3. Event Bus: Transaction → Debt (credit)
  window.addEventListener('transaction:completed', (e) => {
    const tx = e.detail;
    if (tx.payment_method === 'credit') {
      window.debtService.addDebt(tx);
    }
  });

  // 4. Event Bus: Transaction → Cash (non-credit masuk ke penjualan, dihitung di cash_service.getDailySummary)
  
  console.log('WebPOS v3 Modular Service Layer initialized');
});
