"use strict";

const comprehensionQuestions = [
  {
    question: "What media does Shania McDonagh use to create her drawings?",
    options: [
      "Paint and brushes",
      "Nothing more than a pencil",
      "Digital software",
      "Charcoal and ink"
    ],
    answer: "b",
    feedback: "The passage says she created the drawings with nothing more than a pencil."
  },
  {
    question: "What is special about Shania's drawings?",
    options: [
      "They are very abstract",
      "They look like photographs",
      "They are extremely large",
      "They are made on wood"
    ],
    answer: "b",
    feedback: "Her drawings are described as looking like photographs."
  },
  {
    question: "Which country is Shania from?",
    options: [
      "The United States",
      "England",
      "Ireland",
      "Scotland"
    ],
    answer: "c",
    feedback: "The passage describes Shania as a young Irish artist."
  },
  {
    question: "What does Shania want to be in the future?",
    options: [
      "An art teacher",
      "A photographer",
      "An artist",
      "A designer"
    ],
    answer: "c",
    feedback: "The final sentence says she wants to be an artist."
  }
];
const prompts = {
  toefl: {
    speaking: [
      "Some students prefer to study alone, while others prefer to study in a group. Which do you prefer and why?",
      "Describe a change that could improve your campus or community. Explain why it would be helpful."
    ],
    writing: [
      {
        title: "Task 1 · Integrated response",
        prompt: [
          "A short reading argues that cities should replace some street parking with trees.",
          "Summarize the main argument and explain whether the benefits described in the",
          "reading would support that change."
        ].join(" "),
        target: 100
      },
      {
        title: "Task 2 · Academic discussion",
        prompt: "Do you agree or disagree that universities should require students to take courses outside their main subject? Give reasons and an example.",
        target: 100
      }
    ]
  },
  ielts: {
    speaking: [
      "Describe a place where you enjoy spending time. You should say where it is, when you go there, and explain why you like it.",
      "Some people believe cities should invest more in public parks than in roads. To what extent do you agree or disagree?"
    ],
    writing: [
      {
        title: "Task 1 · Describe data",
        prompt: [
          "Imagine a chart comparing tree cover in three city districts: North 38%,",
          "Central 22%, and South 14%. Summarize the main features and make relevant",
          "comparisons."
        ].join(" "),
        target: 150
      },
      {
        title: "Task 2 · Essay",
        prompt: [
          "Some people think that protecting green spaces should be a priority for city",
          "governments. Discuss the advantages and disadvantages and give your opinion."
        ].join(" "),
        target: 150
      }
    ]
  }
};

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const sectionNames = ["reading", "listening", "speaking", "writing"];
let selectedExam = "toefl";
let activeSection = "reading";
let isSubmitted = false;

const listeningAudio = $("#listening-audio");
const listeningAudioStatus = $("#listening-audio-status");

listeningAudio.addEventListener("loadedmetadata", () => {
  listeningAudioStatus.hidden = true;
});

if (window.location.protocol === "file:") {
  listeningAudioStatus.hidden = false;
  listeningAudioStatus.textContent =
    "Si el audio no reproduce al abrir el HTML directamente, abre el proyecto con Live Server o desde localhost.";
}

listeningAudio.addEventListener("error", () => {
  listeningAudioStatus.hidden = false;
  listeningAudioStatus.textContent = window.location.protocol === "file:"
    ? "No se pudo cargar el audio desde un archivo local. Abre el proyecto con Live Server o desde localhost."
    : "No se pudo cargar media/EnglishConversation.mp3. Comprueba que el archivo exista en la carpeta media.";
});

$("#current-year").textContent = new Date().getFullYear();

const menuToggle = $(".menu-toggle");
const mainNav = $("#main-nav");
menuToggle.addEventListener("click", () => {
  const open = menuToggle.getAttribute("aria-expanded") !== "true";
  menuToggle.setAttribute("aria-expanded", String(open));
  mainNav.classList.toggle("is-open", open);
});
$$("a", mainNav).forEach((link) => link.addEventListener("click", () => {
  mainNav.classList.remove("is-open");
  menuToggle.setAttribute("aria-expanded", "false");
}));

