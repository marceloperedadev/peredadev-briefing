

const TOTAL_STEPS = 6;

let currentStep = 1;

const form = document.getElementById("briefingForm");

const steps = Array.from(
  document.querySelectorAll(".form-step")
);

const currentStepLabel =
  document.getElementById("currentStepLabel");

const progressPercent =
  document.getElementById("progressPercent");

const progressFill =
  document.getElementById("progressFill");

const themeToggle =
  document.getElementById("themeToggle");

const loadingPanel =
  document.getElementById("loadingPanel");

const successPanel =
  document.getElementById("successPanel");

const projectOtherWrapper =
  document.getElementById("projectOtherWrapper");

const projectOther =
  document.getElementById("projectOther");


/* =========================================================
   THEME
========================================================= */

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;

  localStorage.setItem(
    "pereda-briefing-theme",
    theme
  );
}

function initializeTheme() {
  const savedTheme =
    localStorage.getItem("pereda-briefing-theme");

  if (savedTheme === "light" || savedTheme === "dark") {
    applyTheme(savedTheme);
    return;
  }

  const prefersLight =
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: light)").matches;

  applyTheme(prefersLight ? "light" : "dark");
}

themeToggle.addEventListener("click", () => {
  const current =
    document.documentElement.dataset.theme || "dark";

  applyTheme(
    current === "dark"
      ? "light"
      : "dark"
  );
});

initializeTheme();


/* =========================================================
   STEP NAVIGATION
========================================================= */

function updateProgress() {
  const percent = Math.round(
    (currentStep / TOTAL_STEPS) * 100
  );

  currentStepLabel.textContent =
    String(currentStep).padStart(2, "0");

  progressPercent.textContent =
    `${percent}%`;

  progressFill.style.width =
    `${(currentStep / TOTAL_STEPS) * 100}%`;
}

function showStep(stepNumber) {
  currentStep = stepNumber;

  steps.forEach((step) => {
    const isActive =
      Number(step.dataset.step) === currentStep;

    step.classList.toggle(
      "active",
      isActive
    );
  });

  updateProgress();

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}


/* =========================================================
   VALIDATION
========================================================= */

function clearErrors(step) {
  step
    .querySelectorAll(".field.error")
    .forEach((field) => {
      field.classList.remove("error");

      const error =
        field.querySelector(".field-error");

      if (error) {
        error.remove();
      }
    });
}

function addError(field, message) {
  field.classList.add("error");

  const existing =
    field.querySelector(".field-error");

  if (existing) {
    existing.remove();
  }

  const error =
    document.createElement("span");

  error.className = "field-error";
  error.textContent = message;

  field.appendChild(error);
}

function validateStep(stepNumber) {
  const step =
    steps.find(
      (item) =>
        Number(item.dataset.step) === stepNumber
    );

  if (!step) {
    return true;
  }

  clearErrors(step);

  let valid = true;

  if (stepNumber === 1) {
    const company =
      document.getElementById("company");

    if (!company.value.trim()) {
      addError(
        company.closest(".field"),
        "Informe o nome da empresa."
      );

      valid = false;
    }
  }

  if (stepNumber === 2) {
    const selected =
      document.querySelector(
        'input[name="projectType"]:checked'
      );

    if (!selected) {
      alert("Selecione o tipo de projeto.");
      valid = false;
    }

    if (
      selected &&
      selected.value === "Outro" &&
      !projectOther.value.trim()
    ) {
      addError(
        projectOther.closest(".field"),
        "Descreva o tipo de projeto."
      );

      valid = false;
    }
  }

  if (stepNumber === 3) {
    const goals =
      document.querySelectorAll(
        'input[name="goals"]:checked'
      );

    if (!goals.length) {
      alert("Selecione pelo menos um objetivo.");
      valid = false;
    }
  }

  if (stepNumber === 4) {
    const presence =
      document.querySelector(
        'input[name="presence"]:checked'
      );

    if (!presence) {
      alert(
        "Informe como está a presença digital."
      );

      valid = false;
    }
  }

  if (stepNumber === 6) {
    const name =
      document.getElementById("name");

    const email =
      document.getElementById("email");

    const phone =
      document.getElementById("phone");

    const consent =
      document.getElementById("contactConsent");

    if (!name.value.trim()) {
      addError(
        name.closest(".field"),
        "Informe seu nome."
      );

      valid = false;
    }

    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (
      !email.value.trim() ||
      !emailPattern.test(email.value.trim())
    ) {
      addError(
        email.closest(".field"),
        "Informe um e-mail válido."
      );

      valid = false;
    }

    if (!phone.value.trim()) {
      addError(
        phone.closest(".field"),
        "Informe seu WhatsApp."
      );

      valid = false;
    }

    if (!consent.checked) {
      alert(
        "É necessário autorizar o contato para enviar o briefing."
      );

      valid = false;
    }
  }

  return valid;
}


