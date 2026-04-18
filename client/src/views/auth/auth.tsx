/**
 * LoginPage.tsx
 * 使用方式：import LoginPage from './LoginPage'
 * 依赖：React 18+，TypeScript，需在全局 CSS 引入 Google Fonts：
 * @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=DM+Mono:wght@300;400&display=swap');
 */

import { useState, type FormEvent, type ChangeEvent } from 'react'

// ─────────────────────────────────────────────
// 类型定义
// ─────────────────────────────────────────────

interface FormValues {
  email: string
  password: string
  remember: boolean
}

interface FormErrors {
  email?: string
  password?: string
  form?: string
}

interface Track {
  title: string
  artist: string
}

interface LoginCredentials extends FormValues {}

// ─────────────────────────────────────────────
// useLoginForm Hook（表单状态 + 验证）
// ─────────────────────────────────────────────

function useLoginForm(onSubmit: (credentials: LoginCredentials) => Promise<void>) {
  const [values, setValues] = useState<FormValues>({ email: '', password: '', remember: false })
  const [errors, setErrors] = useState<FormErrors>({})
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setValues(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validate = (): FormErrors => {
    const next: FormErrors = {}
    if (!values.email) {
      next.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
      next.email = 'Invalid email address'
    }
    if (!values.password) {
      next.password = 'Password is required'
    } else if (values.password.length < 6) {
      next.password = 'At least 6 characters'
    }
    return next
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }
    setIsLoading(true)
    try {
      await onSubmit(values)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Login failed, please try again'
      setErrors({ form: message })
    } finally {
      setIsLoading(false)
    }
  }

  return { values, errors, handleChange, handleSubmit, isLoading }
}

// ─────────────────────────────────────────────
// VinylPlayer 组件
// ─────────────────────────────────────────────

interface VinylPlayerProps {
  isPlaying: boolean
  onToggle: () => void
}

