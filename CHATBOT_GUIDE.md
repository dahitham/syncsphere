# 🤖 Task Assistant Chatbot

## Overview
The Task Assistant is an AI-powered chatbot integrated into your SyncSphere application. It helps users quickly get information about tasks, team members, deadlines, and project status without navigating through multiple pages.

## Features

### 📊 Task Information
- **Get task count**: "How many tasks do we have?"
- **View all tasks**: "Show me all tasks"
- **Check specific member's tasks**: "What tasks does [Member Name] have?"
- **Task status summary**: "How many tasks are in progress?"

### ⚠️ Overdue Tasks
- "Show me overdue tasks"
- "Which tasks are late?"
- "Display missed deadlines"

### 📅 Upcoming Deadlines
- "What tasks are due soon?"
- "Show me upcoming deadlines"
- "Which tasks are coming up?"
- Can specify deadlines for specific members: "When are [Member Name]'s deadlines?"

### 👥 Team Information
- "How many team members do we have?"
- "Show me all team members"
- "List the team"
- "How many members are in the team?"

### 👤 Member Details
- "Tell me about [Member Name]"
- "[Member Name]'s tasks"
- "How many tasks does [Member Name] have?"

## Quick Start

1. **Open the Chat**: Click the 💬 button in the bottom-right corner
2. **Ask a Question**: Type your question or click one of the quick question buttons
3. **Get Instant Answer**: The bot responds with relevant information from your tasks and team data

## Example Questions

### Basic Questions
- "How many tasks do we have?" → Shows total task count and breakdown by status
- "How many team members?" → Shows team size and member names
- "Show me overdue tasks" → Lists all late tasks with due dates

### Detailed Questions
- "What tasks does Marcus Webb have?" → Shows all tasks assigned to Marcus
- "When are Alexandra Chen's deadlines?" → Lists all deadlines for specific member
- "What are the upcoming deadlines?" → Shows next 5 tasks ordered by deadline

## How It Works

The chatbot uses:
1. **Natural Language Processing** - Understands keywords in your questions
2. **Context-Aware Responses** - Pulls real data from your tasks and team members
3. **Smart Classification** - Identifies what information you're looking for
4. **Formatted Output** - Presents data in easy-to-read, organized format

## Files Created

- `src/components/Chatbot.jsx` - Main chatbot UI component
- `src/services/ChatService.js` - NLP and data processing logic
- `src/styles/Chatbot.css` - Chatbot styling

## Future Enhancements

Potential features to add:
- Integration with real AI APIs (OpenAI, Claude)
- Voice input/output
- Task creation through chat
- Advanced analytics
- Team member workload analysis
- Smart task recommendations
- Scheduled reminders via chat
