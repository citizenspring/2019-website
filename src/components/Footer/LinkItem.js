import React from 'react';
import PropTypes from 'prop-types';
import { Icon, LinkItemWrapper } from './Styles';

export default function Howto({ icon, children }) {
  const iconNode = icon === 'oc' ? <img src="/static/images/opencollectiveicon-48x48@2x.png" height={16} /> : icon;

  return (
    <LinkItemWrapper>
      <Icon>{iconNode}</Icon>
      <div>{children}</div>
    </LinkItemWrapper>
  );
}

Howto.propTypes = {
  icon: PropTypes.string,
};
