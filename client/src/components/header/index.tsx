import React from "react";
import { useState, useContext } from "react";
import { Moon, Sun } from "@gravity-ui/icons";
import { Switch, Avatar, SearchField, Dropdown, Button } from "@heroui/react";
import ThemeContext from "../../contexts/ThemeContext";
import defaultImg from "../../assets/default.jpg";
import "./index.css";
import { useNavigate } from "react-router";
export default function Header() {
  const themes = useContext(ThemeContext);
  if (!themes) throw new Error("no theme");
  const { isDark, toggleTheme } = themes;

  const navigate = useNavigate();
  const goHome = () => {
    navigate("/");
  };
  return (
    <div className="header">
      <div className="logo-img" onClick={goHome}>
        <img src="" alt="logo" />
      </div>
      <div>
        <SearchField name="search">
          <SearchField.Group>
            <SearchField.SearchIcon />
            <SearchField.Input className="w-80" placeholder="想播放什么？" />
            <SearchField.ClearButton />
          </SearchField.Group>
        </SearchField>
      </div>
      <div className="setting">
        {/* <Avatar className='avatar-box'>
                    <Avatar.Image className='avatar-img' alt="John Doe" src={defaultImg} />
                    <Avatar.Fallback>user</Avatar.Fallback>
                </Avatar> */}
        <Dropdown>
          <Button
            isIconOnly
            variant="outline"
            className="bg-transparent hover:bg-default-100 min-w-0 p-0 h-auto"
          >
            <Avatar className="avatar-box">
              <Avatar.Image
                className="avatar-img"
                alt="John Doe"
                src={defaultImg}
              />
              <Avatar.Fallback>user</Avatar.Fallback>
            </Avatar>
          </Button>
          <Dropdown.Popover>
            <Dropdown.Menu>
              <Dropdown.Item id="profile" textValue="Profile">
                个人主页
              </Dropdown.Item>
              <Dropdown.Item id="settings" textValue="Settings">
                设置
              </Dropdown.Item>
              <Dropdown.Item id="logout" textValue="Logout">
                退出登录
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown.Popover>
        </Dropdown>

        <Switch isSelected={isDark} onChange={toggleTheme} size="lg">
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
  );
}
