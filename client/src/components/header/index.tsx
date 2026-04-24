import { useState, useContext, type Key } from "react";
import {
  Moon,
  Sun,
  ArrowRightFromSquare,
  Gear,
  Persons,
  ChevronLeft,
} from "@gravity-ui/icons";
import {
  Switch,
  Avatar,
  SearchField,
  Dropdown,
  Label,
  Button,
} from "@heroui/react";
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
  const dispatch = useDispatch<AppDispatch>();
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
        navigate("/profile");
        break;
      case "setting":
        break;
      default:
        break;
    }
  };

  //回退
  const backup = () => {
    navigate(-1);
  };

  return (
    <div className={styles.header}>
      <div className={styles.logoImg} onClick={goHome}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 100 100"
          width="100%"
          height="100%"
        >
          <circle cx="50" cy="50" r="50" fill={isDark ? "#111111" : "white"} />
          <ellipse
            cx="33"
            cy="64"
            rx="10"
            ry="7"
            transform="rotate(-22 33 64)"
            fill={isDark ? "white" : "#111111"}
          />
          <line
            x1="42"
            y1="58"
            x2="42"
            y2="25"
            stroke={isDark ? "white" : "#111111"}
            strokeWidth="3"
            strokeLinecap="round"
          />
          <ellipse
            cx="60"
            cy="55"
            rx="10"
            ry="7"
            transform="rotate(-22 60 55)"
            fill={isDark ? "white" : "#111111"}
          />
          <line
            x1="69"
            y1="49"
            x2="69"
            y2="16"
            stroke={isDark ? "white" : "#111111"}
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            d="M42 25 Q55.5 16 69 16"
            stroke={isDark ? "white" : "#111111"}
            strokeWidth="4.5"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M73 30 Q82 25 83 35 Q84 45 73 49"
            stroke={isDark ? "white" : "#111111"}
            strokeWidth="1.8"
            fill="none"
            strokeLinecap="round"
            opacity={isDark ? 0.7 : 0.65}
          />
          <path
            d="M76 20 Q91 13 93 30 Q95 47 77 54"
            stroke={isDark ? "white" : "#111111"}
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
            opacity={isDark ? 0.35 : 0.32}
          />
        </svg>
      </div>
      <div className={styles.backBtn}>
        <Button isIconOnly variant="tertiary" onClick={backup}>
          <ChevronLeft />
        </Button>
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
