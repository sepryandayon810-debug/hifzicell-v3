/**
 * TRANSACTION SERVICE
 * Handle alur transaksi. Validasi → Simpan → Trigger services lain.
 */
class TransactionService {
  constructor() {
  this.BACKUP_KEY = 'webpos_transactions_backup_v3';
  this.listeners = [];
  this.transactions = [];
  
  // Firebase listener
  db.ref("transactions").orderByChild("timestamp").limitToLast(500).on("value", snap => {
    const data = snap.val() || {};
    this.transactions = Object.entries(data).map(([id, v]) => ({ id, ...v }));
  });
}

  load() {
    try { return JSON.parse(localStorage.getItem(this.STORAGE_KEY)) || []; }
    catch { return []; }
  }

  save() {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.transactions));
  }

  /* --- CONTRACT VALIDATION --- */
  validate(data) {
    if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
      throw new Error('Items wajib diisi');
    }
    if (typeof data.total !== 'number' || data.total <= 0) {
      throw new Error('Total tidak valid');
    }
    if (!['cash','transfer','credit'].includes(data.payment_method)) {
      throw new Error('Metode pembayaran tidak valid');
    }
    return true;
  }

  /* --- CORE FLOW --- */
  process(data) {
    this.validate(data);

   const transaction = {
  id: 'TX-' + Date.now(),
  timestamp: new Date().toISOString(),
  dateKey: new Date().toISOString().split("T")[0],
      items: data.items,
      total: data.total,
      payment_method: data.payment_method,
      customer: data.customer || 'Umum',
      profit: data.profit || 0,
      note: data.note || ''
    };

   // 1. Save ke Firebase
try {
  await db.ref(`transactions/${transaction.id}`).set(transaction);
  
  // Backup local untuk offline
  const backup = JSON.parse(localStorage.getItem(this.BACKUP_KEY) || "[]");
  backup.push(transaction);
  localStorage.setItem(this.BACKUP_KEY, JSON.stringify(backup));
  
} catch (err) {
  // Offline: masuk antrian
  const queue = JSON.parse(localStorage.getItem("webpos_sync_queue_v3") || "[]");
  queue.push(transaction);
  localStorage.setItem("webpos_sync_queue_v3", JSON.stringify(queue));
}

    // 2. Broadcast event (services lain listen, tidak diakses langsung)
    window.dispatchEvent(new CustomEvent('transaction:completed', { detail: transaction }));

    // 3. Auto print jika setting aktif
    const printerCfg = window.settingService.getPrinterConfig();
    if (printerCfg.auto_print && window.printerService) {
      window.printerService.printReceipt(transaction);
    }

    return transaction;
  }

  getAll() { return [...this.transactions]; }
 getToday() {
  const today = new Date().toISOString().split("T")[0];
  return this.transactions.filter(t => t.dateKey === today);
}
  getById(id) { return this.transactions.find(t => t.id === id); }
}

window.transactionService = new TransactionService();
