(function () {
  /**
   * Brevo / Sendinblue
   * Tragen Sie hier die Formular-URL aus Brevo ein
   * (Kontakt > Formulare > HTML einbetten > action="https://...sibforms.com/serve/...").
   * Solange das Feld leer bleibt, wird die Anfrage nur lokal bestätigt.
   */
  var BREVO_FORM_URL = "";

  var forms = document.querySelectorAll("form.js-contact");
  if (!forms.length) return;

  function setStatus(el, message, kind) {
    el.textContent = message;
    el.className = "form-status " + (kind || "");
  }

  function validEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  function validPlz(value) {
    return /^\d{5}$/.test(value.trim());
  }

  function validPhone(value) {
    var digits = value.replace(/\D/g, "");
    return digits.length >= 6;
  }

  forms.forEach(function (form) {
    var status = form.querySelector(".form-status");

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      var name = form.elements.namedItem("name");
      var phone = form.elements.namedItem("phone");
      var zip = form.elements.namedItem("zip");
      var email = form.elements.namedItem("email");
      var privacy = form.elements.namedItem("privacy");

      if (!name.value.trim()) {
        setStatus(status, "Bitte geben Sie Ihren Namen an.", "error");
        name.focus();
        return;
      }
      if (!validPhone(phone.value)) {
        setStatus(status, "Bitte geben Sie eine gültige Telefonnummer an.", "error");
        phone.focus();
        return;
      }
      if (!validPlz(zip.value)) {
        setStatus(status, "Bitte geben Sie eine fünfstellige Postleitzahl an.", "error");
        zip.focus();
        return;
      }
      if (!validEmail(email.value)) {
        setStatus(status, "Bitte geben Sie eine gültige E-Mail-Adresse an.", "error");
        email.focus();
        return;
      }
      if (!privacy.checked) {
        setStatus(status, "Bitte stimmen Sie der Datenschutzerklärung zu.", "error");
        privacy.focus();
        return;
      }

      var payload = {
        NAME: name.value.trim(),
        SMS: phone.value.trim(),
        EMAIL: email.value.trim(),
        PLZ: zip.value.trim()
      };

      if (!BREVO_FORM_URL) {
        setStatus(
          status,
          "Vielen Dank. Wir haben Ihre Anfrage aufgenommen und melden uns persönlich.",
          "ok"
        );
        form.reset();
        return;
      }

      setStatus(status, "Wird gesendet …", "");

      var body = new URLSearchParams(payload);

      fetch(BREVO_FORM_URL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString(),
        mode: "no-cors"
      })
        .then(function () {
          setStatus(
            status,
            "Vielen Dank. Wir haben Ihre Anfrage erhalten und melden uns persönlich.",
            "ok"
          );
          form.reset();
        })
        .catch(function () {
          setStatus(
            status,
            "Die Anfrage konnte nicht gesendet werden. Bitte versuchen Sie es erneut oder schreiben Sie an info@maximilian-heiland.de.",
            "error"
          );
        });
    });
  });
})();
