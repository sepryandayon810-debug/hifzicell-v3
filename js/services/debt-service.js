/**
 * DEBT SERVICE
 * Hutang piutang management.
 */
class DebtService {
  constructor() {
    this.STORAGE_KEY = 'webpos_debts_v3';
    this.debts = this.load();
  }

  load() {
    try { return JSON.parse(localStorage.getItem(this.STORAGE_KEY)) || []; }
    catch { return []; }
  }

  save() {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.debts));
  }

  addDebt(transaction) {
    const debt = {
      id: 'DB-' + Date.now(),
      transaction_id: transaction.id,
      customer: transaction.customer || 'Umum',
      amount: transaction.total,
      paid: 0,
      status: 'unpaid',
      date: new Date().toISOString()
    };
    this.debts.push(debt);
    this.save();
    return debt;
  }

  payDebt(debtId, amount) {
    const debt = this.debts.find(d => d.id === debtId);
    if (!debt) throw new Error('Hutang tidak ditemukan');
    
    debt.paid += amount;
    if (debt.paid >= debt.amount) debt.status = 'paid';
    this.save();
    return debt;
  }

  getAll() { return [...this.debts]; }
  getUnpaid() { return this.debts.filter(d => d.status === 'unpaid'); }
}

window.debtService = new DebtService();
