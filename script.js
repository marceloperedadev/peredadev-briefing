const TOTAL_STEPS = 6;

let currentStep = 1;

const form = document.getElementById("briefingForm");
const steps = Array.from(document.querySelectorAll(".form-step"));

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

const hpField =
  document.getElementById("hpField");

const prevButton =
  document.getElementById("prevButton");

const nextButton =
  document.getElementById("nextButton");

const submitButton =
  document.getElementById("submitButton");

const currentYear =
  document.getElementById("currentYear");


if (!form) {
  throw new Error("Formulário de briefing não encontrado.");
}


/* ---------------------------------------------------------
   ANO
   --------------------------------------------------------- */

if (currentYear) {
  currentYear.textContent = new Date().getFullYear();
}


/* ---------------------------------------------------------
   THEME
   --------------------------------------------------------- */

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;

  try {
    localStorage.setItem(
      "pereda-briefing-theme",
      theme
    );
  } catch {
    // LocalStorage pode estar indisponível.
  }

  if (themeToggle) {
    const isLight = theme === "light";

    themeToggle.setAttribute(
      "aria-pressed",
      String(isLight)
    );

    themeToggle.setAttribute(
      "aria-label",
      isLight
        ? "Ativar tema escuro"
        : "Ativar tema claro"
    );
  }
}


function initializeTheme() {
  let savedTheme = null;

  try {
    savedTheme = localStorage.getItem(
      "pereda-briefing-theme"
    );
  } catch {
    savedTheme = null;
  }

  if (
    savedTheme === "dark" ||
    savedTheme === "light"
  ) {
    applyTheme(savedTheme);
    return;
  }

  const prefersLight =
    window.matchMedia &&
    window.matchMedia(
      "(prefers-color-scheme: light)"
    ).matches;

  applyTheme(
    prefersLight
      ? "light"
      : "dark"
  );
}


if (themeToggle) {
  themeToggle.addEventListener(
    "click",
    () => {
      const currentTheme =
        document.documentElement.dataset.theme === "light"
          ? "light"
          : "dark";

      applyTheme(
        currentTheme === "light"
          ? "dark"
          : "light"
      );
    }
  );
}

initializeTheme();


/* ---------------------------------------------------------
   PROGRESS
   --------------------------------------------------------- */

function updateProgress() {
  const percentage =
    Math.round(
      (currentStep / TOTAL_STEPS) * 100
    );

  if (currentStepLabel) {
    currentStepLabel.textContent =
      `Etapa ${currentStep} de ${TOTAL_STEPS}`;
  }

  if (progressPercent) {
    progressPercent.textContent =
      `${percentage}%`;
  }

  if (progressFill) {
    progressFill.style.width =
      `${percentage}%`;
  }

  const progressTrack =
    document.querySelector(
      ".progress-track"
    );

  if (progressTrack) {
    progressTrack.setAttribute(
      "aria-valuenow",
      String(percentage)
    );
  }
}


/* ---------------------------------------------------------
   STEP VISIBILITY
   --------------------------------------------------------- */

function updateNavigation() {
  if (prevButton) {
    prevButton.hidden =
      currentStep === 1;
  }

  if (nextButton) {
    nextButton.hidden =
      currentStep === TOTAL_STEPS;
  }

  if (submitButton) {
    submitButton.hidden =
      currentStep !== TOTAL_STEPS;
  }
}


function showStep(stepNumber) {
  currentStep = Math.min(
    Math.max(stepNumber, 1),
    TOTAL_STEPS
  );

  steps.forEach((step) => {
    const stepValue =
      Number(step.dataset.step);

    const isActive =
      stepValue === currentStep;

    step.classList.toggle(
      "active",
      isActive
    );
  });

  updateProgress();
  updateNavigation();

  const activeStep =
    steps.find(
      (step) =>
        Number(step.dataset.step) ===
        currentStep
    );

  if (activeStep) {
    const heading =
      activeStep.querySelector(
        ".step-heading h2"
      );

    /*
      IMPORTANTE:
      O foco é mantido no novo título sem
      deslocar a página.
    */
    if (heading) {
      try {
        heading.focus({
          preventScroll: true
        });
      } catch {
        heading.focus();
      }
    }
  }
}


/* ---------------------------------------------------------
   VALIDATION HELPERS
   --------------------------------------------------------- */

function clearErrors(step) {
  step
    .querySelectorAll(".field.error")
    .forEach((field) => {
      field.classList.remove("error");
    });

  step
    .querySelectorAll(".field-error")
    .forEach((error) => {
      error.textContent = "";
    });

  clearStepAlert(step);
}


function clearStepAlert(step) {
  step
    .querySelectorAll(".step-alert")
    .forEach((alert) => {
      alert.remove();
    });
}


function showStepAlert(anchorEl, message) {
  const step =
    anchorEl.closest(".form-step");

  if (!step) {
    return;
  }

  clearStepAlert(step);

  const alert =
    document.createElement("div");

  alert.className = "step-alert";
  alert.setAttribute(
    "role",
    "alert"
  );

  alert.textContent = message;

  anchorEl.insertAdjacentElement(
    "afterend",
    alert
  );
}


