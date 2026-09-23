const TOTAL_STEPS = 6;

let currentStep = 1;

const form = document.getElementById("briefingForm");
const steps = Array.from(document.querySelectorAll(".form-step"));

const currentStepLabel = document.getElementById("currentStepLabel");
const progressPercent = document.getElementById("progressPercent");
const progressFill = document.getElementById("progressFill");

const themeToggle = document.getElementById("themeToggle");

const loadingPanel = document.getElementById("loadingPanel");
const successPanel = document.getElementById("successPanel");

const projectOtherWrapper =
  document.getElementById("projectOtherWrapper");

const projectOther =
  document.getElementById("projectOther");

const hpField =
  document.getElementById("hpField");

if (!form) {
  console.error("Formulário de briefing não encontrado.");
}

/* ---------------------------------------------------------
   THEME
   --------------------------------------------------------- */

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;

  try {
    localStorage.setItem("pereda-briefing-theme", theme);
  } catch {
    // localStorage indisponível: mantém o tema apenas na sessão.
  }
}

function initializeTheme() {
  let savedTheme = null;

  try {
    savedTheme = localStorage.getItem("pereda-briefing-theme");
  } catch {
    savedTheme = null;
  }

  if (savedTheme === "light" || savedTheme === "dark") {
    applyTheme(savedTheme);
    return;
  }

  const prefersLight = window.matchMedia(
    "(prefers-color-scheme: light)"
  ).matches;

  applyTheme(prefersLight ? "light" : "dark");
}

initializeTheme();

themeToggle?.addEventListener("click", () => {
  const currentTheme =
    document.documentElement.dataset.theme || "dark";

  applyTheme(
    currentTheme === "dark"
      ? "light"
      : "dark"
  );
});

/* ---------------------------------------------------------
   PROGRESS
   --------------------------------------------------------- */

function updateProgress() {
  const percentage = Math.round(
    (currentStep / TOTAL_STEPS) * 100
  );

  if (currentStepLabel) {
    currentStepLabel.textContent =
      String(currentStep).padStart(2, "0");
  }

  if (progressPercent) {
    progressPercent.textContent =
      `${percentage}%`;
  }

  if (progressFill) {
    progressFill.style.width =
      `${percentage}%`;
  }
}

/* ---------------------------------------------------------
   STEP POSITION
   --------------------------------------------------------- */

function keepNextStepInView(step) {
  if (!step) return;

  const heading =
    step.querySelector(".step-heading");

  const target = heading || step;

  const header =
    document.querySelector(".briefing-header");

  const headerHeight =
    header?.getBoundingClientRect().height || 0;

  const targetTop =
    target.getBoundingClientRect().top +
    window.scrollY;

  const offset =
    window.innerWidth <= 800
      ? headerHeight + 28
      : headerHeight + 54;

  window.scrollTo({
    top: Math.max(
      0,
      targetTop - offset
    ),
    behavior: "smooth"
  });
}

/* ---------------------------------------------------------
   SHOW STEP
   --------------------------------------------------------- */

function showStep(stepNumber, shouldScroll = true) {
  currentStep = Math.min(
    Math.max(stepNumber, 1),
    TOTAL_STEPS
  );

  steps.forEach((step) => {
    const stepNumberValue =
      Number(step.dataset.step);

    const active =
      stepNumberValue === currentStep;

    step.classList.toggle(
      "active",
      active
    );
  });

  updateProgress();

  const activeStep =
    steps.find(
      (step) =>
        Number(step.dataset.step) ===
        currentStep
    );

  if (
    shouldScroll &&
    activeStep
  ) {
    requestAnimationFrame(() => {
      keepNextStepInView(activeStep);
    });
  }

  requestAnimationFrame(() => {
    activeStep
      ?.querySelector(".step-heading h2")
      ?.focus({
        preventScroll: true
      });
  });
}

/* ---------------------------------------------------------
   VALIDATION HELPERS
   --------------------------------------------------------- */

function clearErrors(step) {
  if (!step) return;

  step
    .querySelectorAll(".field.error")
    .forEach((field) => {
      field.classList.remove("error");
    });

  step
    .querySelectorAll(".field-error")
    .forEach((error) => {
      error.remove();
    });

  clearStepAlert(step);
}

