/**
 * Panel admin — ver solicitudes, responder, likes, marcar leído
 */
import {
  db,
  auth,
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  arrayUnion,
  increment,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  serverTimestamp,
} from "./firebase.js";

const loginView = document.getElementById("login-view");
const panelView = document.getElementById("panel-view");
const loginForm = document.getElementById("login-form");
const loginStatus = document.getElementById("login-status");
const listEl = document.getElementById("solicitudes-list");
const logoutBtn = document.getElementById("logout-btn");

function showLogin() {
  if (loginView) loginView.hidden = false;
  if (panelView) panelView.hidden = true;
  if (logoutBtn) logoutBtn.hidden = true;
}

function showPanel() {
  if (loginView) loginView.hidden = true;
  if (panelView) panelView.hidden = false;
  if (logoutBtn) logoutBtn.hidden = false;
  loadSolicitudes();
}

function setLoginStatus(msg, isError) {
  if (!loginStatus) return;
  loginStatus.textContent = msg || "";
  loginStatus.className = "form-status " + (isError ? "error" : "ok");
  loginStatus.hidden = !msg;
}

if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    setLoginStatus("");
    const email = loginForm.email.value.trim();
    const password = loginForm.password.value;
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      console.error(err);
      setLoginStatus("No se pudo iniciar sesión. Revisa correo y contraseña.", true);
    }
  });
}

if (logoutBtn) {
  logoutBtn.addEventListener("click", () => signOut(auth));
}

onAuthStateChanged(auth, (user) => {
  if (user) showPanel();
  else showLogin();
});

function formatDate(ts) {
  if (!ts) return "—";
  try {
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleString("es-MX", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return "—";
  }
}

async function loadSolicitudes() {
  if (!listEl) return;
  listEl.innerHTML = "<p class='loading-msg'>Cargando…</p>";
  try {
    const q = query(collection(db, "solicitudes"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    if (snap.empty) {
      listEl.innerHTML = "<p class='empty-msg'>No hay solicitudes todavía.</p>";
      return;
    }
    listEl.innerHTML = "";
    snap.forEach((docSnap) => {
      listEl.appendChild(renderCard(docSnap.id, docSnap.data()));
    });
  } catch (err) {
    console.error(err);
    listEl.innerHTML =
      "<p class='empty-msg'>Error al cargar. ¿Activaste Firestore y las reglas?</p>";
  }
}

function renderCard(id, data) {
  const card = document.createElement("article");
  card.className = "admin-card" + (data.leido ? " is-read" : "");
  card.dataset.id = id;

  const respuestas = Array.isArray(data.respuestas) ? data.respuestas : [];

  card.innerHTML = `
    <div class="admin-card-head">
      <div>
        <strong>${escapeHtml(data.nombre || "Sin nombre")}</strong>
        <span class="admin-meta">${formatDate(data.createdAt)}</span>
      </div>
      <div class="admin-badges">
        ${data.leido ? '<span class="badge badge-status released">Leído</span>' : '<span class="badge badge-status early_access">Nuevo</span>'}
        <span class="badge badge-category">${escapeHtml(data.motivo || "consulta")}</span>
      </div>
    </div>
    <p class="admin-msg">${escapeHtml(data.mensaje || "")}</p>
    <p class="admin-contact">
      ${data.email ? "Correo: " + escapeHtml(data.email) : "Sin correo"} ·
      Medio: ${escapeHtml(data.medio || "—")} ·
      👍 ${Number(data.likes) || 0}
    </p>
    <div class="admin-replies" data-replies></div>
    <div class="admin-actions">
      <button type="button" class="btn btn-secondary btn-sm" data-action="like">👍 Me gusta</button>
      <button type="button" class="btn btn-secondary btn-sm" data-action="toggle-read">${data.leido ? "Marcar no leído" : "Marcar leído"}</button>
      <button type="button" class="btn btn-secondary btn-sm" data-action="delete">Eliminar</button>
    </div>
    <form class="reply-form" data-reply>
      <textarea name="respuesta" rows="2" placeholder="Escribe una respuesta…" required maxlength="2000"></textarea>
      <button type="submit" class="btn btn-primary btn-sm">Responder</button>
    </form>
  `;

  const repliesEl = card.querySelector("[data-replies]");
  respuestas.forEach((r, idx) => {
    const div = document.createElement("div");
    div.className = "admin-reply";
    div.innerHTML = `
      <p>${escapeHtml(r.texto || "")}</p>
      <div class="admin-reply-meta">
        <span>${r.autor || "admin"} · ${formatDate(r.createdAt)}</span>
        <button type="button" class="btn-link" data-like-reply="${idx}">👍 ${Number(r.likes) || 0}</button>
      </div>
    `;
    repliesEl.appendChild(div);
  });

  card.querySelector('[data-action="like"]').addEventListener("click", async () => {
    try {
      await updateDoc(doc(db, "solicitudes", id), { likes: increment(1) });
      loadSolicitudes();
    } catch (e) {
      console.error(e);
      alert("No se pudo dar like.");
    }
  });

  card.querySelector('[data-action="toggle-read"]').addEventListener("click", async () => {
    try {
      await updateDoc(doc(db, "solicitudes", id), { leido: !data.leido });
      loadSolicitudes();
    } catch (e) {
      console.error(e);
    }
  });

  card.querySelector('[data-action="delete"]').addEventListener("click", async () => {
    if (!confirm("¿Eliminar esta solicitud?")) return;
    try {
      await deleteDoc(doc(db, "solicitudes", id));
      loadSolicitudes();
    } catch (e) {
      console.error(e);
      alert("No se pudo eliminar.");
    }
  });

  card.querySelectorAll("[data-like-reply]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const idx = Number(btn.dataset.likeReply);
      const next = respuestas.map((r, i) =>
        i === idx ? { ...r, likes: (Number(r.likes) || 0) + 1 } : r
      );
      try {
        await updateDoc(doc(db, "solicitudes", id), { respuestas: next });
        loadSolicitudes();
      } catch (e) {
        console.error(e);
      }
    });
  });

  card.querySelector("[data-reply]").addEventListener("submit", async (e) => {
    e.preventDefault();
    const texto = e.target.respuesta.value.trim();
    if (!texto) return;
    try {
      await updateDoc(doc(db, "solicitudes", id), {
        respuestas: arrayUnion({
          texto,
          autor: "Ricardo",
          createdAt: new Date().toISOString(),
          likes: 0,
        }),
        leido: true,
      });
      e.target.reset();
      loadSolicitudes();
    } catch (err) {
      console.error(err);
      alert("No se pudo guardar la respuesta.");
    }
  });

  return card;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
