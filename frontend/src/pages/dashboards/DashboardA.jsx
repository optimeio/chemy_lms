import styles from '../../styles/DashboardShell.module.css';

const overviewCards = [
  { label: 'Active Courses', value: '8', detail: 'Strong attendance' },
  { label: 'Completed Tasks', value: '24', detail: 'Today: 4 tasks' },
  { label: 'Upcoming Live Classes', value: '2', detail: 'Join before noon' },
  { label: 'Certificates Earned', value: '3', detail: 'New badge available' },
];

export default function DashboardA() {
  return (
    <section className={styles.panel}>
      <div className={styles.summaryGrid}>
        {overviewCards.map((card) => (
          <article key={card.label} className={styles.summaryCard} tabIndex="0">
            <p className={styles.cardLabel}>{card.label}</p>
            <p className={styles.cardValue}>{card.value}</p>
            <p className={styles.cardDetail}>{card.detail}</p>
          </article>
        ))}
      </div>
      <div className={styles.chartCard}>
        <div className={styles.cardHeader}>
          <div>
            <h2 className={styles.cardTitle}>Course Completion</h2>
            <p className={styles.cardSubtitle}>Progress over the last 30 days.</p>
          </div>
          <span className={styles.badge}>Overview</span>
        </div>
        <div className={styles.chartPlaceholder} role="img" aria-label="Placeholder chart showing progress trend">
          <div className={styles.chartLine} />
          <div className={styles.chartLineShort} />
          <div className={styles.chartLineLong} />
        </div>
        <p className={styles.cardText}>
          Your dashboard gives you an at-a-glance view of active coursework, upcoming classes, and earned certificates.
        </p>
      </div>
    </section>
  );
}
