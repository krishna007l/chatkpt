// DOM Elements
let mobileMenuBtn, mobileOverlay, sidebar, newChatBtn, chatHistory;
let messageInput, sendButton, messagesList, welcomeScreen, chatContainer;
let typingIndicator, chatHeader, sidebarToggle, clearChatBtn, exampleBtns;

// State management
let currentChatId = null;
let isTyping = false;
let chatMessages = [];

// Initialize DOM elements
function initializeElements() {
    mobileMenuBtn = document.getElementById('mobileMenuBtn');
    mobileOverlay = document.getElementById('mobileOverlay');
    sidebar = document.getElementById('sidebar');
    newChatBtn = document.getElementById('newChatBtn');
    chatHistory = document.getElementById('chatHistory');
    messageInput = document.getElementById('messageInput');
    sendButton = document.getElementById('sendButton');
    messagesList = document.getElementById('messagesList');
    welcomeScreen = document.getElementById('welcomeScreen');
    chatContainer = document.getElementById('chatContainer');
    typingIndicator = document.getElementById('typingIndicator');
    chatHeader = document.getElementById('chatHeader');
    sidebarToggle = document.getElementById('sidebarToggle');
    clearChatBtn = document.getElementById('clearChatBtn');
    exampleBtns = document.querySelectorAll('.example-btn');
}

// Initialize event listeners
function initializeEventListeners() {
    // Mobile menu
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', toggleMobileMenu);
    }
    
    if (mobileOverlay) {
        mobileOverlay.addEventListener('click', closeMobileMenu);
    }
    
    // Sidebar toggle
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', toggleMobileMenu);
    }
    
    // New chat
    if (newChatBtn) {
        newChatBtn.addEventListener('click', startNewChat);
    }
    
    // Clear chat
    if (clearChatBtn) {
        clearChatBtn.addEventListener('click', clearCurrentChat);
    }
    
    // Send message
    if (sendButton) {
        sendButton.addEventListener('click', handleSendMessage);
    }
    
    // Message input
    if (messageInput) {
        messageInput.addEventListener('keypress', handleInputKeyPress);
        messageInput.addEventListener('input', handleInputChange);
    }
    
    // Example buttons
    if (exampleBtns) {
        exampleBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const text = btn.getAttribute('data-text');
                useExample(text);
            });
        });
    }
    
    // Load chat history from localStorage
    loadChatHistory();
}

// Mobile menu functions
function toggleMobileMenu() {
    sidebar.classList.toggle('active');
    mobileOverlay.classList.toggle('active');
}

function closeMobileMenu() {
    sidebar.classList.remove('active');
    mobileOverlay.classList.remove('active');
}

// Chat functions
function startNewChat() {
    clearCurrentChat();
    showWelcomeScreen();
    currentChatId = 'chat_' + Date.now();
    chatMessages = [];
    closeMobileMenu();
}

function clearCurrentChat() {
    messagesList.innerHTML = '';
    messageInput.value = '';
    updateSendButtonState();
    resetTextareaHeight();
    chatMessages = [];
}

function showWelcomeScreen() {
    welcomeScreen.style.display = 'flex';
    chatContainer.style.display = 'none';
    chatHeader.style.display = 'none';
}

function showChatContainer() {
    welcomeScreen.style.display = 'none';
    chatContainer.style.display = 'flex';
    chatHeader.style.display = 'flex';
}

// Enhanced POST method implementation
async function postData(url = "", data = {}) {
    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Fetch error:", error);
        throw error;
    }
}