/* =========================================================
   NEXT / PREVIOUS
========================================================= */

document
  .querySelectorAll(".next-step")
  .forEach((button) => {
    button.addEventListener("click", () => {
      if (!validateStep(currentStep)) {
        return;
      }

      if (currentStep < TOTAL_STEPS) {
        showStep(currentStep + 1);
      }
    });
  });

document
  .querySelectorAll(".prev-step")
  .forEach((button) => {
    button.addEventListener("click", () => {
      if (currentStep > 1) {
        showStep(currentStep - 1);
      }
    });
  });


/* =========================================================
   OUTRO
========================================================= */

document
  .querySelectorAll('input[name="projectType"]')
  .forEach((input) => {
    input.addEventListener("change", () => {
      const isOther =
        input.value === "Outro" &&
        input.checked;

      projectOtherWrapper.hidden =
        !isOther;

      if (!isOther) {
        projectOther.value = "";
      }
    });
  });


/* =========================================================
   PAYLOAD
========================================================= */

function getPayload() {
  const goals =
    Array.from(
      document.querySelectorAll(
        'input[name="goals"]:checked'
      )
    ).map((input) => input.value);

  const selectedProject =
    document.querySelector(
      'input[name="projectType"]:checked'
    );

  const presence =
    document.querySelector(
      'input[name="presence"]:checked'
    );

  return {
    source: "pereda-dev-briefing",

    version: 1,

    submittedAt:
      new Date().toISOString(),

    business: {
      company:
        document
          .getElementById("company")
          .value
          .trim(),

      segment:
        document
          .getElementById("segment")
          .value
          .trim(),

      location:
        document
          .getElementById("location")
          .value
          .trim(),

      description:
        document
          .getElementById("businessDescription")
          .value
          .trim()
    },

    contact: {
      name:
        document
          .getElementById("name")
          .value
          .trim(),

      email:
        document
          .getElementById("email")
          .value
          .trim(),

      phone:
        document
          .getElementById("phone")
          .value
          .trim()
    },

    project: {
      type:
        selectedProject
          ? selectedProject.value
          : "",

      other:
        document
          .getElementById("projectOther")
          .value
          .trim(),

      goals
    },

    digitalPresence: {
      status:
        presence
          ? presence.value
          : "",

      website:
        document
          .getElementById("website")
          .value
          .trim(),

      instagram:
        document
          .getElementById("instagram")
          .value
          .trim(),

      audience:
        document
          .getElementById("audience")
          .value
          .trim()
    },

    context: {
      timeline:
        document
          .getElementById("timeline")
          .value,

      budget:
        document
          .getElementById("budget")
          .value,

      materials:
        document
          .getElementById("materials")
          .value
          .trim()
    },

    message:
      document
        .getElementById("message")
        .value
        .trim(),

    consent: {
      contact:
        document
          .getElementById("contactConsent")
          .checked
    }
  };
}


/* =========================================================
   SUBMIT
========================================================= */

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!validateStep(6)) {
    return;
  }

  const payload = getPayload();

  /*
   * Só agora o loading aparece.
   * Ele permanece escondido durante todo o preenchimento.
   */
  form.hidden = true;
  loadingPanel.hidden = false;
  successPanel.hidden = true;

  try {
    const response =
      await fetch("/api/briefing", {
        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify(payload)
      });

    let data = null;

    try {
      data = await response.json();
    } catch {
      data = null;
    }

    if (!response.ok) {
      throw new Error(
        data?.error ||
        "Não foi possível enviar o briefing."
      );
    }

    loadingPanel.hidden = true;
    successPanel.hidden = false;

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });

  } catch (error) {
    console.error(
      "Erro ao enviar briefing:",
      error
    );

    loadingPanel.hidden = true;
    form.hidden = false;

    alert(
      error?.message ||
      "Ocorreu um erro ao enviar o briefing. Tente novamente."
    );
  }
});


/* =========================================================
   ENTER
========================================================= */

form.addEventListener("keydown", (event) => {
  if (
    event.key !== "Enter" ||
    event.shiftKey
  ) {
    return;
  }

  const target = event.target;

  if (
    target.tagName === "TEXTAREA" ||
    target.tagName === "SELECT"
  ) {
    return;
  }

  event.preventDefault();

  const activeStep =
    steps.find(
      (step) =>
        Number(step.dataset.step) === currentStep
    );

  const nextButton =
    activeStep?.querySelector(".next-step");

  if (nextButton) {
    nextButton.click();
  }
});