function VinylPlayer({ isPlaying, onToggle }: VinylPlayerProps) {
  const BAR_HEIGHTS = [4, 10, 6, 14, 18, 8, 16, 12, 6, 10, 4, 8]

  return (
    <div style={s.vinylWrap}>
      {/* 黑胶唱片 */}
      <button
        onClick={onToggle}
        aria-label={isPlaying ? '暂停' : '播放'}
        style={{
          ...s.vinyl,
          animation: isPlaying ? 'spin 6s linear infinite' : 'none',
        }}
      >
        {/* 中央标签 */}
        <div style={s.vinylLabel}>
          <span style={s.labelTop}>Side A</span>
          <span style={s.labelBottom}>33⅓ RPM</span>
        </div>
      </button>

      {/* 唱臂 */}
      <div
        style={{
          ...s.tonearm,
          animation: isPlaying ? 'tonearmSway 6s ease-in-out infinite' : 'none',
          transform: isPlaying ? 'rotate(-15deg)' : 'rotate(-20deg)',
        }}
      >
        <svg viewBox="0 0 100 140" fill="none" aria-hidden="true" style={{ width: '100%', height: '100%' }}>
          <circle cx="80" cy="18" r="10" stroke="rgba(200,146,58,0.5)" strokeWidth="1.5" fill="rgba(200,146,58,0.1)" />
          <circle cx="80" cy="18" r="4" fill="rgba(200,146,58,0.4)" />
          <path d="M74 24 Q50 60 30 120" stroke="rgba(200,146,58,0.6)" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="30" cy="122" r="4" fill="rgba(200,146,58,0.4)" stroke="rgba(200,146,58,0.8)" strokeWidth="1" />
        </svg>
      </div>

      {/* 声波条 */}
      <div style={s.waveform} aria-hidden="true">
        {BAR_HEIGHTS.map((h, i) => (
          <span
            key={i}
            style={{
              ...s.bar,
              height: h,
              animation: isPlaying ? `wave 0.8s ease-in-out ${i * 0.07}s infinite alternate` : 'none',
              opacity: isPlaying ? undefined : 0.3,
            }}
          />
        ))}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// LoginForm 组件
// ─────────────────────────────────────────────

const SOCIAL_PROVIDERS = ['Spotify', 'Apple', 'Google'] as const

interface LoginFormProps {
  onSubmit: (credentials: LoginCredentials) => Promise<void>
}

function LoginForm({ onSubmit }: LoginFormProps) {
  const { values, errors, handleChange, handleSubmit, isLoading } = useLoginForm(onSubmit)
  const [showPassword, setShowPassword] = useState(false)
  const [hoveredSocial, setHoveredSocial] = useState<string | null>(null)
  const [btnHovered, setBtnHovered] = useState(false)

  return (
    <div style={s.formSide}>
      <p style={s.eyebrow}>— Late Night Sessions</p>
      <h1 style={s.title}>
        Your <em style={{ fontStyle: 'italic', color: '#c8923a' }}>music</em>,<br />your world.
      </h1>
      <p style={s.subtitle}>Sign in to continue the session</p>

      <form onSubmit={handleSubmit} noValidate>
        {/* Email */}
        <div style={s.field}>
          <label htmlFor="email" style={s.fieldLabel}>Email</label>
          <div style={{ position: 'relative' }}>
            <input
              id="email"
              type="email"
              name="email"
              value={values.email}
              onChange={handleChange}
              placeholder="you@example.com"
              autoComplete="email"
              style={s.input}
              onFocus={e => (e.target.style.borderBottomColor = 'rgba(200,146,58,0.6)')}
              onBlur={e => (e.target.style.borderBottomColor = 'rgba(255,255,255,0.1)')}
            />
            <span style={s.fieldNote}>♩</span>
          </div>
          {errors.email && <p style={s.error} role="alert">{errors.email}</p>}
        </div>

        {/* Password */}
        <div style={s.field}>
          <label htmlFor="password" style={s.fieldLabel}>Password</label>
          <div style={{ position: 'relative' }}>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={values.password}
              onChange={handleChange}
              placeholder="••••••••••"
              autoComplete="current-password"
              style={s.input}
              onFocus={e => (e.target.style.borderBottomColor = 'rgba(200,146,58,0.6)')}
              onBlur={e => (e.target.style.borderBottomColor = 'rgba(255,255,255,0.1)')}
            />
            <button
              type="button"
              onClick={() => setShowPassword(v => !v)}
              aria-label={showPassword ? '隐藏密码' : '显示密码'}
              style={s.togglePw}
            >
              {showPassword ? '♪' : '♫'}
            </button>
          </div>
          {errors.password && <p style={s.error} role="alert">{errors.password}</p>}
        </div>

        {/* 记住我 & 忘记密码 */}
        <div style={s.optionsRow}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <input
              type="checkbox"
              name="remember"
              checked={values.remember}
              onChange={handleChange}
              style={s.checkbox}
            />
            <span style={s.rememberText}>Remember me</span>
          </label>
          <a href="/forgot-password" style={s.forgot}>Forgot password?</a>
        </div>

        {/* 全局表单错误 */}
        {errors.form && <p style={{ ...s.error, marginBottom: 12 }} role="alert">{errors.form}</p>}

        {/* 提交按钮 */}
        <button
          type="submit"
          disabled={isLoading}
          onMouseEnter={() => setBtnHovered(true)}
          onMouseLeave={() => setBtnHovered(false)}
          style={{
            ...s.btnLogin,
            background: btnHovered && !isLoading ? '#c8923a' : 'transparent',
            color: btnHovered && !isLoading ? '#0a0a0f' : '#c8923a',
            opacity: isLoading ? 0.5 : 1,
            cursor: isLoading ? 'not-allowed' : 'pointer',
          }}
        >
          {isLoading ? '▸ Loading...' : '▶ Play Session'}
        </button>
      </form>

      {/* 分割线 */}
      <div style={s.divider}>
        <div style={s.dividerLine} />
        <span style={s.dividerText}>or</span>
        <div style={s.dividerLine} />
      </div>

      {/* 第三方登录 */}
      <div style={s.socialRow}>
        {SOCIAL_PROVIDERS.map(provider => (
          <button
            key={provider}
            type="button"
            onMouseEnter={() => setHoveredSocial(provider)}
            onMouseLeave={() => setHoveredSocial(null)}
            onClick={() => console.log(`Login with ${provider}`)} // 替换为你的 OAuth 逻辑
            style={{
              ...s.socialBtn,
              background: hoveredSocial === provider ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.03)',
              color: hoveredSocial === provider ? 'rgba(240,232,216,0.8)' : 'rgba(240,232,216,0.4)',
              borderColor: hoveredSocial === provider ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.06)',
            }}
          >
            {provider}
          </button>
        ))}
      </div>

      <p style={s.signupRow}>
        No account? <a href="/register" style={s.signupLink}>Join the session →</a>
      </p>
    </div>
  )
}

// ─────────────────────────────────────────────
// NowPlaying 组件
// ─────────────────────────────────────────────

interface NowPlayingProps {
  track: Track
  isPlaying: boolean
}

