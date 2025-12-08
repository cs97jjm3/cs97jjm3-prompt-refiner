# Quick Start Checklist

## ⚡ 5-Minute Setup

### Before You Start
- [ ] Node.js installed (check: `node --version`)
- [ ] Claude Desktop installed and working

### Step 1: Install MCPB
```bash
npm install -g @anthropic-ai/mcpb
```
- [ ] Verify: `mcpb --version` works

### Step 2: Download & Prepare
```bash
# Clone or download this repository
cd prompt-refiner

# Install dependencies
cd server
npm install
cd ..
```
- [ ] `node_modules` folder created in `server/`

### Step 3: Build Extension
```bash
mcpb pack
```
- [ ] `prompt-refiner.mcpb` file created

### Step 4: Install in Claude
- [ ] Double-click `prompt-refiner.mcpb` OR
- [ ] Drag into Claude Desktop Settings → Extensions
- [ ] Click "Install"

### Step 5: Restart Claude
- [ ] Fully close Claude Desktop (exit from system tray)
- [ ] Relaunch Claude Desktop

### Step 6: Test It
Open Claude and type:
```
refine this prompt: write a story about a dog
```

**Expected:** React artifact appears with 4 prompt variants

- [ ] Artifact displays
- [ ] 4 variants shown (Concise, Detailed, Creative, Analytical)
- [ ] Copy buttons work

---

## ✅ Success!

You should now see refined prompts with copy buttons.

**Database location:** `C:\Users\YourUsername\.prompt-refiner\prompt_refiner.db`

---

## 🔧 Optional: Change Database Location

**Only if you want to store data elsewhere:**

1. **Before building**, create `server/config.json`:
   ```json
   {
     "database_path": "C:\\Users\\YourName\\Documents\\prompts.db"
   }
   ```

2. **Then build and install** as above

3. See [README.md](README.md) for more configuration options

---

## 🆘 Something Wrong?

### Extension not appearing?
- Restart Claude Desktop completely (not just close window)
- Check Settings → Extensions

### npm install fails?
- Update Node.js: https://nodejs.org/
- Try: `npm cache clean --force`

### Prompts not refining?
- Explicitly ask: "refine this prompt: test"
- Try in a new chat
- Check extension is enabled in Settings

### Need help?
See full [README.md](README.md) for detailed troubleshooting.

---

## 📚 Next Steps

- Read [README.md](README.md) for full documentation
- See [INSTALLATION.md](INSTALLATION.md) for detailed setup
- Check `server/config.json.example` for configuration options

---

**That's it! Start refining prompts!** 🚀
