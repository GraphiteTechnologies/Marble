<script lang="ts">
    import {createEventDispatcher, getContext, onMount} from 'svelte';
    import {accounts} from '../store/accountStore';
    import type {Kernel} from '../../kernel/Kernel';

    const dispatch = createEventDispatcher();
    const kernel = getContext<Kernel>('kernel');

    let step = 0;
    let username = '';
    let password = '';
    let pfp = '/assets/pfp/default.png';
    let wallpapers: string[] = [];
    let selectedWallpaper = 'shards.jpeg';

    const defaultPfps = [
        '/assets/pfp/default.png',
        '/assets/pfp/cat.png',
    ];

    onMount(() => {
        const wallpaperFiles = kernel.vfs.readDir('/usr/share/wallpapers');
        wallpapers = wallpaperFiles.map(file => file.name);
    });

    const nextStep = () => {
        step++;
    };

    const prevStep = () => {
        step--;
    };

    const createAccount = async() => {
        try {
            await accounts.createUser(username, password, pfp);
            localStorage.setItem('wallpaper', selectedWallpaper);
            dispatch('accountCreated');
        } catch {}
    };

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

    const handlePfpUpload = async(event: Event) => {
        const target = event.target as HTMLInputElement;
        const file = target.files?.[0];

        if(!file) return;

        try {
            pfp = await resizeImage(file);
        } catch(error) {
            console.error('Failed to resize image:', error);
        }
    };

    function changeWallpaper(wallpaper: string) {
        selectedWallpaper = wallpaper;
        const authContainer = document.querySelector('.auth-container-wrapper') as HTMLElement;
        if(authContainer) {
            authContainer.style.setProperty('--bg-image', `url(/wallpapers/${selectedWallpaper})`);
        }
    }
</script>

<div class="auth-container-wrapper">
    <div class="setup-container">
        {#if step === 0}
            <div class="step welcome-layout">
                <div class="welcome-text">
                    <div>
                        <h1>Welcome your new Grafbook</h1>
                        <p>Fast. Secure. Effortless.</p>
                    </div>
                    <button on:click={nextStep}>Get started</button>
                </div>
                <div class="welcome-image">
                    <img src="/assets/setup/setup.png" alt="Setup illustration"/>
                </div>
            </div>
        {/if}

        {#if step === 1}
            <div class="step">
                <h2>Create your account</h2>
                <input type="text" placeholder="Username" bind:value={username}/>
                <input type="password" placeholder="Password" bind:value={password}/>
                <div class="buttons">
                    <button on:click={prevStep}>Back</button>
                    <button on:click={nextStep} disabled={!username || !password}>Next</button>
                </div>
            </div>
        {/if}

        {#if step === 2}
            <div class="step">
                <h2>Choose your profile picture</h2>
                <div class="pfp-selection">
                    {#each defaultPfps as defaultPfp}
                        <img
                                src={defaultPfp}
                                alt="Profile picture"
                                class="pfp-option"
                                class:selected={pfp === defaultPfp}
                                on:click={() => (pfp = defaultPfp)}
                        />
                    {/each}
                    <label for="pfp-upload" class="pfp-upload-label">
                        +
                        <input id="pfp-upload" type="file" accept="image/*" on:change={handlePfpUpload}/>
                    </label>
                </div>
                <img src={pfp} alt="Profile picture" class="pfp-preview"/>
                <div class="buttons">
                    <button on:click={prevStep}>Back</button>
                    <button on:click={nextStep}>Next</button>
                </div>
            </div>
        {/if}

        {#if step === 3}
            <div class="step">
                <h2>Choose your wallpaper</h2>
                <div class="wallpaper-selection">
                    {#each wallpapers as wallpaper}
                        <div class="wallpaper-preview" class:selected={selectedWallpaper === wallpaper}
                             on:click={() => changeWallpaper(wallpaper)}>
                            <img src={`/wallpapers/${wallpaper}`} alt={wallpaper}/>
                        </div>
                    {/each}
                </div>
                <div class="buttons">
                    <button on:click={prevStep}>Back</button>
                    <button on:click={createAccount}>Finish setup</button>
                </div>
            </div>
        {/if}
    </div>
</div>

<style>
    .pfp-selection {
        display: flex;
        gap: 10px;
        justify-content: center;
        margin-bottom: 20px;
    }

    .pfp-option {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        cursor: pointer;
        border: 2px solid transparent;
        transition: border-color 0.2s;
    }

    .pfp-option.selected {
        border-color: white;
    }

    .pfp-upload-label {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #333;
        cursor: pointer;
        font-size: 24px;
    }

    #pfp-upload {
        display: none;
    }

    .wallpaper-selection {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
        gap: 10px;
        max-height: 300px;
        overflow-y: auto;
        margin-bottom: 20px;
    }

    .wallpaper-preview {
        cursor: pointer;
        border: 2px solid transparent;
        border-radius: 8px;
        overflow: hidden;
    }

    .wallpaper-preview.selected {
        border-color: white;
    }

    .wallpaper-preview img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
</style>
