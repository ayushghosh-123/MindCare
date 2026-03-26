
# 🧠 MindCare – AI-Powered Health & Wellness Platform

> A full-stack, AI-driven journaling and health analytics system that leverages LangGraph-based agents to deliver personalized, context-aware wellness insights.

---

## 🚀 Overview

MindCare is an intelligent health and wellness platform designed to help users track, analyze, and improve their mental and physical well-being.

It combines:

- 📓 Structured journaling  
- 📊 Real-time analytics  
- 🤖 AI agent-based insights  

Unlike traditional apps, MindCare uses **LangGraph-powered AI workflows** to provide stateful, personalized, and actionable recommendations.

---

## 🎯 Problem Statement

Many individuals struggle with:

- Inconsistent tracking of mental health and habits  
- Lack of awareness of behavioral patterns  
- Generic, non-personalized health advice  

Most existing solutions lack:

- Real-time insights  
- AI-driven personalization  
- Integrated journaling + analytics systems  

---

## 💡 Solution

MindCare provides a **data-driven self-awareness system** by combining:

- Structured journaling with metadata (mood, tags, habits)  
- Real-time analytics for behavioral tracking  
- LangGraph-based AI agent for contextual insights  

---

## ✨ Core Features

### 📝 Smart Journaling System

- Rich text editor with advanced formatting  
- Mood tracking (5-point scale)  
- Tag-based organization  
- Auto-save functionality  
- Reading time & word count  

---

### 🤖 AI Health Assistant (LangGraph Agent)

- Context-aware conversational assistant  
- Multi-step reasoning using LangGraph  
- Personalized health recommendations  
- Behavioral pattern detection  

---

### 📊 Advanced Analytics Dashboard

- Mood trend visualization  
- Sleep and activity tracking  
- Health score calculation  
- Long-term behavioral insights  

---

### 📁 Multi-Journal Management

- Create and manage multiple journals  
- Organize entries by category  
- Filter by mood, tags, and date  

---

### 👤 User Profile System

- Health goals tracking  
- Medical information storage  
- Emergency contact details  

---

## 🧠 AI Agent Architecture (LangGraph)

MindCare uses LangGraph to build a **stateful AI agent** capable of multi-step reasoning and contextual decision-making.

### 🔄 Workflow Pipeline

1. **Input Node**
   - Receives user query or journal entry  

2. **Context Retrieval Node**
   - Fetches relevant user history from Supabase  
   - Includes mood trends, past entries, and metadata  

3. **Processing Node (LLM)**
   - Generates insights using contextual data  

4. **Decision Node**
   - Determines next action:
     - Provide recommendation  
     - Ask follow-up questions  
     - Trigger deeper analysis  

5. **Response Node**
   - Returns structured and personalized output  

---

## ⚙️ Key Capabilities

- Stateful conversations across sessions  
- Multi-step reasoning workflows  
- Context-aware decision making  
- Modular and scalable agent design  

---

## 💡 Why LangGraph?

- Enables workflow-based AI systems  
- Provides better control over reasoning steps  
- Supports scalable, production-ready AI architecture  

---

## ⚙️ Technical Architecture

### 🔐 Authentication & Security

- Clerk authentication system  
- Secure session handling  
- Row Level Security (RLS) in Supabase  
- Privacy-first data architecture  

---

### 🗄️ Database Design

- Supabase PostgreSQL  
- Optimized schema for journaling and analytics  
- Indexed queries for performance  
- Real-time subscriptions  

---

### 🔄 Real-Time System

- Live synchronization of journal entries  
- Instant UI updates  
- Event-driven architecture  

---

## 🧰 Tech Stack

### Frontend
- Next.js 15  
- React 19  
- TypeScript  
- Tailwind CSS  
- shadcn/ui  

### Backend & Database
- Supabase (PostgreSQL + Realtime)  

### Authentication
- Clerk  

### AI & Automation
- LangGraph (Agent Workflow Orchestration)  
- OpenAI API (LLM Processing)  

### UI/UX
- Framer Motion  
- Lucide Icons  

---

## 🧠 AI Capabilities

- Context-aware response generation  
- Stateful conversations using LangGraph  
- Multi-step reasoning pipelines  
- Behavioral pattern recognition  
- Personalized recommendation engine  

---

## 📱 Application Structure

### Core Modules

- **Dashboard** → Overview and insights  
- **Diary** → Journal creation and management  
- **AI Assistant** → LangGraph-powered chatbot  
- **Analytics** → Data visualization and trends  
- **Profile** → User health data  

---

## 🔄 Data Flow

1. User authentication via Clerk  
2. Data stored securely in Supabase  
3. Journal entries enriched with metadata  
4. LangGraph agent processes contextual data  
5. AI generates insights and recommendations  
6. Analytics engine visualizes trends  

---

## 🎨 UI/UX Highlights

- Mobile-first responsive design  
- Clean and minimal interface  
- Accessible (WCAG compliant)  
- Smooth animations with Framer Motion  

---

## 📊 Health Metrics Tracked

- Mood trends  
- Sleep patterns  
- Activity levels  
- Basic nutrition tracking  

---
 
 ## 📬 Email Delivery & Human-in-the-Loop (HITL)
 
 MindCare implements a **Human-in-the-Loop** safety mechanism for all AI-generated wellness insights and reports.
 
 ### 🔄 Workflow
 1. **Generation** → The AI agent (Journaling or Report) drafts a response based on user data.
 2. **Evaluation** → The `evaluate_agent` node reviews the response for safety and empathy, then generates a structured review payload.
 3. **Approval** → The user receives the review card in the UI and can **Approve**, **Edit**, or **Reject** the draft.
 4. **Dispatch** → Once approved, the `email_agent` sends the final text to the user's primary email address via Gmail SMTP.
 
 ### ⚙️ Configuration
 To enable email delivery, ensure the following keys are set in your `.env.local`:
 - `GMAIL_USER` — Your Gmail address.
 - `GMAIL_APP_PASSWORD` — A 16-character App Password from Google Account settings.
 - `EMAIL_FROM` — The display name and email (e.g., `MindCare <your-email@gmail.com>`).
 - `MAIN_REPORT_EMAIL` — (Optional) A primary administrative address to receive copies of all reports.
 
 ---
 
 ## 🚀 Getting Started

### 1. Clone Repository

```bash
git clone https://github.com/your-username/mindcare.git
cd mindcare
```