import { writable, get } from 'svelte/store';
import { sendToast } from './toasterStore';

export interface User {
  id: string;
  username: string;
  passwordHash: string;
  pfp: string;
}

const USERS_STORAGE_KEY = 'graphite-users';

const createAccountStore = () => {
  const { subscribe, set, update } = writable<User[]>([]);

  const loadUsers = () => {
    const usersJson = localStorage.getItem(USERS_STORAGE_KEY);
    if (usersJson) {
      set(JSON.parse(usersJson));
    }
  };

  const saveUsers = (users: User[]) => {
    try {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    } catch (exception) {
      if (exception instanceof DOMException && exception.name === 'QuotaExceededError') {
        sendToast('Error: Storage quota exceeded. Please use a smaller profile picture.', 'error');
      } else {
        sendToast('An unknown error occurred while saving user data.', 'error');
      }
      throw exception;
    }
  };

  const hashPassword = async (password: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hash))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  };

  const createUser = async (username: string, password: string, pfp: string) => {
    const passwordHash = await hashPassword(password);
    const newUser: User = {
      id: crypto.randomUUID(),
      username,
      passwordHash,
      pfp,
    };
    update((users) => {
      const newUsers = [...users, newUser];
      saveUsers(newUsers);
      return newUsers;
    });
  };

  const updateUser = async (userId: string, data: Partial<{ username: string; password: string; pfp: string }>) => {
    update((users) => {
      const userIndex = users.findIndex((u) => u.id === userId);
      if (userIndex === -1) return users;

      const updatedUsers = [...users];
      const userToUpdate = { ...updatedUsers[userIndex] };

      if (data.username) {
        userToUpdate.username = data.username;
      }
      if (data.pfp) {
        userToUpdate.pfp = data.pfp;
      }
      
      if (data.password) {
        hashPassword(data.password).then(hash => {
            userToUpdate.passwordHash = hash;
        });
      }

      updatedUsers[userIndex] = userToUpdate;
      saveUsers(updatedUsers);
      return updatedUsers;
    });
  };

  const login = async (userId: string, password: string): Promise<boolean> => {
    const passwordHash = await hashPassword(password);
    const user = get(accounts).find((u) => u.id === userId);
    if (user && user.passwordHash === passwordHash) {
      sessionStorage.setItem('graphite-session', JSON.stringify({ userId: user.id }));
      return true;
    }
    return false;
  };

  const logout = () => {
    sessionStorage.removeItem('graphite-session');
  };

  const getSession = (): { userId: string } | null => {
    const sessionJson = sessionStorage.getItem('graphite-session');
    if (sessionJson) {
      return JSON.parse(sessionJson);
    }
    return null;
  };

  const getCurrentUser = (): User | null => {
    const session = getSession();
    if (session) {
      return get(accounts).find(u => u.id === session.userId) || null;
    }
    return null;
  }

  loadUsers();

  return {
    subscribe,
    createUser,
    updateUser,
    login,
    logout,
    getSession,
    getCurrentUser,
  };
};

export const accounts = createAccountStore();
