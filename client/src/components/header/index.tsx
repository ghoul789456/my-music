import React from 'react'
import { useState,useContext } from 'react'
import { Moon, Sun } from "@gravity-ui/icons";
import { Switch } from "@heroui/react";
import ThemeContext from '../../contexts/ThemeContext';
import defaultImg from '../../assets/default.jpg';
import './index.css'
export default function Header() {
    const themes=useContext(ThemeContext)
    if(!themes) throw new Error("no theme");
    const {isDark,toggleTheme}=themes
    
    return (
        <div className='header'>
            <div className='logo-img'>
                <img src="" alt="logo" />
            </div>
            <div className='setting'>
                <img src={defaultImg} alt="个人中心" />
                <Switch
                    isSelected={isDark} onChange={toggleTheme}
                    size="lg"
                >
                    {({ isSelected }) => (
                        <>
                            <Switch.Control>
                                <Switch.Thumb>
                                    <Switch.Icon>
                                        {isSelected ? (
                                            <Moon className="size-4 text-inherit opacity-70" />
                                        ) : (
                                            <Sun className="size-4 text-inherit opacity-100" />
                                        )}
                                    </Switch.Icon>
                                </Switch.Thumb>
                            </Switch.Control>
                        </>
                    )}
                </Switch>
            </div>
        </div>
    )
}
