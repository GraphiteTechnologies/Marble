<script lang="ts">
  import { accounts, type User } from '../store/accountStore';
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

  let users: User[] = [];
  accounts.subscribe((value) => {
    users = value;
  });

  let selectedUser: User | null = users[0] || null;
  let password = '';
  let error = '';

  const login = async () => {
    if (!selectedUser) return;

    const success = await accounts.login(selectedUser.id, password);
    if (success) {
      dispatch('loginSuccess');
    } else {
      error = 'Incorrect password.';
    }
  };
</script>

<div class="login-container">
  <div class="user-selection">
    {#each users as user}
      <div class="user-card" on:click={() => (selectedUser = user)} class:selected={selectedUser?.id === user.id}>
        <img src={user.pfp} alt={user.username} />
        <span>{user.username}</span>
      </div>
    {/each}
  </div>

  {#if selectedUser}
    <div class="login-form">
      <h2>{selectedUser.username}</h2>
      <input
        type="password"
        placeholder="Password"
        bind:value={password}
        on:keydown={(e) => e.key === 'Enter' && login()}
      />
      <button on:click={login}>Login</button>
      {#if error}
        <p class="error">{error}</p>
      {/if}
    </div>
  {/if}
</div>
