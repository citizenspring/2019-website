import styled from 'styled-components';
import { Box } from '@rebass/grid';
import { H1 } from '../components/Text';

export const Content = children => (
  <Box py={3} px={[2, 3, 3]}>
    {children.children}
  </Box>
);

export const Title = children => {
  return (
    <Box mr={2} mt={[2, 3, 3]} mb={[3, 3, 4]} pt={[1, 2, 4]}>
      <H1 fontSize={'3rem'}>{children.children}</H1>
    </Box>
  );
};

export const Subtitle = styled.h1`
  font-size: 2rem;
  margin-right: 1rem;
  margin-top: 2rem;
  padding-top: 2rem;
`;

export const Description = styled.p`
  font-size: 1.6rem;
  color: #555;
`;

export const PullQuote = styled.p`
  font-size: 2rem;
  font-style: italic;
`;
