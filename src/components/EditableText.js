import React from 'react';
import styled from 'styled-components';
import autolinker from 'autolinker';
import { FormattedMessage } from 'react-intl';

const Wrapper = styled.div`
  div {
    display: inline-block;
  }
  .edit {
    font-size: 1.4rem;
    display: inline-block;
    margin-left: 0.5rem;
  }
  @media (min-width: 600px) {
    .edit {
      visibility: hidden;
    }
    &:hover {
      .edit {
        visibility: visible;
      }
    }
  }
`;

export default function EditableText({ mailto, html, children }) {
  return (
    <Wrapper>
      {html && <div dangerouslySetInnerHTML={{ __html: autolinker.link(html) }} />}
      {children && <div>{children}</div>}
      <a href={mailto} className="edit">
        ✏️
        <FormattedMessage id="edit" defaultMessage="edit" />
      </a>
    </Wrapper>
  );
}
