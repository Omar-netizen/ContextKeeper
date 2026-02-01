# 📋 ContextKeeper - ChatGPT Memory Manager

> Save and reuse ChatGPT conversation snippets. Fight lag without losing context.

## Screenshots

<img width="550" height="746" alt="image" src="https://github.com/user-attachments/assets/9e5cc5f8-46b3-425d-8ece-d3c774c7f576" />
<img width="880" height="507" alt="image" src="https://github.com/user-attachments/assets/02f6ee4b-00cb-4413-8499-3af30c596c56" />

## 🎯 The Problem

Heavy ChatGPT users experience two critical pain points:

1. **Performance Degradation**: After 30+ messages, the interface becomes sluggish with typing lag
2. **Context Loss**: Starting a new chat (the only solution to lag) means manually copy-pasting context

## ✨ The Solution

ContextKeeper is a lightweight browser extension that lets you:

- 💾 **Save Context**: Select any text from ChatGPT conversations and save it as a snippet
- 📋 **Quick Copy**: One-click copy with smart formatting for easy context injection
- 🏷️ **Organize**: Tag and search your snippets for easy retrieval
- ✏️ **Edit**: Update snippets as your projects evolve
- 📊 **Track**: View statistics about your saved contexts
- 🔒 **Privacy-First**: All data stored locally - no external servers

## 🚀 Installation

### For Users (Chrome Web Store)
*Coming soon - extension pending approval*

### For Developers (Load Unpacked)

1. **Clone or Download** this repository
   ```bash
   git clone https://github.com/yourusername/ContextKeeper.git
   cd ContextKeeper
   ```

2. **Generate Icons**
   - Open `icon-generator.html` in your browser
   - Download all three icon sizes
   - Place them in the `icons/` folder

3. **Load in Chrome**
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top-right)
   - Click "Load unpacked"
   - Select the `ContextKeeper` folder
   - Extension is now installed! 🎉

## 📖 How to Use

### Saving Context

1. Go to [ChatGPT](https://chat.openai.com)
2. Have a conversation
3. **Select** any text you want to save
4. Click the **"💾 Save Context"** button that appears
5. Enter a title and optional tags
6. Click Save

### Using Saved Context

1. Click the **ContextKeeper icon** in your Chrome toolbar
2. Browse or search your saved snippets
3. Click **"📋 Copy"** on any snippet
4. Open a new ChatGPT chat
5. **Paste** (Ctrl+V / Cmd+V) into the message box
6. ChatGPT receives perfectly formatted context!

### Managing Snippets

- **Edit**: Click ✏️ to update title, content, or tags
- **Delete**: Click 🗑️ to remove a snippet
- **Search**: Use the search box to filter by title, content, or tags
- **Export**: Backup all snippets as JSON
- **Import**: Restore from a previous backup
- **Stats**: View your usage statistics

## 🎨 Features

### Current (v1.0)
- ✅ Text selection and saving
- ✅ Smart clipboard formatting
- ✅ Tag system for organization
- ✅ Search functionality
- ✅ Edit existing snippets
- ✅ Export/Import (JSON backup)
- ✅ Usage statistics
- ✅ Beautiful, responsive UI
- ✅ 100% local storage (privacy-focused)

### Planned (Future Versions)
- 🔲 Cloud sync across devices
- 🔲 Snippet templates
- 🔲 Folder organization
- 🔲 Keyboard shortcuts
- 🔲 Firefox support
- 🔲 Dark mode

## 🛠️ Technical Details

### Tech Stack
- **Manifest Version**: V3
- **Languages**: JavaScript, HTML, CSS
- **Storage**: `chrome.storage.local` (no backend required)
- **Permissions**: `storage`, `activeTab`, `clipboardWrite`

### File Structure
```
ContextKeeper/
├── manifest.json           # Extension configuration
├── popup/
│   ├── popup.html         # Extension popup UI
│   ├── popup.js           # Popup logic
│   └── popup.css          # Popup styles
├── content/
│   └── content.js         # ChatGPT page integration
├── background/
│   └── service-worker.js  # Background processes
├── icons/
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── README.md
```

### Data Structure
```javascript
{
  id: "unique-id",
  title: "Snippet Title",
  content: "The actual text content...",
  tags: ["tag1", "tag2"],
  created: 1706630400000,
  lastUsed: 1706630400000
}
```

## 🔒 Privacy & Security

- **100% Local**: All data stored in your browser using `chrome.storage.local`
- **No Tracking**: Zero analytics or telemetry
- **No External Servers**: No API calls, no cloud storage
- **Open Source**: Code is transparent and auditable
- **Minimal Permissions**: Only requests what's necessary

## 🐛 Troubleshooting

### Save button doesn't appear
- Make sure you're on `chat.openai.com` or `chatgpt.com`
- Try selecting more than 10 characters
- Reload the ChatGPT page

### Copy doesn't work
- Check if clipboard permissions are granted
- Try manually selecting and copying from the extension popup

### Extension icon not showing
- Make sure icons are in the `icons/` folder
- Icon files must be named exactly: `icon16.png`, `icon48.png`, `icon128.png`
- Reload the extension

## 🤝 Contributing

Contributions are welcome! Here's how:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 🙏 Acknowledgments

- Built to solve a real problem faced by ChatGPT power users
- Inspired by the need for better context management
- Thanks to the Chrome Extension development community

## 📧 Contact

Have questions or feedback? 

- **Email**: mdomarkhan314@gmail.com

## ⭐ Support

If you find ContextKeeper useful, please consider:
- Giving it a ⭐ on GitHub
- Sharing it with other ChatGPT users
- Contributing to the codebase
- Reporting bugs and suggesting features

---

**Made with ❤️ for the ChatGPT community**