function renderChoiceQuestion(container, index, questionData) {
  const node = document.createElement("fieldset");
  node.className = "question-item";
  node.dataset.group = container.id;
  node.dataset.index = String(index);
  node.dataset.answer = questionData.answer;
  node.dataset.feedback = questionData.feedback;
  const legend = document.createElement("legend");
  legend.className = "sr-only";
  legend.textContent = `Pregunta ${index + 1}: ${questionData.question}`;
  const prompt = document.createElement("p");
  const number = document.createElement("span");
  number.className = "question-number";
  number.textContent = `PREGUNTA ${String(index + 1).padStart(2, "0")}`;
  prompt.append(number, document.createElement("br"), questionData.question);
  node.append(legend, prompt);
  const answers = document.createElement("div");
  answers.className = "answer-choices";
  questionData.options.forEach((option, choiceIndex) => {
    const value = String.fromCharCode(97 + choiceIndex);
    const label = document.createElement("label");
    label.className = "answer-choice";
    const input = document.createElement("input");
    input.type = "radio";
    input.name = `${container.id}-${index}`;
    input.value = value;
    const text = document.createElement("span");
    text.textContent = `${value.toUpperCase()}. ${option}`;
    label.append(input, text);
    answers.append(label);
  });
  node.append(answers);
  container.append(node);
}

function renderQuestions() {
  const reading = $("#reading-questions");
  const listening = $("#listening-questions");
  reading.replaceChildren();
  listening.replaceChildren();
  comprehensionQuestions.forEach((question, index) => {
    renderChoiceQuestion(reading, index, question);
    renderChoiceQuestion(listening, index, question);
  });
}

function renderTasks() {
  const speaking = $("#speaking-tasks");
  const writing = $("#writing-tasks");
  speaking.replaceChildren();
  writing.replaceChildren();
  prompts[selectedExam].speaking.forEach((prompt, index) => {
    const card = document.createElement("article");
    card.className = "speaking-task";
    card.innerHTML = `
      <span class="task-index">
        CONSIGNA ${String(index + 1).padStart(2, "0")} · MÁXIMO 45 SEGUNDOS
      </span>
      <h5></h5>
      <p>
        Organiza tus ideas y responde en inglés. Incluye una razón, un detalle
        o un ejemplo.
      </p>
      <div class="recording-controls">
        <button
          class="button button-primary start-recording"
          type="button"
          data-task="${index}"
        >
          ● Grabar respuesta
        </button>
        <button
          class="button button-glass stop-recording"
          type="button"
          data-task="${index}"
          disabled
        >
          Detener
        </button>
        <span class="recording-time" data-time="${index}">00:45</span>
      </div>
      <p class="recording-state" data-state="${index}" aria-live="polite">
        La grabación solo permanece en este navegador.
      </p>
      <audio
        class="recording-playback"
        data-playback="${index}"
        controls
        hidden
        aria-label="Reproducir respuesta ${index + 1}"
      ></audio>
    `;
    $("h5", card).textContent = prompt;
    speaking.append(card);
  });
  prompts[selectedExam].writing.forEach((task, index) => {
    const card = document.createElement("article");
    card.className = "writing-task";
    card.innerHTML = `
      <span class="task-index"></span>
      <h5></h5>
      <p></p>
      <textarea
        rows="5"
        data-writing="${index}"
        aria-label="Respuesta de escritura, tarea ${index + 1}"
        placeholder="Write your response here..."
      ></textarea>
      <div class="word-count-row">
        <strong data-count="${index}">0 palabras</strong>
        <span data-target="${index}"></span>
      </div>
    `;
    $(".task-index", card).textContent = task.title.toUpperCase();
    $("h5", card).textContent = task.prompt;
    $("p", card).textContent = selectedExam === "toefl"
      ? `Longitud sugerida: al menos ${task.target} palabras para esta práctica.`
      : `Longitud sugerida: al menos ${task.target} palabras para esta práctica.`;
    $(`[data-target="${index}"]`, card).textContent = `Objetivo: ${task.target} palabras`;
    writing.append(card);
  });
  $$(".start-recording").forEach((button) => button.addEventListener("click", () => startRecording(Number(button.dataset.task))));
  $$(".stop-recording").forEach((button) => button.addEventListener("click", () => stopRecording(Number(button.dataset.task))));
  $$("[data-writing]").forEach((textarea) => textarea.addEventListener("input", () => updateWordCount(textarea)));
}

