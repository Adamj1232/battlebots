import React from 'react';
import '../../styles/SciFiButton.css';

interface SciFiButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'accent';
  size?: 'small' | 'medium' | 'large';
  glow?: boolean;
}

export const SciFiButton: React.FC<SciFiButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  glow = false,
  className = '',
  children,
  ...props
}) => {
  const buttonClasses = [
    'sci-fi-button',
    `sci-fi-button--${variant}`,
    `sci-fi-button--${size}`,
    glow ? 'sci-fi-button--glow' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <button className={buttonClasses} {...props}>
      <span className="sci-fi-button__content">{children}</span>
      <div className="sci-fi-button__border" />
      {glow && <div className="sci-fi-button__glow" />}
    </button>
  );
};

// Button Group Component
export interface SciFiButtonGroupProps {
  children: React.ReactNode;
  className?: string;
}

export const SciFiButtonGroup: React.FC<SciFiButtonGroupProps> = ({
  children,
  className = '',
}) => {
  return (
    <div className={`sci-fi-button-group ${className}`.trim()}>
      {children}
    </div>
  );
}; 