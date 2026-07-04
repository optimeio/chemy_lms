import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Features from '../components/Features';
import Footer from '../components/Footer';
import { Link } from 'react-router-dom';
import '../styles/Home.css';

export default function Home() {
  const values = [
    { title: 'Innovation', desc: 'We build practical solutions powered by modern learning and technology.', icon: '💡' },
    { title: 'Collaboration', desc: 'We work with institutions, industry, and learners as one team.', icon: '🤝' },
    { title: 'Growth', desc: 'We empower students and professionals to grow skills and careers.', icon: '📈' },
  ];

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <>
      <Navbar />
      <Hero />
      <Features />

      {/* Core Values Section */}
      <section className="home-values-section">
        <div className="container">
          <div className="values-header">
            <h2 className="section-title">Our Core Values</h2>
            <p className="section-subtitle">The principles that guide our work and drive our commitment to excellence</p>
          </div>

          <div className="values-grid">
            {values.map((val, index) => (
              <motion.div
                key={index}
                className="value-card"
                variants={cardVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                whileHover={{ y: -6 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="value-icon">{val.icon}</div>
                <h3>{val.title}</h3>
                <p>{val.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <motion.h2
            className="cta-title"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Partner with <span>Chemy LMS</span>
          </motion.h2>
          <motion.p
            className="cta-subtitle"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            Let us accelerate your industrial and digital operations with precision engineering.
          </motion.p>
          <motion.div
            className="cta-buttons"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <Link
              to="/contact"
              className="btn btn-primary"
            >
              Contact Us
            </Link>
            <Link
              to="/about"
              className="btn btn-secondary"
            >
              Learn More
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </>
  );
}