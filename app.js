const DATA_URL = "./data/internships.json";
const STORAGE_KEY = "edvyro_internship_applications";

const state = {
  internships: [],
  filtered: [],
  selectedInternship: null,
  lastFocusedButton: null,
  simulateError: false,
};

const searchInput = document.getElementById("search-input");
const domainSelect = document.getElementById("domain-select");
const modeSelect = document.getElementById("mode-select");
const resetBtn = document.getElementById("reset-btn");
const emptyResetBtn = document.getElementById("empty-reset-btn");
const retryBtn = document.getElementById("retry-btn");
const simulateErrorBtn = document.getElementById("simulate-error-btn");

const resultsStatus = document.getElementById("results-status");
const loadingState = document.getElementById("loading-state");
const errorState = document.getElementById("error-state");
const errorMessage = document.getElementById("error-message");
const emptyState = document.getElementById("empty-state");
const listEl = document.getElementById("internship-list");

const dialog = document.getElementById("internship-dialog");
const dialogId = document.getElementById("dialog-id");
const dialogTitle = document.getElementById("dialog-title");
const dialogMeta = document.getElementById("dialog-meta");
const dialogSkills = document.getElementById("dialog-skills");
const dialogCloseBtn = document.getElementById("dialog-close-btn");
const cancelApplyBtn = document.getElementById("cancel-apply-btn");

const applyForm = document.getElementById("apply-form");
const nameInput = document.getElementById("applicant-name");
const emailInput = document.getElementById("applicant-email");
const urlInput = document.getElementById("applicant-url");
const nameError = document.getElementById("name-error");
const emailError = document.getElementById("email-error");
const urlError = document.getElementById("url-error");
const formFeedback = document.getElementById("form-feedback");

function showSection(section) {
  loadingState.hidden = section !== "loading";
  errorState.hidden = section !== "error";
  emptyState.hidden = section !== "empty";
  listEl.hidden = section !== "list";
}

async function loadInternships() {
  showSection("loading");
  resultsStatus.textContent = "Loading internships...";

  try {
    await new Promise((resolve) => setTimeout(resolve, 250));

    if (state.simulateError) {
      throw new Error("Simulated network failure. Click Retry to recover.");
    }

    const response = await fetch(DATA_URL);
    if (!response.ok) {
      throw new Error(`Server responded with status ${response.status}`);
    }

    const payload = await response.json();
    if (!payload || !Array.isArray(payload.internships)) {
      throw new Error("Invalid data format: expected an internships array.");
    }

    state.internships = payload.internships;
    populateDomainFilter(state.internships);
    applyFilters();
  } catch (err) {
    errorMessage.textContent = err.message || "Unable to load internship records.";
    resultsStatus.textContent = "Failed to load internships.";
    showSection("error");
  }
}

function populateDomainFilter(items) {
  const currentValue = domainSelect.value;
  const domains = [...new Set(items.map((item) => item.domain))].sort();

  domainSelect.textContent = "";
  const allOption = document.createElement("option");
  allOption.value = "all";
  allOption.textContent = "All domains";
  domainSelect.appendChild(allOption);

  domains.forEach((domain) => {
    const option = document.createElement("option");
    option.value = domain;
    option.textContent = domain;
    domainSelect.appendChild(option);
  });

  if (domains.includes(currentValue)) {
    domainSelect.value = currentValue;
  }
}

function applyFilters() {
  const query = searchInput.value.trim().toLowerCase();
  const domain = domainSelect.value;
  const mode = modeSelect.value;

  state.filtered = state.internships.filter((item) => {
    const matchesDomain = domain === "all" || item.domain === domain;
    const matchesMode = mode === "all" || item.mode === mode;

    const searchableText = [
      item.id,
      item.title,
      item.domain,
      item.mode,
      item.location,
      ...(item.skills || []),
    ]
      .join(" ")
      .toLowerCase();

    const matchesQuery = !query || searchableText.includes(query);
    return matchesDomain && matchesMode && matchesQuery;
  });

  renderCards(state.filtered);
}

