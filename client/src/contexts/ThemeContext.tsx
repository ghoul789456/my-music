import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'

type Theme = 'light' | 'dark'

interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
     isDark: boolean;
}
const ThemeContext = createContext<ThemeContextType|null>(null)
export default ThemeContext;

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setTheme] = useState<Theme>('light')

    useEffect(() => {
        document.documentElement.classList.toggle('dark', theme === 'dark')
    }, [theme])

    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light')
    }
    return (
        <ThemeContext.Provider value={{
            theme,
            toggleTheme,
             isDark: theme === 'dark' 
        }}>
            {children}
        </ThemeContext.Provider>
    );
};
