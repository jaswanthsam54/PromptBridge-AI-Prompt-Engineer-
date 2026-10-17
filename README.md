# PromptBridge: Autonomous Universal AI Prompt Engineer

PromptBridge is an autonomous, universal input layer and AI prompt engineering cockpit. Instead of simple chatbot wrappers, PromptBridge intercepts raw, vague, slang, or broken human input, diagnoses what context is missing, asks rapid-tap clarifying questions, and mathematically constructs world-class Master Prompts ready to copy or launch in ChatGPT, Claude, Gemini, or DeepSeek.

---

## ⚡ Core Features

- **Ask First, Engineer Second**: Intelligent diagnostic engine that asks 1–4 high-leverage clarifying questions to resolve 80% ambiguity before prompt construction.
- **Dual-Engine Core (₹0 / 100% Free Tier)**:
  - **Primary**: Groq Cloud (`llama-3.3-70b-versatile`) for sub-second (< 0.5s) inference.
  - **Fallback**: Google Gemini (`gemini-2.0-flash`) via Google AI Studio.
- **Silent Framework Routing**: Autonomously selects the optimal prompt framework (11-POINT, CO-STAR, RISEN, RTF, RACE, BAB, CRISPE, etc.) based on task complexity.
- **Target LLM Syntactic Tuning**:
  - **Universal**: Clean markdown hierarchy compatible with any LLM.
  - **Claude**: Strict XML structural tags (`<role>`, `<context>`, `<constraints>`, `<output_format>`).
  - **ChatGPT**: Structured H2 headers with negative guardrails.
  - **DeepSeek**: Goal-framed, zero-bloat reasoning format.
- **Anti-Fluff Negative Shield**: Enforces strict negative constraints against AI clichés and lazy code truncations.
- **Private Local Storage**: All prompt history and starred prompts are stored locally in the browser (`localStorage`) with zero external database requirements.

---

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/jaswanthsam54/PromptBridge-AI-Prompt-Engineer-.git
cd PromptBridge-AI-Prompt-Engineer-
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
Add your free API key from [Groq Console](https://console.groq.com/keys):
```env
GROQ_API_KEY=gsk_your_groq_api_key_here
```

### 4. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🌐 Deployment

Deploy with 1-click on [Vercel](https://vercel.com):
1. Import your GitHub repository into Vercel.
2. In Project Settings, add `GROQ_API_KEY` under **Environment Variables**.
3. Click **Deploy**.
