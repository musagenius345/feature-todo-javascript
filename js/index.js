/**
 * Import the functions for localStorage handling
 */
import { getTodoList, saveTodoList } from './localStorage.js';

/**
 * @constant {HTMLElement} todoList - Reference to the task list element.
 */
const todoList = document.getElementById('taskList');

/**
 * @constant {HTMLElement} addTodoBtn - Reference to the add button element.
 */
const addTodoBtn = document.querySelector('.addBtn');

/**
 * @constant {HTMLElement} inputTodo - Reference to the input field for adding tasks.
 */
const inputTodo = document.querySelector('.inputTodo');

/**
 * @constant {HTMLElement} ConfirmDelete - Confirm delete popover.
 */
const confirmDelete = document.querySelector('.confirmDelete');


const deleteTodoYes = document.querySelector('.yesDelete')
const goBackTodo = document.querySelector('.goBackTodo')
/**
 * Checks if the Enter key is pressed.
 * @param {KeyboardEvent} e - The keyboard event.
 * @returns {boolean} True if the Enter key is pressed, otherwise false.
 */
const enterClicked = e => e.key === 'Enter' || e.keyCode === 13;

/**
 * Function to create a new task element.
 * @returns {Object} An object containing references to various task elements.
 */
function createTaskElement() {
  const newTodoDiv = document.createElement('div');
  const todoPara = document.createElement('p');
  const todoCheckBox = document.createElement('input');
  const deleteBtn = document.createElement('button');
  const editBtn = document.createElement('button');
  const todoID = crypto.randomUUID();

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

  // Append elements and animate the new task div
  newTodoDiv.classList.add('grid', 'animate__animated', 'animate__backInUp');
  newTodoDiv.append(todoCheckBox, todoPara, editBtn, deleteBtn);

  return { todoID, todoCheckBox, newTodoDiv, todoPara, editBtn, deleteBtn };
}

/**
 * Function to add a task.
 */
function addTask() {
  const { newTodoDiv, todoID, todoPara, editBtn, deleteBtn } = createTaskElement();

  if (inputTodo.value.trim() !== '') {
    todoPara.textContent = inputTodo.value.trim();
    todoList.appendChild(newTodoDiv);

    // Update todo list in localStorage
    const updatedTodoList = getTodoList();
    updatedTodoList.push({ id: todoID, text: todoPara.textContent, completed: false });
    saveTodoList(updatedTodoList);

    inputTodo.value = '';
  }

  // Add event listener for the "edit" button
  editBtn.addEventListener('click', () => toggleEditState(todoPara, editBtn));
  deleteBtn.addEventListener('click', () => deleteTodo(newTodoDiv, todoPara.textContent));
}

/**
 * Function to toggle edit/save state for a task.
 * @param {HTMLElement} todoPara - Reference to the task paragraph element.
 * @param {HTMLElement} editBtn - Reference to the edit button element.
 */
function toggleEditState(todoPara, editBtn) {
  if (editBtn.textContent === 'edit') {
    editTodo(todoPara, editBtn);
  } else {
    saveTodo(todoPara, editBtn);
  }
}

/**
 * Function to edit a task.
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
 * Function to save a task.
 * @param {HTMLElement} todoPara - Reference to the task paragraph element.
 * @param {HTMLElement} editBtn - Reference to the edit button element.
 */
function saveTodo(todoPara, editBtn) {
  todoPara.setAttribute('contenteditable', 'false');
  editBtn.textContent = 'edit';
  editBtn.classList.remove('neutral');

  // Retrieve the todo list from local storage
  const todoStore = getTodoList();

  // Find and update the corresponding task in the todo list
  const taskID = todoPara.parentElement.dataset.taskId;
  const taskIndex = todoStore.findIndex(item => item.id === taskID);

  if (taskIndex !== -1) {
    todoStore[taskIndex].text = todoPara.textContent;
    // Save the updated todo list to local storage
    saveTodoList(todoStore);
  }
}

/**
 * Function to delete a task with animation.
 * @param {HTMLElement} todoContainer - Reference to the task container element.
 * @param {string} todoText - The text of the todo to be deleted.
 */
function deleteTodo(todoContainer, todoText) {
  // Get current todo list from localStorage
  const currentTodoList = getTodoList();

  if (supportsPopover) {
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
        const index = currentTodoList.findIndex(item => item.text === todoText);
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
 * Function to Check the Modern native Popover API Support
 * @returns {boolean}
 */
function supportsPopover() {
  return HTMLElement.prototype.hasOwnProperty("popover");
}

document.addEventListener('DOMContentLoaded', () => initialize());

function initialize() {
  // Retrieve the todo list from local storage
  const todoStore = getTodoList();

  // Check if there are any todo items in local storage
  if (todoStore && todoStore.length > 0) {
    // Loop through the todo list and create and display tasks for each item
    for (const todoItem of todoStore) {
      const { newTodoDiv, todoPara, todoCheckBox, editBtn, deleteBtn } = createTaskElement();

      // Set the task text and completed status based on local storage data
      todoPara.textContent = todoItem.text;
      todoCheckBox.checked = todoItem.completed;

      // Append elements to the task list
      newTodoDiv.appendChild(todoCheckBox);
      newTodoDiv.appendChild(todoPara);
      newTodoDiv.appendChild(editBtn);
      newTodoDiv.appendChild(deleteBtn);
      todoList.appendChild(newTodoDiv);

      // Add event listeners for the "edit" button and "delete" button
      editBtn.addEventListener('click', () => toggleEditState(todoPara, editBtn));
      deleteBtn.addEventListener('click', () => deleteTodo(newTodoDiv, todoItem.text));

      // Add event listener for checkbox change event
      todoCheckBox.addEventListener('change', () => {
        // Update the completed property of the corresponding todo item
        todoItem.completed = todoCheckBox.checked;
        // Save the updated todo list to localStorage
        saveTodoList(todoStore);
      });

      // Update the todoStore with the edited text when saving changes
      editBtn.addEventListener('click', () => {
        if (editBtn.textContent === 'Save') {
          saveTodo(todoPara, editBtn);
          todoItem.text = todoPara.textContent;
          saveTodoList(todoStore);
        }
      });
    }
  }

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