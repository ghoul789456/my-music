import { useState } from "react";
import styles from "./index.module.scss";

// ─────────────────────────────────────────────
// 类型定义
// ─────────────────────────────────────────────

interface LoginValues {
  email: string;
  password: string;
  remember: boolean;
}

interface RegisterValues {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface LoginErrors {
  email?: string;
  password?: string;
  form?: string;
}

interface RegisterErrors {
  username?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  form?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  remember: boolean;
}

export interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
}

type AuthTab = "login" | "register";

// ─────────────────────────────────────────────
// useLoginForm Hook
// ─────────────────────────────────────────────

function useLoginForm() {
  const [values, setValues] = useState<LoginValues>({
    email: "",
    password: "",
    remember: false,
  });
  const [errors, setErrors] = useState<LoginErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setValues((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errors[name as keyof LoginErrors]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = (): LoginErrors => {
    const next: LoginErrors = {};
    if (!values.email) {
      next.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
      next.email = "Invalid email address";
    }
    if (!values.password) {
      next.password = "Password is required";
    } else if (values.password.length < 6) {
      next.password = "At least 6 characters";
    }
    return next;
  };

  const submit = async (
    e: React.FormEvent<HTMLFormElement>,
    onLogin: (c: LoginCredentials) => Promise<void>,
  ) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setIsLoading(true);
    try {
      await onLogin(values);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Login failed, please try again";
      setErrors({ form: msg });
    } finally {
      setIsLoading(false);
    }
  };

  return { values, errors, handleChange, submit, isLoading };
}

// ─────────────────────────────────────────────
// useRegisterForm Hook
// ─────────────────────────────────────────────

function useRegisterForm() {
  const [values, setValues] = useState<RegisterValues>({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<RegisterErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof RegisterErrors]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = (): RegisterErrors => {
    const next: RegisterErrors = {};
    if (!values.username) {
      next.username = "Username is required";
    } else if (values.username.length < 2) {
      next.username = "At least 2 characters";
    }
    if (!values.email) {
      next.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
      next.email = "Invalid email address";
    }
    if (!values.password) {
      next.password = "Password is required";
    } else if (values.password.length < 6) {
      next.password = "At least 6 characters";
    }
    if (!values.confirmPassword) {
      next.confirmPassword = "Please confirm your password";
    } else if (values.password !== values.confirmPassword) {
      next.confirmPassword = "Passwords do not match";
    }
    return next;
  };

  const submit = async (
    e: React.FormEvent<HTMLFormElement>,
    onRegister: (c: RegisterCredentials) => Promise<void>,
  ) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setIsLoading(true);
    try {
      await onRegister({
        username: values.username,
        email: values.email,
        password: values.password,
      });
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Registration failed, please try again";
      setErrors({ form: msg });
    } finally {
      setIsLoading(false);
    }
  };

  return { values, errors, handleChange, submit, isLoading };
}

// ─────────────────────────────────────────────
// VinylPlayer
// ─────────────────────────────────────────────

const BAR_HEIGHTS = [4, 10, 6, 14, 18, 8, 16, 12, 6, 10, 4, 8];

function VinylPlayer({
  isPlaying,
  onToggle,
}: {
  isPlaying: boolean;
  onToggle: () => void;
}) {
  return (
    <div className={styles.vinylWrap}>
      <button
        className={`${styles.vinyl} ${isPlaying ? styles.vinylSpinning : ""}`}
        onClick={onToggle}
        aria-label={isPlaying ? "暂停" : "播放"}
      >
        <div className={styles.vinylLabel}>
          <span className={styles.labelTop}>Side A</span>
          <span className={styles.labelBottom}>33⅓ RPM</span>
        </div>
      </button>

      <div
        className={`${styles.tonearm} ${isPlaying ? styles.tonearmPlaying : ""}`}
      >
        <svg viewBox="0 0 100 140" fill="none" aria-hidden="true">
          <circle
            cx="80"
            cy="18"
            r="10"
            stroke="rgba(200,146,58,0.5)"
            strokeWidth="1.5"
            fill="rgba(200,146,58,0.1)"
          />
          <circle cx="80" cy="18" r="4" fill="rgba(200,146,58,0.4)" />
          <path
            d="M74 24 Q50 60 30 120"
            stroke="rgba(200,146,58,0.6)"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <circle
            cx="30"
            cy="122"
            r="4"
            fill="rgba(200,146,58,0.4)"
            stroke="rgba(200,146,58,0.8)"
            strokeWidth="1"
          />
        </svg>
      </div>

      <div className={styles.waveform} aria-hidden="true">
        {BAR_HEIGHTS.map((h, i) => (
          <span
            key={i}
            className={`${styles.bar} ${isPlaying ? styles.barAnimated : ""}`}
            style={{ height: h, animationDelay: `${i * 0.07}s` }}
          />
        ))}
      </div>
    </div>
  );
}

const SOCIAL_PROVIDERS = ["Spotify", "Apple", "Google"] as const;

function LoginForm({
  onLogin,
  onSwitchToRegister,
}: {
  onLogin: (c: LoginCredentials) => Promise<void>;
  onSwitchToRegister: () => void;
}) {
  const { values, errors, handleChange, submit, isLoading } = useLoginForm();
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form onSubmit={(e) => submit(e, onLogin)} noValidate>
      <div className={styles.field}>
        <label htmlFor="lp-email" className={styles.fieldLabel}>
          Email
        </label>
        <div className={styles.inputWrap}>
          <input
            id="lp-email"
            type="email"
            name="email"
            value={values.email}
            onChange={handleChange}
            placeholder="you@example.com"
            autoComplete="email"
            className={styles.input}
          />
          <span className={styles.fieldIcon}>♩</span>
        </div>
        {errors.email && (
          <p className={styles.error} role="alert">
            {errors.email}
          </p>
        )}
      </div>

      <div className={styles.field}>
        <label htmlFor="lp-password" className={styles.fieldLabel}>
          Password
        </label>
        <div className={styles.inputWrap}>
          <input
            id="lp-password"
            type={showPassword ? "text" : "password"}
            name="password"
            value={values.password}
            onChange={handleChange}
            placeholder="••••••••••"
            autoComplete="current-password"
            className={styles.input}
          />
          <button
            type="button"
            className={styles.togglePw}
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "隐藏密码" : "显示密码"}
          >
            {showPassword ? "♪" : "♫"}
          </button>
        </div>
        {errors.password && (
          <p className={styles.error} role="alert">
            {errors.password}
          </p>
        )}
      </div>

      <div className={styles.optionsRow}>
        <label className={styles.remember}>
          <input
            type="checkbox"
            name="remember"
            checked={values.remember}
            onChange={handleChange}
            className={styles.checkbox}
          />
          <span>Remember me</span>
        </label>
        <a href="/forgot-password" className={styles.forgot}>
          Forgot password?
        </a>
      </div>

      {errors.form && (
        <p className={`${styles.error} ${styles.errorForm}`} role="alert">
          {errors.form}
        </p>
      )}

      <button type="submit" className={styles.btnLogin} disabled={isLoading}>
        <span>{isLoading ? "▸ Loading..." : "▶ Play Session"}</span>
      </button>

      <div className={styles.divider}>
        <span>or</span>
      </div>

      <div className={styles.socialRow}>
        {SOCIAL_PROVIDERS.map((provider) => (
          <button
            key={provider}
            type="button"
            className={styles.socialBtn}
            onClick={() => console.log(`Login with ${provider}`)}
          >
            {provider}
          </button>
        ))}
      </div>

      <p className={styles.signupRow}>
        No account?{" "}
        <button
          type="button"
          className={styles.switchLink}
          onClick={onSwitchToRegister}
        >
          Join the session →
        </button>
      </p>
    </form>
  );
}

