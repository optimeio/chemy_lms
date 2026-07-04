import styles from '../../styles/DashboardShell.module.css';

const stats = [
  { label: 'Enrolled Courses', value: '8', emoji: '📚' },
  { label: "Today's Live Classes", value: '2', emoji: '🎥' },
  { label: 'Pending Assignments', value: '4', emoji: '📝' },
  { label: 'Completed Courses', value: '5', emoji: '✅' },
  { label: 'Certificates Earned', value: '3', emoji: '📜' },
  { label: 'Notifications', value: '5', emoji: '🔔' },
];

const announcements = [
  { title: 'New course available', detail: 'UI/UX essentials is live now.' },
  { title: 'Live class reminder', detail: 'Data Structures starts in 30 minutes.' },
  { title: 'Assignment due', detail: 'DB Quiz due tomorrow at 11:59 PM.' },
];

export default function StudentDashboard() {
  return (
    <section className={styles.panel}>
      <div className={styles.headerBlock}>
        <div>
          <h2 className={styles.cardTitle}>Student Dashboard</h2>
          <p className={styles.cardSubtitle}>Track your learning progress and stay on top of upcoming classes.</p>
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
          <h3 className={styles.widgetHeading}>Learning Progress</h3>
          <div className={styles.progressRow}>
            <div className={styles.progressCircle}>
              <span>75%</span>
            </div>
            <div>
              <p className={styles.widgetLabel}>Overall completion</p>
              <p className={styles.widgetText}>You are doing great. Keep up the momentum with your live sessions.</p>
            </div>
          </div>
        </article>

        <article className={styles.widgetCard}>
          <div className={styles.widgetHeadingRow}>
            <h3 className={styles.widgetHeading}>Upcoming Live Class</h3>
            <span className={styles.badge}>Today</span>
          </div>
          <p className={styles.widgetText}>Data Structures with Pr. Priya Sharma</p>
          <p className={styles.widgetMeta}>10:00 AM - 11:30 AM</p>
          <button className={styles.primaryButton}>Join Class</button>
        </article>

        <article className={styles.widgetCard}>
          <h3 className={styles.widgetHeading}>Recent Announcements</h3>
          <ul className={styles.listGroup}>
            {announcements.map((item) => (
              <li key={item.title} className={styles.listItem}>
                <strong>{item.title}</strong>
                <p>{item.detail}</p>
              </li>
            ))}
          </ul>
        </article>

        <article className={styles.chartCard}>
          <div className={styles.widgetHeadingRow}>
            <h3 className={styles.widgetHeading}>Course Completion</h3>
            <span className={styles.badge}>Monthly</span>
          </div>
          <div className={styles.chartPlaceholder} role="img" aria-label="Course completion chart placeholder" />
        </article>

        <article className={styles.widgetCard}>
          <h3 className={styles.widgetHeading}>Calendar</h3>
          <div className={styles.calendarGrid}>
            <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
            {Array.from({ length: 28 }, (_, i) => (
              <span key={i} className={styles.calendarDay}>{i + 1}</span>
            ))}
          </div>
        </article>

        <article className={styles.widgetCard}>
          <h3 className={styles.widgetHeading}>Recent Activity</h3>
          <ul className={styles.listGroup}>
            <li className={styles.listItem}>Assignment submitted for Database Quiz</li>
            <li className={styles.listItem}>Joined live session: Data Structures</li>
            <li className={styles.listItem}>Certificate earned: Python Basics</li>
          </ul>
        </article>
      </div>
    </section>
  );
}
