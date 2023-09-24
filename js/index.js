// Import the functions for localStorage handling
import { getTodoList, saveTodoList } from './localStorage.js';

// State machine for managing todo list
const todoMachine = {
  states: {
    idle: {
      ADD_TODO: 'addingTodo',
      DELETE_TODO: 'deletingTodo',
      EDIT_TODO: 'editingTodo',
    },
    addingTodo: {
      SAVE: 'idle',
      CANCEL: 'idle',
    },
    deletingTodo: {
      CONFIRM_DELETE: 'idle',
      CANCEL: 'idle',
    },
    editingTodo: {
      SAVE: 'idle',
      CANCEL: 'idle',
    },
  },
  initialState: 'idle',
};

// Function to transition between states
function transition(state, action) {
  return todoMachine.states[state][action] || state;
}

// Initialize state
let currentState = todoMachine.initialState;

document.addEventListener('DOMContentLoaded', () => {
  const todoList = document.getElementById('taskList');
  const addTodoBtn = document.querySelector('.addBtn');
  const inputTodo = document.querySelector('.inputTodo');
  const confirmDelete = document.querySelector('.confirmDelete');
  const deleteTodoYes = document.querySelector('.yesDelete');
  const goBackTodo = document.querySelector('.goBackTodo');

  // Initialize todos with data from localStorage
  let todos = getTodoList();

  // Check if the Popover API is supported
  function supportsPopover() {
    return HTMLElement.prototype.hasOwnProperty('popover');
  }

  // Generate a unique ID using crypto.randomUUID()
  function generateTodoID() {
    return crypto.randomUUID();
  }

  // Render the todo list
  function renderTodos() {
    todoList.innerHTML = '';

    todos.forEach((todo) => {
      const todoItem = document.createElement('div');
      todoItem.classList.add('grid', 'todoEl');

      const todoCheckBox = document.createElement('input');
      todoCheckBox.setAttribute('type', 'checkbox');
      todoCheckBox.classList.add('todoCheck');
      todoCheckBox.checked = todo.completed;

      const todoText = document.createElement('p');
      todoText.classList.add('todoItem');
      todoText.textContent = todo.text;

      const editBtn = document.createElement('button');
      editBtn.classList.add('success');
      editBtn.textContent = 'edit';

      const deleteBtn = document.createElement('button');
      deleteBtn.classList.add('warning');
      deleteBtn.textContent = 'delete';

      todoItem.dataset.taskId = todo.id;
      todoItem.append(todoCheckBox, todoText, editBtn, deleteBtn);

      // Event listener for checkbox change
      todoCheckBox.addEventListener('change', () => toggleCompleted(todo.id, todoCheckBox.checked));

      // Event listener for edit button
      editBtn.addEventListener('click', () => startEditing(todo.id));

      // Event listener for delete button
      deleteBtn.addEventListener('click', () => confirmDeleteTodoPrompt(todo.id));

      todoList.appendChild(todoItem);
    });
  }

  // Add a new task
  function addTask() {
    const text = inputTodo.value.trim();
    if (text) {
      const id = generateTodoID();
      todos.push({ id, text, completed: false });
      inputTodo.value = '';
      renderTodos();
      // Save updated todos to localStorage
      saveTodoList(todos);
    }
  }

  // Toggle completion state of a task
  function toggleCompleted(id, completed) {
    const index = todos.findIndex((todo) => todo.id === id);
    if (index !== -1) {
      todos[index].completed = completed;
      renderTodos();
      // Save updated todos to localStorage
      saveTodoList(todos);
    }
  }

  // Start editing a task
  function startEditing(id) {
    currentState = transition(currentState, 'EDIT_TODO');
    const index = todos.findIndex((todo) => todo.id === id);
    if (index !== -1) {
      const todoText = todos[index].text;
      const newText = prompt('Edit task:', todoText);
      if (newText !== null) {
        todos[index].text = newText;
        currentState = transition(currentState, 'SAVE');
        renderTodos();
        // Save updated todos to localStorage
        saveTodoList(todos);
      } else {
        currentState = transition(currentState, 'CANCEL');
      }
    }
  }

  // Confirm delete task prompt
  function confirmDeleteTodoPrompt(id) {
    if (supportsPopover()) {
      currentState = transition(currentState, 'DELETE_TODO');
      confirmDelete.showPopover()
      deleteTodoYes.addEventListener('click', () => {
        deleteTodo(id);
        confirmDelete.hidePopover()
        currentState = transition(currentState, 'CONFIRM_DELETE');
      });

      goBackTodo.addEventListener('click', () => {
        confirmDelete.hidePopover()
        currentState = transition(currentState, 'CANCEL');
      });
    } else {
      alert('Popover API not supported');
    }
  }

  // Delete a task
  function deleteTodo(id) {
    const index = todos.findIndex((todo) => todo.id === id);
    if (index !== -1) {
      todos.splice(index, 1);
      renderTodos();
      // Save updated todos to localStorage
      saveTodoList(todos);
    }
  }

  // Event listener for Add button
  addTodoBtn.addEventListener('click', addTask);

  // Event listener for Enter key in input
  inputTodo.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      addTask();
    }
  });

  // Initial rendering of todos
  renderTodos();
});