// Main send message handler
async function handleSendMessage() {
    const question = messageInput.value.trim();
    if (!question || isTyping) return;

    // Disable button and show loading state
    const originalButtonHTML = sendButton.innerHTML;
    sendButton.innerHTML = `
        <svg class="spinner" viewBox="0 0 50 50" width="20" height="20">
            <circle cx="25" cy="25" r="20" fill="none" stroke="currentColor" stroke-width="4" stroke-dasharray="80" stroke-dashoffset="60"></circle>
        </svg>
    `;
    sendButton.disabled = true;
    isTyping = true;

    try {
        // Update UI
        messageInput.value = '';
        showChatContainer();
        
        // Add user message to chat
        addMessage('user', question);
        
        // Add question to chat history
        chatMessages.push({ role: 'user', content: question });
        
        // Show typing indicator
        showTypingIndicator();

        // Get the answer from API
        const result = await postData("/api", { question: question });
        
        // Hide typing indicator
        hideTypingIndicator();
        
        if (result && result.answer) {
            // Add AI response
            addMessage('assistant', result.answer);
            chatMessages.push({ role: 'assistant', content: result.answer });
            
            // Add to history sidebar
            addToHistory(question, result.answer);
            
            // Save chat to localStorage
            saveChatToHistory(question, result.answer);
        } else {
            throw new Error("Invalid response from server");
        }

    } catch (error) {
        console.error("Error processing request:", error);
        addMessage('assistant', 'Sorry, I encountered an error. Please try again.');
        chatMessages.push({ role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' });
    } finally {
        // Restore button state
        sendButton.innerHTML = originalButtonHTML;
        sendButton.disabled = false;
        isTyping = false;
        messageInput.focus();
    }
}

// Add message to chat
function addMessage(role, content) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}`;
    
    const avatarDiv = document.createElement('div');
    avatarDiv.className = `avatar ${role}`;
    avatarDiv.textContent = role === 'user' ? 'U' : 'AI';
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.innerHTML = formatMessage(content);
    
    messageDiv.appendChild(avatarDiv);
    messageDiv.appendChild(contentDiv);
    messagesList.appendChild(messageDiv);
    
    // Scroll to bottom
    scrollToBottom();
}

// Format message with markdown-like styling
function formatMessage(text) {
    if (!text) return '';
    
    return text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`([^`]+)`/g, '<code>$1</code>')
        .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
        .replace(/\n/g, '<br>')
        .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
}

// Typing indicator
function showTypingIndicator() {
    typingIndicator.style.display = 'flex';
    scrollToBottom();
}

function hideTypingIndicator() {
    typingIndicator.style.display = 'none';
}

// Scroll to bottom
function scrollToBottom() {
    setTimeout(() => {
        const messagesContainer = document.querySelector('.messages-container');
        if (messagesContainer) {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    }, 100);
}

// Add to history sidebar
function addToHistory(question, answer) {
    if (!chatHistory) return;

    const chatItem = document.createElement('div');
    chatItem.className = 'history-item';
    
    const truncatedQuestion = question.length > 30 ? question.substring(0, 30) + '...' : question;
    
    chatItem.innerHTML = `
        <svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" height="16" width="16">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
        <span>${truncatedQuestion}</span>
    `;
    
    chatItem.addEventListener('click', () => {
        clearCurrentChat();
        addMessage('user', question);
        addMessage('assistant', answer);
        showChatContainer();
        closeMobileMenu();
    });
    
    // Add to beginning of history
    const historyLabel = chatHistory.querySelector('.history-label');
    if (historyLabel) {
        chatHistory.insertBefore(chatItem, historyLabel.nextSibling);
    } else {
        chatHistory.prepend(chatItem);
    }
    
    // Limit history to last 20 items
    const items = chatHistory.querySelectorAll('.history-item');
    if (items.length > 20) {
        items[items.length - 1].remove();
    }
}

// Local storage management
function saveChatToHistory(question, answer) {
    try {
        const chatData = {
            id: 'chat_' + Date.now(),
            question: question,
            answer: answer,
            timestamp: new Date().toISOString()
        };

        // Get existing history
        let history = JSON.parse(localStorage.getItem('unicai_chat_history') || '[]');
        
        // Add to beginning
        history.unshift(chatData);
        
        // Keep only last 20 chats
        history = history.slice(0, 20);
        
        localStorage.setItem('unicai_chat_history', JSON.stringify(history));
    } catch (e) {
        console.warn("Could not save chat to localStorage:", e);
    }
}

function loadChatHistory() {
    try {
        const history = JSON.parse(localStorage.getItem('unicai_chat_history') || '[]');
        
        history.forEach(chat => {
            addToHistory(chat.question, chat.answer);
        });
    } catch (e) {
        console.warn("Could not load chat history:", e);
    }
}

// Use example text
function useExample(text) {
    messageInput.value = text;
    messageInput.style.height = 'auto';
    messageInput.style.height = Math.min(messageInput.scrollHeight, 200) + 'px';
    updateSendButtonState();
    messageInput.focus();
}

// Input handlers
function handleInputKeyPress(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
    }
}

function handleInputChange() {
    updateSendButtonState();
    autoResizeTextarea();
}

function updateSendButtonState() {
    if (!sendButton) return;
    
    const isEmpty = !messageInput.value.trim();
    sendButton.disabled = isEmpty || isTyping;
    sendButton.style.opacity = (isEmpty || isTyping) ? '0.5' : '1';
    sendButton.style.cursor = (isEmpty || isTyping) ? 'not-allowed' : 'pointer';
}

function autoResizeTextarea() {
    if (messageInput) {
        messageInput.style.height = 'auto';
        messageInput.style.height = Math.min(messageInput.scrollHeight, 200) + 'px';
    }
}

function resetTextareaHeight() {
    if (messageInput) {
        messageInput.style.height = 'auto';
    }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    initializeElements();
    initializeEventListeners();
    
    // Show welcome screen by default
    showWelcomeScreen();
    
    // Focus on input
    if (messageInput) {
        messageInput.focus();
    }
});