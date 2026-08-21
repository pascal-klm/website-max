(function () {
  var BREVO_FORM_URL = "";
  var forms = document.querySelectorAll("form.js-contact");
  if (!forms.length) return;

  function setStatus(el, message, kind) {
    el.textContent = message;
    el.className = "form-status " + (kind || "");
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
        setStatus(status, "Wie dürfen wir dich ansprechen?", "error");
        name.focus();
        return;
      }
      if (phone.value.replace(/\D/g, "").length < 6) {
        setStatus(status, "Bitte eine Telefonnummer für den Rückruf.", "error");
        phone.focus();
        return;
      }
      if (!/^\d{5}$/.test(zip.value.trim())) {
        setStatus(status, "Bitte eine fünfstellige Postleitzahl.", "error");
        zip.focus();
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
        setStatus(status, "Die E-Mail-Adresse wirkt noch nicht vollständig.", "error");
        email.focus();
        return;
      }
      if (!privacy.checked) {
        setStatus(status, "Bitte die Datenschutzerklärung bestätigen.", "error");
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
        setStatus(status, "Danke. Wir rufen dich persönlich an.", "ok");
        form.reset();
        return;
      }

      setStatus(status, "Wird gesendet …", "");
      fetch(BREVO_FORM_URL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(payload).toString(),
        mode: "no-cors"
      })
        .then(function () {
          setStatus(status, "Danke. Wir rufen dich persönlich an.", "ok");
          form.reset();
        })
        .catch(function () {
          setStatus(status, "Das hat nicht geklappt. Schreib uns an info@maximilian-heiland.de", "error");
        });
    });
  });
})();
