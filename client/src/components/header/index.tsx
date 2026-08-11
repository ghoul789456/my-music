import { useState } from "react";
import { Search, Bell } from "lucide-react";
import styles from "./index.module.css";
import UserMenu from "./UserMenu";

export default function Header() {
  const [searchValue, setSearchValue] = useState("");

  return (
    <>
      {/* 移动端 */}
      <header className={`${styles.header} ${styles.mobileOnly}`}>
        <span className={styles.mobileTitle}>MY MUSIC</span>
        <div className={styles.actions}>
          <UserMenu />
        </div>
      </header>

      {/* 桌面端 */}
      <header className={`${styles.header} ${styles.desktopOnly}`}>
        <div className={styles.brand}>
          <div className={styles.brandText}>
            <p className={styles.brandTitle}>MY MUSIC</p>
            <p className={styles.brandSub}>PRIVATE LISTENING</p>
          </div>
        </div>

        <div className={styles.searchBox}>
          <Search size={18} className={styles.searchIcon} />
          <input
            className={styles.searchInput}
            placeholder="音乐搜索"
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
        </div>

        <div className={styles.actions}>
          <button className={styles.iconBtn} aria-label="通知">
            <Bell size={20} />
          </button>
          <UserMenu />
        </div>
      </header>
    </>
  );
}
