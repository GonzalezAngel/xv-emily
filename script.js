const countdown = document.querySelector("[data-event-date]");
const slides = document.querySelector(".slides");
const next = document.querySelector(".arrow--next");
const prev = document.querySelector(".arrow--prev");
const confirmationLink = document.querySelector("[data-confirmation-link]");

function getGuestSlug() {
  const url = new URL(window.location.href);
  const queryGuest = url.searchParams.get("invitado");
  if (queryGuest) return queryGuest;

  const hashGuest = url.hash.replace("#", "");
  if (hashGuest && hashGuest !== "inicio") return hashGuest;

  const invitationIndex = url.pathname.indexOf("/invitacion/");
  if (invitationIndex >= 0) {
    return url.pathname.slice(invitationIndex + "/invitacion/".length).replace(/\/$/, "");
  }

  return "familia-garcia";
}

function applyGuestLink() {
  if (!confirmationLink) return;
  const slug = getGuestSlug();
  confirmationLink.href = `confirmacion.html?invitado=${encodeURIComponent(slug)}`;
}

function write(selector, value) {
  document.querySelectorAll(selector).forEach((element) => {
    element.textContent = String(value).padStart(2, "0");
  });
}

function updateCountdown() {
  if (!countdown) return;

  const eventDate = new Date(countdown.dataset.eventDate).getTime();
  const diff = Math.max(eventDate - Date.now(), 0);
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff / 3600000) % 24);
  const minutes = Math.floor((diff / 60000) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  write("[data-days], [data-days-small]", days);
  write("[data-hours], [data-hours-small]", hours);
  write("[data-minutes], [data-minutes-small]", minutes);
  write("[data-seconds], [data-seconds-small]", seconds);
}

function moveSlide(direction) {
  if (!slides) return;

  const width = slides.clientWidth;
  const max = slides.scrollWidth - width;
  const nextPosition = slides.scrollLeft + direction * width;

  slides.scrollTo({
    left: nextPosition > max ? 0 : Math.max(nextPosition, 0),
    behavior: "smooth",
  });
}

next?.addEventListener("click", () => moveSlide(1));
prev?.addEventListener("click", () => moveSlide(-1));

updateCountdown();
setInterval(updateCountdown, 1000);
applyGuestLink();