function addError(field, message) {
  if (!field) {
    return;
  }

  field.classList.add("error");

  const error =
    field.querySelector(".field-error");

  if (error) {
    error.textContent = message;
  }
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

  if (!step) {
    return false;
  }

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

    if (!company.value.trim()) {
      addError(
        company.parentElement,
        "Informe o nome da empresa."
      );

      valid = false;
    }

    if (!segment.value.trim()) {
      addError(
        segment.parentElement,
        "Informe o segmento."
      );

      valid = false;
    }

    if (!location.value.trim()) {
      addError(
        location.parentElement,
        "Informe a cidade ou região."
      );

      valid = false;
    }

    if (!description.value.trim()) {
      addError(
        description.parentElement,
        "Conte brevemente sobre a empresa."
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
        step.querySelector(".choice-list"),
        "Selecione uma opção para continuar."
      );

      valid = false;
    }

    if (
      selectedProject &&
      selectedProject.value === "Outro"
    ) {
      if (!projectOther.value.trim()) {
        addError(
          projectOther.parentElement,
          "Descreva brevemente o projeto."
        );

        valid = false;
      }
    }
  }


  if (stepNumber === 3) {
    const goals =
      step.querySelectorAll(
        'input[name="goals"]:checked'
      );

    if (!goals.length) {
      showStepAlert(
        step.querySelector(".goal-grid"),
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
        step.querySelector(".segmented"),
        "Selecione uma opção para continuar."
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

    if (!name.value.trim()) {
      addError(
        name.parentElement,
        "Informe seu nome."
      );

      valid = false;
    }

    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email.value.trim()) {
      addError(
        email.parentElement,
        "Informe seu e-mail."
      );

      valid = false;
    } else if (
      !emailPattern.test(
        email.value.trim()
      )
    ) {
      addError(
        email.parentElement,
        "Informe um e-mail válido."
      );

      valid = false;
    }

    if (!phone.value.trim()) {
      addError(
        phone.parentElement,
        "Informe seu WhatsApp ou telefone."
      );

      valid = false;
    }

    if (!consent.checked) {
      showStepAlert(
        document.querySelector(
          ".consent-field"
        ),
        "Autorize o contato para enviar o briefing."
      );

      valid = false;
    }
  }

  return valid;
}


/* ---------------------------------------------------------
   PROJECT OTHER
   --------------------------------------------------------- */

function updateProjectOther() {
  const selected =
    document.querySelector(
      'input[name="projectType"]:checked'
    );

  const isOther =
    selected &&
    selected.value === "Outro";

  if (projectOtherWrapper) {
    projectOtherWrapper.hidden =
      !isOther;
  }

  if (!isOther && projectOther) {
    projectOther.value = "";

    const error =
      projectOther.parentElement
        .querySelector(".field-error");

    projectOther.parentElement
      .classList.remove("error");

    if (error) {
      error.textContent = "";
    }
  }
}


document
  .querySelectorAll(
    'input[name="projectType"]'
  )
  .forEach((input) => {
    input.addEventListener(
      "change",
      updateProjectOther
    );
  });


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

        showStep(
          currentStep + 1
        );
      }
    );
  });


document
  .querySelectorAll(".prev-step")
  .forEach((button) => {
    button.addEventListener(
      "click",
      () => {
        showStep(
          currentStep - 1
        );
      }
    );
  });


/* ---------------------------------------------------------
   ENTER
   --------------------------------------------------------- */

form.addEventListener(
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
      target instanceof HTMLTextAreaElement ||
      target instanceof HTMLSelectElement
    ) {
      return;
    }

    const activeStep =
      steps.find(
        (step) =>
          Number(step.dataset.step) ===
          currentStep
      );

    if (!activeStep) {
      return;
    }

    const nextButtonInStep =
      activeStep.querySelector(
        ".next-step"
      );

    if (nextButtonInStep) {
      event.preventDefault();
      nextButtonInStep.click();
    }
  }
);


/* ---------------------------------------------------------
   PAYLOAD
   --------------------------------------------------------- */

function getPayload() {
  const selectedProject =
    document.querySelector(
      'input[name="projectType"]:checked'
    );

  const presence =
    document.querySelector(
      'input[name="presence"]:checked'
    );

  const goals =
    Array.from(
      document.querySelectorAll(
        'input[name="goals"]:checked'
      )
    ).map(
      (input) => input.value
    );

  return {
    source: "pereda-dev-briefing",
    version: 1,
    submittedAt: new Date().toISOString(),

    hp:
      hpField
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

form.addEventListener(
  "submit",
  async (event) => {
    event.preventDefault();

    if (
      !validateStep(TOTAL_STEPS)
    ) {
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

      let data = null;

      try {
        data =
          await response.json();
      } catch {
        data = null;
      }

      if (
        !response.ok ||
        !data ||
        !data.success
      ) {
        throw new Error(
          data &&
          data.error
            ? data.error
            : "Não foi possível enviar o briefing."
        );
      }

      if (loadingPanel) {
        loadingPanel.hidden = true;
      }

      if (successPanel) {
        successPanel.hidden = false;

        try {
          successPanel.focus({
            preventScroll: true
          });
        } catch {
          successPanel.focus();
        }
      }

    } catch (error) {
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

      if (activeStep) {
        const heading =
          activeStep.querySelector(
            ".step-heading"
          );

        if (heading) {
          showStepAlert(
            heading,
            error instanceof Error
              ? error.message
              : "Não foi possível enviar o briefing."
          );
        }
      }
    }
  }
);


/* ---------------------------------------------------------
   INITIAL STATE
   --------------------------------------------------------- */

updateProjectOther();
updateProgress();
showStep(currentStep);