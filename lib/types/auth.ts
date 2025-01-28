export interface User {
    id: string;
    phone: string;
    token?: string;
  }
  
  export interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
  }
  
  export interface AuthContextType extends AuthState {
    login: (user: User) => void;
    logout: () => void;
  }