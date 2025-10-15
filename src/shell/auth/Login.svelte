<script lang="ts">
  import { accounts, type User } from '../store/accountStore';
  import { createEventDispatcher } from 'svelte';
  import { fade } from 'svelte/transition';

  const dispatch = createEventDispatcher();

  let users: User[] = [];
  let selectedUser: User | null = null;
  let password = '';
  let error = '';
  let container: HTMLElement;

  accounts.subscribe((value) => {
    users = value;
    if (!selectedUser && users.length > 0) {
      selectedUser = users[0];
    }
  });

  const login = async () => {
    if (!selectedUser) return;

    const success = await accounts.login(selectedUser.id, password);
    if (success) {
      dispatch('loginSuccess');
    } else {
      error = 'Incorrect password.';
      password = '';
    }
  };

  $: if (container && selectedUser) {
    const background = selectedUser.wallpaper
      ? selectedUser.wallpaper.startsWith('data:')
        ? `url(${selectedUser.wallpaper})`
        : `url(/wallpapers/${selectedUser.wallpaper})`
      : 'url(/wallpapers/shards.jpeg)';
    container.style.setProperty('--bg-image', background);
  }
</script>

<div class="modern-login-container" bind:this={container} transition:fade>
  {#if selectedUser}
    <div class="login-box" in:fade={{ duration: 300 }}>
      <img class="pfp" src={selectedUser.pfp} alt={selectedUser.username} />
      <h2 class="username">{selectedUser.username}</h2>
      <div class="password-wrapper">
        <input
          type="password"
          placeholder="Password"
          bind:value={password}
          on:keydown={(e) => e.key === 'Enter' && login()}
        />
        <button class="login-button" on:click={login}>→</button>
      </div>
      {#if error}
        <p class="error">{error}</p>
      {/if}
    </div>
  {/if}

  {#if users.length > 1}
    <div class="user-switcher">
      <span>Not {selectedUser?.username}?</span>
      {#each users.filter(u => u.id !== selectedUser?.id) as user}
        <button class="user-pill" on:click={() => { selectedUser = user; error = ''; password = ''; }}>
          <img src={user.pfp} alt={user.username} />
          <span>{user.username}</span>
        </button>
      {/each}
    </div>
  {/if}
</div>

{#each users as user}
    {#if user.wallpaper && !user.wallpaper.startsWith('data:')}
        <link rel="preload" href="/wallpapers/{user.wallpaper}" as="image" />
    {/if}
{/each}

<style>
  .modern-login-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100vh;
    width: 100vw;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
    Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    color: white;
    text-align: center;
    position: relative;
  }

  .modern-login-container::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: var(--bg-image);
    background-size: cover;
    background-position: center;
    filter: blur(8px);
    z-index: -1;
    transition: background-image 0.5s ease-in-out;
  }

  .login-box {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    padding: 40px;
    border-radius: 24px;
  }

  .pfp {
    width: 128px;
    height: 128px;
    border-radius: 50%;
    object-fit: cover;
    border: 3px solid rgba(255, 255, 255, 0.8);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  }

  .username {
    font-size: 24px;
    font-weight: 500;
    margin: 0;
  }

  .password-wrapper {
    position: relative;
    display: flex;
    align-items: center;
  }

  .password-wrapper input {
    width: 250px;
    padding: 12px 50px 12px 20px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 9999px;
    background: rgba(0, 0, 0, 0.2);
    color: white;
    font-size: 16px;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
  }

  .password-wrapper input:focus {
    border-color: rgba(255, 255, 255, 0.8);
    box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.2);
  }

  .login-button {
    position: absolute;
    right: 5px;
    width: 36px;
    height: 36px;
    border-radius: 9999px;
    border: none;
    background-color: rgba(255, 255, 255, 0.9);
    color: #222;
    font-size: 20px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color 0.2s;
  }

  .login-button:hover {
    background-color: white;
  }

  .error {
    color: #ff9a9a;
    margin-top: 8px;
  }

  .user-switcher {
    position: absolute;
    bottom: 40px;
    display: flex;
    align-items: center;
    gap: 12px;
    background-color: rgba(0, 0, 0, 0.2);
    padding: 8px 16px;
    border-radius: 9999px;
  }

  .user-pill {
    display: flex;
    align-items: center;
    gap: 8px;
    background: none;
    border: none;
    color: white;
    cursor: pointer;
    padding: 4px;
    border-radius: 9999px;
    transition: background-color 0.2s;
  }

  .user-pill:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }

  .user-pill img {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    object-fit: cover;
  }
</style>
