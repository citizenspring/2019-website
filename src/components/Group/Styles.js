import styled from 'styled-components';
import { Span } from '../Text';
import { Box } from '@rebass/grid';
import { Metadata, MetadataItem as Item } from '../../styles/layout';

export const MetadataWrapper = children => {
  return (
    <Box mt={-3} mb={1}>
      <Metadata>{children.children}</Metadata>
    </Box>
  );
};

export const MetadataItem = Item;
