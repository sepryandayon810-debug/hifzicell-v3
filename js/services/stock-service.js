class StockService {
  constructor() {
    this.products = [];
    
    db.ref("products").on("value", snap => {
      const data = snap.val() || {};
      this.products = Object.entries(data).map(([id, v]) => ({ id, ...v }));
    });
  }
  
  async addProduct(data) {
    const id = 'PRD-' + Date.now();
    await db.ref(`products/${id}`).set({ 
      id, 
      ...data, 
      createdAt: new Date().toISOString() 
    });
    return id;
  }
  
  async updateStock(id, qtyChange) {
    const snap = await db.ref(`products/${id}/stock`).once("value");
    const current = snap.val() || 0;
    await db.ref(`products/${id}`).update({ stock: current + qtyChange });
  }
  
  getAll() { return [...this.products]; }
  getById(id) { return this.products.find(p => p.id === id); }
}

window.stockService = new StockService();
