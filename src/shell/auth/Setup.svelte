<script lang="ts">
    import {createEventDispatcher, getContext, onMount} from 'svelte';
    import {accounts} from '../store/accountStore';
    import type {Kernel} from '../../kernel/Kernel';
    import {fade, fly} from 'svelte/transition';

    const dispatch = createEventDispatcher();
    const kernel = getContext<Kernel>('kernel');

    let step = 0;
    let username = '';
    let password = '';
    let confirmPassword = '';
    let pfp = '/assets/pfp/default.png';
    let wallpapers: string[] = [];
    let selectedWallpaper = 'shards.jpeg';
    let container: HTMLElement;

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
            await accounts.createUser(username, password, pfp, selectedWallpaper);
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
    }

    $: passwordsMatch = password === confirmPassword;

    $: if (container) {
        const background = selectedWallpaper.startsWith('data:')
            ? `url(${selectedWallpaper})`
            : `url(/wallpapers/${selectedWallpaper})`;
        container.style.setProperty('--bg-image', background);
    }
</script>

<div class="auth-container-wrapper" bind:this={container}>
    <div class="setup-container">
        {#if step === 0}
            <div class="step welcome-layout" in:fly={{ y: 20, duration: 500 }} out:fade>
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
            <div class="step creation-step" in:fly={{ y: 20, duration: 500 }} out:fade>
                <div class="pfp-section">
                    <h2>Choose your picture</h2>
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
                </div>
                <div class="divider"/>
                <div class="form-section">
                    <h2>Create your account</h2>
                    <input type="text" placeholder="Username" bind:value={username}/>
                    <input type="password" placeholder="Password" bind:value={password}/>
                    <input type="password" placeholder="Confirm Password" bind:value={confirmPassword}/>
                    {#if !passwordsMatch && confirmPassword}
                        <p class="error" in:fade>Passwords do not match.</p>
                    {/if}
                    <div class="buttons">
                        <button on:click={prevStep}>Back</button>
                        <button on:click={nextStep} disabled={!username || !password || !passwordsMatch}>Next</button>
                    </div>
                </div>
            </div>
        {/if}

        {#if step === 2}
            <div class="step" in:fly={{ y: 20, duration: 500 }} out:fade>
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
    .auth-container-wrapper {
        transition: background-image 0.5s ease-in-out;
    }

    .setup-container {
        position: relative;
    }

    .step {
        position: absolute;
        width: 100%;
        box-sizing: border-box;
    }

    input {
        transition: border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
    }

    input:focus {
        box-shadow: 0 0 5px rgba(255, 255, 255, 0.5);
    }

    .error {
        color: #ff9a9a;
        font-size: 14px;
        margin-top: -5px;
        margin-bottom: 5px;
    }

    .creation-step {
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 40px;
    }

    .pfp-section, .form-section {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10px;
    }

    .divider {
        width: 1px;
        background-color: #444;
        height: 300px;
    }

    .pfp-selection {
        display: flex;
        gap: 10px;
        justify-content: center;
        margin-bottom: 20px;
    }

    .pfp-option, .pfp-upload-label {
        width: 80px;
        height: 80px;
        border-radius: 50%;
        cursor: pointer;
        border: 2px solid transparent;
        transition: border-color 0.2s, transform 0.2s;
    }

    .pfp-option:hover, .pfp-upload-label:hover {
        transform: scale(1.05);
    }

    .pfp-option.selected {
        border-color: white;
    }

    .pfp-upload-label {
        display: flex;
        align-items: center;
        justify-content: center;
        background: #333;
        font-size: 32px;
    }

    #pfp-upload {
        display: none;
    }

    .pfp-preview {
        width: 120px;
        height: 120px;
        border-radius: 50%;
        object-fit: cover;
        border: 2px solid white;
        transition: transform 0.3s;
    }

    .pfp-section:hover .pfp-preview {
        transform: scale(1.03);
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
        transition: border-color 0.2s, transform 0.2s;
    }

    .wallpaper-preview img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
</style>
