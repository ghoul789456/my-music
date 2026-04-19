import { useState, useContext } from "react";
import {
  Moon,
  Sun,
  ArrowRightFromSquare,
  Gear,
  Persons,
} from "@gravity-ui/icons";
import { Switch, Avatar, SearchField, Dropdown, Label } from "@heroui/react";
import ThemeContext from "../../contexts/ThemeContext";
import defaultImg from "../../assets/default.jpg";
import styles from "./index.module.css";
import { useNavigate } from "react-router";

export default function Header() {
  const themes = useContext(ThemeContext);
  if (!themes) throw new Error("no theme");
  const { isDark, toggleTheme } = themes;

  const navigate = useNavigate();
  const goHome = () => {
    navigate("/");
  };

  const [isOpen, setIsOpen] = useState(false);
  // 1. 判断本地是否有 token (建议封装成工具函数)
  // 即使有 token，实际开发中可能还需要判断是否过期，这里先做基础判断
  console.log(localStorage.getItem("token"));
  console.log(!localStorage.getItem("token"));
  const isLoggedIn = !!localStorage.getItem("token");

  const handleOpenChange = (isOpen: boolean) => {
    console.log("isOpen", isOpen);
    console.log("isLoggedIn", isLoggedIn);
    if (isOpen && !isLoggedIn) {
      navigate("/auth");
      setIsOpen(false);
    } else {
      setIsOpen(true);
    }
  };

  return (
    <div className={styles.header}>
      <div className={styles.logoImg} onClick={goHome}>
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
      <div className={styles.setting}>
        <Dropdown isOpen={isOpen} onOpenChange={handleOpenChange}>
          <Dropdown.Trigger className="rounded-full">
            <Avatar className={styles.avatarBox}>
              <Avatar.Image
                className="avatar-img"
                alt="John Doe"
                src={defaultImg}
              />
              <Avatar.Fallback>user</Avatar.Fallback>
            </Avatar>
          </Dropdown.Trigger>

          {/* <Dropdown.Popover>
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
          </Dropdown.Popover> */}

          <Dropdown.Popover>
            <div className="px-3 pt-3 pb-1">
              <div className="flex items-center gap-2">
                <Avatar size="sm">
                  <Avatar.Image
                    alt="Jane"
                    src="https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/avatars/orange.jpg"
                  />
                  <Avatar.Fallback delayMs={600}>JD</Avatar.Fallback>
                </Avatar>
                <div className="flex flex-col gap-0">
                  <p className="text-sm leading-5 font-medium">Jane Doe</p>
                  <p className="text-xs leading-none text-muted">
                    jane@example.com
                  </p>
                </div>
              </div>
            </div>
            <Dropdown.Menu>
              <Dropdown.Item id="dashboard" textValue="Dashboard">
                <Label>Dashboard</Label>
              </Dropdown.Item>
              <Dropdown.Item id="profile" textValue="Profile">
                <Label>Profile</Label>
              </Dropdown.Item>
              <Dropdown.Item id="settings" textValue="Settings">
                <div className="flex w-full items-center justify-between gap-2">
                  <Label>Settings</Label>
                  <Gear className="size-3.5 text-muted" />
                </div>
              </Dropdown.Item>
              <Dropdown.Item id="new-project" textValue="New project">
                <div className="flex w-full items-center justify-between gap-2">
                  <Label>Create Team</Label>
                  <Persons className="size-3.5 text-muted" />
                </div>
              </Dropdown.Item>
              <Dropdown.Item id="logout" textValue="Logout" variant="danger">
                <div className="flex w-full items-center justify-between gap-2">
                  <Label>Log Out</Label>
                  <ArrowRightFromSquare className="size-3.5 text-danger" />
                </div>
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
