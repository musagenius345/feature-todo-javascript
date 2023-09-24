/**
 * Import the functions for localStorage handling
 */
import { getTodoList, saveTodoList } from './localStorage.js';

/**
 * DOM Elements
 */
const todoList = document.getElementById('taskList');
const addTodoBtn = document.querySelector('.addBtn');
const inputTodo = document.querySelector('.inputTodo');
const confirmDelete = document.querySelector('.confirmDelete');
const deleteTodoYes = document.querySelector('.yesDelete');
const goBackTodo = document.querySelector('.goBackTodo');

/**
 * Checks if the Enter key is pressed.
 * @param {KeyboardEvent} e - The keyboard event.
 * @returns {boolean} True if the Enter key is pressed, otherwise false.
 */
const enterClicked = (e) => e.key === 'Enter' || e.keyCode === 13;

/**
 * Create a new task element.
 * @param {string} todoText - The text of the task.
 * @param {string} todoID - The ID of the task.
 * @param {boolean} completed - The completion state of the task.
 * @returns {HTMLElement} The task element.
 */
function createTaskElement(todoText, todoID, completed) {
  const newTodoDiv = document.createElement('div');
  const todoPara = document.createElement('p');
  const todoCheckBox = document.createElement('input');
  const deleteBtn = document.createElement('button');
  const editBtn = document.createElement('button');

  // Assign classes and attributes to elements
  todoPara.classList.add('todoItem');
  todoCheckBox.setAttribute('type', 'checkbox');
  todoCheckBox.classList.add('todoCheck');
  editBtn.classList.add('success');
  deleteBtn.classList.add('warning');
  deleteBtn.setAttribute('popover-target', 'confirmDelete');
  editBtn.textContent = 'edit';
  deleteBtn.textContent = 'delete';

  // Set the task ID as a data attribute
  newTodoDiv.dataset.taskId = todoID;

  // Set initial text and completion state
  todoPara.textContent = todoText;
  todoCheckBox.checked = completed;

  // Append elements and animate the new task div
  newTodoDiv.classList.add('grid', 'animate__animated', 'animate__backInUp');
  newTodoDiv.append(todoCheckBox, todoPara, editBtn, deleteBtn);

  return { todoID, todoCheckBox, newTodoDiv, todoPara, editBtn, deleteBtn };
}

/**
 * Add a task.
 */
function addTask() {
  const todoText = inputTodo.value.trim();
  if (todoText !== '') {
    const todoID = crypto.randomUUID();
    const { newTodoDiv, todoPara, editBtn, deleteBtn, todoCheckBox } = createTaskElement(
      todoText,
      todoID,
      false
    );

    todoList.appendChild(newTodoDiv);

    // Update todo list in localStorage
    const updatedTodoList = getTodoList();
    updatedTodoList.push({ id: todoID, text: todoText, completed: false });
    saveTodoList(updatedTodoList);

    inputTodo.value = '';

    // Add event listener for the "edit" button
    editBtn.addEventListener('click', () => toggleEditState(todoPara, editBtn, todoID, updatedTodoList));
    deleteBtn.addEventListener('click', () => deleteTodo(newTodoDiv, todoText, updatedTodoList));
    todoCheckBox.addEventListener('change', () => toggleCompleted(todoID, todoCheckBox.checked, updatedTodoList));
  }
}

/**
 * Toggle edit/save state for a task.
 * @param {HTMLElement} todoPara - Reference to the task paragraph element.
 * @param {HTMLElement} editBtn - Reference to the edit button element.
 * @param {string} todoID - The ID of the todo item.
 * @param {Array} todoStore - The todo store array.
 */
function toggleEditState(todoPara, editBtn, todoID, todoStore) {
  if (editBtn.textContent === 'edit') {
    editTodo(todoPara, editBtn);
  } else if (editBtn.textContent === 'Save') {
    saveTodo(todoPara, editBtn, todoID, todoStore);
  }
}

/**
 * Edit a task.
 * @param {HTMLElement} todoPara - Reference to the task paragraph element.
 * @param {HTMLElement} editBtn - Reference to the edit button element.
 */
function editTodo(todoPara, editBtn) {
  todoPara.setAttribute('contenteditable', 'true');
  todoPara.focus();
  editBtn.textContent = 'Save';
  editBtn.classList.add('neutral');
}

/**
 * Save a task.
 * @param {HTMLElement} todoPara - Reference to the task paragraph element.
 * @param {HTMLElement} editBtn - Reference to the edit button element.
 * @param {string} todoID - The ID of the todo item.
 * @param {Array} todoStore - The todo store array.
 */
