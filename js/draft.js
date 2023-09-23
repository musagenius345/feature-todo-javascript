const todoList = document.getElementById('taskList')
const addTodoBtn = document.querySelector('.addBtn')
const inputTodo = document.querySelector('.inputTodo')
const enterClicked = e => e.keyCode === 13

function addTask() {
  const newTodoDiv = document.createElement('div')
  const todoPara = document.createElement('p')
  todoPara.classList.add('todoItem')

  const todoCheckBox = document.createElement('input')
  todoCheckBox.setAttribute('type', 'checkbox')
  todoCheckBox.classList.add('todoCheck')
  // Modern way of generating random v4 UUID without dependencies
  const todoId = crypto.randomUUID()
  const deleteBtn = document.createElement('button')
  const editBtn = document.createElement('button')

  if (inputTodo.value.trim() !== '') {
    newTodoDiv.classList.add('grid')
    todoPara.textContent = inputTodo.value.trim()

    // Adding Classes
    editBtn.classList.add('success', 'smallBtn')
    deleteBtn.classList.add('warning', 'smallBtn')

    //Adding textContent
    editBtn.textContent = 'edit'
    deleteBtn.textContent = 'delete'

    newTodoDiv.append(todoCheckBox, todoPara, editBtn, deleteBtn)
    todoList.appendChild(newTodoDiv)
  }

  editBtn.addEventListener('click', () => {
    if (editBtn.textContent === 'edit') {
      editTodo(todoPara);
      editBtn.textContent = 'Save';
      editBtn.classList.add('neutral');
    } else {
      saveTodo(todoPara);
      editBtn.textContent = 'edit';
      editBtn.classList.remove('neutral');
    }
  });

  todoPara.addEventListener('keydown', (e) => {
    if (enterClicked(e)) {
      saveTodo(todoPara)
      editBtn.classList.remove('neutral')
      editBtn.textContent = 'edit'
    }
  });

  deleteBtn.addEventListener('click', () => {
    deleteTodo(newTodoDiv)
  });

  inputTodo.value = ''
}

function editTodo(todoContent) {
  todoContent.setAttribute('contenteditable', 'true')
}

function saveTodo(todoContent) {
  todoContent.setAttribute('contenteditable', 'false')
}

function deleteTodo(todoContainer) { 
    todoContainer.remove()
}



inputTodo.addEventListener('keydown', (e) => {
  if (enterClicked(e)) {
    addTask()
  }
})

addTodoBtn.addEventListener('click', () => {
  addTask()
})