function updateWordCount(textarea) {
  const words = textarea.value.trim().match(/\S+/g) || [];
  const taskIndex = Number(textarea.dataset.writing);
  const goal = prompts[selectedExam].writing[taskIndex].target;
  const label = $(`[data-count="${taskIndex}"]`);
  label.textContent = `${words.length} ${words.length === 1 ? "palabra" : "palabras"}`;
  label.classList.toggle("goal-met", words.length >= goal);
}

const examSelect = $("#exam-select");
examSelect.addEventListener("change", () => {
  selectedExam = examSelect.value;
  isSubmitted = false;
  $("#simulator-name").textContent = selectedExam === "toefl" ? "TOEFL iBT · Practice test" : "IELTS Academic · Practice test";
  $("#results").hidden = true;
  renderQuestions();
  renderTasks();
  updateProgress();
});

function getAnswer(node) {
  return $('input[type="radio"]:checked', node)?.value || "";
}

function normalizeAnswer(value) {
  return value.toLocaleLowerCase().replace(/[.,!?]/g, "").trim();
}

function correctAnswerText(node) {
  const index = Number(node.dataset.index);
  const correctOption = comprehensionQuestions[index].answer;
  return comprehensionQuestions[index].options[correctOption.charCodeAt(0) - 97];
}

function answerIsCorrect(node, value) {
  return Boolean(value) && normalizeAnswer(value) === normalizeAnswer(node.dataset.answer);
}

function getCompletedCount() {
  const questionCount = $$(".question-item").filter((node) => getAnswer(node)).length;
  const recordingsRated = ["speaking-rating", "writing-rating"].filter((id) => $(`#${id}`).value).length;
  const writings = $$("[data-writing]").filter((textarea) => textarea.value.trim().length > 0).length;
  return questionCount + recordingsRated + writings;
}

function updateProgress() {
  const total = comprehensionQuestions.length * 2 + 2 + 2;
  const percent = Math.round((getCompletedCount() / total) * 100);
  $("#exam-progress").style.width = `${percent}%`;
  $("#progress-percent").textContent = `${percent}% completado`;
  $("#progress-label").textContent = `${sectionNames.indexOf(activeSection) + 1} de 4 · ${activeSection[0].toUpperCase()}${activeSection.slice(1)}`;
}

$$(".skill-step").forEach((button) => button.addEventListener("click", () => showSection(button.dataset.section)));
$$(".next-section").forEach((button) => button.addEventListener("click", () => showSection(button.dataset.next)));
function showSection(name) {
  activeSection = name;
  $$("[data-section-panel]").forEach((panel) => {
    const active = panel.dataset.sectionPanel === name;
    panel.hidden = !active;
    panel.classList.toggle("active", active);
  });
  $$(".skill-step").forEach((step) => {
    const active = step.dataset.section === name;
    step.classList.toggle("active", active);
    step.toggleAttribute("aria-current", active);
    if (step.dataset.section !== name && sectionNames.indexOf(step.dataset.section) < sectionNames.indexOf(name)) step.classList.add("complete");
  });
  updateProgress();
  if (window.matchMedia("(max-width: 720px)").matches) $("#simulador").scrollIntoView({ behavior: "smooth", block: "start" });
}
$("#exam-form").addEventListener("input", updateProgress);

