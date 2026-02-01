// Load and display snippets
async function loadSnippets() {
  const { snippets = [] } = await chrome.storage.local.get('snippets');
  displaySnippets(snippets);
}

// Display snippets in the UI
function displaySnippets(snippets) {
  const container = document.getElementById('snippetsList');
  
  if (snippets.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <p>No saved contexts yet</p>
        <small>Select text on ChatGPT and click "Save Context"</small>
      </div>
    `;
    return;
  }

  container.innerHTML = snippets
    .sort((a, b) => b.created - a.created)
    .map(snippet => createSnippetCard(snippet))
    .join('');

  // Add event listeners to buttons
  addSnippetEventListeners();
}

// Create HTML for a snippet card
function createSnippetCard(snippet) {
  const date = new Date(snippet.created).toLocaleDateString();
  const preview = snippet.content.substring(0, 150) + (snippet.content.length > 150 ? '...' : '');
  const tags = snippet.tags || [];

  return `
    <div class="snippet-card" data-id="${snippet.id}">
      <div class="snippet-header">
        <div class="snippet-title">${escapeHtml(snippet.title)}</div>
        <div class="snippet-date">${date}</div>
      </div>
      <div class="snippet-content">${escapeHtml(preview)}</div>
      ${tags.length > 0 ? `
        <div class="snippet-tags">
          ${tags.map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join('')}
        </div>
      ` : ''}
      <div class="snippet-actions">
        <button class="btn btn-primary copy-btn" data-id="${snippet.id}">📋 Copy</button>
        <button class="btn btn-secondary edit-btn" data-id="${snippet.id}">✏️ Edit</button>
        <button class="btn btn-danger delete-btn" data-id="${snippet.id}">🗑️</button>
      </div>
    </div>
  `;
}

// Add event listeners to snippet buttons
function addSnippetEventListeners() {
  // Copy buttons
  document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const id = e.target.dataset.id;
      await copySnippet(id);
    });
  });

  // Edit buttons
  document.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const id = e.target.dataset.id;
      await editSnippet(id);
    });
  });

  // Delete buttons
  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const id = e.target.dataset.id;
      await deleteSnippet(id);
    });
  });
}

// Copy snippet to clipboard with formatting
async function copySnippet(id) {
  const { snippets = [] } = await chrome.storage.local.get('snippets');
  const snippet = snippets.find(s => s.id === id);
  
  if (!snippet) return;

  const formattedText = `Continue from this previous conversation context:

---
${snippet.content}
---

Please acknowledge you've received this context, then I'll ask my next question.`;

  try {
    await navigator.clipboard.writeText(formattedText);
    showToast('✓ Copied to clipboard!');
    
    // Update last used timestamp
    snippet.lastUsed = Date.now();
    await chrome.storage.local.set({ snippets });
  } catch (err) {
    console.error('Failed to copy:', err);
    showToast('❌ Failed to copy', true);
  }
}

// Edit a snippet
async function editSnippet(id) {
  const { snippets = [] } = await chrome.storage.local.get('snippets');
  const snippet = snippets.find(s => s.id === id);
  
  if (!snippet) return;

  // Create edit modal
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal-content">
      <h2>Edit Snippet</h2>
      <input 
        type="text" 
        id="edit-title" 
        class="edit-input"
        value="${escapeHtml(snippet.title)}"
        placeholder="Title"
      />
      <textarea 
        id="edit-content" 
        class="edit-textarea"
        placeholder="Content"
      >${escapeHtml(snippet.content)}</textarea>
      <input 
        type="text" 
        id="edit-tags" 
        class="edit-input"
        value="${(snippet.tags || []).join(', ')}"
        placeholder="Tags (comma-separated)"
      />
      <div class="modal-actions">
        <button class="btn btn-secondary" id="cancel-edit">Cancel</button>
        <button class="btn btn-primary" id="save-edit">Save Changes</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  // Focus title
  setTimeout(() => document.getElementById('edit-title').focus(), 100);

  // Handle cancel
  document.getElementById('cancel-edit').addEventListener('click', () => {
    modal.remove();
  });

  // Handle save
  document.getElementById('save-edit').addEventListener('click', async () => {
    const title = document.getElementById('edit-title').value.trim();
    const content = document.getElementById('edit-content').value.trim();
    const tagsInput = document.getElementById('edit-tags').value.trim();

    if (!title || !content) {
      showToast('❌ Title and content required', true);
      return;
    }

    const tags = tagsInput 
      ? tagsInput.split(',').map(t => t.trim()).filter(t => t)
      : [];

    // Update snippet
    snippet.title = title;
    snippet.content = content;
    snippet.tags = tags;

    await chrome.storage.local.set({ snippets });
    modal.remove();
    loadSnippets();
    showToast('✓ Snippet updated');
  });

  // Close on overlay click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  });
}

// Delete a snippet
async function deleteSnippet(id) {
  if (!confirm('Delete this snippet?')) return;

  const { snippets = [] } = await chrome.storage.local.get('snippets');
  const filtered = snippets.filter(s => s.id !== id);
  await chrome.storage.local.set({ snippets: filtered });
  loadSnippets();
  showToast('✓ Snippet deleted');
}

// Clear all snippets
async function clearAll() {
  if (!confirm('Delete ALL snippets? This cannot be undone.')) return;

  await chrome.storage.local.set({ snippets: [] });
  loadSnippets();
  showToast('✓ All snippets cleared');
}

// Export snippets to JSON
async function exportSnippets() {
  const { snippets = [] } = await chrome.storage.local.get('snippets');
  
  if (snippets.length === 0) {
    showToast('❌ No snippets to export', true);
    return;
  }

  const dataStr = JSON.stringify(snippets, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `contextkeeper-backup-${Date.now()}.json`;
  link.click();
  
  URL.revokeObjectURL(url);
  showToast('✓ Snippets exported');
}

// Import snippets from JSON
async function importSnippets() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'application/json';
  
  input.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const text = await file.text();
      const imported = JSON.parse(text);

      if (!Array.isArray(imported)) {
        throw new Error('Invalid format');
      }

      const { snippets = [] } = await chrome.storage.local.get('snippets');
      
      // Merge and avoid duplicates
      const merged = [...snippets];
      let addedCount = 0;

      imported.forEach(snippet => {
        if (!merged.find(s => s.id === snippet.id)) {
          merged.push(snippet);
          addedCount++;
        }
      });

      await chrome.storage.local.set({ snippets: merged });
      loadSnippets();
      showToast(`✓ Imported ${addedCount} snippets`);
    } catch (err) {
      console.error('Import failed:', err);
      showToast('❌ Import failed - invalid file', true);
    }
  });

  input.click();
}

// Search functionality
function setupSearch() {
  const searchInput = document.getElementById('searchInput');
  
  searchInput.addEventListener('input', async (e) => {
    const query = e.target.value.toLowerCase();
    const { snippets = [] } = await chrome.storage.local.get('snippets');
    
    const filtered = snippets.filter(s => 
      s.title.toLowerCase().includes(query) ||
      s.content.toLowerCase().includes(query) ||
      (s.tags || []).some(tag => tag.toLowerCase().includes(query))
    );
    
    displaySnippets(filtered);
  });
}

// Show stats
async function showStats() {
  const { snippets = [] } = await chrome.storage.local.get('snippets');
  
  const totalSnippets = snippets.length;
  const totalChars = snippets.reduce((sum, s) => sum + s.content.length, 0);
  const allTags = snippets.flatMap(s => s.tags || []);
  const uniqueTags = [...new Set(allTags)].length;

  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal-content stats-modal">
      <h2>📊 Your Statistics</h2>
      <div class="stat-item">
        <span class="stat-label">Total Snippets:</span>
        <span class="stat-value">${totalSnippets}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Total Characters:</span>
        <span class="stat-value">${totalChars.toLocaleString()}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Unique Tags:</span>
        <span class="stat-value">${uniqueTags}</span>
      </div>
      <div class="modal-actions">
        <button class="btn btn-primary" id="close-stats">Close</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  document.getElementById('close-stats').addEventListener('click', () => {
    modal.remove();
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  });
}

// Show toast notification
function showToast(message, isError = false) {
  const toast = document.createElement('div');
  toast.className = 'success-toast';
  toast.textContent = message;
  if (isError) toast.style.background = '#ef4444';
  
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.remove();
  }, 2000);
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  loadSnippets();
  setupSearch();
  
  // Event listeners
  document.getElementById('clearAll').addEventListener('click', clearAll);
  
  // Add export/import/stats buttons to footer
  const footer = document.querySelector('footer');
  footer.innerHTML = `
    <div style="display: flex; gap: 8px; flex-wrap: wrap; justify-content: center;">
      <button id="exportBtn" class="btn btn-secondary" style="font-size: 11px; padding: 6px 12px;">📤 Export</button>
      <button id="importBtn" class="btn btn-secondary" style="font-size: 11px; padding: 6px 12px;">📥 Import</button>
      <button id="statsBtn" class="btn btn-secondary" style="font-size: 11px; padding: 6px 12px;">📊 Stats</button>
      <button id="clearAll" class="btn btn-danger" style="font-size: 11px; padding: 6px 12px;">🗑️ Clear All</button>
    </div>
  `;

  document.getElementById('exportBtn').addEventListener('click', exportSnippets);
  document.getElementById('importBtn').addEventListener('click', importSnippets);
  document.getElementById('statsBtn').addEventListener('click', showStats);
  document.getElementById('clearAll').addEventListener('click', clearAll);
});

// Listen for updates from content script
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'SNIPPET_SAVED') {
    loadSnippets();
  }
});