// ─────────────────────────────────────────────
// RegisterForm
// ─────────────────────────────────────────────

function RegisterForm({
  onRegister,
  onSwitchToLogin,
}: {
  onRegister: (c: RegisterCredentials) => Promise<void>;
  onSwitchToLogin: () => void;
}) {
  const { values, errors, handleChange, submit, isLoading } = useRegisterForm();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <form onSubmit={(e) => submit(e, onRegister)} noValidate>
      <div className={styles.field}>
        <label htmlFor="rp-username" className={styles.fieldLabel}>
          Username
        </label>
        <div className={styles.inputWrap}>
          <input
            id="rp-username"
            type="text"
            name="username"
            value={values.username}
            onChange={handleChange}
            placeholder="your_stage_name"
            autoComplete="username"
            className={styles.input}
          />
          <span className={styles.fieldIcon}>♬</span>
        </div>
        {errors.username && (
          <p className={styles.error} role="alert">
            {errors.username}
          </p>
        )}
      </div>

      <div className={styles.field}>
        <label htmlFor="rp-email" className={styles.fieldLabel}>
          Email
        </label>
        <div className={styles.inputWrap}>
          <input
            id="rp-email"
            type="email"
            name="email"
            value={values.email}
            onChange={handleChange}
            placeholder="you@example.com"
            autoComplete="email"
            className={styles.input}
          />
          <span className={styles.fieldIcon}>♩</span>
        </div>
        {errors.email && (
          <p className={styles.error} role="alert">
            {errors.email}
          </p>
        )}
      </div>

      <div className={styles.field}>
        <label htmlFor="rp-password" className={styles.fieldLabel}>
          Password
        </label>
        <div className={styles.inputWrap}>
          <input
            id="rp-password"
            type={showPassword ? "text" : "password"}
            name="password"
            value={values.password}
            onChange={handleChange}
            placeholder="••••••••••"
            autoComplete="new-password"
            className={styles.input}
          />
          <button
            type="button"
            className={styles.togglePw}
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "隐藏密码" : "显示密码"}
          >
            {showPassword ? "♪" : "♫"}
          </button>
        </div>
        {errors.password && (
          <p className={styles.error} role="alert">
            {errors.password}
          </p>
        )}
      </div>

      <div className={styles.field}>
        <label htmlFor="rp-confirm" className={styles.fieldLabel}>
          Confirm Password
        </label>
        <div className={styles.inputWrap}>
          <input
            id="rp-confirm"
            type={showConfirm ? "text" : "password"}
            name="confirmPassword"
            value={values.confirmPassword}
            onChange={handleChange}
            placeholder="••••••••••"
            autoComplete="new-password"
            className={styles.input}
          />
          <button
            type="button"
            className={styles.togglePw}
            onClick={() => setShowConfirm((v) => !v)}
            aria-label={showConfirm ? "隐藏密码" : "显示密码"}
          >
            {showConfirm ? "♪" : "♫"}
          </button>
        </div>
        {errors.confirmPassword && (
          <p className={styles.error} role="alert">
            {errors.confirmPassword}
          </p>
        )}
      </div>

      {errors.form && (
        <p className={`${styles.error} ${styles.errorForm}`} role="alert">
          {errors.form}
        </p>
      )}

      <button type="submit" className={styles.btnLogin} disabled={isLoading}>
        <span>{isLoading ? "▸ Loading..." : "♪ Start Listening"}</span>
      </button>

      <div className={styles.divider}>
        <span>or</span>
      </div>

      <div className={styles.socialRow}>
        {SOCIAL_PROVIDERS.map((provider) => (
          <button
            key={provider}
            type="button"
            className={styles.socialBtn}
            onClick={() => console.log(`Register with ${provider}`)}
          >
            {provider}
          </button>
        ))}
      </div>

      <p className={styles.signupRow}>
        Already have an account?{" "}
        <button
          type="button"
          className={styles.switchLink}
          onClick={onSwitchToLogin}
        >
          Sign in →
        </button>
      </p>
    </form>
  );
}

