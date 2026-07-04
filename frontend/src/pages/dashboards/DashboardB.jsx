import { useEffect, useState } from 'react';
import styles from '../../styles/DashboardShell.module.css';

const feedItems = [
  {
    title: 'New assignment posted',
    description: 'UI/UX design quiz is now available in your course portal.',
    time: '10 minutes ago',
  },
  {
    title: 'Live session starting soon',
    description: 'Join the Data Structures class at 11:00 AM.',
    time: '1 hour ago',
  },
  {
    title: 'Course milestone reached',
    description: 'You have completed 60% of the JavaScript fundamentals track.',
    time: 'Yesterday',
  },
  {
    title: 'Feedback received',
    description: 'Your latest assignment has been reviewed by the mentor.',
    time: '2 days ago',
  },
];

export default function DashboardB() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setItems(feedItems);
      setLoading(false);
    }, 650);

    return () => clearTimeout(timer);
  }, []);

  return (
    <section className={styles.panel} aria-busy={loading}>
      <div className={styles.cardHeader}>
        <div>
          <h2 className={styles.cardTitle}>Recent Activity</h2>
          <p className={styles.cardSubtitle}>Latest updates from your learning feed.</p>
        </div>
      </div>

      {loading ? (
        <div className={styles.loadingBlock}>Loading your activity feed…</div>
      ) : (
        <ul className={styles.feedList}>
          {items.map((item) => (
            <li key={item.title} className={styles.feedItem} tabIndex="0">
              <div className={styles.feedItemHeader}>
                <h3>{item.title}</h3>
                <span className={styles.meta}>{item.time}</span>
              </div>
              <p>{item.description}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