let recordings = [];
let recordingUrls = [];
let recordingTimers = [];
function startRecording(taskIndex) {
  if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
    $(`[data-state="${taskIndex}"]`).textContent = "La grabación no está disponible. Usa un navegador compatible en HTTPS o localhost.";
    return;
  }
  const startButton = $(`.start-recording[data-task="${taskIndex}"]`);
  const stopButton = $(`.stop-recording[data-task="${taskIndex}"]`);
  const state = $(`[data-state="${taskIndex}"]`);
  const time = $(`[data-time="${taskIndex}"]`);
  startButton.disabled = true;
  state.textContent = "Solicitando permiso para usar el micrófono…";
  navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
    const options = {};
    if (MediaRecorder.isTypeSupported("audio/webm")) options.mimeType = "audio/webm";
    const recorder = new MediaRecorder(stream, options);
    const chunks = [];
    recordings[taskIndex] = { recorder, stream, chunks, seconds: 45 };
    recorder.addEventListener("dataavailable", (event) => { if (event.data.size) chunks.push(event.data); });
    recorder.addEventListener("error", (event) => {
      state.textContent = `Error de grabación: ${event.error?.message || "no se pudo completar"}.`;
      finishRecordingUI(taskIndex, stream);
    });
    recorder.addEventListener("stop", () => {
      const blob = new Blob(chunks, { type: recorder.mimeType || "audio/webm" });
      const oldUrl = recordingUrls[taskIndex];
      if (oldUrl) URL.revokeObjectURL(oldUrl);
      const url = URL.createObjectURL(blob);
      recordingUrls[taskIndex] = url;
      const player = $(`[data-playback="${taskIndex}"]`);
      player.src = url;
      player.hidden = false;
      state.textContent = "Grabación lista. Escúchala y autoevalúa tu respuesta.";
      finishRecordingUI(taskIndex, stream);
    });
    recorder.start();
    stopButton.disabled = false;
    state.textContent = "Grabando… el micrófono se detendrá automáticamente al llegar a 45 segundos.";
    let remaining = 45;
    time.textContent = "00:45";
    recordingTimers[taskIndex] = window.setInterval(() => {
      remaining -= 1;
      time.textContent = `00:${String(remaining).padStart(2, "0")}`;
      if (remaining <= 0) stopRecording(taskIndex);
    }, 1000);
  }).catch((error) => {
    state.textContent = error.name === "NotAllowedError"
      ? "Permiso denegado. Habilita el micrófono en la configuración del navegador."
      : error.name === "NotFoundError"
        ? "No se encontró un micrófono conectado."
        : `No se pudo iniciar la grabación: ${error.message || "error desconocido"}.`;
    startButton.disabled = false;
  });
}

function stopRecording(taskIndex) {
  const entry = recordings[taskIndex];
  if (entry?.recorder.state === "recording") {
    $(`.stop-recording[data-task="${taskIndex}"]`).disabled = true;
    $(`[data-state="${taskIndex}"]`).textContent = "Preparando la grabación…";
    entry.recorder.stop();
  }
}

function finishRecordingUI(taskIndex, stream) {
  window.clearInterval(recordingTimers[taskIndex]);
  stream.getTracks().forEach((track) => track.stop());
  $(`.start-recording[data-task="${taskIndex}"]`).disabled = false;
  $(`.stop-recording[data-task="${taskIndex}"]`).disabled = true;
}

function getObjectiveScores(groupId) {
  const items = $$(".question-item", $(`#${groupId}`));
  const correct = items.filter((item) => answerIsCorrect(item, getAnswer(item))).length;
  return { correct, total: items.length };
}

function bandForRaw(correct) {
  return [0, 3, 5, 6.5, 8][correct] ?? 0;
}
function cefrForBand(band) {
  if (band >= 8.5) return "C2";
  if (band >= 7) return "C1";
  if (band >= 5.5) return "B2";
  if (band >= 4) return "B1";
  if (band >= 3) return "A2";
  if (band > 0) return "A1";
  return "Por debajo de A1";
}
function bandForSelfRating(rating) {
  return [0, 4, 5.5, 7, 8.5][rating] ?? 0;
}
function sectionScore(result, rating) {
  if (selectedExam === "toefl") {
    if (typeof rating === "number") return Math.round((rating / 4) * 30);
    return Math.round((result.correct / result.total) * 30);
  }
  if (typeof rating === "number") return bandForSelfRating(rating);
  return bandForRaw(result.correct);
}
function roundHalf(number) {
  return Math.round(number * 2) / 2;
}

