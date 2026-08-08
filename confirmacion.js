const form = document.querySelector(".rsvp-form");
const layout = document.querySelector(".rsvp-layout");
const statusText = document.querySelector(".form-status");
const guestInput = document.querySelector('input[name="personas"]');
const answerSelect = document.querySelector('select[name="respuesta"]');
const guestPreview = document.querySelector("#guest-preview");
const guestName = document.querySelector("#guest-name");
const thankYou = document.querySelector(".thank-you");

const storageKey = "confirmaciones-emily";
const guests = window.INVITADOS_EMILY || {};
const homeLink = document.querySelector(".home-link");

function getGuestSlug() {
  const url = new URL(window.location.href);
  const queryGuest = url.searchParams.get("invitado");
  if (queryGuest) return queryGuest;

  const hashGuest = url.hash.replace("#", "");
  if (hashGuest) return hashGuest;

  const invitationIndex = url.pathname.indexOf("/invitacion/");
  if (invitationIndex >= 0) {
    return url.pathname.slice(invitationIndex + "/invitacion/".length).replace(/\/$/, "");
  }

  return "familia-garcia";
}

const guestSlug = getGuestSlug();
if (homeLink) {
  homeLink.href = 'index.html?invitado='+encodeURIComponent(guestSlug)+'#inicio';
}
const currentGuest = guests[guestSlug] || {
  nombre: "Invitado especial",
  boletos: 1,
};
const maxGuests = Number(currentGuest.boletos) || 1;

function getRows() {
  try {
    return JSON.parse(localStorage.getItem(storageKey)) || [];
  } catch {
    return [];
  }
}

function csvCell(value) {
  return `"${String(value).replaceAll('"', '""')}"`;
}

function downloadCsv(rows) {
  // URL de tu aplicación web publicada en Google Apps Script
  const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxAMiHIDFH-0gSnc6tkwGNUzrzi6pClN5tSzR5akcN8mZu9b9dPxVCHzTkW_3uvsN2X/exec';

  const history = localStorage.getItem("confirmaciones-emily");
  let history_array = [];
  try {
    history_array = JSON.parse(history) || [];
  } catch {
    history_array = [];
  }
  
  if (history_array.length < 2) {
    enviarConfirmacion(idFamilia = rows.at(-1).invitado, boletosConfirmados = rows.at(-1).personasConfirmadas)
  } else {
    alert("Ya se registró una confirmación")
  }

  
  
  async function enviarConfirmacion(idFamilia, boletosConfirmados) {
    // 2. Estructurar el objeto de datos
    const payload = {
      idFamilia: idFamilia,
      boletosConfirmados: boletosConfirmados
    };

    try {
      // 3. Enviar la petición POST
      await fetch(SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors', // Evita bloqueos de políticas CORS con Apps Script
        headers: {
          'Content-Type': 'text/plain;charset=utf-8'
        },
        body: JSON.stringify(payload)
      });

    } catch (error) {
      console.error('Error al enviar confirmación:', error);
    }
  }
}

function clampGuestCount() {
  if (answerSelect.value === "No") {
    guestInput.value = 0;
    guestPreview.textContent = "0";
    return 0;
  }

  const typedValue = Number(guestInput.value || 1);
  const safeValue = Math.max(1, Math.min(typedValue, maxGuests));

  guestInput.value = safeValue;
  guestPreview.textContent = safeValue;
  return safeValue;
}

guestName.textContent = currentGuest.nombre;
guestPreview.textContent = maxGuests;
guestInput.value = maxGuests;
guestInput.max = maxGuests;

guestInput.addEventListener("input", clampGuestCount);
guestInput.addEventListener("change", clampGuestCount);
answerSelect.addEventListener("change", () => {
  if (answerSelect.value === "No") {
    guestInput.value = 0;
    guestInput.disabled = true;
  } else {
    guestInput.disabled = false;
    guestInput.value = maxGuests;
  }

  clampGuestCount();
});

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const data = new FormData(form);
  const personasConfirmadas = clampGuestCount();

  if (personasConfirmadas > maxGuests) {
    statusText.textContent = "Este invitado solo tiene ${maxGuests} boleto(s) asignado(s).";
    return;
  }

  const row = {
    fechaRegistro: new Date().toLocaleString("es-MX"),
    slug: guestSlug,
    invitado: currentGuest.nombre,
    boletosAsignados: maxGuests,
    respuesta: data.get("respuesta"),
    personasConfirmadas,
  };
  const rows = [...getRows(), row];

  localStorage.setItem(storageKey, JSON.stringify(rows));
  downloadCsv(rows);
  statusText.textContent = "";
  thankYou.hidden = false;
  layout.classList.add("is-submitted");
});