function renderCards(items) {
  listEl.textContent = "";

  const total = state.internships.length;
  const count = items.length;
  resultsStatus.textContent = `Showing ${count} of ${total} internship${total === 1 ? "" : "s"}.`;

  if (count === 0) {
    showSection("empty");
    return;
  }

  const fragment = document.createDocumentFragment();

  items.forEach((item) => {
    const card = document.createElement("article");
    card.className = "card";
    card.setAttribute("aria-labelledby", `title-${item.id}`);

    const top = document.createElement("div");
    top.className = "card-top";

    const idBadge = document.createElement("span");
    idBadge.className = "badge badge-muted";
    idBadge.textContent = item.id;

    const modeBadge = document.createElement("span");
    modeBadge.className = "badge";
    modeBadge.textContent = item.mode;

    top.append(idBadge, modeBadge);

    const title = document.createElement("h3");
    title.id = `title-${item.id}`;
    title.textContent = item.title;

    const domain = document.createElement("p");
    domain.className = "card-domain";
    domain.textContent = item.domain;

    const meta = document.createElement("p");
    meta.className = "card-meta";
    meta.textContent = `Location: ${item.location}`;

    const skillsList = document.createElement("ul");
    skillsList.className = "skill-tags";
    skillsList.setAttribute("aria-label", "Required skills");

    item.skills.forEach((skill) => {
      const li = document.createElement("li");
      li.textContent = skill;
      skillsList.appendChild(li);
    });

    const footer = document.createElement("div");
    footer.className = "card-footer";

    const openings = document.createElement("span");
    openings.className = "openings";
    openings.textContent = `${item.openings} ${item.openings === 1 ? "opening" : "openings"}`;

    const actionBtn = document.createElement("button");
    actionBtn.type = "button";
    actionBtn.className = "btn btn-primary";
    actionBtn.textContent = "Details & Apply";
    actionBtn.addEventListener("click", () => openDialog(item, actionBtn));

    footer.append(openings, actionBtn);
    card.append(top, title, domain, meta, skillsList, footer);
    fragment.appendChild(card);
  });

  listEl.appendChild(fragment);
  showSection("list");
}

function resetFilters() {
  searchInput.value = "";
  domainSelect.value = "all";
  modeSelect.value = "all";
  applyFilters();
  searchInput.focus();
}

function openDialog(item, triggerBtn) {
  state.selectedInternship = item;
  state.lastFocusedButton = triggerBtn;

  dialogId.textContent = item.id;
  dialogTitle.textContent = item.title;

  dialogMeta.textContent = "";
  const metaPairs = [
    ["Domain", item.domain],
    ["Work mode", item.mode],
    ["Location", item.location],
    ["Openings", String(item.openings)],
  ];

  metaPairs.forEach(([label, value]) => {
    const wrapper = document.createElement("div");
    const dt = document.createElement("dt");
    dt.textContent = label;
    const dd = document.createElement("dd");
    dd.textContent = value;
    wrapper.append(dt, dd);
    dialogMeta.appendChild(wrapper);
  });

  dialogSkills.textContent = "";
  item.skills.forEach((skill) => {
    const li = document.createElement("li");
    li.textContent = skill;
    dialogSkills.appendChild(li);
  });

  clearFormState();
  dialog.showModal();
  dialogCloseBtn.focus();
}

function closeDialog() {
  dialog.close();
  if (state.lastFocusedButton) {
    state.lastFocusedButton.focus();
  }
}

function clearFormState() {
  applyForm.reset();
  nameError.textContent = "";
  emailError.textContent = "";
  urlError.textContent = "";
  formFeedback.textContent = "";
  formFeedback.className = "form-feedback";
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isSafeHttpUrl(value) {
  if (!value) return true;
  try {
    const parsed = new URL(value);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}

function getSavedApplications() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function handleApplicationSubmit(event) {
  event.preventDefault();
  nameError.textContent = "";
  emailError.textContent = "";
  urlError.textContent = "";
  formFeedback.textContent = "";
  formFeedback.className = "form-feedback";

  const name = nameInput.value.trim();
  const email = emailInput.value.trim().toLowerCase();
  const portfolioUrl = urlInput.value.trim();
  let isValid = true;

  if (!name) {
    nameError.textContent = "Please enter your full name.";
    isValid = false;
  }

  if (!email || !isValidEmail(email)) {
    emailError.textContent = "Please enter a valid email address.";
    isValid = false;
  }

  if (!isSafeHttpUrl(portfolioUrl)) {
    urlError.textContent = "URL must start with https:// or http://.";
    isValid = false;
  }

  if (!isValid) return;

  const internshipId = state.selectedInternship.id;
  const saved = getSavedApplications();
  const isDuplicate = saved.some(
    (entry) => entry.internshipId === internshipId && entry.email === email
  );

  if (isDuplicate) {
    formFeedback.textContent = `You have already applied for ${internshipId} using this email.`;
    formFeedback.classList.add("is-error");
    return;
  }

  saved.push({
    internshipId,
    email,
    submittedAt: new Date().toISOString(),
  });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));

  formFeedback.textContent = `Application submitted for ${state.selectedInternship.title} (${internshipId}).`;
  formFeedback.classList.add("is-success");
  applyForm.reset();
}

searchInput.addEventListener("input", applyFilters);
domainSelect.addEventListener("change", applyFilters);
modeSelect.addEventListener("change", applyFilters);
resetBtn.addEventListener("click", resetFilters);
emptyResetBtn.addEventListener("click", resetFilters);

retryBtn.addEventListener("click", () => {
  state.simulateError = false;
  loadInternships();
});

simulateErrorBtn.addEventListener("click", () => {
  state.simulateError = true;
  loadInternships();
});

dialogCloseBtn.addEventListener("click", closeDialog);
cancelApplyBtn.addEventListener("click", closeDialog);
dialog.addEventListener("cancel", (event) => {
  event.preventDefault();
  closeDialog();
});
applyForm.addEventListener("submit", handleApplicationSubmit);

loadInternships();
