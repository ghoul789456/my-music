import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { LockKeyhole } from "lucide-react";
import type { RootState } from "../../store/store";
import { closeLoginPrompt } from "../../store/userSlice";
import styles from "./index.module.scss";

export default function LoginPrompt() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isOpen = useSelector((state: RootState) => state.user.loginPromptOpen);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") dispatch(closeLoginPrompt());
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [dispatch, isOpen]);

  if (!isOpen) return null;

  const goToLogin = () => {
    dispatch(closeLoginPrompt());
    navigate("/auth");
  };

  return (
    <div
      className={styles.backdrop}
      role="presentation"
      onMouseDown={() => dispatch(closeLoginPrompt())}
    >
      <section
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="login-prompt-title"
        aria-describedby="login-prompt-description"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className={styles.icon} aria-hidden="true">
          <LockKeyhole size={24} />
        </div>
        <h2 id="login-prompt-title">登录后播放音乐</h2>
        <p id="login-prompt-description">
          游客暂时不能播放歌曲，请先登录账号再开始聆听。
        </p>
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.cancelButton}
            onClick={() => dispatch(closeLoginPrompt())}
          >
            取消
          </button>
          <button type="button" className={styles.loginButton} onClick={goToLogin} autoFocus>
            去登录
          </button>
        </div>
      </section>
    </div>
  );
}
