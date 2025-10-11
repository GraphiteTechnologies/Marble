import type {Directory, Inode, VFSFile} from './vfs.types';
import {InodeType} from './vfs.types';

const FS_STORAGE_KEY = 'graphite_fs';

export class VFS {
    private root: Directory | null = null;

    constructor() {
        this.mount();
        console.log("Virtual File System Initialized");
    }

    private mount(): void {
        const storedFs = localStorage.getItem(FS_STORAGE_KEY);
        if(storedFs) {
            this.root = JSON.parse(storedFs);
        } else {
            this.initializeDefaultFs();
        }
    }

    private initializeDefaultFs(): void {
        console.log("No filesystem found. Initializing default FS.");
        this.root = {
            id: 'root',
            name: '/',
            type: InodeType.Directory,
            parentId: null,
            children: {},
        };

        this.mkdir('/home');
        this.mkdir('/system');
        this.mkdir('/apps');

        this.sync();
    }

    private sync(): void {
        if(this.root) {
            localStorage.setItem(FS_STORAGE_KEY, JSON.stringify(this.root, null, 2));
        }
    }

    public mkdir(path: string): void {
        if(!this.root) return;
        const parts = path.split('/').filter(p => p);
        let current: Directory = this.root;

        for(const part of parts) {
            if(!current.children[part]) {
                const newDir: Directory = {
                    id: `${current.id}/${part}`,
                    name: part,
                    type: InodeType.Directory,
                    parentId: current.id,
                    children: {},
                };
                current.children[part] = newDir;
            }
            const nextNode = current.children[part];
            if(nextNode.type !== InodeType.Directory) {
                throw new Error(`Path contains a file where a directory is expected: ${part}`);
            }
            current = nextNode as Directory;
        }
        this.sync();
    }

    private _resolvePath(path: string): { parent: Directory | null, node: Inode | null, remaining: string[] } {
        if(!this.root) return {parent: null, node: null, remaining: []};
        if(path === '/') return {parent: null, node: this.root, remaining: []};

        const parts = path.split('/').filter(p => p);
        let current: Directory = this.root;
        let parent: Directory | null = null;

        for(let i = 0; i < parts.length; i++) {
            const part = parts[i];
            const nextNode = current.children[part];

            if(!nextNode) {
                return {parent: current, node: null, remaining: parts.slice(i)};
            }

            if(nextNode.type === InodeType.Directory) {
                parent = current;
                current = nextNode as Directory;
            } else {
                if(i === parts.length - 1) {
                    return {parent: current, node: nextNode, remaining: []};
                } else {
                    throw new Error(`Path contains a file where a directory is expected: ${part}`);
                }
            }
        }
        return {parent, node: current, remaining: []};
    }

    public writeFile(path: string, content: string): void {
        const {parent, node, remaining} = this._resolvePath(path);

        if(!parent || remaining.length > 1) {
            throw new Error(`Invalid path: ${path}`);
        }

        const fileName = remaining[0];
        if(node && node.type === InodeType.Directory) {
            throw new Error(`Cannot write to a directory: ${path}`);
        }

        const newFile: VFSFile = {
            id: `${parent.id}/${fileName}`,
            name: fileName,
            type: InodeType.File,
            parentId: parent.id,
            content: content,
        };

        parent.children[fileName] = newFile;
        this.sync();
    }

    public readFile(path: string): string {
        const {node} = this._resolvePath(path);
        if(!node || node.type !== InodeType.File) {
            throw new Error(`File not found or not a file: ${path}`);
        }
        return (node as VFSFile).content;
    }

    public ls(path: string): string[] {
        const {node} = this._resolvePath(path);
        if(!node || node.type !== InodeType.Directory) {
            throw new Error(`Directory not found or not a directory: ${path}`);
        }
        return Object.keys((node as Directory).children);
    }

}
