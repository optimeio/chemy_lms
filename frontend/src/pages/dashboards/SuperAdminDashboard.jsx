import { useOutletContext } from 'react-router-dom';
import styles from '../../styles/DashboardShell.module.css';

const stats = [
  { label: 'Total Users', value: '584', emoji: '👥' },
  { label: 'Active Courses', value: '34', emoji: '🎓' },
  { label: 'Current Programs', value: '18', emoji: '📌' },
  { label: 'Open Tickets', value: '12', emoji: '🛠️' },
  { label: 'System Alerts', value: '3', emoji: '🚨' },
  { label: 'Monthly Growth', value: '14%', emoji: '📈' },
];

const metrics = [
  { name: 'Platform uptime', value: '99.98%' },
  { name: 'New signups', value: '96' },
  { name: 'Course launches', value: '4' },
  { name: 'Support response time', value: '1h 20m' },
];

export default function SuperAdminDashboard() {
  const { activeTab } = useOutletContext() || { activeTab: 'dashboard' };

  if (activeTab !== 'dashboard') {
    return (
      <section className={styles.panel}>
        <div className={styles.headerBlock}>
          <div>
            <h2 className={styles.cardTitle}>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h2>
            <p className={styles.cardSubtitle}>This administration module is currently under development.</p>
          </div>
        </div>
        <div className={styles.widgetCard} style={{ marginTop: '20px', padding: '40px', textAlign: 'center' }}>
          <h3>More tools coming soon!</h3>
          <p>The {activeTab} management interface will be available in a future update.</p>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.panel}>
      <div className={styles.headerBlock}>
        <div>
          <h2 className={styles.cardTitle}>Super Admin Dashboard</h2>
          <p className={styles.cardSubtitle}>View platform health, user activity, and management insights.</p>
        </div>
      </div>

      <div className={styles.summaryGrid}>
        {stats.map((item) => (
          <article key={item.label} className={styles.quickCard}>
            <span className={styles.cardEmoji}>{item.emoji}</span>
            <div>
              <p className={styles.cardLabel}>{item.label}</p>
              <p className={styles.cardValue}>{item.value}</p>
            </div>
          </article>
        ))}
      </div>

      <div className={styles.widgetGrid}>
        <article className={styles.chartCard}>
          <div className={styles.widgetHeadingRow}>
            <h3 className={styles.widgetHeading}>Platform Health</h3>
            <span className={styles.badge}>Stable</span>
          </div>
          <div className={styles.chartPlaceholder} role="img" aria-label="Platform health placeholder" />
        </article>

        <article className={styles.widgetCard}>
          <h3 className={styles.widgetHeading}>Operational Metrics</h3>
          <ul className={styles.metricList}>
            {metrics.map((metric) => (
              <li key={metric.name} className={styles.metricRow}>
                <span>{metric.name}</span>
                <strong>{metric.value}</strong>
              </li>
            ))}
          </ul>
        </article>

        <article className={styles.widgetCard}>
          <h3 className={styles.widgetHeading}>Security Alerts</h3>
          <ul className={styles.listGroup}>
            <li className={styles.listItem}>Review MFA rollout for new users.</li>
            <li className={styles.listItem}>Update access policy for trainers.</li>
          </ul>
        </article>

        <article className={styles.widgetCard}>
          <h3 className={styles.widgetHeading}>Recent Admin Actions</h3>
          <ul className={styles.listGroup}>
            <li className={styles.listItem}>Created new course categories.</li>
            <li className={styles.listItem}>Approved SPOC user requests.</li>
            <li className={styles.listItem}>Deployed UX system update.</li>
          </ul>
        </article>

        <article className={styles.chartCard}>
          <div className={styles.widgetHeadingRow}>
            <h3 className={styles.widgetHeading}>Growth Snapshot</h3>
            <span className={styles.badge}>Weekly</span>
          </div>
          <div className={styles.chartPlaceholder} role="img" aria-label="Growth snapshot placeholder" />
        </article>

        <article className={styles.widgetCard}>
          <h3 className={styles.widgetHeading}>System Tasks</h3>
          <ul className={styles.listGroup}>
            <li className={styles.listItem}>Review pending instructor approvals.</li>
            <li className={styles.listItem}>Audit scheduled content updates.</li>
          </ul>
        </article>
      </div>
    </section>
  );
}
