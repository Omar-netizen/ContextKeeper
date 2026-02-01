console.log('ContextKeeper: Loaded');

let saveButton = null;
let selectedText = '';
let isDialogOpen = false;

/* ================================
   TEXT SELECTION
================================ */

document.addEventListener('mouseup', handleSelection);
document.addEventListener('keyup', handleSelection);

function handleSelection() {
  if (isDialogOpen) return;

  const selection = window.getSelection();
  const text = selection.toString().trim();

  if (text.length > 10) {
    selectedText = text;
    showSaveButton(selection);
  } else {
    hideSaveButton();
  }
}

/* ================================
   FLOATING SAVE BUTTON
================================ */

function showSaveButton(selection) {
  hideSaveButton();
  if (!selection.rangeCount) return;

  const rect = selection.getRangeAt(0).getBoundingClientRect();

  saveButton = document.createElement('button');
  saveButton.id = 'ck-floating-save';
  saveButton.textContent = '💾 Save Context';

  saveButton.style.cssText = `
    position: fixed;
    top: ${rect.bottom + 8}px;
    left: ${rect.left}px;
    z-index: 2147483647;
    background: linear-gradient(135deg,#667eea,#764ba2);
    color: black;
    border: none;
    padding: 10px 16px;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    font-family: system-ui, -apple-system, BlinkMacSystemFont;
  `;

  // 🔥 CRITICAL: mousedown beats ChatGPT
  saveButton.addEventListener('mousedown', (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();

    console.log('ContextKeeper: Save pressed');

    isDialogOpen = true;
    showSaveDialog();
  });

  document.documentElement.appendChild(saveButton);
}

function hideSaveButton() {
  if (saveButton) {
    saveButton.remove();
    saveButton = null;
  }
}

/* ================================
   MODAL DIALOG
================================ */

function showSaveDialog() {
  const existing = document.getElementById('ck-overlay');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.id = 'ck-overlay';

  overlay.style.cssText = `
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.55);
    z-index: 2147483647;
    display: flex;
    align-items: center;
    justify-content: center;
    backdrop-filter: blur(4px);
  `;

  const dialog = document.createElement('div');
  dialog.style.cssText = `
    background: white;
    padding: 28px;
    border-radius: 12px;
    width: 90%;
    max-width: 480px;
    box-shadow: 0 20px 60px rgba(0,0,0,.3);
    font-family: system-ui, -apple-system, BlinkMacSystemFont;
  `;

  dialog.innerHTML = `
    <h2 style="margin-bottom:16px">Save Context</h2>

    <input id="ck-title" placeholder="Title"
      style="width:100%;padding:12px;border:2px solid #0c0b0b;color:black;border-radius:8px;margin-bottom:12px"/>

    <input id="ck-tags" placeholder="Tags (comma separated)"
      style="width:100%;padding:12px;border:2px solid #080707;color:black;border-radius:8px;margin-bottom:20px"/>

    <div style="display:flex;justify-content:flex-end;gap:10px">
      <button id="ck-cancel">Cancel</button>
      <button id="ck-save"
        style="background:#667eea;color:black;border:none;padding:10px 18px;border-radius:8px;font-weight:600">
        Save
      </button>
    </div>
  `;

  overlay.appendChild(dialog);
  document.documentElement.appendChild(overlay);

  setTimeout(() => document.getElementById('ck-title')?.focus(), 50);

  /* EVENTS */

  document.getElementById('ck-cancel').onmousedown = closeDialog;
  document.getElementById('ck-save').onmousedown = saveHandler;

  overlay.addEventListener('mousedown', (e) => {
    if (e.target === overlay) closeDialog(e);
  });

  dialog.addEventListener('mousedown', (e) => e.stopPropagation());
}

/* ================================
   HANDLERS
================================ */

function closeDialog(e) {
  e?.preventDefault();
  e?.stopImmediatePropagation();

  document.getElementById('ck-overlay')?.remove();
  hideSaveButton();
  isDialogOpen = false;
}

async function saveHandler(e) {
  e.preventDefault();
  e.stopImmediatePropagation();

  const title = document.getElementById('ck-title').value.trim();
  const tagsRaw = document.getElementById('ck-tags').value.trim();

  if (!title) {
    alert('Please enter a title');
    return;
  }

  const tags = tagsRaw
    ? tagsRaw.split(',').map(t => t.trim()).filter(Boolean)
    : [];

  await saveSnippet(title, selectedText, tags);

  closeDialog();
  showSuccess();
}

/* ================================
   STORAGE
================================ */

async function saveSnippet(title, content, tags) {
  const snippet = {
    id: generateId(),
    title,
    content,
    tags,
    created: Date.now()
  };

  const data = await chrome.storage.local.get('snippets');
  const snippets = data.snippets || [];

  snippets.push(snippet);
  await chrome.storage.local.set({ snippets });

  try {
    chrome.runtime.sendMessage({ type: 'SNIPPET_SAVED' });
  } catch {}
}

/* ================================
   UI FEEDBACK
================================ */

function showSuccess() {
  const n = document.createElement('div');
  n.textContent = '✓ Context saved';
  n.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #10b981;
    color: black;
    padding: 14px 20px;
    border-radius: 8px;
    font-weight: 600;
    z-index: 2147483647;
  `;
  document.documentElement.appendChild(n);
  setTimeout(() => n.remove(), 2000);
}

/* ================================
   UTIL
================================ */

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

/* ================================
   SAFETY CLEANUP
================================ */

document.addEventListener('mousedown', (e) => {
  if (isDialogOpen) return;

  if (saveButton && !saveButton.contains(e.target)) {
    if (!window.getSelection().toString().trim()) {
      hideSaveButton();
    }
  }
});

console.log('ContextKeeper: Ready');
