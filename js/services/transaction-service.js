/**
 * TRANSACTION SERVICE
 * Handle alur transaksi. Validasi → Simpan → Trigger services lain.
 */
class TransactionService {
  constructor() {
    this.STORAGE_KEY = 'webpos_transactions_v3';
    this.listeners = [];
    this.transactions = this.load();
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
      date: new Date().toISOString(),
      items: data.items,
      total: data.total,
      payment_method: data.payment_method,
      customer: data.customer || 'Umum',
      profit: data.profit || 0,
      note: data.note || ''
    };

    // 1. Save
    this.transactions.push(transaction);
    this.save();

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
    const today = new Date().toDateString();
    return this.transactions.filter(t => new Date(t.date).toDateString() === today);
  }
  getById(id) { return this.transactions.find(t => t.id === id); }
}

window.transactionService = new TransactionService();
