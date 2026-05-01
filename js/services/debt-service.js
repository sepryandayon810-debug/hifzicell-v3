/**
 * DEBT SERVICE
 * Hutang piutang management.
 */
class DebtService {
  constructor() {
  this.debts = [];
  
  // Realtime listener dari Firebase
  db.ref("debts").orderByChild("createdAt").on("value", snap => {
    const data = snap.val() || {};
    this.debts = Object.entries(data).map(([id, v]) => ({ id, ...v }));
  });
}

  load() {
    try { return JSON.parse(localStorage.getItem(this.STORAGE_KEY)) || []; }
    catch { return []; }
  }

  save() {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.debts));
  }

 async addDebt(transaction) {
  const debtId = 'DBT-' + Date.now();
  const debt = {
    id: debtId,
    transaction_id: transaction.id,
    customer: transaction.customer || "Umum",
    amount: transaction.total,
    paid: 0,
    status: "unpaid",
    createdAt: new Date().toISOString(),
    dateKey: new Date().toISOString().split("T")[0]
  };
  await db.ref(`debts/${debtId}`).set(debt);
  return debt;
}

  async payDebt(debtId, amount) {
  const snap = await db.ref(`debts/${debtId}`).once("value");
  const debt = snap.val();
  if (!debt) throw new Error('Hutang tidak ditemukan');
  
  const newPaid = (debt.paid || 0) + amount;
  const status = newPaid >= debt.amount ? "paid" : "partial";
  
  await db.ref(`debts/${debtId}`).update({
    paid: newPaid,
    status: status,
    lastPayment: new Date().toISOString()
  });
  
  return { ...debt, paid: newPaid, status };
}
  
  getAll() { return [...this.debts]; }
  getUnpaid() { return this.debts.filter(d => d.status === 'unpaid'); }
}

window.debtService = new DebtService();
