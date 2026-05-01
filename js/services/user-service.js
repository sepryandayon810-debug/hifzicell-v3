class UserService {
  constructor() {
    this.currentUser = null;
    auth.onAuthStateChanged(user => {
      if (user) this.loadUserData(user.uid);
    });
  }
  
  async loadUserData(uid) {
    const snap = await db.ref(`users/${uid}`).once("value");
    const data = snap.val();
    if (data) {
      this.currentUser = { id: uid, ...data };
      localStorage.setItem("webpos_session_v3", JSON.stringify(this.currentUser));
    }
  }
  
  async register(email, password, name, role="Kasir") {
    const cred = await auth.createUserWithEmailAndPassword(email, password);
    await db.ref(`users/${cred.user.uid}`).set({ name, role, email, createdAt: nowIso() });
    return cred.user.uid;
  }
  
  async login(email, password) {
    await auth.signInWithEmailAndPassword(email, password);
  }
  
  logout() {
    auth.signOut();
    localStorage.removeItem("webpos_session_v3");
  }
  
  getCurrent() {
    return this.currentUser || JSON.parse(localStorage.getItem("webpos_session_v3")) || { name:"Guest", role:"Kasir" };
  }
  
  async getAll() {
    const snap = await db.ref("users").once("value");
    const data = snap.val() || {};
    return Object.entries(data).map(([id,v]) => ({id, ...v}));
  }
}
window.userService = new UserService();
