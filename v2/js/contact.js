(function () {
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
    return value.replace(/\D/g, "").length >= 6;
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
        setStatus(status, "Wie heißt du?", "error");
        name.focus();
        return;
      }
      if (!validPhone(phone.value)) {
        setStatus(status, "Wir brauchen eine echte Nummer für den Rückruf.", "error");
        phone.focus();
        return;
      }
      if (!validPlz(zip.value)) {
        setStatus(status, "Fünfstellige PLZ, sonst finden wir dich nicht.", "error");
        zip.focus();
        return;
      }
      if (!validEmail(email.value)) {
        setStatus(status, "Die E-Mail sieht nicht gültig aus.", "error");
        email.focus();
        return;
      }
      if (!privacy.checked) {
        setStatus(status, "Bitte die Datenschutzerklärung abhaken.", "error");
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
        setStatus(status, "Ist raus. Wir rufen dich an.", "ok");
        form.reset();
        return;
      }

      setStatus(status, "Geht raus …", "");
      fetch(BREVO_FORM_URL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(payload).toString(),
        mode: "no-cors"
      })
        .then(function () {
          setStatus(status, "Ist raus. Wir rufen dich an.", "ok");
          form.reset();
        })
        .catch(function () {
          setStatus(
            status,
            "Klappt gerade nicht. Schreib an info@maximilian-heiland.de",
            "error"
          );
        });
    });
  });
})();
