import styles from '../../styles/DashboardShell.module.css';

const stats = [
  { label: 'Total Employees', value: '142', emoji: '🏢' },
  { label: 'Active Trainings', value: '8', emoji: '📚' },
  { label: 'Assigned Trainers', value: '12', emoji: '👨‍🏫' },
  { label: 'Upcoming Sessions', value: '6', emoji: '📅' },
  { label: 'Attendance %', value: '78%', emoji: '📊' },
  { label: 'Certificates Generated', value: '56', emoji: '📜' },
];

export default function SpocDashboard() {
  return (
    <section className={styles.panel}>
      <div className={styles.headerBlock}>
        <div>
          <h2 className={styles.cardTitle}>SPOC Dashboard</h2>
          <p className={styles.cardSubtitle}>Monitor employee training and program progress at a glance.</p>
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
        <article className={styles.widgetCard}>
          <h3 className={styles.widgetHeading}>Employee Progress</h3>
          <div className={styles.chartPlaceholder} role="img" aria-label="Employee progress placeholder" />
        </article>

        <article className={styles.widgetCard}>
          <h3 className={styles.widgetHeading}>Batch Status</h3>
          <ul className={styles.listGroup}>
            <li className={styles.listItem}>Data Science Batch — 72% complete</li>
            <li className={styles.listItem}>Cyber Security Batch — 60% complete</li>
          </ul>
        </article>

        <article className={styles.widgetCard}>
          <h3 className={styles.widgetHeading}>Upcoming Training</h3>
          <ul className={styles.listGroup}>
            <li className={styles.listItem}>Cloud Computing — 20 Jul</li>
            <li className={styles.listItem}>Leadership Workshop — 22 Jul</li>
          </ul>
        </article>

        <article className={styles.chartCard}>
          <h3 className={styles.widgetHeading}>Attendance Chart</h3>
          <div className={styles.chartPlaceholder} role="img" aria-label="Attendance chart placeholder" />
        </article>

        <article className={styles.widgetCard}>
          <h3 className={styles.widgetHeading}>Training Calendar</h3>
          <div className={styles.calendarGrid}>
            <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
            {Array.from({ length: 28 }, (_, i) => (
              <span key={i} className={styles.calendarDay}>{i + 1}</span>
            ))}
          </div>
        </article>

        <article className={styles.widgetCard}>
          <h3 className={styles.widgetHeading}>Recent Activities</h3>
          <ul className={styles.listGroup}>
            <li className={styles.listItem}>Certificate report generated for July batch.</li>
            <li className={styles.listItem}>Attendance audit completed for training week.</li>
          </ul>
        </article>
      </div>
    </section>
  );
}
