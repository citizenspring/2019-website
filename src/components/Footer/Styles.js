import styled from 'styled-components';
import settings from '../../../settings.json';

export const FooterWrapper = styled.div`
  margin-top: 3rem;
  height: 350px;
  overflow: hidden;
  position: relative;
`;
export const FooterBackground = styled.div`
  position: absolute;
  background: url(${settings.background}) no-repeat top center;
  background-size: cover;
  height: 350px;
  top: -5px;
  left: -5px;
  width: 105%;
  filter: blur(5px);
  z-index: 0;
`;

export const FooterContent = styled.div`
  padding: 2rem;
  z-index: 10;
  position: relative;
`;

export const FooterCopyLeft = styled.div`
  background: rgba(255, 255, 255, 0.8);
  font-size: 11px;
  z-index: 10;
  padding: 0.5rem;
  position: relative;
`;

export const FooterTitle = styled.h1`
  color: white;
  font-size: 2.8rem;
  margin-bottom: 0;
`;

export const FooterSubtitle = styled.h2`
  margin-top: 0;
  color: #222;
  font-size: 1.8rem;
`;

export const FooterLink = styled.a.attrs({
  target: '_blank',
  rel: 'noopener',
})`
  color: #828282;
  text-decoration: none;
  margin: 0px 3px;
`;

export const LinksWrapper = styled.div``;

export const LinkItemWrapper = styled.div`
  display: flex;
  margin: 0.2rem 0;
  text-shadow: 0px 0px 1px rgba(255, 255, 255, 0.8);
`;

export const Icon = styled.div`
  width: 20px;
  margin-right: 2px;
`;