function clearStepAlert(step) {
  step
    ?.querySelectorAll(".step-alert")
    .forEach((alert) => {
      alert.remove();
    });
}

function showStepAlert(anchorElement, message) {
  if (!anchorElement) return;

  const step =
    anchorElement.closest(".form-step");

  if (!step) return;

  clearStepAlert(step);

  const alert =
    document.createElement("div");

  alert.className = "step-alert";
  alert.setAttribute("role", "alert");
  alert.textContent = message;

  anchorElement.insertAdjacentElement(
    "afterend",
    alert
  );
}

function addError(field, message) {
  if (!field) return;

  const wrapper =
    field.closest(".field");

  if (!wrapper) return;

  wrapper.classList.add("error");

  const error =
    document.createElement("span");

  error.className = "field-error";
  error.textContent = message;

  field.insertAdjacentElement(
    "afterend",
    error
  );
}

/* ---------------------------------------------------------
   VALIDATION
   --------------------------------------------------------- */

function validateStep(stepNumber) {
  const step =
    steps.find(
      (item) =>
        Number(item.dataset.step) ===
        stepNumber
    );

  if (!step) return true;

  clearErrors(step);

  let valid = true;

  if (stepNumber === 1) {
    const company =
      document.getElementById("company");

    const segment =
      document.getElementById("segment");

    const location =
      document.getElementById("location");

    const description =
      document.getElementById(
        "businessDescription"
      );

    if (!company?.value.trim()) {
      addError(
        company,
        "Informe o nome da empresa."
      );
      valid = false;
    }

    if (!segment?.value.trim()) {
      addError(
        segment,
        "Informe o segmento."
      );
      valid = false;
    }

    if (!location?.value.trim()) {
      addError(
        location,
        "Informe a localização."
      );
      valid = false;
    }

    if (!description?.value.trim()) {
      addError(
        description,
        "Conte brevemente sobre o negócio."
      );
      valid = false;
    }
  }

  if (stepNumber === 2) {
    const selectedProject =
      step.querySelector(
        'input[name="projectType"]:checked'
      );

    if (!selectedProject) {
      showStepAlert(
        step.querySelector(".step-heading"),
        "Selecione o tipo de projeto."
      );

      valid = false;
    }

    if (
      selectedProject?.value === "Outro" &&
      !projectOther?.value.trim()
    ) {
      addError(
        projectOther,
        "Descreva o tipo de projeto."
      );

      valid = false;
    }
  }

  if (stepNumber === 3) {
    const goals =
      Array.from(
        step.querySelectorAll(
          'input[name="goals"]:checked'
        )
      );

    if (!goals.length) {
      showStepAlert(
        step.querySelector(".goal-grid") ||
          step.querySelector(".choice-list") ||
          step.querySelector(".step-heading"),
        "Selecione pelo menos um objetivo."
      );

      valid = false;
    }
  }

  if (stepNumber === 4) {
    const presence =
      step.querySelector(
        'input[name="presence"]:checked'
      );

    if (!presence) {
      showStepAlert(
        step.querySelector(".segmented") ||
          step.querySelector(".choice-list") ||
          step.querySelector(".step-heading"),
        "Informe como está a presença digital atual."
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
      document.getElementById(
        "contactConsent"
      );

    if (!name?.value.trim()) {
      addError(
        name,
        "Informe seu nome."
      );
      valid = false;
    }

    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email?.value.trim()) {
      addError(
        email,
        "Informe seu e-mail."
      );
      valid = false;
    } else if (
      !emailPattern.test(
        email.value.trim()
      )
    ) {
      addError(
        email,
        "Informe um e-mail válido."
      );
      valid = false;
    }

    if (!phone?.value.trim()) {
      addError(
        phone,
        "Informe seu telefone."
      );
      valid = false;
    }

    if (!consent?.checked) {
      showStepAlert(
        step.querySelector(".consent") ||
          step.querySelector(".consent-field") ||
          step.querySelector(".step-heading"),
        "Autorize o contato para enviar o briefing."
      );

      valid = false;
    }
  }

  return valid;
}

/* ---------------------------------------------------------
   NAVIGATION
   --------------------------------------------------------- */

document
  .querySelectorAll(".next-step")
  .forEach((button) => {
    button.addEventListener(
      "click",
      () => {
        if (
          !validateStep(currentStep)
        ) {
          return;
        }

        if (
          currentStep <
          TOTAL_STEPS
        ) {
          showStep(
            currentStep + 1,
            true
          );
        }
      }
    );
  });

document
  .querySelectorAll(".prev-step")
  .forEach((button) => {
    button.addEventListener(
      "click",
      () => {
        if (
          currentStep > 1
        ) {
          showStep(
            currentStep - 1,
            true
          );
        }
      }
    );
  });

/* ---------------------------------------------------------
   OTHER PROJECT TYPE
   --------------------------------------------------------- */

document
  .querySelectorAll(
    'input[name="projectType"]'
  )
  .forEach((radio) => {
    radio.addEventListener(
      "change",
      () => {
        const isOther =
          radio.checked &&
          radio.value === "Outro";

        if (projectOtherWrapper) {
          projectOtherWrapper.hidden =
            !isOther;
        }

        if (!isOther && projectOther) {
          projectOther.value = "";
        }
      }
    );
  });

/* ---------------------------------------------------------
   PAYLOAD
   --------------------------------------------------------- */

function getPayload() {
  const selectedProject =
    document.querySelector(
      'input[name="projectType"]:checked'
    );

  const goals =
    Array.from(
      document.querySelectorAll(
        'input[name="goals"]:checked'
      )
    ).map(
      (input) => input.value
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

    hp: hpField
      ? hpField.value.trim()
      : "",

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
          .getElementById(
            "businessDescription"
          )
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
        projectOther
          ? projectOther.value.trim()
          : "",

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
          .value
          .trim(),

      budget:
        document
          .getElementById("budget")
          .value
          .trim(),

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
          .getElementById(
            "contactConsent"
          )
          .checked
    }
  };
}

