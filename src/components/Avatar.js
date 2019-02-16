import React from 'react';
import PropTypes from '../lib/propTypes';

export default function Avatar({ user, height }) {
  const image = user.image || `https://ui-avatars.com/api/?rounded=true&name=${user.name}`;
  return (
    <img
      src={image}
      alt={user.name}
      title={user.name}
      height={height || 36}
      style={{ borderRadius: `${height || 36}px` }}
    />
  );
}

Avatar.propTypes = {
  user: PropTypes.nodeType('User').isRequired,
};
