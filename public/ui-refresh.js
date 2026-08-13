(() => {
  const VERSION = "1.1.3-ui-sync";
  const root = document.getElementById("root");
  if (!root) return;
  window.__AFTERPARTY_UI_REFRESH = VERSION;

  const normalize = (value) => String(value || "").replace(/\s+/g, " ").trim();
  const buttons = () => Array.from(root.querySelectorAll("button"));
  const exactButton = (label) => buttons().find((button) => normalize(button.textContent) === label);
  const screen = () => root.firstElementChild;

  const iconSvgs = {
    truth_dare: `<svg viewBox="0 0 64 64" fill="none" aria-hidden="true"><path d="M7 12h29a8 8 0 0 1 8 8v12a8 8 0 0 1-8 8H22L12 50V40H7a7 7 0 0 1-7-7V20a8 8 0 0 1 7-8Z" stroke="currentColor" stroke-width="4"/><path d="m43 21 13-7-5 13h8L43 50l5-16h-8l3-13Z" fill="currentColor"/></svg>`,
    questions: `<svg viewBox="0 0 64 64" fill="none" aria-hidden="true"><circle cx="32" cy="32" r="26" stroke="currentColor" stroke-width="4"/><path d="M23 24c1-7 17-10 20-1 3 10-11 10-11 18" stroke="currentColor" stroke-width="5" stroke-linecap="round"/><circle cx="32" cy="49" r="3" fill="currentColor"/></svg>`,
    tiptoe: `<svg viewBox="0 0 64 64" fill="none" aria-hidden="true"><ellipse cx="22" cy="35" rx="9" ry="15" transform="rotate(15 22 35)" stroke="currentColor" stroke-width="4"/><circle cx="14" cy="16" r="3.6" fill="currentColor"/><circle cx="20" cy="12" r="3.3" fill="currentColor"/><circle cx="26" cy="12" r="3" fill="currentColor"/><circle cx="31" cy="15" r="2.7" fill="currentColor"/><ellipse cx="43" cy="38" rx="8" ry="13" transform="rotate(-18 43 38)" stroke="currentColor" stroke-width="4"/><circle cx="50" cy="21" r="3.2" fill="currentColor"/><circle cx="45" cy="17" r="3" fill="currentColor"/><circle cx="40" cy="17" r="2.8" fill="currentColor"/><circle cx="36" cy="20" r="2.5" fill="currentColor"/></svg>`
  };

  const gameTiles = [
    { id: "truth_dare", label: "Truth or Dare", subtitle: "Classic turns · five vibes", accent: "#ff5aa8" },
    { id: "questions", label: "Questions", subtitle: "Conversation · votes · reveals", accent: "#9b78ff" },
    { id: "tiptoe", label: "Tiptoe", subtitle: "Clues · timer · team score", accent: "#7df0d2" }
  ];

  const choiceMeta = {
    "Mild": { cls: "ap-vibe-mild", symbol: "✦", subtitle: "Playful · funny · low stakes" },
    "Bold": { cls: "ap-vibe-bold", symbol: "ϟ", subtitle: "Confessions · attraction · social risk" },
    "Couples": { cls: "ap-vibe-couples", symbol: "♥", subtitle: "Chemistry · flirting · connection" },
    "Couples / Flirty": { cls: "ap-vibe-couples", symbol: "♥", subtitle: "Chemistry · flirting · connection" },
    "Spicy 21+": { cls: "ap-vibe-spicy", symbol: "◒", subtitle: "Adult chemistry · intimacy · heat" },
    "Wild 21+": { cls: "ap-vibe-wild", symbol: "♛", subtitle: "Highest intensity · after-hours chaos" }
  };

  const displayMeta = {
    "TV + Phones": { symbol: "▣", subtitle: "TV is the shared board · phones join by QR" },
    "Multi-Device": { symbol: "◫", subtitle: "Each player uses their own phone" },
    "TV Only": { symbol: "▰", subtitle: "Fire TV / shared screen only" },
    "Pass & Play": { symbol: "↻", subtitle: "One device passed around the room" }
  };

  const gameMeta = {
    "Truth or Dare": { symbol: "⚡", subtitle: "Truths and dares across five vibes" },
    "Questions": { symbol: "?", subtitle: "Questions across the same five vibes" },
    "Tiptoe": { symbol: "⌁", subtitle: "Team clue game with timer and scoring" }
  };

  const formatMeta = {
    "Individual": { symbol: "●", subtitle: "Everyone plays for themselves" },
    "Teams": { symbol: "◆", subtitle: "Split the room into sides" },
    "Teams — required for Tiptoe": { symbol: "◆", subtitle: "Tiptoe always uses team play" }
  };

  function markCard(button, className, meta) {
    if (!button || !meta) return;
    button.classList.add(className);
    button.dataset.apSymbol = meta.symbol || "✦";
    button.dataset.apSubtitle = meta.subtitle || "";
  }

  function launchGame(game) {
    const nativeNewGame = exactButton("New Game");
    if (!nativeNewGame) return;
    nativeNewGame.click();
    let attempts = 0;
    const timer = window.setInterval(() => {
      attempts += 1;
      const option = exactButton(game.label);
      const heading = Array.from(root.querySelectorAll("h1,h2")).find((item) => normalize(item.textContent) === "Choose the game");
      if (heading && option) {
        option.click();
        window.clearInterval(timer);
        window.setTimeout(() => {
          const continueButton = exactButton("Continue");
          if (continueButton) continueButton.click();
        }, 80);
      } else if (attempts > 24) {
        window.clearInterval(timer);
      }
    }, 50);
  }

  function enhanceHome() {
    const nativeNewGame = exactButton("New Game");
    const title = Array.from(root.querySelectorAll("h1")).find((item) => normalize(item.textContent) === "Afterparty");
    if (!nativeNewGame || !title) return false;
    const top = screen();
    top?.classList.add("ap-home-screen");
    nativeNewGame.classList.add("ap-native-new-game");

    const copy = title.parentElement?.querySelector("p");
    if (copy && copy.dataset.apRefreshed !== VERSION) {
      copy.textContent = "Pick the energy, choose how the room is playing, and let Afterparty keep the night moving.";
      copy.dataset.apRefreshed = VERSION;
    }

    if (!top.querySelector(".ap-game-picker")) {
      const actionStack = nativeNewGame.parentElement;
      const picker = document.createElement("section");
      picker.className = "ap-game-picker";
      picker.setAttribute("aria-label", "Choose a game");
      picker.innerHTML = `<div class="ap-game-picker__eyebrow">GAME</div><div class="ap-game-picker__title">What are we playing?</div><div class="ap-game-picker__grid"></div>`;
      const grid = picker.querySelector(".ap-game-picker__grid");
      gameTiles.forEach((game) => {
        const tile = document.createElement("button");
        tile.type = "button";
        tile.className = "ap-game-tile";
        tile.dataset.game = game.id;
        tile.style.setProperty("--tile-accent", game.accent);
        tile.setAttribute("aria-label", `Start ${game.label} setup`);
        tile.innerHTML = `<span class="ap-game-tile__icon">${iconSvgs[game.id]}</span><strong>${game.label}</strong><small>${game.subtitle}</small>`;
        tile.addEventListener("click", () => launchGame(game));
        grid.appendChild(tile);
      });
      actionStack?.parentElement?.insertBefore(picker, actionStack);
    }
    return true;
  }

  function enhanceWizard() {
    const headings = Array.from(root.querySelectorAll("h2")).map((item) => normalize(item.textContent));
    const wizardHeading = headings.find((value) => [
      "Choose the game", "Choose the play format", "Choose the display mode", "Choose the content vibe", "Choose a Topic Pack", "Add players", "Create the room", "Teams or Pair Play", "Name and assign teams", "Review and ready"
    ].includes(value));
    if (!wizardHeading) return false;
    screen()?.classList.add("ap-setup-screen");

    buttons().forEach((button) => {
      const label = normalize(button.textContent);
      if (choiceMeta[label]) {
        markCard(button, "ap-choice-card", choiceMeta[label]);
        button.classList.add(choiceMeta[label].cls);
      }
      if (displayMeta[label]) markCard(button, "ap-display-option", displayMeta[label]);
      if (gameMeta[label]) markCard(button, "ap-game-option", gameMeta[label]);
      if (formatMeta[label]) markCard(button, "ap-play-format-option", formatMeta[label]);
    });
    return true;
  }

  function enhanceLobby() {
    const roomCodeNode = Array.from(root.querySelectorAll("div,span")).find((node) => /^[A-Z]{4}$/.test(normalize(node.textContent)) && node.children.length === 0);
    if (roomCodeNode) roomCodeNode.classList.add("ap-room-code");

    const svg = root.querySelector('svg[aria-label*="QR"], div[aria-label*="QR"] svg');
    if (svg) {
      let panel = svg.parentElement;
      for (let i = 0; i < 4 && panel?.parentElement; i += 1) {
        const panelText = normalize(panel.textContent);
        if (panelText.includes("Latest pending invite") || panelText.includes("Create an invite") || panelText.includes("http")) break;
        panel = panel.parentElement;
      }
      panel?.classList.add("ap-qr-panel");
    }

    buttons().forEach((button) => {
      const label = normalize(button.textContent);
      if (choiceMeta[label]) {
        markCard(button, "ap-choice-card", choiceMeta[label]);
        button.classList.add(choiceMeta[label].cls);
      }
      if (displayMeta[label]) markCard(button, "ap-display-option", displayMeta[label]);
      if (gameMeta[label]) markCard(button, "ap-game-option", gameMeta[label]);
    });
  }

  function enhance() {
    const top = screen();
    if (!top) return;
    top.classList.remove("ap-home-screen", "ap-setup-screen");
    if (!enhanceHome()) enhanceWizard();
    enhanceLobby();
  }

  let queued = false;
  const observer = new MutationObserver(() => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      enhance();
    });
  });
  observer.observe(root, { childList: true, subtree: true, characterData: true });
  enhance();
})();
