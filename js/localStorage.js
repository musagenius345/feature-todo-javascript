/**
 * Function to get the todo list from localStorage.
 *
 * @returns {Array} An array containing the todo list retrieved from localStorage.
 */
export function getTodoList() {
  const storedTodoList = localStorage.getItem('myTodoList');
  if (storedTodoList) {
    return JSON.parse(storedTodoList);
  }
  return []; // Return an empty array if there's no data in localStorage
}

/**
 * Function to save or update the todo list in localStorage.
 *
 * @param {Array} todoList - The todo list to be saved or updated in localStorage.
 */
export function saveTodoList(todoList) {
  localStorage.setItem('myTodoList', JSON.stringify(todoList));
}
