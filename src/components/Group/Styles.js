import styled from 'styled-components';
import { Span } from '../Text';
import { Box } from '@rebass/grid';

export const MetadataWrapper = children => {
  return (
    <Box mt={[-4, -4, -4]} mb={1}>
      <Span fontSize={'1.2rem'} color="#555">
        {children.children}
      </Span>
    </Box>
  );
};
