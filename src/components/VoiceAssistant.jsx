import React, { useEffect, useRef, useState } from 'react';
import { useApp } from '../context/AppContext';

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

const getDefaultDeadline = () => {
  const date = new Date();
  date.setDate(date.getDate() + 3);
  return date.toISOString().slice(0, 10);
};

// Reusable speak function using Web Speech API
const speak = (text, voiceEnabled = true) => {
  if (!voiceEnabled || !window.speechSynthesis) return;
  const speech = new SpeechSynthesisUtterance(text);
  speech.lang = 'en-US';
  speech.rate = 1;
  speech.pitch = 1;
  window.speechSynthesis.cancel(); // Cancel any ongoing speech
  window.speechSynthesis.speak(speech);
};

export default function VoiceAssistant() {
  const {
    addTask,
    tasks,
    updateTaskStatus,
    removeTask,
    addMember,
    updateTaskMember,
    removeAllTasks,
    members,
  } = useApp();
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [status, setStatus] = useState('Try: Add task, Start task, Complete task, Show pending tasks, Delete task, Show progress');
  const [actionMessage, setActionMessage] = useState('');
  const [voiceEnabled, setVoiceEnabled] = useState(true); // Toggle for voice feedback
  const recognitionRef = useRef(null);

  const findTask = (name) => {
    // Clean up the name by removing punctuation and extra spaces
    const cleanName = name.toLowerCase().replace(/[.,!?;:]/g, '').trim();
    if (!cleanName) return null;
    
    return tasks.find(task => 
      task.title.toLowerCase().replace(/[.,!?;:]/g, '').includes(cleanName)
    );
  };

  const getAvailableTasks = () => {
    if (tasks.length === 0) return 'You have no tasks. Say "Add task [task name]" to create one.';
    return `Available tasks: ${tasks.map(t => `"${t.title}"`).join(', ')}.`;
  };

  const findMember = (name) => {
    // Clean up the name by removing punctuation and extra spaces
    const cleanName = name.toLowerCase().replace(/[.,!?;:]/g, '').trim();
    if (!cleanName) return null;
    
    // Try exact word match first
    return members.find(member => {
      const memberNameClean = member.name.toLowerCase().replace(/[.,!?;:]/g, '');
      // Check if any word in the member name matches any word in the search name
      const memberWords = memberNameClean.split(/\s+/);
      const searchWords = cleanName.split(/\s+/);
      return searchWords.some(word => memberNameClean.includes(word));
    });
  };

  const setResponse = (message) => {
    setActionMessage(message);
    setStatus(message);
    speak(message, voiceEnabled); // Speak the response if voice is enabled
  };

  useEffect(() => {
    if (!SpeechRecognition) {
      setStatus('Speech recognition is not supported in this browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setListening(true);
      setStatus('Listening... Speak clearly now.');
      setActionMessage('');
    };

    recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;

        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }

      // Display interim results while speaking
      setTranscript(finalTranscript || interimTranscript);

      // Process command when speech is finalized
      if (finalTranscript) {
        processCommand(finalTranscript.trim());
      }
    };

    recognition.onerror = (event) => {
      const errorMessage = event.error === 'no-speech' 
        ? 'I did not hear anything. Please try again.'
        : event.error === 'network'
        ? 'Network error occurred. Please check your connection.'
        : event.error === 'not-allowed'
        ? 'Microphone access denied. Please allow microphone access in your browser settings.'
        : event.error === 'audio-capture'
        ? 'No microphone found. Please connect a microphone.'
        : `Voice recognition error: ${event.error}. Please try again.`;
      setStatus(errorMessage);
      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
      setStatus('Tap the mic to listen again.');
    };

    recognitionRef.current = recognition;
    return () => {
      recognition.abort();
    };
  }, []);

  const extractAfter = (text, phrase) => {
    const idx = text.indexOf(phrase);
    if (idx === -1) return '';
    return text.slice(idx + phrase.length).trim();
  };

  const processCommand = (text) => {
    const lowerText = text.toLowerCase();
    let match;

    if (/^(add|create|new) task[,.]?\s+(.+)/.test(lowerText)) {
      match = lowerText.match(/^(?:add|create|new) task[,.]?\s+(.+)/);
      const title = match ? text.slice(match.index + match[0].indexOf(match[1])).trim() : extractAfter(text, 'task ');
      if (!title) {
        setResponse('Could not find a task name. Say "Add task [task name]".');
        return;
      }
      addTask({ title, memberId: null, deadline: getDefaultDeadline() });
      setResponse(`✓ Task added: "${title}".`);
      return;
    }

    if (/^(start|finish|complete|mark task|set task).+/.test(lowerText)) {
      if (/^start task[,.]?\s*$/.test(lowerText)) {
        // User said just "Start task" without specifying a task name
        setResponse('Which task would you like to start? Please say "Start task [task name]".');
        return;
      }

      if (/^start task[,.]?\s+(.+)/.test(lowerText)) {
        match = lowerText.match(/^start task[,.]?\s+(.+)/);
        const name = match[1];
        const task = findTask(name);
        if (!task) { 
          setResponse(`Could not find task. ${getAvailableTasks()}`);
          return; 
        }
        updateTaskStatus(task.id, 'In Progress');
        setResponse(`✓ Task "${task.title}" is now In Progress.`);
        return;
      }

      if (/^(finish|complete) task[,.]?\s*$/.test(lowerText)) {
        // User said just "Complete/Finish task" without specifying a task name
        setResponse('Which task would you like to complete? Please say "Complete task [task name]".');
        return;
      }

      if (/^(finish|complete) task[,.]?\s+(.+)/.test(lowerText)) {
        match = lowerText.match(/^(?:finish|complete) task[,.]?\s+(.+)/);
        const name = match[1];
        const task = findTask(name);
        if (!task) { 
          setResponse(`Could not find task. ${getAvailableTasks()}`);
          return; 
        }
        updateTaskStatus(task.id, 'Finished');
        setResponse(`✓ Task "${task.title}" marked as finished.`);
        return;
      }

      if (/mark task[,.]?\s+(.+)\s+as completed/.test(lowerText)) {
        match = lowerText.match(/mark task[,.]?\s+(.+)\s+as completed/);
        const name = match[1];
        const task = findTask(name);
        if (!task) { 
          setResponse(`Could not find task. ${getAvailableTasks()}`);
          return; 
        }
        updateTaskStatus(task.id, 'Finished');
        setResponse(`✓ Task "${task.title}" marked as completed.`);
        return;
      }

      if (/^set task[,.]?\s+(.+)\s+to pending/.test(lowerText)) {
        match = lowerText.match(/^set task[,.]?\s+(.+)\s+to pending/);
        const name = match[1];
        const task = findTask(name);
        if (!task) { 
          setResponse(`Could not find task. ${getAvailableTasks()}`);
          return; 
        }
        updateTaskStatus(task.id, 'Not Started');
        setResponse(`✓ Task "${task.title}" set to pending.`);
        return;
      }
    }

    if (/^(delete|remove) task[,.]?\s*$/.test(lowerText)) {
      // User said just "Delete/Remove task" without specifying a task name
      setResponse('Which task would you like to delete? Please say "Delete task [task name]".');
      return;
    }

    if (/^(delete|remove) task[,.]?\s+(.+)/.test(lowerText)) {
      match = lowerText.match(/^(?:delete|remove) task[,.]?\s+(.+)/);
      const name = match[1];
      const task = findTask(name);
      if (!task) { 
        setResponse(`Could not find task. ${getAvailableTasks()}`);
        return; 
      }
      removeTask(task.id);
      setResponse(`✓ Task "${task.title}" deleted.`);
      return;
    }

    if (/clear\s+all\s+tasks?/.test(lowerText)) {
      removeAllTasks();
      setResponse('✓ All tasks have been cleared.');
      return;
    }

    if (/show\s+all\s+tasks?/.test(lowerText) || /what\s+tasks?.*do\s+i\s+have/.test(lowerText) || /tell\s+me\s+all\s+tasks?/.test(lowerText)) {
      setResponse(`There are ${tasks.length} tasks total.`);
      return;
    }

    if (/show\s+tasks?$/.test(lowerText)) {
      setResponse(`There are ${tasks.length} tasks total.`);
      return;
    }

    if (/show\s+(the\s+)?pending\s+tasks?/.test(lowerText) || /what\s+are\s+(the\s+)?pending\s+tasks?/.test(lowerText)) {
      const pending = tasks.filter(task => task.status !== 'Finished').length;
      setResponse(`You have ${pending} pending task${pending === 1 ? '' : 's'}.`);
      return;
    }

    if (/show\s+(the\s+)?completed\s+tasks?/.test(lowerText) || /show\s+(the\s+)?done\s+tasks?/.test(lowerText) || /what\s+are\s+(the\s+)?completed\s+tasks?/.test(lowerText)) {
      const completed = tasks.filter(task => task.status === 'Finished').length;
      setResponse(`You have ${completed} completed task${completed === 1 ? '' : 's'}.`);
      return;
    }

    if (/show\s+(the\s+)?overdue\s+tasks?/.test(lowerText) || /what\s+are\s+(the\s+)?overdue\s+tasks?/.test(lowerText)) {
      const overdue = tasks.filter(task => task.status !== 'Finished' && new Date(task.deadline) < new Date()).length;
      setResponse(`You have ${overdue} overdue task${overdue === 1 ? '' : 's'}.`);
      return;
    }

    if (/show tasks for[,.]?\s+(.+)/.test(lowerText)) {
      match = lowerText.match(/show tasks for[,.]?\s+(.+)/);
      const name = match[1];
      const member = findMember(name);
      if (!member) { setResponse(`Could not find member "${name}".`); return; }
      const memberTasks = tasks.filter(task => task.memberId === member.id);
      setResponse(`${member.name} has ${memberTasks.length} task${memberTasks.length === 1 ? '' : 's'}.`);
      return;
    }

    if (/show\s+team\s+members?/.test(lowerText) || /how\s+many\s+team\s+members?/.test(lowerText) || /what\s+is\s+my\s+team/.test(lowerText)) {
      setResponse(`There are ${members.length} team members.`);
      return;
    }

    if (/^how\s+many\s+tasks?.*completed?/.test(lowerText)) {
      const completed = tasks.filter(task => task.status === 'Finished').length;
      setResponse(`Completed tasks: ${completed}.`);
      return;
    }

    if (/how\s+many.*pending/.test(lowerText)) {
      const pending = tasks.filter(task => task.status !== 'Finished').length;
      setResponse(`Pending tasks: ${pending}.`);
      return;
    }

    if (/what\s+is\s+my\s+progress/.test(lowerText) || /show\s+progress/.test(lowerText)) {
      const total = tasks.length;
      const completed = tasks.filter(task => task.status === 'Finished').length;
      const percent = total ? Math.round((completed / total) * 100) : 0;
      setResponse(`Your progress is ${percent}% complete.`);
      return;
    }

    if (/add member[,.]?\s+(.+)/.test(lowerText)) {
      match = lowerText.match(/add member[,.]?\s+(.+)/);
      const name = match[1].replace(/[.,!?;:]/g, '').trim();
      if (!name) {
        setResponse('Please provide a member name. Say "Add member [name]".');
        return;
      }
      addMember(name);
      setResponse(`✓ Added team member ${name}.`);
      return;
    }

    if (/assign task[,.]?\s+(.+)\s+to\s+(.+)/.test(lowerText)) {
      match = lowerText.match(/assign task[,.]?\s+(.+)\s+to\s+(.+)/);
      const taskName = match[1];
      const memberName = match[2];
      const task = findTask(taskName);
      const member = findMember(memberName);
      if (!task) { 
        setResponse(`Could not find task. ${getAvailableTasks()}`);
        return; 
      }
      if (!member) { 
        setResponse(`Could not find member "${memberName}". Available: ${members.map(m => `"${m.name}"`).join(', ')}.`);
        return; 
      }
      updateTaskMember(task.id, member.id);
      setResponse(`✓ Assigned "${task.title}" to ${member.name}.`);
      return;
    }

    // Handle shorthand: "[task name] to [member name]" (e.g., "Developer task to Dahita")
    if (/\s+to\s+/.test(lowerText) && !lowerText.startsWith('set task')) {
      const parts = lowerText.split(/\s+to\s+/);
      if (parts.length === 2) {
        const taskName = parts[0].replace(/^(?:assign\s+)?task[,.]?\s+/, '').trim();
        const memberName = parts[1].trim();
        
        if (taskName && memberName) {
          const task = findTask(taskName);
          const member = findMember(memberName);
          
          if (task && member) {
            updateTaskMember(task.id, member.id);
            setResponse(`✓ Assigned "${task.title}" to ${member.name}.`);
            return;
          }
        }
      }
    }

    if (/show\s+tasks?\s+due\s+today/.test(lowerText)) {
      const today = new Date().toISOString().slice(0, 10);
      const dueToday = tasks.filter(task => task.deadline === today).length;
      setResponse(`There are ${dueToday} task${dueToday === 1 ? '' : 's'} due today.`);
      return;
    }

    if (/show\s+tasks?\s+due\s+tomorrow/.test(lowerText)) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dateString = tomorrow.toISOString().slice(0, 10);
      const dueTomorrow = tasks.filter(task => task.deadline === dateString).length;
      setResponse(`There are ${dueTomorrow} task${dueTomorrow === 1 ? '' : 's'} due tomorrow.`);
      return;
    }

    setResponse('Command not recognized. Try: Add task, Start task, Complete task, Show pending tasks, Delete task, What are my pending tasks, Show progress, or Add member.');
  };

  const toggleListening = () => {
    if (!SpeechRecognition) {
      setStatus('Speech recognition is not supported in your browser.');
      return;
    }
    if (!recognitionRef.current) {
      setStatus('Speech recognition is not initialized.');
      return;
    }
    
    try {
      if (listening) {
        recognitionRef.current.stop();
      } else {
        setTranscript('');
        setActionMessage('');
        recognitionRef.current.start();
      }
    } catch (error) {
      console.error('Speech recognition error:', error);
      setStatus('Failed to start microphone. Please check permissions.');
      setListening(false);
    }
  };

  const toggleVoice = () => {
    setVoiceEnabled(prev => !prev);
  };

  return (
    <div className="voice-assistant">
      <div className="voice-header">
        <div>
          <div className="voice-title">Voice Assistant</div>
          <div className="voice-sub">Try: Add task, Start task, Complete task, Show pending tasks, Delete task, Show progress</div>
        </div>
        <div className="voice-controls">
          <button
            className={`voice-voice-toggle${voiceEnabled ? '' : ' muted'}`}
            onClick={toggleVoice}
            type="button"
            title={voiceEnabled ? 'Mute voice feedback' : 'Enable voice feedback'}
          >
            {voiceEnabled ? '🔊' : '🔇'}
          </button>
          <button
            className={`voice-mic-button${listening ? ' listening' : ''}`}
            onClick={toggleListening}
            type="button"
          >
            🎤
          </button>
        </div>
      </div>

      <div className="voice-status-row">
        <span className="voice-status-label">Status:</span>
        <span className="voice-status-text">{status}</span>
      </div>

      <div className="voice-transcript-box">
        <div className="voice-transcript-label">Transcript</div>
        <div className="voice-transcript-content">{transcript || 'No speech recognized yet.'}</div>
      </div>

      {actionMessage && (
        <div className="voice-action-message">{actionMessage}</div>
      )}
    </div>
  );
}
