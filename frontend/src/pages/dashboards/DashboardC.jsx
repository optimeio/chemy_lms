import styles from '../../styles/DashboardShell.module.css';

const metrics = [
  { label: 'Completion Rate', value: '76%', detail: 'Up 8% from last week' },
  { label: 'Average Score', value: '92', detail: 'Across all quizzes' },
  { label: 'Active Students', value: '128', detail: 'Engaged today' },
];

export default function DashboardC() {
  return (
    <section className={styles.panel}>
      <div className={styles.metricGrid}>
        {metrics.map((metric) => (
          <article key={metric.label} className={styles.metricCard} tabIndex="0">
            <p className={styles.metricLabel}>{metric.label}</p>
            <p className={styles.metricValue}>{metric.value}</p>
            <p className={styles.cardDetail}>{metric.detail}</p>
          </article>
        ))}
      </div>
      <div className={styles.chartCard}>
        <div className={styles.cardHeader}>
          <div>
            <h2 className={styles.cardTitle}>Analytics Snapshot</h2>
            <p className={styles.cardSubtitle}>Engagement patterns for your current program.</p>
          </div>
          <span className={styles.badge}>Insights</span>
        </div>
        <div className={styles.chartPlaceholder} role="img" aria-label="Placeholder for analytic chart">
          <div className={styles.analyticsDots}>
            <span />
            <span />
            <span />
            <span />
          </div>
          <p>Interactive analytics chart placeholder.</p>
        </div>
      </div>
    </section>
  );
}
