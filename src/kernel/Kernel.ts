import { VFS } from './services/VFS';
import { ProcessManager } from './services/ProcessManager';
import { WindowManager } from './services/WindowManager';

export class Kernel {
  public vfs: VFS;
  public processManager: ProcessManager;
  public windowManager: WindowManager;

  constructor() {
    this.vfs = new VFS();
    this.processManager = new ProcessManager();
    this.windowManager = new WindowManager();
    console.log("Kernel Initialized");
  }
}
