import { createContext, useState, useEffect, ReactNode } from 'react';

type ThemeColor = 'blue' | 'purple' | 'green' | 'orange' | 'rose';
type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
  themeColor: ThemeColor;
  setThemeColor: (color: ThemeColor) => void;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  toggleThemeMode: () => void;
}

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeContext = createContext<ThemeContextType>({
  themeColor: 'blue',
  setThemeColor: () => {},
  themeMode: 'light',
  setThemeMode: () => {},
  toggleThemeMode: () => {},
});

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [themeColor, setThemeColor] = useState<ThemeColor>(() => {
    const savedColor = localStorage.getItem('themeColor') as ThemeColor;
    return savedColor || 'blue';
  });

  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    const savedMode = localStorage.getItem('themeMode') as ThemeMode;
    if (savedMode) {
      return savedMode;
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    // 设置颜色主题类
    document.documentElement.classList.remove('theme-blue', 'theme-purple', 'theme-green', 'theme-orange', 'theme-rose');
    document.documentElement.classList.add(`theme-${themeColor}`);
    
    // 设置明暗模式类
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(themeMode);
    
    // 保存到本地存储
    localStorage.setItem('themeColor', themeColor);
    localStorage.setItem('themeMode', themeMode);
  }, [themeColor, themeMode]);

  const toggleThemeMode = () => {
    setThemeMode(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider 
      value={{ 
        themeColor, 
        setThemeColor, 
        themeMode, 
        setThemeMode,
        toggleThemeMode
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}