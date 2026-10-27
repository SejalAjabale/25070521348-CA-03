import React from 'react';
import { ShieldCheck, Droplets, Award, Star, MapPin, Clock, Phone, Mail } from 'lucide-react';

const AboutSection = () => {
  return (
    <div className="about-container">
      <div className="about-hero glass-panel">
        <h2 className="section-title">
          <ShieldCheck className="icon-cyan" size={26} /> The Apex Standard of Automotive Care
        </h2>
        <p className="about-lead">
          Apex Detailed Wash was founded with a singular mission: to bring exotic car grade detailing
          and paint protection to daily drivers. Every vehicle is treated with calibrated pH-balanced formulas,
          ultra-plush 1200 GSM microfibers, and certified paint-safe techniques.
        </p>

        <div className="features-highlight-grid">
          <div className="highlight-card">
            <div className="highlight-icon">
              <ShieldCheck size={28} />
            </div>
            <h4>Scratch-Free Guarantee</h4>
            <p>Our two-bucket grit guard system and touch-safe foam canons ensure zero micro-marring or swirl marks.</p>
          </div>

          <div className="highlight-card">
            <div className="highlight-icon">
              <Droplets size={28} />
            </div>
            <h4>Eco-Friendly Water Recycling</h4>
            <p>We reclaim and bio-filter 80% of wash water, conserving municipal resources while delivering spotless finishes.</p>
          </div>

          <div className="highlight-card">
            <div className="highlight-icon">
              <Award size={28} />
            </div>
            <h4>Certified Master Polishers</h4>
            <p>Our detailers hold IDA (International Detailing Association) credentials and factory ceramic certifications.</p>
          </div>
        </div>
      </div>

      {/* Customer Testimonials */}
      <div className="testimonials-section">
        <h3 className="sub-title">What Our Drivers Say</h3>
        <div className="testimonials-grid">
          <div className="testimonial-card">
            <div className="star-rating">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={16} fill="#ffb703" color="#ffb703" />
              ))}
            </div>
            <p className="testimonial-quote">
              "The Ceramic Detail Wash on my Porsche Carrera was unbelievable. The water beading and depth of color looked better than the day I took delivery."
            </p>
            <div className="testimonial-author">
              <strong>Marcus Sterling</strong>
              <span>Porsche 911 Owner</span>
            </div>
          </div>

          <div className="testimonial-card">
            <div className="star-rating">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={16} fill="#ffb703" color="#ffb703" />
              ))}
            </div>
            <p className="testimonial-quote">
              "Booking online took 30 seconds. The team was punctual, thorough, and the interior deep spa eradicated every trace of dog hair and coffee stains."
            </p>
            <div className="testimonial-author">
              <strong>Elena Rostova</strong>
              <span>Audi Q7 Owner</span>
            </div>
          </div>

          <div className="testimonial-card">
            <div className="star-rating">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={16} fill="#ffb703" color="#ffb703" />
              ))}
            </div>
            <p className="testimonial-quote">
              "Hands down the cleanest studio in town. The staff explained every step and sent me a live status update when my BMW M3 was ready for pickup."
            </p>
            <div className="testimonial-author">
              <strong>David Chen</strong>
              <span>BMW M3 Competition Owner</span>
            </div>
          </div>
        </div>
      </div>

      {/* Facility & Contact Information */}
      <div className="facility-grid">
        <div className="facility-card glass-panel">
          <h4>Studio Hours</h4>
          <ul className="info-list">
            <li><Clock size={16} className="icon-cyan" /> Monday – Friday: 8:00 AM – 7:00 PM</li>
            <li><Clock size={16} className="icon-cyan" /> Saturday: 8:30 AM – 6:00 PM</li>
            <li><Clock size={16} className="icon-cyan" /> Sunday: 9:00 AM – 4:00 PM</li>
          </ul>
        </div>

        <div className="facility-card glass-panel">
          <h4>Studio Location</h4>
          <ul className="info-list">
            <li><MapPin size={16} className="icon-cyan" /> 742 Performance Way, Suite 100</li>
            <li><Phone size={16} className="icon-cyan" /> +1 (800) 555-APEX (2739)</li>
            <li><Mail size={16} className="icon-cyan" /> concierge@apexwash.com</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AboutSection;
