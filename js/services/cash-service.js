/**
 * CASH SERVICE
 * Manage modal, shift, kas masuk/keluar.
 */
class CashService {
  constructor() {
  this.current = null;
  this.mutations = [];
  
  // Listen shift aktif dari Firebase
  db.ref("shifts").orderByChild("status").equalTo("open").on("value", snap => {
    const data = snap.val() || {};
    const open = Object.entries(data).map(([id, v]) => ({ id, ...v }));
    this.current = open.find(s => s.kasirId === getUid()) || open[0] || null;
  });
  
  // Listen kas mutations dari Firebase
  db.ref("kas_mutations").orderByChild("timestamp").limitToLast(200).on("value", snap => {
    const data = snap.val() || {};
    this.mutations = Object.entries(data).map(([id, v]) => ({ id, ...v }));
  });
}

  load() {
    try { return JSON.parse(localStorage.getItem(this.STORAGE_KEY)) || {}; }
    catch { return {}; }
  }

  save() {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.data));
  }

  async openShift(modal_awal, kasirName) {
  const shiftId = 'SHIFT-' + Date.now();
  const shift = {
    id: shiftId,
    modal_awal,
    start: new Date().toISOString(),
    end: null,
    kasirId: getUid() || "unknown",
    kasirName,
    status: "open"
  };
  await db.ref(`shifts/${shiftId}`).set(shift);
  this.current = shift;
  return shift;
}

  async addMutation(type, amount, note, fee = 0) {
  if (!this.current) throw new Error("Shift belum dibuka");
  const mutId = 'MUT-' + Date.now();
  await db.ref(`kas_mutations/${mutId}`).set({
    id: mutId,
    shiftId: this.current.id,
    type,        // "in", "out", "topup", "tarik"
    amount,
    note,
    fee,
    timestamp: new Date().toISOString(),
    dateKey: new Date().toISOString().split("T")[0],
    kasirId: getUid()
  });
}

  async addCash(amount, note) {
  await this.addMutation("in", amount, note);
}

  async reduceCash(amount, note) {
  await this.addMutation("out", amount, note);
}

  async closingShift() {
  if (!this.current) throw new Error("Tidak ada shift aktif");
  const summary = this.getDailySummary();
  const shiftUpdate = {
    end: new Date().toISOString(),
    status: "closed",
    summary: summary
  };
  await db.ref(`shifts/${this.current.id}`).update(shiftUpdate);
  this.current = null;
  return { ...this.current, ...shiftUpdate, ...summary };
}

  /* --- DASHBOARD DATA (Read Only) --- */
  getDailySummary() {
  const today = new Date().toISOString().split("T")[0];
  const shiftId = this.current?.id;
  
  // Transaksi hari ini dari transactionService
  const todayTxs = window.transactionService ? window.transactionService.getToday() : [];
  
  // Mutations hari ini & shift ini
  const todayMuts = this.mutations.filter(m => 
    m.dateKey === today && m.shiftId === shiftId
  );
  
  const kasMasuk = todayMuts.filter(m => m.type === "in").reduce((s, m) => s + m.amount, 0);
  const kasKeluar = todayMuts.filter(m => m.type === "out").reduce((s, m) => s + m.amount, 0);
  const topups = todayMuts.filter(m => m.type === "topup");
  const tariks = todayMuts.filter(m => m.type === "tarik");
  
  return {
    modal_awal: this.current?.modal_awal || 0,
    total_transaksi: todayTxs.length,
    total_laba: todayTxs.reduce((s, t) => s + (t.profit || 0), 0),
    uang_masuk: kasMasuk,
    uang_keluar: kasKeluar,
    penjualan_produk: todayTxs.reduce((s, t) => s + t.total, 0),
    topup: topups.reduce((s, m) => s + m.amount, 0),
    tarik_tunai: tariks.reduce((s, m) => s + m.amount, 0),
    total_admin_fee: [...topups, ...tariks].reduce((s, m) => s + (m.fee || 0), 0),
    piutang_customer: todayTxs.filter(t => t.payment_method === "credit").reduce((s, t) => s + t.total, 0)
  };
}
  
window.cashService = new CashService();
