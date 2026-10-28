/**
 * Formulario de contacto → Firestore colección "solicitudes"
 */
import {
  db,
  collection,
  addDoc,
  serverTimestamp,
} from "./firebase.js";

const form = document.getElementById("contact-form");
const statusEl = document.getElementById("form-status");
const submitBtn = document.getElementById("form-submit");

function setStatus(msg, type) {
  if (!statusEl) return;
  statusEl.textContent = msg;
  statusEl.className = "form-status " + (type || "");
  statusEl.hidden = !msg;
}

if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    setStatus("");

    const nombre = (form.nombre.value || "").trim();
    const email = (form.email.value || "").trim();
    const medio = (form.medio.value || "").trim();
    const motivo = (form.motivo.value || "").trim();
    const mensaje = (form.mensaje.value || "").trim();
    const consentimiento = form.consentimiento?.checked;

    if (!nombre || nombre.length > 100) {
      setStatus("Escribe un nombre válido (máx. 100 caracteres).", "error");
      return;
    }
    if (!mensaje || mensaje.length < 10 || mensaje.length > 4000) {
      setStatus("El mensaje debe tener entre 10 y 4000 caracteres.", "error");
      return;
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus("El correo no parece válido.", "error");
      return;
    }
    if (!consentimiento) {
      setStatus("Debes aceptar el aviso de privacidad para enviar.", "error");
      return;
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Enviando…";
    }

    try {
      await addDoc(collection(db, "solicitudes"), {
        nombre,
        email: email || null,
        medio: medio || "no indicado",
        motivo: motivo || "consulta",
        mensaje,
        createdAt: serverTimestamp(),
        leido: false,
        likes: 0,
        respuestas: [],
      });
      form.reset();
      setStatus("Mensaje enviado. Gracias, te responderé pronto.", "ok");
    } catch (err) {
      console.error(err);
      setStatus(
        "No se pudo enviar. Comprueba tu conexión o inténtalo por WhatsApp.",
        "error"
      );
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = "Enviar mensaje";
      }
    }
  });
}
