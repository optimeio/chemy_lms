import { useState } from 'react';
import styles from '../../styles/DashboardShell.module.css';

export default function DashboardD() {
  const [settings, setSettings] = useState({
    darkMode: false,
    emailNotifications: true,
    autoPlayContent: false,
  });

  const handleToggle = (key) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <section className={styles.panel}>
      <div className={styles.cardHeader}>
        <div>
          <h2 className={styles.cardTitle}>Preferences</h2>
          <p className={styles.cardSubtitle}>Personalize your dashboard experience.</p>
        </div>
      </div>
      <div className={styles.settingsGrid}>
        <article className={styles.settingCard} tabIndex="0">
          <div>
            <h3>Dark Mode</h3>
            <p>Switch themes for low-light comfort.</p>
          </div>
          <button
            className={`${styles.toggleButton} ${settings.darkMode ? styles.toggleOn : ''}`}
            onClick={() => handleToggle('darkMode')}
            aria-pressed={settings.darkMode}
          >
            {settings.darkMode ? 'Enabled' : 'Disabled'}
          </button>
        </article>

        <article className={styles.settingCard} tabIndex="0">
          <div>
            <h3>Email Notifications</h3>
            <p>Receive updates on assignments and announcements.</p>
          </div>
          <button
            className={`${styles.toggleButton} ${settings.emailNotifications ? styles.toggleOn : ''}`}
            onClick={() => handleToggle('emailNotifications')}
            aria-pressed={settings.emailNotifications}
          >
            {settings.emailNotifications ? 'On' : 'Off'}
          </button>
        </article>

        <article className={styles.settingCard} tabIndex="0">
          <div>
            <h3>Auto-play content</h3>
            <p>Begin lessons automatically when available.</p>
          </div>
          <button
            className={`${styles.toggleButton} ${settings.autoPlayContent ? styles.toggleOn : ''}`}
            onClick={() => handleToggle('autoPlayContent')}
            aria-pressed={settings.autoPlayContent}
          >
            {settings.autoPlayContent ? 'Active' : 'Inactive'}
          </button>
        </article>
      </div>
      <div className={styles.preferenceFooter}>
        <p>These changes apply only for your current browser session and serve as a demo for preference state.</p>
      </div>
    </section>
  );
}
