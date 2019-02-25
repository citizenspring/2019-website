import styled from 'styled-components';
import { Metadata } from '../../styles/layout';
export const PostWrapper = styled.div`
  background-color: white;
  display: flex;
  margin: 0rem 0 4rem 0;
`;

export const ContentWrapper = styled.div`
  margin-left: 0rem;
  font-size: 1.5rem;
`;

export const HeaderWrapper = styled.div`
  display: flex;
  flex-direction: row;
  font-size: 10pt;
`;

export const DateContainer = styled.div`
  margin: 0px 5px;
  color: #828282;
`;

export const Title = styled.a`
  color: #000000;
  text-decoration: none;
  margin: 0px 0px;
  &:visited {
    color: #828282;
  }
`;

export const PostHeaderWrapper = styled(Metadata)``;

export const Reaction = styled.div`
  font-size: 2rem;
`;

export const FooterLink = styled.a.attrs({
  target: '_blank',
  rel: 'noopener',
})`
  color: #828282;
  text-decoration: none;
  margin: 0px 3px;
`;
