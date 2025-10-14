import { writable } from 'svelte/store';

export interface TodoItem {
    id: number;
    text: string;
    completed: boolean;
    dueDate: string | null;
}

const TODO_STORAGE_KEY = 'graphite_todos';

function createTodoStore() {
    const storedTodos = localStorage.getItem(TODO_STORAGE_KEY);
    const initialTodos: TodoItem[] = storedTodos ? JSON.parse(storedTodos) : [];

    const { subscribe, update } = writable<TodoItem[]>(initialTodos);

    subscribe(todos => {
        localStorage.setItem(TODO_STORAGE_KEY, JSON.stringify(todos));
    });

    function addTodo(text: string, dueDate: string | null) {
        const newItem: TodoItem = {
            id: Date.now(),
            text,
            completed: false,
            dueDate,
        };
        update(todos => [...todos, newItem]);
    }

    function toggleTodo(id: number) {
        update(todos =>
            todos.map(todo =>
                todo.id === id ? { ...todo, completed: !todo.completed } : todo
            )
        );
    }
    
    function removeTodo(id: number) {
        update(todos => todos.filter(todo => todo.id !== id));
    }

    return {
        subscribe,
        addTodo,
        toggleTodo,
        removeTodo,
    };
}

export const todos = createTodoStore();