/* ---------------------------------------------------------
   SUBMIT
   --------------------------------------------------------- */

form?.addEventListener(
  "submit",
  async (event) => {
    event.preventDefault();

    if (!validateStep(6)) {
      showStep(6, true);
      return;
    }

    const payload =
      getPayload();

    form.hidden = true;

    if (loadingPanel) {
      loadingPanel.hidden = false;
    }

    if (successPanel) {
      successPanel.hidden = true;
    }

    try {
      const response =
        await fetch(
          "/api/briefing",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json"
            },

            body:
              JSON.stringify(payload)
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Não foi possível enviar o briefing."
        );
      }

      if (loadingPanel) {
        loadingPanel.hidden = true;
      }

      if (successPanel) {
        successPanel.hidden = false;
      }

      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    } catch (error) {
      console.error(
        "Erro ao enviar briefing:",
        error
      );

      if (loadingPanel) {
        loadingPanel.hidden = true;
      }

      form.hidden = false;

      const activeStep =
        steps.find(
          (step) =>
            Number(step.dataset.step) ===
            currentStep
        );

      showStepAlert(
        activeStep?.querySelector(
          ".step-heading"
        ),
        error?.message ||
          "Não foi possível enviar o briefing. Tente novamente."
      );
    }
  }
);

/* ---------------------------------------------------------
   ENTER = CONTINUAR
   --------------------------------------------------------- */

form?.addEventListener(
  "keydown",
  (event) => {
    if (
      event.key !== "Enter" ||
      event.shiftKey
    ) {
      return;
    }

    const target =
      event.target;

    if (
      target instanceof
        HTMLTextAreaElement ||
      target instanceof
        HTMLSelectElement
    ) {
      return;
    }

    event.preventDefault();

    const activeStep =
      steps.find(
        (step) =>
          Number(step.dataset.step) ===
          currentStep
      );

    const nextButton =
      activeStep?.querySelector(
        ".next-step"
      );

    if (nextButton) {
      nextButton.click();
    }
  }
);

/* ---------------------------------------------------------
   INITIAL STATE
   --------------------------------------------------------- */

updateProgress();
showStep(
  currentStep,
  false
);