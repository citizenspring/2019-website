import styled from 'styled-components';
import { Box } from '@rebass/grid';
import { H1 } from '../components/Text';

export const MaxWidth = styled.div`
  max-width: 900px;
  margin: 0 auto;
`;

export const Content = children => (
  <Box py={3} px={[2, 3, 3]}>
    <MaxWidth>{children.children}</MaxWidth>
  </Box>
);

const TitleH1 = styled(H1)`
  font-size: 3rem;
  line-height: 1.3;
  margin-bottom: 8px;
`;

export const Title = children => {
  return (
    <Box mr={2} mt={[2, 3, 3]} mb={[2, 2, 3]} pt={[1, 2, 4]}>
      <TitleH1>{children.children}</TitleH1>
    </Box>
  );
};

export const Subtitle = styled.h1`
  font-size: 2rem;
  font-weight: 300;
  margin-right: 1rem;
  margin-top: ${props => (props.mt !== undefined ? props.mt : '2rem')};
  padding-top: ${props => (props.pt !== undefined ? props.pt : '2rem')};
`;

export const Description = styled.p`
  font-size: 1.6rem;
  color: #555;
`;

export const DescriptionBlock = styled.div`
  margin: 1rem 0;
  font-size: 1.6rem;
  color: #555;
`;

export const PullQuote = styled.p`
  font-size: 2rem;
  max-width: 400px;
  color: #555;
  font-weight: 300;
`;

export const Metadata = styled.div`
  padding: 0px;
  margin: 0 0 1rem 0;
  font-size: 1.2rem;
  color: #828282;
  display: flex;
  align-items: center;
  .edit {
    visibility: hidden;
  }
  &:hover {
    .edit {
      visibility: visible;
    }
    .emoji {
      filter: grayscale(0);
    }
  }
`;

export const MetadataItem = styled.div`
  margin-right: 0.5rem;
`;

export const Emoji = styled.span.attrs({ className: 'emoji' })`
  font-size: 1.2rem;
  filter: grayscale(1);
`;
