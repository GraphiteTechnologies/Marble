<script lang="ts">
    import {todos} from '../store/todoStore';
    import {selectedDateStore} from '../store/selectedDateStore';
    import {CheckCircle, Circle, Plus, Trash} from 'phosphor-svelte';
    import {fly} from 'svelte/transition';

    let newTodoText = '';

    $: filteredTodos = $selectedDateStore
        ? $todos.filter(todo => todo.dueDate === $selectedDateStore)
        : $todos;

    function handleAddTodo() {
        if(newTodoText.trim()) {
            todos.addTodo(newTodoText.trim(), $selectedDateStore);
            newTodoText = '';
        }
    }

    function formatDate(dateString: string | null) {
        if(!dateString) return '';
        const date = new Date(dateString);
        date.setDate(date.getDate() + 1);
        return date.toLocaleDateString([], {month: 'short', day: 'numeric'});
    }
</script>

<div class="todo-container">
    <div class="header">
        <h3>{$selectedDateStore ? `Events on ${formatDate($selectedDateStore)}` : 'All Events'}</h3>
    </div>
    <div class="todo-list">
        {#each filteredTodos as todo (todo.id)}
            <div class="todo-item" class:completed={todo.completed} in:fly={{ y: 10, duration: 200 }}>
                <button class="toggle" on:click={() => todos.toggleTodo(todo.id)}>
                    {#if todo.completed}
                        <CheckCircle size={20} weight="fill"/>
                    {:else}
                        <Circle size={20}/>
                    {/if}
                </button>
                <div class="text-content">
                    <span class="text">{todo.text}</span>
                    {#if todo.dueDate}
                        <span class="due-date">{formatDate(todo.dueDate)}</span>
                    {/if}
                </div>
                <button class="remove" on:click={() => todos.removeTodo(todo.id)}>
                    <Trash size={18}/>
                </button>
            </div>
        {/each}
    </div>
    <div class="add-todo">
        <input
                class="text-input"
                type="text"
                bind:value={newTodoText}
                placeholder={$selectedDateStore ? 'Add task for selected date...' : 'Add a task...'}
                on:keydown={(e) => e.key === 'Enter' && handleAddTodo()}
        />
        <button class="add-button" on:click={handleAddTodo} aria-label="Add task">
            <Plus size={20}/>
        </button>
    </div>
</div>

<style>
    .todo-container {
        padding: 12px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        margin-bottom: 12px;
    }

    .header h3 {
        margin: 0 0 10px 0;
        font-weight: 500;
        text-align: center;
        font-size: 16px;
    }

    .todo-list {
        max-height: 150px;
        overflow-y: auto;
        margin-bottom: 10px;
        padding-right: 8px;
    }

    .todo-list::-webkit-scrollbar {
        width: 6px;
    }

    .todo-list::-webkit-scrollbar-track {
        background: rgba(255, 255, 255, 0.05);
        border-radius: 3px;
    }

    .todo-list::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.2);
        border-radius: 3px;
    }

    .todo-list::-webkit-scrollbar-thumb:hover {
        background: rgba(255, 255, 255, 0.3);
    }

    .todo-item {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 8px;
        font-size: 14px;
        border-radius: 6px;
        transition: background-color 0.2s;
    }

    .todo-item:hover {
        background-color: rgba(255, 255, 255, 0.05);
    }

    .todo-item.completed .text {
        text-decoration: line-through;
        opacity: 0.6;
    }

    .toggle {
        background: none;
        border: none;
        color: var(--primary-text);
        cursor: pointer;
        padding: 0;
        display: flex;
        align-items: center;
    }

    .text-content {
        flex-grow: 1;
        display: flex;
        flex-direction: column;
    }

    .due-date {
        font-size: 11px;
        color: var(--secondary-text);
        opacity: 0.8;
    }

    .remove {
        background: none;
        border: none;
        color: var(--secondary-text);
        cursor: pointer;
        opacity: 0.5;
        transition: opacity 0.2s, color 0.2s;
        width: 36px;
        height: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0;
    }

    .todo-item:hover .remove {
        opacity: 0.8;
    }

    .remove:hover {
        opacity: 1;
        color: var(--primary-text);
    }

    .add-todo {
        display: flex;
        gap: 8px;
        padding-right: 16px;
        box-sizing: border-box;
    }

    .add-todo input {
        background-color: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 6px;
        color: var(--primary-text);
        padding: 8px 10px;
        font-size: 13px;
        transition: border-color 0.2s, box-shadow 0.2s;
    }

    .add-todo input:focus {
        outline: none;
        border-color: var(--accent-color);
    }

    .text-input {
        flex-grow: 1;
    }

    .add-button {
        background-color: transparent;
        border: none;
        color: var(--primary-text);
        border-radius: 6px;
        padding: 0;
        width: 36px;
        height: 36px;
        cursor: pointer;
        font-weight: 500;
        transition: background-color 0.2s, color 0.2s;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .add-button:hover {
        background-color: rgba(255, 255, 255, 0.1);
        color: var(--accent-color-hover);
    }
</style>
