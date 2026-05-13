/**
 * Chat Service - Handles NLP and data querying for the chatbot
 */

class ChatService {
  constructor() {
    this.keywords = {
      tasks: ['task', 'tasks', 'work', 'todo', 'assignment', 'deliverable'],
      team: ['team', 'teams', 'group', 'members', 'people', 'staff'],
      deadline: ['deadline', 'due', 'due date', 'deadline', 'when', 'date'],
      status: ['status', 'progress', 'completed', 'finished', 'done'],
      member: ['member', 'members', 'person', 'people', 'person', 'assign'],
      count: ['how many', 'count', 'total', 'number', 'many'],
      overdue: ['overdue', 'late', 'missed', 'past due'],
      soon: ['soon', 'coming up', 'upcoming', 'next', 'this week'],
      lead: ['lead', 'leader', 'manager'],
    };
  }

  /**
   * Classify the user's question into categories
   */
  classifyQuestion(question) {
    const lower = question.toLowerCase();
    const classified = {
      isAboutTasks: false,
      isAboutTeam: false,
      isAboutDeadline: false,
      isAboutStatus: false,
      isAboutCount: false,
      isAboutOverdue: false,
      isAboutSoon: false,
      isAboutLead: false,
    };

    for (const [category, words] of Object.entries(this.keywords)) {
      if (words.some(word => lower.includes(word))) {
        classified[`isAbout${category.charAt(0).toUpperCase() + category.slice(1)}`] = true;
      }
    }

    return classified;
  }

  /**
   * Generate response based on question and app data
   */
  generateResponse(question, appData) {
    const classification = this.classifyQuestion(question);
    const lower = question.toLowerCase();

    // Extract mentioned member name if any
    const mentionedMember = appData.members.find(m =>
      lower.includes(m.name.toLowerCase())
    );

    // TASK-RELATED QUESTIONS
    if (classification.isAboutTasks) {
      if (lower.includes('how many')) {
        const totalCount = appData.tasks.length;
        return `There are ${totalCount} tasks in total. ${appData.tasks.filter(t => t.status === 'In Progress').length} are in progress, ${appData.tasks.filter(t => t.status === 'Finished').length} are finished, and ${appData.tasks.filter(t => t.status === 'Not Started').length} haven't started yet.`;
      }

      if (lower.includes('overdue') || lower.includes('late')) {
        const overdue = appData.getOverdueTasks?.() || [];
        if (overdue.length === 0) {
          return "Great news! There are no overdue tasks. Everything is on track! 🎉";
        }
        const tasksList = overdue.map(t => `• ${t.title} (${t.deadline})`).join('\n');
        return `You have ${overdue.length} overdue task(s):\n${tasksList}`;
      }

      if (lower.includes('due soon') || lower.includes('coming up')) {
        const dueSoon = appData.getDueSoonTasks?.() || [];
        if (dueSoon.length === 0) {
          return "No tasks are due in the next few days. You're all set!";
        }
        const tasksList = dueSoon.map(t => {
          const days = appData.daysDiff(t.deadline);
          return `• ${t.title} - Due in ${days} days (${t.deadline})`;
        }).join('\n');
        return `You have ${dueSoon.length} task(s) due soon:\n${tasksList}`;
      }

      if (mentionedMember) {
        const memberTasks = appData.tasks.filter(t => t.memberId === mentionedMember.id);
        if (memberTasks.length === 0) {
          return `${mentionedMember.name} doesn't have any tasks assigned.`;
        }
        const tasksList = memberTasks.map(t => `• ${t.title} (${t.status})`).join('\n');
        return `${mentionedMember.name} has ${memberTasks.length} task(s):\n${tasksList}`;
      }

      return `You currently have ${appData.tasks.length} tasks across the team. Would you like to know about a specific member's tasks or task status?`;
    }

    // TEAM & MEMBER QUESTIONS
    if (classification.isAboutTeam || classification.isAboutCount) {
      if (lower.includes('member') || lower.includes('people')) {
        if (lower.includes('how many')) {
          return `Your team has ${appData.members.length} members: ${appData.members.map(m => m.name).join(', ')}.`;
        }
        const membersList = appData.members.map(m => {
          const taskCount = appData.tasks.filter(t => t.memberId === m.id).length;
          return `• ${m.name} - ${taskCount} task(s)`;
        }).join('\n');
        return `Here are your team members:\n${membersList}`;
      }

      if (lower.includes('team')) {
        return `You have a team of ${appData.members.length} members. Would you like to know more about specific team members or their tasks?`;
      }
    }

    // DEADLINE QUESTIONS
    if (classification.isAboutDeadline) {
      if (mentionedMember) {
        const memberTasks = appData.tasks.filter(t => t.memberId === mentionedMember.id);
        if (memberTasks.length === 0) {
          return `${mentionedMember.name} doesn't have any tasks with deadlines.`;
        }
        const deadlines = memberTasks
          .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
          .map(t => `• ${t.title} - ${t.deadline}`)
          .join('\n');
        return `${mentionedMember.name}'s deadlines:\n${deadlines}`;
      }

      const upcomingTasks = appData.tasks
        .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
        .slice(0, 5);
      const deadlines = upcomingTasks.map(t => `• ${t.title} - ${t.deadline}`).join('\n');
      return `Upcoming deadlines:\n${deadlines}`;
    }

    // DEFAULT RESPONSE
    return `I can help you with questions about tasks, team members, deadlines, and project status. Try asking:\n• "How many tasks do we have?"\n• "Show me overdue tasks"\n• "What's ${appData.members[0]?.name}'s tasks?"\n• "How many team members are there?"`;
  }

  /**
   * Main chat method
   */
  chat(userMessage, appData) {
    if (!userMessage.trim()) {
      return "Please ask me something about your tasks and team!";
    }

    return this.generateResponse(userMessage, appData);
  }
}

export default new ChatService();
