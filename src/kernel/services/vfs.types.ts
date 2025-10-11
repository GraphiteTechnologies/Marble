export enum InodeType {
  File = 'FILE',
  Directory = 'DIRECTORY',
}

export interface Inode {
  id: string;
  name: string;
  type: InodeType;
  parentId: string | null;
}

export interface VFSFile extends Inode {
  type: InodeType.File;
  content: string;
}

export interface Directory extends Inode {
  type: InodeType.Directory;
  children: { [name: string]: Inode };
}
