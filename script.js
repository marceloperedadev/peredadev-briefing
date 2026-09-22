const form = document.querySelector("#briefing-form");
const steps = [...document.querySelectorAll(".step")];

const nextButton = document.querySelector("#next-button");
const backButton = document.querySelector("#back-button");

const progressBar = document.querySelector("#progress-bar");
const progressCount = document.querySelector("#progress-count");
const stepLabel = document.querySelector("#step-label");

const successPanel = document.querySelector("#success-panel");
const loadingPanel = document.querySelector("#loading-panel");

const themeToggle = document.querySelector("#theme-toggle");
const otherProjectField = document.querySelector("#other-project-field");

let currentStep = 0;
let submitting = false;

function getFieldError() {
return steps[currentStep].querySelector(".field-error");
}

function clearCurrentError() {
const error = getFieldError();

if (error) {
error.textContent = "";
}
}

function showError(message) {
const error = getFieldError();

if (error) {
error.textContent = message;
}
}

function getCheckedValues(name) {
return [...form.querySelectorAll(`input[name="${name}"]:checked`)]
.map((input) => input.value);
}

function validateStep() {
clearCurrentError();

const step = steps[currentStep];

if (currentStep === 0) {
const company = form.elements.company;
const name = form.elements.name;


if (!company.value.trim()) {
  showError("Informe o nome da empresa para continuar.");
  company.focus();
  return false;
}

if (!name.value.trim()) {
  showError("Informe seu nome para continuar.");
  name.focus();
  return false;
}


}

if (currentStep === 1) {
const selected = form.querySelector(
'input[name="projectType"]:checked'
);


if (!selected) {
  showError("Escolha o tipo de projeto para continuar.");
  return false;
}


}

if (currentStep === 2) {
const goals = getCheckedValues("goals");


if (!goals.length) {
  showError("Escolha pelo menos um objetivo.");
  return false;
}


}

if (currentStep === 3) {
const presence = form.querySelector(
'input[name="presence"]:checked'
);


if (!presence) {
  showError("Escolha a opção que melhor representa seu momento.");
  return false;
}

}

if (currentStep === 4) {
const timeline = form.elements.timeline;
const budget = form.elements.budget;


if (!timeline.value || !budget.value) {
  showError(
    "Selecione o prazo e a faixa de investimento para continuar."
  );
  return false;
}


}

if (currentStep === 5) {
const email = form.elements.email;
const phone = form.elements.phone;
const consent = form.elements.contactConsent;


if (!email.value.trim()) {
  showError("Informe seu e-mail.");
  email.focus();
  return false;
}

if (!email.validity.valid) {
  showError("Confira o e-mail informado.");
  email.focus();
  return false;
}

if (!phone.value.trim()) {
  showError("Informe seu WhatsApp.");
  phone.focus();
  return false;
}

if (!consent.checked) {
  showError(
    "Autorize o contato para enviar o briefing."
  );
  consent.focus();
  return false;
}


}

return true;
}

function updateStep(direction = 0) {
steps.forEach((step, index) => {
const active = index === currentStep;


step.hidden = !active;
step.classList.toggle("is-active", active);


});

const total = steps.length;
const percent = ((currentStep + 1) / total) * 100;

progressBar.style.width = `${percent}%`;

progressCount.textContent =
`${String(currentStep + 1).padStart(2, "0")} / ${String(total).padStart(2, "0")}`;

stepLabel.textContent =
`${String(currentStep + 1).padStart(2, "0")} — ${steps[currentStep].dataset.label}`;

backButton.hidden = currentStep === 0;

nextButton.innerHTML =
currentStep === total - 1
? 'Enviar briefing <span aria-hidden="true">↗</span>'
: 'Continuar <span aria-hidden="true">↗</span>';

if (direction) {
const firstInput = steps[currentStep].querySelector(
"input:not([type='hidden']), select, textarea"
);


firstInput?.focus();


}

window.scrollTo({
top: 0,
behavior: "smooth"
});
}

