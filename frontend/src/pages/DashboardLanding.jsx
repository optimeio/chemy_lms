import { Link } from 'react-router-dom';
import styles from '../styles/DashboardShell.module.css';

const cards = [
  { label: 'Overview', path: '/app/a', description: 'Quick summary of your key learning stats.' },
  { label: 'Activity', path: '/app/b', description: 'Recent activity updates and notifications.' },
  { label: 'Analytics', path: '/app/c', description: 'Performance metrics and engagement trends.' },
  { label: 'Preferences', path: '/app/d', description: 'Adjust your dashboard settings and preferences.' },
];

export default function DashboardLanding() {
  return (
    <section className={styles.panel}>
      <div className={styles.cardHeader}>
        <div>
          <h2 className={styles.cardTitle}>Dashboard Home</h2>
          <p className={styles.cardSubtitle}>
            Choose a view to continue. Your dashboard is split into four sections for fast navigation.
          </p>
        </div>
      </div>
      <div className={styles.summaryGrid}>
        {cards.map((card) => (
          <article key={card.label} className={styles.summaryCard} tabIndex="0">
            <h3 className={styles.cardLabel}>{card.label}</h3>
            <p className={styles.cardDetail}>{card.description}</p>
            <Link to={card.path} className={styles.toggleButton} style={{ marginTop: '18px' }}>
              Open {card.label}
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