function NowPlaying({ track, isPlaying }: NowPlayingProps) {
  return (
    <div style={s.nowPlaying} role="status" aria-live="polite">
      <span
        style={{
          ...s.npDot,
          background: isPlaying ? '#c8923a' : 'rgba(200,146,58,0.3)',
          animation: isPlaying ? 'pulse 1.5s ease-in-out infinite' : 'none',
        }}
        aria-hidden="true"
      />
      <span style={s.npLabel}>Now playing —</span>
      <span style={s.npTrack}>{track.artist} · {track.title}</span>
    </div>
  )
}

// ─────────────────────────────────────────────
// LoginPage（默认导出）
// ─────────────────────────────────────────────

const CURRENT_TRACK: Track = { title: 'Kind of Blue', artist: 'Miles Davis' }

/**
 * @param onLogin 接收 { email, password, remember }，需返回 Promise
 * 示例：
 *   const handleLogin = async ({ email, password }) => {
 *     const res = await fetch('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) })
 *     if (!res.ok) throw new Error('Invalid credentials')
 *     router.push('/dashboard')
 *   }
 */
interface LoginPageProps {
  onLogin?: (credentials: LoginCredentials) => Promise<void>
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [isPlaying, setIsPlaying] = useState(true)

  const handleLogin = async (credentials: LoginCredentials) => {
    // ↓ 替换为你的登录逻辑
    if (onLogin) {
      await onLogin(credentials)
    } else {
      console.log('Login:', credentials)
    }
  }

  return (
    <>
      {/* 关键帧动画，注入到 <head> */}
      <style>{KEYFRAMES}</style>

      <div style={s.page}>
        <div style={s.bgGlow} />
        <div style={s.noise} />

        <main style={s.container}>
          <VinylPlayer isPlaying={isPlaying} onToggle={() => setIsPlaying(p => !p)} />
          <LoginForm onSubmit={handleLogin} />
        </main>

        <NowPlaying track={CURRENT_TRACK} isPlaying={isPlaying} />
      </div>
    </>
  )
}

// ─────────────────────────────────────────────
// 样式对象（替代 CSS Modules）
// ─────────────────────────────────────────────

const FONT = "'DM Mono', monospace"
const GOLD = '#c8923a'
const CREAM = '#f0e8d8'

