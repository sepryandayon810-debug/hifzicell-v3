/**
 * CASH SERVICE
 * Manage modal, shift, kas masuk/keluar.
 */
class CashService {
  constructor() {
    this.STORAGE_KEY = 'webpos_cash_v3';
    this.data = this.load();
    if (!this.data.shifts) this.data = { shifts: [], current: null, mutations: [] };
  }

  load() {
    try { return JSON.parse(localStorage.getItem(this.STORAGE_KEY)) || {}; }
    catch { return {}; }
  }

  save() {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.data));
  }

  openShift(modal_awal) {
    this.data.current = {
      modal_awal: modal_awal || 0,
      start: new Date().toISOString(),
      kasir: 'Default'
    };
    this.save();
    return this.data.current;
  }

  addCash(amount, note) {
    this.data.mutations.push({ type: 'in', amount, note, date: new Date().toISOString() });
    this.save();
  }

  reduceCash(amount, note) {
    this.data.mutations.push({ type: 'out', amount, note, date: new Date().toISOString() });
    this.save();
  }

  closingShift() {
    const summary = this.getDailySummary();
    const shift = {
      ...this.data.current,
      ...summary,
      end: new Date().toISOString()
    };
    this.data.shifts.push(shift);
    this.data.current = null;
    this.save();
    return shift;
  }

  /* --- DASHBOARD DATA (Read Only) --- */
  getDailySummary() {
    const today = new Date().toDateString();
    const txs = window.transactionService ? window.transactionService.getAll() : [];
    const todayTxs = txs.filter(t => new Date(t.date).toDateString() === today);

    const kasMasuk = this.data.mutations
      .filter(m => new Date(m.date).toDateString() === today && m.type === 'in')
      .reduce((s, m) => s + m.amount, 0);

    const kasKeluar = this.data.mutations
      .filter(m => new Date(m.date).toDateString() === today && m.type === 'out')
      .reduce((s, m) => s + m.amount, 0);

    const penjualan = todayTxs.reduce((s, t) => s + t.total, 0);
    const piutang = todayTxs.filter(t => t.payment_method === 'credit').reduce((s, t) => s + t.total, 0);

    return {
      modal_awal: this.data.current?.modal_awal || 0,
      total_transaksi: todayTxs.length,
      total_laba: todayTxs.reduce((s, t) => s + (t.profit || 0), 0),
      uang_masuk: kasMasuk + penjualan,
      uang_keluar: kasKeluar,
      penjualan_produk: penjualan,
      topup: kasMasuk,
      tarik_tunai: kasKeluar,
      piutang_customer: piutang
    };
  }

  getCurrentShift() { return this.data.current; }
}

window.cashService = new CashService();
