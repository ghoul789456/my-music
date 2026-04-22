import { useState, useContext, type Key } from "react";
import {
  Moon,
  Sun,
  ArrowRightFromSquare,
  Gear,
  Persons,
} from "@gravity-ui/icons";
import { Switch, Avatar, SearchField, Dropdown, Label } from "@heroui/react";
import ThemeContext from "../../contexts/ThemeContext";
import styles from "./index.module.css";
import { useNavigate } from "react-router";
import { useSelector, useDispatch } from "react-redux";
import { type RootState, type AppDispatch } from "../../store/store";
import { logout } from "../../store/userSlice";

export default function Header() {
  const themes = useContext(ThemeContext);
  if (!themes) throw new Error("no theme");
  const { isDark, toggleTheme } = themes;

  const navigate = useNavigate();
  const goHome = () => {
    navigate("/");
  };

  //获取个人信息
  const { userInfo, isLoggedIn } = useSelector(
    (state: RootState) => state.user,
  );
  const dispatch = useDispatch();
  console.log("userInfo", userInfo);

  //判断是否登录
  const [isOpen, setIsOpen] = useState(false);
  const handleOpenChange = (isOpen: boolean) => {
    console.log("isOpen", isOpen);
    console.log("isLoggedIn", isLoggedIn);
    if (isLoggedIn) {
      if (isOpen) {
        setIsOpen(true);
      } else {
        setIsOpen(false);
      }
    } else {
      navigate("/auth");
      setIsOpen(false);
    }
  };
  //处理头像下拉框选项
  const handleAction = (key: Key) => {
    switch (key) {
      case "logout":
        localStorage.removeItem("auth_data");
        dispatch(logout());
        break;
      case "profile":
        break;
      case "setting":
        break;
      default:
        break;
    }
  };

  return (
    <div className={styles.header}>
      <div className={styles.logoImg} onClick={goHome}>
        {/* <img src={defaultLogo} alt="logo" /> */}

        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 100 100"
          width="35"
          height="35"
        >
          <circle cx="50" cy="50" r="50" fill="#111111" />
          <ellipse
            cx="33"
            cy="64"
            rx="10"
            ry="7"
            transform="rotate(-22 33 64)"
            fill="white"
          />
          <line
            x1="42"
            y1="58"
            x2="42"
            y2="25"
            stroke="white"
            stroke-width="3"
            stroke-linecap="round"
          />
          <ellipse
            cx="60"
            cy="55"
            rx="10"
            ry="7"
            transform="rotate(-22 60 55)"
            fill="white"
          />
          <line
            x1="69"
            y1="49"
            x2="69"
            y2="16"
            stroke="white"
            stroke-width="3"
            stroke-linecap="round"
          />
          <path
            d="M42 25 Q55.5 16 69 16"
            stroke="white"
            stroke-width="4.5"
            fill="none"
            stroke-linecap="round"
          />
          <path
            d="M73 30 Q82 25 83 35 Q84 45 73 49"
            stroke="white"
            stroke-width="1.8"
            fill="none"
            stroke-linecap="round"
            opacity="0.7"
          />
          <path
            d="M76 20 Q91 13 93 30 Q95 47 77 54"
            stroke="white"
            stroke-width="1.5"
            fill="none"
            stroke-linecap="round"
            opacity="0.35"
          />
        </svg>
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
                alt="user"
                src={
                  userInfo?.avatar ||
                  "https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/avatars/orange.jpg"
                }
              />
              <Avatar.Fallback>{userInfo?.username}</Avatar.Fallback>
            </Avatar>
          </Dropdown.Trigger>

          <Dropdown.Popover>
            <div className="px-3 pt-3 pb-1">
              <div className="flex items-center gap-2">
                <Avatar size="sm">
                  <Avatar.Image
                    alt="user"
                    src={
                      userInfo?.avatar ||
                      "https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/avatars/orange.jpg"
                    }
                  />
                  <Avatar.Fallback delayMs={600}>
                    {userInfo?.username}
                  </Avatar.Fallback>
                </Avatar>
                <div className="flex flex-col gap-0">
                  <p className="text-sm leading-5 font-medium">
                    {userInfo?.username}
                  </p>
                  <p className="text-xs leading-none text-muted">
                    {userInfo?.email}
                  </p>
                </div>
              </div>
            </div>
            <Dropdown.Menu onAction={handleAction}>
              <Dropdown.Item id="profile" textValue="Profile">
                <Label>个人资料</Label>
              </Dropdown.Item>
              <Dropdown.Item id="settings" textValue="Settings">
                <div className="flex w-full items-center justify-between gap-2">
                  <Label>设置</Label>
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
                  <Label>退出</Label>
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
