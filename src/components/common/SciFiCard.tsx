import React from 'react';
import './SciFiCard.css';

export interface SciFiCardProps {
  title?: string;
  subtitle?: string;
  image?: string;
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
  selected?: boolean;
  onClick?: () => void;
  className?: string;
  children: React.ReactNode;
  glowColor?: string;
  stats?: {
    label: string;
    value: number;
    max: number;
  }[];
  specialAbility?: {
    name: string;
    description: string;
  };
}

export const SciFiCard: React.FC<SciFiCardProps> = ({
  title,
  subtitle,
  image,
  rarity,
  selected = false,
  onClick,
  className = '',
  children,
  glowColor,
  stats,
  specialAbility,
}) => {
  const cardClasses = [
    'sci-fi-card',
    selected && 'selected',
    onClick && 'clickable',
    rarity,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const cardStyle = glowColor ? {
    '--card-glow-color': glowColor,
  } as React.CSSProperties : undefined;

  return (
    <div
      className={cardClasses}
      onClick={onClick}
      style={cardStyle}
    >
      {image && (
        <div className="sci-fi-card-image">
          <img src={image} alt={title} />
          {rarity && <span className={`rarity-badge ${rarity}`}>{rarity}</span>}
        </div>
      )}
      <div className="sci-fi-card-content">
        {title && <h3 className="sci-fi-card-title">{title}</h3>}
        {subtitle && <h4 className="sci-fi-card-subtitle">{subtitle}</h4>}
        {children}
        {stats && stats.length > 0 && (
          <div className="sci-fi-card-stats">
            {stats.map((stat, index) => (
              <div key={index} className="stat-bar">
                <span className="stat-label">{stat.label}</span>
                <div className="stat-bar-container">
                  <div
                    className="stat-value"
                    style={{ width: `${(stat.value / stat.max) * 100}%` }}
                  />
                  <span className="stat-number">{stat.value}</span>
                </div>
              </div>
            ))}
          </div>
        )}
        {specialAbility && (
          <div className="special-ability">
            <h4>{specialAbility.name}</h4>
            <p>{specialAbility.description}</p>
          </div>
        )}
      </div>
    </div>
  );
}; 