function saveTodo(todoPara, editBtn, todoID, todoStore) {
  todoPara.setAttribute('contenteditable', 'false');

  // Find and update the corresponding task in the todo list
  const taskIndex = todoStore.findIndex((item) => item.id === todoID);

  if (taskIndex !== -1) {
    todoStore[taskIndex].text = todoPara.textContent;
    editBtn.textContent = 'edit';
    editBtn.classList.remove('neutral');
    saveTodoList(todoStore); // Save the updated todo list to localStorage
  }
}

/**
 * Delete a task with animation.
 * @param {HTMLElement} todoContainer - Reference to the task container element.
 * @param {string} todoText - The text of the todo to be deleted.
 * @param {Array} todoStore - The todo store array.
 */
function deleteTodo(todoContainer, todoText, todoStore) {
  // Get current todo list from localStorage
  const currentTodoList = todoStore;

  if (supportsPopover()) {
    confirmDelete.classList.add('animate__animated', 'animate__slideInRight');
    confirmDelete.showPopover();

    deleteTodoYes.addEventListener('click', () => {
      // Add animate.css classes to the todo item for the deletion animation
      todoContainer.classList.add('animate__animated', 'animate__fadeOutRightBig');

      confirmDelete.hidePopover();
      // Listen for the animationend event to remove the todo item and update data
      todoContainer.addEventListener('animationend', () => {
        todoContainer.remove(); // Remove the element after the animation

        // Find and remove the corresponding task from the current todo list
        const index = currentTodoList.findIndex((item) => item.text === todoText);
        if (index !== -1) {
          currentTodoList.splice(index, 1);
          saveTodoList(currentTodoList); // Update the todo list in localStorage
        }
      });
    });

    goBackTodo.addEventListener('click', () => {
      confirmDelete.hidePopover();
    });
  } else {
    console.error('Popover API not supported');
    todoContainer.remove();
  }
}

/**
 * Toggle the completion state of a task.
 * @param {string} todoID - The ID of the todo item.
 * @param {boolean} completed - The completion state of the todo item.
 * @param {Array} todoStore - The todo store array.
 */
function toggleCompleted(todoID, completed, todoStore) {
  const taskIndex = todoStore.findIndex((item) => item.id === todoID);

  if (taskIndex !== -1) {
    todoStore[taskIndex].completed = completed;
    saveTodoList(todoStore); // Save the updated todo list to localStorage
  }
}

/**
 * Check if the Modern native Popover API is supported.
 * @returns {boolean}
 */
function supportsPopover() {
  return HTMLElement.prototype.hasOwnProperty('popover');
}

/**
 * Initialize the application.
 */
function initialize() {
  // Retrieve the todo list from local storage
  const todoStore = getTodoList();

  // Check if there are any todo items in local storage
  if (todoStore && todoStore.length > 0) {
    // Loop through the todo list and create and display tasks for each item
    for (const todoItem of todoStore) {
      const { newTodoDiv, todoPara, todoCheckBox, editBtn, deleteBtn } = createTaskElement(
        todoItem.text,
        todoItem.id,
        todoItem.completed
      );

      // Append elements to the task list
      newTodoDiv.appendChild(todoCheckBox);
      newTodoDiv.appendChild(todoPara);
      newTodoDiv.appendChild(editBtn);
      newTodoDiv.appendChild(deleteBtn);
      todoList.appendChild(newTodoDiv);

      // Add event listeners for the "edit" button and "delete" button
      editBtn.addEventListener('click', () =>
        toggleEditState(todoPara, editBtn, todoItem.id, todoStore)
      );
      deleteBtn.addEventListener('click', () => deleteTodo(newTodoDiv, todoItem.text, todoStore));
      todoCheckBox.addEventListener('change', () =>
        toggleCompleted(todoItem.id, todoCheckBox.checked, todoStore)
      );
    }
  }

  // Event listeners for new edit buttons
  const editButtons = document.querySelectorAll('.success');
  editButtons.forEach((editBtn) =>
    editBtn.addEventListener('click', () =>
      toggleEditState(editBtn.previousElementSibling, editBtn)
    )
  );

  console.log('Hello');
}

// Event listeners
inputTodo.addEventListener('keydown', (e) => {
  if (enterClicked(e)) {
    addTask();
  }
});

addTodoBtn.addEventListener('click', () => {
  addTask();
});

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', initialize);