const s: Record<string, React.CSSProperties> = {
  // 页面
  page: {
    minHeight: '100vh',
    background: '#0a0a0f',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    fontFamily: FONT,
  },
  noise: {
    position: 'fixed',
    inset: 0,
    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`,
    pointerEvents: 'none',
    zIndex: 0,
  },
  bgGlow: {
    position: 'fixed',
    width: 600,
    height: 600,
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(180,120,60,0.12) 0%, transparent 70%)',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    pointerEvents: 'none',
  },
  container: {
    position: 'relative',
    zIndex: 1,
    display: 'flex',
    alignItems: 'center',
    gap: 60,
    padding: 40,
    maxWidth: 900,
    width: '100%',
  },

  // VinylPlayer
  vinylWrap: { position: 'relative', flexShrink: 0, width: 280, height: 280 },
  vinyl: {
    width: 280,
    height: 280,
    borderRadius: '50%',
    background: 'repeating-radial-gradient(circle at center, #1a1a1a 0px, #111 2px, #1c1c1c 4px, #0f0f0f 6px)',
    position: 'relative',
    boxShadow: '0 0 0 1px rgba(255,255,255,0.04), 0 20px 60px rgba(0,0,0,0.8), inset 0 0 30px rgba(0,0,0,0.5)',
    cursor: 'pointer',
    border: 'none',
    overflow: 'hidden',
    transition: 'transform 0.8s cubic-bezier(0.4,0,0.2,1)',
  },
  vinylLabel: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 90,
    height: 90,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #c8923a 0%, #e8b86d 40%, #a06828 70%, #c8923a 100%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 12px rgba(0,0,0,0.6), inset 0 1px 2px rgba(255,255,255,0.3)',
  },
  labelTop: { fontSize: 7, letterSpacing: 2, color: 'rgba(10,10,15,0.65)', textTransform: 'uppercase', marginBottom: 22 },
  labelBottom: { fontSize: 6, letterSpacing: 1.5, color: 'rgba(10,10,15,0.5)', textTransform: 'uppercase', marginTop: 18 },
  tonearm: { position: 'absolute', top: -10, right: -10, width: 100, height: 140, transformOrigin: 'top right', transition: 'transform 0.8s cubic-bezier(0.4,0,0.2,1)' },
  waveform: { position: 'absolute', bottom: -30, left: '50%', transform: 'translateX(-50%)', display: 'flex', alignItems: 'flex-end', gap: 2, height: 20 },
  bar: { display: 'block', width: 2, background: 'rgba(200,146,58,0.5)', borderRadius: 1 },

  // LoginForm
  formSide: { flex: 1, display: 'flex', flexDirection: 'column' },
  eyebrow: { fontSize: 10, letterSpacing: 4, color: 'rgba(200,146,58,0.7)', textTransform: 'uppercase', marginBottom: 12 },
  title: { fontFamily: "'Playfair Display', serif", fontSize: 38, fontWeight: 700, color: CREAM, lineHeight: 1.1, marginBottom: 6, letterSpacing: -0.5 },
  subtitle: { fontSize: 11, color: 'rgba(240,232,216,0.3)', letterSpacing: 1, marginBottom: 36 },
  field: { marginBottom: 16 },
  fieldLabel: { display: 'block', fontSize: 9, letterSpacing: 2.5, color: 'rgba(200,146,58,0.6)', textTransform: 'uppercase', marginBottom: 8 },
  input: {
    width: '100%',
    background: 'transparent',
    border: 'none',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
    color: CREAM,
    fontFamily: FONT,
    fontSize: 14,
    fontWeight: 300,
    padding: '8px 28px 8px 0',
    outline: 'none',
    letterSpacing: 0.5,
    transition: 'border-bottom-color 0.3s',
  },
  fieldNote: { position: 'absolute', right: 0, bottom: 10, color: 'rgba(200,146,58,0.35)', fontSize: 12 },
  togglePw: { position: 'absolute', right: 0, bottom: 10, color: 'rgba(200,146,58,0.35)', fontSize: 12, background: 'none', border: 'none', cursor: 'pointer', padding: 0, lineHeight: 1 },
  error: { fontFamily: FONT, fontSize: 10, color: 'rgba(220,80,80,0.8)', marginTop: 4, letterSpacing: 0.5 },
  optionsRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '4px 0 28px' },
  checkbox: { appearance: 'none' as const, width: 14, height: 14, border: '1px solid rgba(200,146,58,0.4)', background: 'transparent', cursor: 'pointer', flexShrink: 0 },
  rememberText: { fontSize: 10, color: 'rgba(240,232,216,0.35)', letterSpacing: 1 },
  forgot: { fontSize: 10, color: 'rgba(200,146,58,0.5)', textDecoration: 'none', letterSpacing: 1 },
  btnLogin: {
    width: '100%',
    padding: '14px 0',
    border: `1px solid rgba(200,146,58,0.5)`,
    fontFamily: FONT,
    fontSize: 11,
    letterSpacing: 4,
    textTransform: 'uppercase' as const,
    transition: 'background 0.3s, color 0.3s',
  },
  divider: { display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' },
  dividerLine: { flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' },
  dividerText: { fontSize: 9, color: 'rgba(240,232,216,0.2)', letterSpacing: 2 },
  socialRow: { display: 'flex', gap: 10, marginBottom: 20 },
  socialBtn: { flex: 1, padding: 10, border: '1px solid', fontFamily: FONT, fontSize: 10, letterSpacing: 2, cursor: 'pointer', textAlign: 'center' as const, transition: 'all 0.2s' },
  signupRow: { fontSize: 10, color: 'rgba(240,232,216,0.2)', letterSpacing: 1, textAlign: 'center' as const },
  signupLink: { color: 'rgba(200,146,58,0.6)', textDecoration: 'none' },

  // NowPlaying
  nowPlaying: {
    position: 'fixed',
    bottom: 24,
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '8px 20px',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 100,
    whiteSpace: 'nowrap',
    zIndex: 10,
  },
  npDot: { width: 5, height: 5, borderRadius: '50%', flexShrink: 0, transition: 'background 0.3s' },
  npLabel: { fontSize: 10, color: 'rgba(240,232,216,0.3)', letterSpacing: 1.5 },
  npTrack: { fontSize: 10, color: 'rgba(200,146,58,0.7)', letterSpacing: 1 },
}

// ─────────────────────────────────────────────
// CSS 关键帧（注入到 <style> 标签）
// ─────────────────────────────────────────────

const KEYFRAMES = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
  @keyframes tonearmSway {
    0%, 100% { transform: rotate(-15deg); }
    50%       { transform: rotate(-13deg); }
  }
  @keyframes wave {
    from { transform: scaleY(1);   opacity: 0.4; }
    to   { transform: scaleY(0.3); opacity: 0.9; }
  }
  @keyframes pulse {
    0%, 100% { opacity: 1;   transform: scale(1); }
    50%       { opacity: 0.4; transform: scale(0.8); }
  }
`
