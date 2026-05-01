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
  window.addEventListener('transaction:completed', async (e) => {
  const tx = e.detail;
  if (tx.payment_method === 'credit') {
    await window.debtService.addDebt(tx);  // ← tambah await
  }
});

  // Offline sync: kirim antrian saat online lagi
window.addEventListener("online", async () => {
  const queue = JSON.parse(localStorage.getItem("webpos_sync_queue_v3") || "[]");
  if (queue.length === 0) return;
  
  for (const tx of queue) {
    try { 
      await db.ref(`transactions/${tx.id}`).set(tx); 
    }
    catch(err) { 
      console.error("Sync gagal", tx.id); 
    }
  }
  
  localStorage.removeItem("webpos_sync_queue_v3");
  alert("📡 Data offline tersinkronkan ke Firebase");
});

  // 4. Event Bus: Transaction → Cash (non-credit masuk ke penjualan, dihitung di cash_service.getDailySummary)
  
  console.log('WebPOS v3 Modular Service Layer initialized');
});