$("#exam-form").addEventListener("submit", (event) => {
  event.preventDefault();
  if (isSubmitted) return;
  const missing = $$(".question-item").find((item) => !getAnswer(item));
  if (missing) {
    const panel = missing.closest("[data-section-panel]");
    showSection(panel.dataset.sectionPanel);
    missing.scrollIntoView({ behavior: "smooth", block: "center" });
    const input = $("input", missing);
    input?.focus();
    $("#progress-label").textContent = "Responde todas las preguntas antes de finalizar";
    return;
  }
  const emptyWriting = $$("[data-writing]").find((textarea) => !textarea.value.trim());
  if (emptyWriting) {
    showSection("writing");
    emptyWriting.focus();
    $("#progress-label").textContent = "Escribe una respuesta para cada tarea de Writing";
    return;
  }
  const missingRating = ["speaking-rating", "writing-rating"].find((id) => !$(`#${id}`).value);
  if (missingRating) {
    showSection(missingRating === "speaking-rating" ? "speaking" : "writing");
    $(`#${missingRating}`).focus();
    $("#progress-label").textContent = "Completa las autoevaluaciones antes de finalizar";
    return;
  }
  isSubmitted = true;
  showResults();
});

function showResults() {
  const reading = getObjectiveScores("reading-questions");
  const listening = getObjectiveScores("listening-questions");
  const speakingRating = Number($("#speaking-rating").value);
  const writingRating = Number($("#writing-rating").value);
  const scoreValues = {
    Reading: sectionScore(reading),
    Listening: sectionScore(listening),
    Speaking: sectionScore({}, speakingRating),
    Writing: sectionScore({}, writingRating)
  };
  const tiles = $("#score-sections");
  tiles.replaceChildren();
  Object.entries(scoreValues).forEach(([label, score]) => {
    const tile = document.createElement("div");
    tile.className = "score-tile";
    const name = document.createElement("span");
    name.textContent = label;
    const value = document.createElement("b");
    value.textContent = selectedExam === "toefl" ? `${score}/30` : score.toFixed(1);
    tile.append(name, value);
    tiles.append(tile);
  });
  if (selectedExam === "toefl") {
    const total = Object.values(scoreValues).reduce((sum, value) => sum + value, 0);
    $("#score-label").textContent = "TOEFL iBT · ESTIMACIÓN COMPARABLE 0–120";
    $("#total-score").textContent = `${total} / 120`;
    $("#cefr-result").textContent = `Equivalencia orientativa: ${cefrForToefl(total)}`;
    $("#results-disclaimer").textContent =
      "Estimación pedagógica en la escala comparable 0–120 solicitada; " +
      "ETS también informa resultados en su escala actual de 1–6.";
  } else {
    const average = roundHalf(Object.values(scoreValues).reduce((sum, value) => sum + value, 0) / 4);
    $("#score-label").textContent = "IELTS ACADEMIC · BANDA ESTIMADA";
    $("#total-score").textContent = average.toFixed(1);
    $("#cefr-result").textContent = `Nivel CEFR orientativo: ${cefrForBand(average)}`;
    $("#results-disclaimer").textContent = "Estimación pedagógica redondeada a bandas de 0.5; no equivale a una calificación oficial de IELTS.";
  }
  buildReview();
  $("#results").hidden = false;
  $("#results").scrollIntoView({ behavior: "smooth", block: "start" });
}

function cefrForToefl(total) {
  if (total >= 114) return "C2";
  if (total >= 95) return "C1";
  if (total >= 72) return "B2";
  if (total >= 42) return "B1";
  if (total >= 25) return "A2";
  return "A1 o inferior";
}

function buildReview() {
  const review = $("#answer-review");
  review.replaceChildren();
  [
    ["reading-questions", "Reading"],
    ["listening-questions", "Listening"]
  ].forEach(([id, title]) => {
    const group = document.createElement("details");
    group.className = "review-group";
    group.open = true;
    const summary = document.createElement("summary");
    const correct = getObjectiveScores(id);
    summary.textContent = `${title} · ${correct.correct} de ${correct.total} correctas`;
    group.append(summary);
    $$(".question-item", $(`#${id}`)).forEach((item) => {
      const result = document.createElement("div");
      result.className = "review-item";
      const isCorrect = answerIsCorrect(item, getAnswer(item));
      const status = document.createElement("span");
      status.className = `review-status${isCorrect ? "" : " wrong"}`;
      status.textContent = isCorrect ? "✓" : "×";
      const detail = document.createElement("div");
      const prompt = $("p", item).innerText.replace(/^PREGUNTA \d+\s*/, "").trim();
      const userAnswer = getAnswer(item);
      detail.innerHTML = "";
      const question = document.createElement("b");
      question.textContent = prompt;
      const answerLine = document.createElement("div");
      const selectedText = userAnswer
        ? comprehensionQuestions[Number(item.dataset.index)].options[userAnswer.charCodeAt(0) - 97]
        : "Sin respuesta";
      answerLine.textContent =
        `Tu respuesta: ${selectedText} · Respuesta esperada: ${correctAnswerText(item)}.`;
      const explanation = document.createElement("div");
      explanation.textContent = item.dataset.feedback;
      detail.append(question, answerLine, explanation);
      result.append(status, detail);
      group.append(result);
    });
    review.append(group);
  });
}

