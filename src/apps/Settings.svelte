<script lang="ts">
    import {getContext, onMount} from 'svelte';
    import type {Kernel} from '../kernel/Kernel';
    import {accounts, type User} from '../shell/store/accountStore';

    export let section: string | null = null;
    let wallpapers: string[] = [];
    let selectedWallpaper: string = '';
    let activeSection = section || 'appearance';

    let currentUser: User | null = null;
    let newUsername = '';
    let newPassword = '';

    accounts.subscribe(() => {
        currentUser = accounts.getCurrentUser();
        if(currentUser) {
            newUsername = currentUser.username;
        }
    });

    onMount(async() => {
        const kernel = getContext<Kernel>('kernel');
        const vfs = kernel.vfs;
        const wallpaperFiles = vfs.readDir('/usr/share/wallpapers');
        wallpapers = wallpaperFiles.map(file => file.name);

        const currentUser = accounts.getCurrentUser();
        if(currentUser?.wallpaper) {
            if(currentUser.wallpaper.startsWith('data:')) {
                selectedWallpaper = 'custom';
            } else {
                selectedWallpaper = currentUser.wallpaper;
            }
        } else {
            selectedWallpaper = 'shards.jpeg';
        }
    });

    function changeWallpaper(wallpaper: string) {
        if(!currentUser) return;
        accounts.updateUser(currentUser.id, {wallpaper});
        selectedWallpaper = wallpaper;
    }

    function handleWallpaperUpload(event: Event) {
        const target = event.target as HTMLInputElement;
        const file = target.files?.[0];

        if(!file || !currentUser)
            return;

        const reader = new FileReader();
        reader.onload = () => {
            const dataUrl = reader.result as string;
            accounts.updateUser(currentUser!.id, {wallpaper: dataUrl});
            selectedWallpaper = 'custom';
        };
        reader.readAsDataURL(file);
    }

    const resizeImage = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX_WIDTH = 256;
                    const MAX_HEIGHT = 256;
                    let width = img.width;
                    let height = img.height;

                    if(width > height) {
                        if(width > MAX_WIDTH) {
                            height *= MAX_WIDTH / width;
                            width = MAX_WIDTH;
                        }
                    } else {
                        if(height > MAX_HEIGHT) {
                            width *= MAX_HEIGHT / height;
                            height = MAX_HEIGHT;
                        }
                    }
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    if(!ctx) {
                        return reject(new Error('Failed to get canvas context'));
                    }
                    ctx.drawImage(img, 0, 0, width, height);
                    resolve(canvas.toDataURL('image/jpeg', 0.9));
                };
                img.onerror = reject;
                img.src = event.target?.result as string;
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };

    async function handlePfpUpload(event: Event) {
        const target = event.target as HTMLInputElement;
        const file = target.files?.[0];

        if(!file || !currentUser) return;

        try {
            const resizedPfp = await resizeImage(file);
            accounts.updateUser(currentUser!.id, {pfp: resizedPfp});
        } catch(error) {
            console.error('Failed to resize image:', error);
        }
    }

    function handleAccountUpdate() {
        if(!currentUser) return;

        const updates: Partial<User> = {};
        if(newUsername !== currentUser.username) {
            updates.username = newUsername;
        }
        if(newPassword) {
            updates.password = newPassword;
        }

        if(Object.keys(updates).length > 0) {
            accounts.updateUser(currentUser.id, updates);
            if(newPassword) {
                newPassword = '';
            }
        }
    }

    function handlePowerwash() {
        if(confirm('Are you sure you want to powerwash? This will delete all your data and restart the system.')) {
            localStorage.clear();
            sessionStorage.clear();
            window.location.reload();
        }
    }
</script>

