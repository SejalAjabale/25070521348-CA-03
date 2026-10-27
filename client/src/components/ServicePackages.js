import React from 'react';
import { Sparkles, Check, Clock, ArrowRight } from 'lucide-react';

export const PACKAGES = [
  {
    id: 'express',
    name: 'Express Wash',
    price: 30,
    duration: '30 mins',
    popular: false,
    description: 'Quick exterior refresh designed for vehicles with light road dust.',
    features: [
      'pH-Neutral Snow Foam Bath',
      'Hand Mitt Exterior Wash & Rinse',
      'Spot-Free Reverse Osmosis Rinse',
      'Microfiber Hand Towel Dry',
      'Wheel & Tire Face Cleaning',
      'Exterior Glass Cleaning'
    ]
  },
  {
    id: 'ceramic',
    name: 'Ceramic Detail Wash',
    price: 65,
    duration: '60 mins',
    popular: true,
    description: 'Our signature wash including hydrophobic ceramic sealant protection.',
    features: [
      'Everything in Express Wash',
      'Wheel Decontamination & Iron Remover',
      'Tire Dressing & UV Satin Protection',
      'Interior Express Vacuum & Dash Wipe',
      '6-Month SiO2 Ceramic Hydrophobic Sealant',
      'Streak-Free Glass Inside & Out',
      'Signature Luxury Car Fragrance'
    ]
  },
  {
    id: 'spa',
    name: 'Interior & Exterior Deep Spa',
    price: 120,
    duration: '90 mins',
    popular: false,
    description: 'Complete deep cleaning inside and out for the discerning car enthusiast.',
    features: [
      'Everything in Ceramic Detail Wash',
      'Deep Steam Cleaning & Upholstery Shampoo',
      'Leather Conditioning & Matte Restorer',
      'Air Vent Disinfection & Odor Neutralizer',
      'Clay Bar Surface Decontamination',
      'Engine Bay Dust & Plastic Dressing',
      'Door Jams & Trunk Channel Detailing'
    ]
  },
  {
    id: 'ultra',
    name: 'Paint Correction & Ultra Coat',
    price: 220,
    duration: '180 mins',
    popular: false,
    description: 'Master polish removing swirl marks and locking in showroom gloss.',
    features: [
      'Full Multi-Stage Machine Polish',
      '85%+ Swirl & Micro-Scratch Removal',
      '12-Month Pro Ceramic Coating Shield',
      'Wheel Barrel & Caliper Deep Scrub',
      'Hydrophobic Windshield Coating',
      'Complete VIP Interior Rejuvenation',
      'Complimentary 30-Day Checkup Wash'
    ]
  }
];

const ServicePackages = ({ onSelectPackage }) => {
  return (
    <div className="packages-container">
      <div className="section-title-wrap">
        <h2 className="section-title">
          <Sparkles className="icon-cyan" size={24} /> Precision Detailing Packages
        </h2>
        <p className="section-subtitle">
          Engineered for supercar finishes and everyday drivers. Choose your treatment level.
        </p>
      </div>

      <div className="packages-grid">
        {PACKAGES.map((pkg) => (
          <div
            key={pkg.id}
            className={`package-card ${pkg.popular ? 'package-card-featured' : ''}`}
          >
            {pkg.popular && (
              <div className="package-ribbon">
                <Sparkles size={13} /> MOST POPULAR
              </div>
            )}

            <div className="package-card-header">
              <h3 className="package-title">{pkg.name}</h3>
              <p className="package-desc">{pkg.description}</p>
              <div className="package-price-wrap">
                <span className="price-currency">$</span>
                <span className="price-amount">{pkg.price}</span>
                <span className="price-period">/ session</span>
              </div>
              <div className="package-duration">
                <Clock size={14} /> Estimated Time: {pkg.duration}
              </div>
            </div>

            <div className="package-divider" />

            <ul className="package-features-list">
              {pkg.features.map((feat, idx) => (
                <li key={idx} className="package-feature-item">
                  <Check size={16} className="feature-check" />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>

            <button
              type="button"
              className={`package-cta-btn ${pkg.popular ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => onSelectPackage(pkg.name)}
            >
              Book {pkg.name} <ArrowRight size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ServicePackages;