$("#restart-exam").addEventListener("click", () => {
  isSubmitted = false;
  $("#exam-form").reset();
  $("#results").hidden = true;
  $("#results-disclaimer").textContent = "Resultado orientativo, no oficial ni equivalente a una puntuación certificada.";
  $$(".skill-step").forEach((step) => step.classList.remove("complete"));
  renderQuestions();
  renderTasks();
  showSection("reading");
  updateProgress();
  $("#simulador").scrollIntoView({ behavior: "smooth", block: "start" });
});

$("#chooser-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const questions = ["goal", "destination", "format", "priority"];
  const unanswered = questions.find((name) => !new FormData(form).get(name));
  const result = $("#recommendation");
  result.hidden = false;
  if (unanswered) {
    result.textContent = "Responde las cuatro preguntas para recibir una orientación personalizada.";
    form.querySelector(`[name="${unanswered}"]`).focus();
    return;
  }
  const answers = new FormData(form);
  let toefl = 0;
  let ielts = 0;
  if (answers.get("goal") === "academic") { toefl += 1; ielts += 1; }
  if (answers.get("goal") === "work") { toefl += 1; ielts += 1; }
  if (answers.get("goal") === "migration") ielts += 1;
  if (answers.get("destination") === "north-america") toefl += 2;
  if (answers.get("destination") === "uk-australia") ielts += 2;
  if (answers.get("format") === "computer") toefl += 1;
  if (answers.get("format") === "interview") ielts += 1;
  if (answers.get("priority") === "digital") toefl += 1;
  if (answers.get("priority") === "flexible") ielts += 1;
  let recommendationText;
  if (answers.get("priority") === "requirements") {
    recommendationText = `
      <strong>Empieza por los requisitos de tu organización.</strong>
      Para estudio, empleo o migración, la certificación aceptada depende del país
      y del programa. Una vez confirmado, elige el formato que prefieras.
    `;
  } else if (toefl > ielts) {
    recommendationText = `
      <strong>TOEFL iBT podría ajustarse mejor a tus preferencias.</strong>
      Tus respuestas favorecen el formato digital y/o destinos donde suele ser
      aceptado. Verifica los requisitos concretos del programa.
    `;
  } else if (ielts > toefl) {
    recommendationText = `
      <strong>IELTS Academic podría ajustarse mejor a tus preferencias.</strong>
      Tus respuestas favorecen una entrevista oral y/o destinos donde suele ser
      aceptado. Para migración, verifica el tipo de IELTS específico requerido.
    `;
  } else {
    recommendationText = `
      <strong>Ambos exámenes podrían ser una opción.</strong>
      La decisión dependerá de cuál acepta tu institución o autoridad y del
      formato en el que te sientas más cómodo.
    `;
  }
  result.innerHTML = `<span class="result-label">TU ORIENTACIÓN · NO ES UN REQUISITO OFICIAL</span>${recommendationText}`;
});

$("#exam-form").addEventListener("input", updateProgress);
renderQuestions();
renderTasks();
updateProgress();

window.addEventListener("beforeunload", () => {
  recordings.forEach((entry) => {
    if (entry?.recorder.state === "recording") entry.recorder.stop();
    entry?.stream.getTracks().forEach((track) => track.stop());
  });
  recordingUrls.filter(Boolean).forEach((url) => URL.revokeObjectURL(url));
  recordingTimers.forEach((timer) => window.clearInterval(timer));
});
