/**
 * USER SERVICE
 * Firebase Auth + Realtime Database untuk data user.
 * Login pakai username (di belakang: username@webpos.local)
 */
class UserService {
  constructor() {
    this.currentUser = null;
    this.allUsers = [];

    // Load dari localStorage dulu (instant)
    var saved = localStorage.getItem("webpos_session_v3");
    if (saved) {
      try { this.currentUser = JSON.parse(saved); } catch(e) {}
    }

    // Sync dengan Firebase Auth
    var self = this;
    auth.onAuthStateChanged(function(user) {
      if (user) {
        self.loadUserData(user.uid);
      } else {
        self.currentUser = null;
        localStorage.removeItem("webpos_session_v3");
      }
    });

    // Load semua user list
    this.loadAllUsers();
  }

  loadUserData(uid) {
    var self = this;
    db.ref("users/" + uid).once("value").then(function(snap) {
      var data = snap.val();
      if (data) {
        self.currentUser = {
          id: uid,
          name: data.name || "Kasir",
          username: data.username || "",
          role: data.role || "Kasir",
          email: data.email || ""
        };
        localStorage.setItem("webpos_session_v3", JSON.stringify(self.currentUser));
      }
    });
  }

  loadAllUsers() {
    var self = this;
    db.ref("users").on("value", function(snap) {
      var data = snap.val() || {};
      self.allUsers = [];
      for (var uid in data) {
        if (data.hasOwnProperty(uid)) {
          self.allUsers.push({
            id: uid,
            name: data[uid].name || "User",
            username: data[uid].username || "",
            role: data[uid].role || "Kasir",
            email: data[uid].email || ""
          });
        }
      }
    });
  }

  // Login pakai username
  async loginByUsername(username, password) {
    var email = username.toLowerCase().trim() + "@webpos.local";
    var cred = await auth.signInWithEmailAndPassword(email, password);
    var snap = await db.ref("users/" + cred.user.uid).once("value");
    var data = snap.val();
    if (data) {
      this.currentUser = {
        id: cred.user.uid,
        name: data.name,
        username: data.username || username,
        role: data.role,
        email: data.email
      };
      localStorage.setItem("webpos_session_v3", JSON.stringify(this.currentUser));
    }
    return this.currentUser;
  }

  // Register pakai username
  async registerByUsername(name, username, password, role) {
    var email = username.toLowerCase().trim() + "@webpos.local";
    var cred = await auth.createUserWithEmailAndPassword(email, password);
    await db.ref("users/" + cred.user.uid).set({
      name: name,
      username: username.toLowerCase().trim(),
      email: email,
      role: role || "Kasir",
      createdAt: new Date().toISOString()
    });
    return cred.user.uid;
  }

  logout() {
    auth.signOut();
    localStorage.removeItem("webpos_session_v3");
    window.location.href = "login.html";
  }

  getCurrent() {
    return this.currentUser || { name: "Guest", role: "Kasir", id: "guest", username: "" };
  }

  async getAll() {
    return this.allUsers;
  }
}

window.userService = new UserService();
