import React from 'react';
import styled from 'styled-components';
import { FormattedMessage } from 'react-intl';

const Wrapper = styled.div`
  div {
    display: inline-block;
  }
  .edit {
    font-size: 1.4rem;
    display: inline-block;
    margin-left: 0.5rem;
    visibility: hidden;
  }
  &:hover {
    .edit {
      visibility: visible;
    }
  }
`;

export default function EditableText({ mailto, children }) {
  return (
    <Wrapper>
      {children && (
        <div>
          {children}
          <a href={mailto} className="edit">
            edit
          </a>
        </div>
      )}
    </Wrapper>
  );
}
