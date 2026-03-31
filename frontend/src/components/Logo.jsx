import React from 'react';
import logoImg from '../assets/logo.png';

const Logo = ({ size = 'medium', className = '', style = {} }) => {
  const sizes = {
    small: '44px',
    medium: '60px',
    large: '80px',
    xlarge: '100px',
    xxlarge: '130px'
  };

  const height = sizes[size] || size;

  return (
    <div className={`logo-container ${className}`} style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      ...style
    }}>
      <img
        src={logoImg}
        alt="AI Resume Analyser"
        style={{
          height: height,
          width: 'auto',
          maxWidth: '100%',
          objectFit: 'contain',
          borderRadius: '4px'
        }}
      />
    </div>
  );
};

export default Logo;
