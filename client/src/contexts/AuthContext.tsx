import React, { createContext, useContext, useState, ReactNode } from "react";

// Интерфейс для данных пользователя
interface User {
  id: number;
  username: string;
}

// Интерфейс для контекста
interface AuthContextType {
  user: User | null;
  login: (userData: User) => void; // Принимает данные пользователя
  logout: () => void; // Просто очищает состояние
}

// Создаем контекст
const AuthContext = createContext<AuthContextType | null>(null);

// Хук для использования контекста
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// Провайдер контекста
export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);

  // Функция для входа пользователя (принимает данные пользователя)
  const login = (userData: User) => {
    setUser(userData);
  };

  // Функция для выхода пользователя (очищает состояние)
  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
