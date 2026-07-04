import styles from '../../styles/DashboardShell.module.css';

const stats = [
  { label: 'Total Students', value: '256', emoji: '👨‍🎓' },
  { label: 'Assigned Courses', value: '12', emoji: '📚' },
  { label: "Today's Classes", value: '3', emoji: '🎥' },
  { label: 'Upcoming Schedule', value: '5', emoji: '📅' },
  { label: 'Pending Evaluations', value: '7', emoji: '📝' },
  { label: 'Average Rating', value: '4.8', emoji: '⭐' },
];

const sessions = [
  { title: 'Database Systems', time: '10:00 AM' },
  { title: 'Algorithm Design', time: '1:00 PM' },
  { title: 'UX Fundamentals', time: '4:00 PM' },
];

export default function TrainerDashboard() {
  return (
    <section className={styles.panel}>
      <div className={styles.headerBlock}>
        <div>
          <h2 className={styles.cardTitle}>Trainer Dashboard</h2>
          <p className={styles.cardSubtitle}>Manage classes, students, and upcoming sessions from one place.</p>
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
          <div className={styles.widgetHeadingRow}>
            <h3 className={styles.widgetHeading}>Today's Schedule</h3>
            <span className={styles.badge}>Live</span>
          </div>
          <ul className={styles.listGroup}>
            {sessions.map((item) => (
              <li key={item.title} className={styles.listItem}>
                <strong>{item.title}</strong>
                <p>{item.time}</p>
              </li>
            ))}
          </ul>
        </article>

        <article className={styles.widgetCard}>
          <h3 className={styles.widgetHeading}>Student Attendance</h3>
          <div className={styles.chartPlaceholder} role="img" aria-label="Student attendance placeholder" />
        </article>

        <article className={styles.widgetCard}>
          <h3 className={styles.widgetHeading}>Upcoming Sessions</h3>
          <ul className={styles.listGroup}>
            <li className={styles.listItem}>Python Programming - 18 Jul, 10:00 AM</li>
            <li className={styles.listItem}>Web Development - 19 Jul, 02:00 PM</li>
          </ul>
        </article>

        <article className={styles.chartCard}>
          <div className={styles.widgetHeadingRow}>
            <h3 className={styles.widgetHeading}>Assignment Review Queue</h3>
            <span className={styles.badge}>8 pending</span>
          </div>
          <div className={styles.chartPlaceholder} role="img" aria-label="Assignment review queue chart placeholder" />
        </article>

        <article className={styles.chartCard}>
          <div className={styles.widgetHeadingRow}>
            <h3 className={styles.widgetHeading}>Course Completion Analytics</h3>
            <span className={styles.badge}>Updated</span>
          </div>
          <div className={styles.chartPlaceholder} role="img" aria-label="Course completion analytics placeholder" />
        </article>

        <article className={styles.widgetCard}>
          <h3 className={styles.widgetHeading}>Notifications</h3>
          <ul className={styles.listGroup}>
            <li className={styles.listItem}>New assignment submitted by Arjun.</li>
            <li className={styles.listItem}>Feedback response ready for UI/UX class.</li>
          </ul>
        </article>
      </div>
    </section>
  );
}
