import styled from 'styled-components';
import { Span } from '../Text';
import { Box } from '@rebass/grid';

export const MetadataWrapper = children => {
  return (
    <Box mt={-3} mb={1}>
      <Span fontSize={'1.2rem'} color="#828282">
        {children.children}
      </Span>
    </Box>
  );
};

export const ListItemWrapper = styled.div`
  margin: 8px 0;
  width: 100%;
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

export const Title = styled.h1`
  color: #000000;
  font-size: 1.6rem;
  text-decoration: none;
  margin: 0px 0px;
  &:visited {
    color: #828282;
  }
`;

export const FooterLink = styled.a.attrs({
  target: '_blank',
  rel: 'noopener',
})`
  color: #828282;
  text-decoration: none;
  margin: 0px 3px;
`;
