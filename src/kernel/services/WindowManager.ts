import type {WindowState} from './windowManager.types';
import type {AppManifest} from '../../apps/types';

type Subscription = (windows: WindowState[]) => void;

export class WindowManager {
    private windows: WindowState[] = [];
    private subscriptions: Set<Subscription> = new Set();
    private nextZIndex = 1;
    private nextWindowId = 1;

    constructor() {
        console.log("Window Manager Initialized");
    }

    subscribe(callback: Subscription): () => void {
        this.subscriptions.add(callback);
        callback(this.windows);

        return () => {
            this.subscriptions.delete(callback);
        };
    }

    private notify(): void {
        this.subscriptions.forEach(callback => callback(this.windows));
    }

    public open(app: AppManifest): void {
        const newWindow: WindowState = {
            id: `win-${this.nextWindowId++}`,
            appId: app.id,
            title: app.name,
            position: {x: 50 + this.windows.length * 20, y: 50 + this.windows.length * 20},
            size: {width: 800, height: 600},
            zIndex: this.nextZIndex++,
            isFocused: true,
            isMinimized: false,
            isMaximized: false,
        };

        this.windows.forEach(win => win.isFocused = false);

        this.windows = [...this.windows, newWindow];
        this.notify();
    }

    public close(windowId: string): void {
        this.windows = this.windows.filter(win => win.id !== windowId);

        if(this.windows.length > 0) {
            const topWindow = this.windows.reduce((prev, current) => (prev.zIndex > current.zIndex) ? prev : current);
            this.focus(topWindow.id);
        }

        this.notify();
    }

    public focus(windowId: string): void {
        const windowToFocus = this.windows.find(win => win.id === windowId);
        if(!windowToFocus) return;

        if(!windowToFocus.isFocused) {
            this.windows.forEach(win => {
                win.isFocused = win.id === windowId;

                if(win.id === windowId)
                    win.zIndex = this.nextZIndex++;
            });
        }

        this.notify();
    }

    public resize(windowId: string, newSize: { width: number, height: number }): void {
        const windowToResize = this.windows.find(win => win.id === windowId);

        if(!windowToResize)
            return;

        windowToResize.size = newSize;
        this.notify();
    }

    public minimize(windowId: string): void {
        const windowToMinimize = this.windows.find(win => win.id === windowId);
        if(!windowToMinimize)
            return;

        windowToMinimize.isMinimized = true;
        this.notify();
    }

    public restore(windowId: string): void {
        const windowToRestore = this.windows.find(win => win.id === windowId);
        if(!windowToRestore)
            return;

        windowToRestore.isMinimized = false;
        this.focus(windowId);
        this.notify();
    }

    public toggleMaximize(windowId: string): void {
        const windowToMaximize = this.windows.find(win => win.id === windowId);
        if(!windowToMaximize)
            return;

        windowToMaximize.isMaximized = !windowToMaximize.isMaximized;

        if(windowToMaximize.isMaximized)
            windowToMaximize.isMinimized = false;

        this.notify();
    }

    public setPosition(windowId: string, newPosition: { x: number, y: number }): void {
        const windowToMove = this.windows.find(win => win.id === windowId);

        if(!windowToMove)
            return;

        windowToMove.position = newPosition;
        this.notify();
    }
}
