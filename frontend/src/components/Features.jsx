import { motion } from 'framer-motion';
import '../styles/Features.css';

export default function Features() {
  const programs = [
    {
      icon: '🎓',
      title: 'Faculty Development Program (FDP)',
      description: 'Empowering faculty with industry-relevant skills and practical teaching methods.'
    },
    {
      icon: '👩‍🎓',
      title: 'Student Development Program (SDP)',
      description: 'Enhancing student employability through hands-on training and live project exposure.'
    },
    {
      icon: '🧪',
      title: 'Technical Training Programs',
      description: 'Career-focused courses on automation, IoT, and advanced manufacturing systems.'
    },
    {
      icon: '🔧',
      title: 'IoT & Industry 4.0 Solutions',
      description: 'Smart solutions designed for modern industrial operations and digital transformation.'
    },
    {
      icon: '🚀',
      title: 'Placement & Career Support',
      description: 'Connecting learners with opportunities, internships, and real-world hiring partners.'
    },
  ];

  const animateVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    <>
      <section className="features-section" id="programs">
        <div className="features-header">
          <span className="section-overline">What We Offer</span>
          <h2 className="section-title">Our Programs & Solutions</h2>
          <p className="section-subtitle">Building learning journeys that bring together technology, training, and career readiness.</p>
        </div>
        <div className="features-grid">
          {programs.map((program, index) => (
            <motion.div
              key={index}
              className="feature-card"
              variants={animateVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              whileHover={{ y: -6 }}
            >
              <div className="feature-icon">{program.icon}</div>
              <h3 className="feature-title">{program.title}</h3>
              <p className="feature-description">{program.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

    </>
  );
}