<div class="app-container settings-container">
    <div class="sidebar">
        <h2>Settings</h2>
        <nav>
            <button class:active={activeSection === 'appearance'} on:click={() => activeSection = 'appearance'}>
                Appearance
            </button>
            <button class:active={activeSection === 'account'} on:click={() => activeSection = 'account'}>
                Account
            </button>
            <button class:active={activeSection === 'system'} on:click={() => activeSection = 'system'}>
                System
            </button>
            <button class:active={activeSection === 'about'} on:click={() => activeSection = 'about'}>
                About
            </button>
        </nav>
    </div>
    <div class="content">
        {#if activeSection === 'appearance'}
            <section>
                <h2>Appearance</h2>
                <div class="form-group">
                    <label>Wallpaper</label>
                    <div class="wallpaper-selection">
                        {#each wallpapers as wallpaper}
                            <div class="wallpaper-preview" class:selected={selectedWallpaper === wallpaper}
                                 on:click={() => changeWallpaper(wallpaper)}>
                                <img src={`/wallpapers/${wallpaper}`} alt={wallpaper}/>
                            </div>
                        {/each}
                    </div>
                </div>
                <div class="form-group">
                    <label for="wallpaper-upload">Upload Custom Wallpaper</label>
                    <div class="file-input-wrapper">
                        <button class="btn">Choose File</button>
                        <input id="wallpaper-upload" type="file" accept="image/*" on:change={handleWallpaperUpload}/>
                    </div>
                </div>
            </section>
        {:else if activeSection === 'account'}
            <section>
                <h2>Account</h2>
                {#if currentUser}
                    <div class="form-group">
                        <label>Profile Picture</label>
                        <div class="pfp-container">
                            <img src={currentUser.pfp} alt="Profile Picture" class="pfp-preview"/>
                            <input type="file" id="pfp-upload" accept="image/*" on:change={handlePfpUpload}
                                   style="display: none;"/>
                            <label for="pfp-upload" class="btn">Change</label>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="username-input">Username</label>
                        <input id="username-input" type="text" bind:value={newUsername}/>
                    </div>
                    <div class="form-group">
                        <label for="password-input">New Password</label>
                        <input id="password-input" type="password" bind:value={newPassword}
                               placeholder="Leave blank to keep current password"/>
                    </div>
                    <button class="btn" on:click={handleAccountUpdate}>Save Changes</button>
                {/if}
            </section>
        {:else if activeSection === 'system'}
            <section>
                <h2>System</h2>
                <div class="form-group">
                    <label>Powerwash</label>
                    <p>Reset your device to its factory settings. This will delete all your data.</p>
                    <button class="btn btn-danger" on:click={handlePowerwash}>Powerwash</button>
                </div>
            </section>
        {:else if activeSection === 'about'}
            <section>
                <h2>About</h2>
                <p>Graphite is a modern, web-based operating system.</p>
            </section>
        {/if}
    </div>
</div>

<style>
    @import '../shell/AppKit.css';

    .settings-container {
        display: flex;
        height: 100%;
    }


    .sidebar {
        width: 200px;
        background: transparent;
        padding: 20px;
        border-right: 1px solid var(--border-color);
    }

    .sidebar h2 {
        margin-top: 0;
    }

    .sidebar nav {
        display: flex;
        flex-direction: column;
        gap: 10px;
    }

    .sidebar nav button {
        background: none;
        border: none;
        color: var(--primary-text);
        padding: 10px;
        text-align: left;
        cursor: pointer;
        border-radius: var(--border-radius);
    }

    .sidebar nav button.active {
        background: var(--accent-color);
        color: white;
    }

    .content {
        flex: 1;
        padding: 20px;
    }

    .content .btn {
        background-color: var(--accent-color);
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: var(--border-radius);
        cursor: pointer;
    }

    .content .btn-danger {
        background-color: #dc3545;
        color: white;
    }

    .pfp-container {
        display: flex;
        align-items: center;
        gap: 10px;
    }

    .pfp-preview {
        width: 60px;
        height: 60px;
        border-radius: 50%;
    }

    .wallpaper-selection {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
        gap: 10px;
        max-height: 300px;
        overflow-y: auto;
    }

    .wallpaper-preview {
        cursor: pointer;
        border: 2px solid transparent;
        border-radius: 8px;
        overflow: hidden;
    }

    .wallpaper-preview.selected {
        border-color: var(--accent-color);
    }

    .wallpaper-preview img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
</style>