function getFormData() {
const data = new FormData(form);

const projectType = data.get("projectType");

return {
source: "pereda-dev-briefing",
version: 1,


submittedAt: new Date().toISOString(),

business: {
  company: String(data.get("company") || "").trim(),
  segment: String(data.get("segment") || "").trim(),
  location: String(data.get("location") || "").trim(),
  description: String(
    data.get("businessDescription") || ""
  ).trim(),
},

contact: {
  name: String(data.get("name") || "").trim(),
  email: String(data.get("email") || "").trim(),
  phone: String(data.get("phone") || "").trim(),
},

project: {
  type: String(projectType || ""),
  other: String(data.get("projectOther") || "").trim(),
  goals: getCheckedValues("goals"),
},

digitalPresence: {
  status: String(data.get("presence") || ""),
  website: String(data.get("website") || "").trim(),
  instagram: String(data.get("instagram") || "").trim(),
  audience: String(data.get("audience") || "").trim(),
},

context: {
  timeline: String(data.get("timeline") || ""),
  budget: String(data.get("budget") || ""),
  materials: getCheckedValues("materials"),
},

message: String(data.get("message") || "").trim(),

consent: {
  contact: data.get("contactConsent") === "true",
},


};
}

async function submitBriefing() {
if (submitting) {
return;
}

submitting = true;

form.hidden = true;
document.querySelector(".progress-meta").hidden = true;
document.querySelector(".progress-track").hidden = true;
loadingPanel.hidden = false;

try {
const payload = getFormData();


const response = await fetch("/api/briefing", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify(payload),
});

const result = await response.json().catch(() => null);

if (!response.ok) {
  throw new Error(
    result?.error ||
    "Não foi possível enviar o briefing."
  );
}

loadingPanel.hidden = true;
successPanel.hidden = false;

successPanel.focus();


} catch (error) {
console.error(error);

submitting = false;

loadingPanel.hidden = true;
form.hidden = false;

document.querySelector(".progress-meta").hidden = false;
document.querySelector(".progress-track").hidden = false;

showError(
  error instanceof Error
    ? error.message
    : "Não foi possível enviar o briefing. Tente novamente."
);

}
}

nextButton.addEventListener("click", () => {
if (!validateStep()) {
return;
}

if (currentStep < steps.length - 1) {
currentStep += 1;
updateStep(1);
return;
}

submitBriefing();
});

backButton.addEventListener("click", () => {
if (currentStep <= 0) {
return;
}

currentStep -= 1;
updateStep(-1);
});

form.addEventListener("keydown", (event) => {
if (
event.key === "Enter" &&
event.target.tagName !== "TEXTAREA"
) {
event.preventDefault();
nextButton.click();
}
});

form.addEventListener("input", () => {
clearCurrentError();
});

form.addEventListener("change", () => {
clearCurrentError();
});

form.querySelectorAll(
'input[name="projectType"]'
).forEach((input) => {
input.addEventListener("change", () => {
const showOther = input.value === "Outro" && input.checked;


otherProjectField.hidden = !showOther;

if (!showOther) {
  form.elements.projectOther.value = "";
}


});
});

/* THEME */

function getInitialTheme() {
const saved = localStorage.getItem("pereda-briefing-theme");

if (saved === "light" || saved === "dark") {
return saved;
}

return window.matchMedia(
"(prefers-color-scheme: light)"
).matches
? "light"
: "dark";
}

function setTheme(theme) {
document.documentElement.dataset.theme = theme;

localStorage.setItem(
"pereda-briefing-theme",
theme
);

themeToggle.setAttribute(
"aria-label",
theme === "dark"
? "Ativar tema claro"
: "Ativar tema escuro"
);
}

themeToggle.addEventListener("click", () => {
const current =
document.documentElement.dataset.theme || "dark";

setTheme(
current === "dark"
? "light"
: "dark"
);
});

setTheme(getInitialTheme());

updateStep();