// ─────────────────────────────────────────────
// FormPanel — 容纳 Tab 切换 + 两个表单
// ─────────────────────────────────────────────

function FormPanel({
  onLogin,
  onRegister,
}: {
  onLogin: (c: LoginCredentials) => Promise<void>;
  onRegister: (c: RegisterCredentials) => Promise<void>;
}) {
  const [activeTab, setActiveTab] = useState<AuthTab>("login");
  // pendingTab: 动画期间"即将激活"的那个面板（用于驱动进入动画）
  const [pendingTab, setPendingTab] = useState<AuthTab | null>(null);
  const [direction, setDirection] = useState<"forward" | "back">("forward");

  const switchTab = (tab: AuthTab) => {
    if (tab === activeTab || pendingTab !== null) return;
    const dir = tab === "register" ? "forward" : "back";
    setDirection(dir);
    setPendingTab(tab);
    setTimeout(() => {
      setActiveTab(tab);
      setPendingTab(null);
    }, 320);
  };

  const titles: Record<AuthTab, React.ReactNode> = {
    login: (
      <>
        Your <em>music</em>, your world.
      </>
    ),
    register: (
      <>
        Join the <em>session</em>.
      </>
    ),
  };

  const isAnimating = pendingTab !== null;

  // login 面板（绝对定位，叠在注册表单上；注册表单撑开容器高度）
  const loginClass = [
    styles.formSliderLogin,
    activeTab === "login" && !isAnimating
      ? styles.slideCenter
      : activeTab === "login" && isAnimating && direction === "forward"
        ? styles.slideOutToLeft
        : pendingTab === "login" && direction === "back"
          ? styles.slideInFromLeft
          : styles.slideHidden,
  ]
    .filter(Boolean)
    .join(" ");

  // register 面板（正常文档流，撑开高度）
  const registerClass = [
    styles.formSliderRegister,
    activeTab === "register" && !isAnimating
      ? styles.slideCenter
      : activeTab === "register" && isAnimating && direction === "back"
        ? styles.slideOutToRight
        : pendingTab === "register" && direction === "forward"
          ? styles.slideInFromRight
          : styles.slideHidden,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={styles.formSide}>
      <h1
        className={`${styles.title} ${isAnimating ? styles.titleFading : ""}`}
      >
        {titles[activeTab]}
      </h1>

      <div className={styles.formBody}>
        <div className={loginClass} aria-hidden={activeTab !== "login"}>
          <LoginForm
            onLogin={onLogin}
            onSwitchToRegister={() => switchTab("register")}
          />
        </div>
        <div className={registerClass} aria-hidden={activeTab !== "register"}>
          <RegisterForm
            onRegister={onRegister}
            onSwitchToLogin={() => switchTab("login")}
          />
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Auth — 路由组件（默认导出）
// ─────────────────────────────────────────────

interface AuthPageProps {
  onLogin?: (credentials: LoginCredentials) => Promise<void>;
  onRegister?: (credentials: RegisterCredentials) => Promise<void>;
}

export default function Auth({ onLogin, onRegister }: AuthPageProps) {
  const [isPlaying, setIsPlaying] = useState(true);

  const handleLogin = async (credentials: LoginCredentials) => {
    if (onLogin) {
      await onLogin(credentials);
    } else {
      console.log("Login:", credentials);
    }
  };

  const handleRegister = async (credentials: RegisterCredentials) => {
    if (onRegister) {
      await onRegister(credentials);
    } else {
      console.log("Register:", credentials);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.bgGlow} />
      <div className={styles.noise} />

      <main className={styles.container}>
        <VinylPlayer
          isPlaying={isPlaying}
          onToggle={() => setIsPlaying((p) => !p)}
        />
        <FormPanel onLogin={handleLogin} onRegister={handleRegister} />
      </main>
    </div>
  );
}
