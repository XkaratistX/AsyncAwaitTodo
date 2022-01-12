(function () {
 
})


 // Globals
  const todoList = document.getElementById('todo-list');
  const userSelect = document.getElementById('user-todo');
  const form = document.querySelector('form');
  let todos = [];
  let users = [];

  // Attach Event
  document.addEventListener('DOMContentLoaded', initApp);
  form.addEventListener('submit', handleSubmit);
  
  // Basic Logic
  
  // get user from object
  function getUserName(userId) {
    const user = users.find(u => u.id === userId);
    return user.name;
  }

  function printTodo({
    id,
    userId,
    title,
    completed
  }) {
    const li = document.createElement('li');
    li.className = 'todo-item';
    li.dataset.id = id;
    li.innerHTML = `
                  <span>${title} <i>by</i> <b>${getUserName(userId)}</b></span>
                  `;

    const status = document.createElement('input');
    status.type = 'checkbox';
    status.checked = completed;
    status.addEventListener('change', handleStatusChange)

    const close = document.createElement('span');
    close.innerHTML = '&times';
    close.className = 'close';
    close.addEventListener('click', handleClose);

    li.prepend(status);
    li.append(close);

    todoList.prepend(li);
  }

  // user Option
  function createUserOption(user) {
    const option = document.createElement('option');
    option.value = user.id;
    option.innerText = user.name;
    console.log(user.name);
    userSelect.append(option);
  }

  // Event Logic
  function initApp() {
    Promise.all([getAllTodos(), getAllUsers()]).then(values => { // values - это массив с данными
      [todos, users] = values;

      // Отправить в разметку
      todos.forEach((todo) => printTodo(todo));
      users.forEach((user) => createUserOption(user));
    });
  };

  function handleSubmit(e) {
    e.preventDefault();

    createTodo({
      userId: +form.user.value,
      title: form.todo.value,
      completed: false
    });
  }

  function handleStatusChange() {
    const todoId = this.parentElement.dataset.id;
    const completed = this.checked;

    toggleStatus(todoId, completed);
  }

  function handleClose() {
    const todoId = this.parentElement.dataset.id;
    deleteTodo(todoId);
  }

  function removeTodo(todoId) {
    todos = todos.filter(todo => todo.id !== todoId);

    const todo = todoList.querySelector(`[data-id="${todoId}"]`);
    todo.querySelector('input').removeEventListener('change', handleStatusChange);
    todo.querySelector('.close').removeEventListener('click', handleClose);

    todo.remove();
  }

  function alertError(error) {
    alert(error.message);
  }


  // Async logic

  async function getAllTodos() {
   try {
      const response = await fetch('https://jsonplaceholder.typicode.com/todos?_limit=15');
    const data = await response.json();

    return data;
   } catch (error) {
      alertError(error);
   }
  }

  async function getAllUsers() {
    try {
      const response = await fetch('https://jsonplaceholder.typicode.com/users');
      const data = await response.json();

      return data;
    } catch (error) {
      alertError(error);
    }
  }

  async function createTodo(todo) {
    try {
      const response = await fetch('https://jsonplaceholder.typicode.com/todos', {
        method: 'POST',
        body: JSON.stringify(todo),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const newTodo = await response.json();
      
      printTodo({newTodo, ...todo});
    } catch (error) {
      alertError(error);
    }
  }

  async function toggleStatus(todoId, completed) {
    try {
      const response = await fetch(`https://jsonplaceholder.typicode.com/todos/${todoId}`, {
        method: 'PATCH',
        body: JSON.stringify({completed}),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error('Failed to connect with server!')
      } 
    } catch (error) {
      alertError(error)
    }
  }

  async function deleteTodo(todoId) {
    try {
      const response = await fetch(
        `https://jsonplaceholder.typicode.com/todos/${todoId}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        removeTodo(todoId);
      } else {
        throw new Error('Failed to connect with the server! Please try later.');
      }
    } catch (error) {
      alertError(error);
    }
  }