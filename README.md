# 🧠 MindCare – AI-Powered Health & Wellness Platform

MindCare is not just another journaling app — it’s something I built with the idea that mental health tracking should actually *understand you*, not just store your data.

Instead of giving generic suggestions, MindCare uses AI to analyze patterns in your daily thoughts, mood, and habits, and then responds in a way that feels more personal and meaningful.

---

## 🚀 Why MindCare?

While exploring apps like MindDoc, BetterMe, Quabble, and others, I noticed something common:

* They track data
* They provide structured exercises
* But they don’t truly *understand context over time*

That’s exactly the gap MindCare tries to solve.

---

## 💡 What Makes It Different?

MindCare introduces an **AI-driven, context-aware system** that:

* Remembers your past inputs
* Understands behavioral patterns
* Generates personalized insights instead of generic advice

It’s designed more like a **thinking assistant** rather than a simple app.

---

## ✨ Core Features

### 📝 Smart Journaling

* Rich text journaling with mood tracking
* Tags, metadata, and auto-save
* Word count & reading time

---

### 🤖 AI Health Assistant

* Built using **LangGraph-based workflow**
* Multi-step reasoning (not one-shot responses)
* Context-aware conversations across sessions

---

### 📊 Advanced Analytics Dashboard

* Mood trends and behavioral patterns
* Health score calculation
* Long-term insights visualization

---

### 🔄 Real-Time System

* Instant data sync
* Live UI updates
* Event-driven architecture

---

### 👤 User Profile System

* Health goals tracking
* Medical information
* Emergency contact storage

---

### 📬 Human-in-the-Loop (HITL)

* AI generates insights → user reviews
* Approve / Edit / Reject system
* Ensures safe and meaningful outputs

---

## 🧠 AI Architecture (How It Thinks)

MindCare uses a **LangGraph-powered AI agent** instead of a basic chatbot.

### Workflow:

1. Input (User journal or query)
2. Context Retrieval (past entries + metadata)
3. AI Processing (LLM reasoning)
4. Decision Making
5. Response Generation

This allows the system to:

* Maintain state across sessions
* Provide deeper insights
* Ask better follow-up questions

---

## ⚙️ Tech Stack

### Frontend

* Next.js 15
* React 19
* TypeScript
* Tailwind CSS
* shadcn/ui

### Backend & Database

* Supabase (PostgreSQL + Realtime)

### Authentication

* Clerk

### AI & Automation

* LangGraph
* OpenAI API

### UI/UX

* Framer Motion
* Lucide Icons

---

## 🔄 Data Flow

User → Authentication → Journal Entry
→ Database → AI Processing → Insights
→ Dashboard / Email Output

---

## 📊 Features Compared to Existing Apps

| Feature         | Existing Apps | MindCare             |
| --------------- | ------------- | -------------------- |
| Mood Tracking   | Basic         | AI Pattern Detection |
| Journaling      | Static        | Context-Aware AI     |
| AI Chat         | Simple        | Multi-step Reasoning |
| Analytics       | Graphs        | Behavioral Insights  |
| Personalization | Limited       | Dynamic & Adaptive   |
| Feedback        | None          | Human-in-the-Loop    |

---

## 🚀 Future Scope

* Wearable integration (health data sync)
* Voice-based journaling
* Predictive mental health alerts
* Offline AI mode
* Mobile app (React Native)

---

## 🧾 Installation

```bash
git clone https://github.com/your-username/mindcare.git
cd mindcare
npm install
npm run dev
```

---

## 🔐 Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
CLERK_SECRET_KEY=
OPENAI_API_KEY=
GMAIL_USER=
GMAIL_APP_PASSWORD=
```

---

## 🎯 Project Goal

The goal of MindCare is simple:

> To move from **data tracking → to self-understanding**

---

## 🙌 Final Note

This project was built with the idea that technology should not just automate tasks, but actually help people understand themselves better.

If this helps even one person feel more aware or supported — it’s worth it.

---

⭐ If you like the project, feel free to star it!
