import React from 'react';
import PropTypes from 'prop-types';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import withIntl from '../lib/withIntl';
import PostList from './PostList';
import TopBar from '../components/TopBar';
import Footer from '../components/Footer';
import { compose, withHandlers, withState } from 'recompose';
import { pick } from 'lodash';
import { Box, Flex } from '@rebass/grid';
import Container from '../components/Container';

import { Title, Content, Description } from '../styles/layout';
import StyledInputField from '../components/StyledInputField';
import StyledInputGroup from '../components/StyledInputGroup';
import StyledSelect from '../components/StyledSelect';
import StyledInput from '../components/StyledInput';
import StyledTextarea from '../components/StyledTextarea';
import StyledButton from '../components/StyledButton';
import StyledCard from '../components/StyledCard';
import { mailto } from '../lib/utils';
import env from '../env.frontend';
import InputTypeLocation from '../components/InputTypeLocation';

import { FormattedMessage, defineMessages } from 'react-intl';

const timeOptions = [];
for (let i = 8; i < 24; i++) {
  timeOptions.push(`${i}h`);
}

const enhance = compose(
  withState('state', 'setState', ({ errors }) => ({ errors, tab: 'personal' })),
  withHandlers({
    timeOptions,
    getFieldError: ({ state, errors }) => name => (errors && errors[name]) || state.errors[name],
    onChange: ({ setState }) => ({ target }) =>
      setState(state => ({
        ...state,
        [target.name]: target.value,
        errors: { ...state.errors, [target.name]: null },
      })),
    onInvalid: ({ setState }) => event => {
      event.persist();
      event.preventDefault();
      setState(state => ({
        ...state,
        errors: { ...state.errors, [event.target.name]: event.target.validationMessage },
      }));
    },
  }),
  // follows composition of onChange && onInvalid to access them from props
  withHandlers({
    getFieldProps: ({ state, onChange, onInvalid }) => name => ({
      defaultValue: state[name] || '',
      fontSize: 'Paragraph',
      lineHeight: 'Paragraph',
      onChange,
      onInvalid,
      type: 'text',
      width: 1,
    }),
  }),
);

const CreateGroupPage = enhance(
  ({ getFieldError, getFieldProps, onChange, onSubmit, state, setState, submitting, ...props }) => (
    <div>
      <TopBar />
      <Content>
        <Title>
          <FormattedMessage id="createGroup.title" defaultMessage="Register your Citizen Initiative" />
        </Title>
        <StyledCard width={1} maxWidth={480} {...props}>
          <Box
            as="form"
            p={4}
            onSubmit={event => {
              event.preventDefault();
              onSubmit(pick(state, ['email', 'firstName', 'lastName']));
            }}
            method="POST"
          >
            <Box mb={3}>
              <StyledInputField label="Name" htmlFor="name" error={getFieldError('name')}>
                {inputProps => <StyledInput {...inputProps} {...getFieldProps(inputProps.name)} />}
              </StyledInputField>
            </Box>

            <Box mb={4}>
              <StyledInputField label="Website" htmlFor="website" error={getFieldError('website')}>
                {inputProps => <StyledInput {...inputProps} {...getFieldProps(inputProps.name)} />}
              </StyledInputField>
            </Box>
            <Box mb={4}>
              <StyledInputField label="Description" htmlFor="description" error={getFieldError('description')}>
                {inputProps => <StyledTextarea {...inputProps} {...getFieldProps(inputProps.name)} />}
              </StyledInputField>
            </Box>

            {/* <Box mb={4}>
            <StyledInputField label="Desired URL" htmlFor="slug" error={getFieldError('slug')}>
              {inputProps => (
                <StyledInputGroup prepend={`${env.BASE_URL}/`} {...inputProps} {...getFieldProps(inputProps.name)} />
              )}
            </StyledInputField>
          </Box>
          </Box> */}

            <Flex>
              <Box mb={4} width={1 / 2}>
                <StyledInputField label="When is your open door?" htmlFor="startsAt" error={getFieldError('startsAt')}>
                  {inputProps => (
                    <StyledSelect
                      options={['Thursday March 21st', 'Friday March 22nd', 'Saturday March 23rd', 'Sunday March 24th']}
                      defaultValue="Thursday March 21st"
                      {...inputProps}
                      {...getFieldProps(inputProps.name)}
                      onChange={({ key }) => onChange({ target: { name: 'startsAt', value: key } })}
                    />
                  )}
                </StyledInputField>
              </Box>
              <Box mb={4} width={1 / 4}>
                <StyledInputField label="From" htmlFor="startsAtTime" error={getFieldError('startsAtTime')}>
                  {inputProps => (
                    <StyledSelect
                      options={timeOptions}
                      defaultValue="10h"
                      {...inputProps}
                      {...getFieldProps(inputProps.name)}
                      onChange={({ key }) => onChange({ target: { name: 'startsAtTime', value: key } })}
                    />
                  )}
                </StyledInputField>
              </Box>

              <Box mb={4} width={1 / 4}>
                <StyledInputField label="Till" htmlFor="endsAtTime" error={getFieldError('endsAtTime')}>
                  {inputProps => (
                    <StyledSelect
                      options={timeOptions}
                      defaultValue="10h"
                      {...inputProps}
                      {...getFieldProps(inputProps.name)}
                      onChange={({ key }) => onChange({ target: { name: 'endsAtTime', value: key } })}
                    />
                  )}
                </StyledInputField>
              </Box>
            </Flex>

            <Box mb={4}>
              <StyledInputField label="Location" htmlFor="location" error={getFieldError('location')}>
                {inputProps => <InputTypeLocation {...inputProps} {...getFieldProps(inputProps.name)} />}
              </StyledInputField>
            </Box>

            <Box mb={4}>
              <StyledInputField
                label="Registration URL (Facebook event / Eventbrite) - optional"
                htmlFor="eventUrl"
                error={getFieldError('eventUrl')}
              >
                {inputProps => <StyledInput {...inputProps} {...getFieldProps(inputProps.name)} />}
              </StyledInputField>
            </Box>

            <StyledButton
              buttonStyle="primary"
              disabled={!state.email}
              width={1}
              type="submit"
              fontWeight="600"
              loading={submitting}
            >
              <FormattedMessage id="createGroup.submitBtn" defaultMessage="Register" />
            </StyledButton>
          </Box>
        </StyledCard>
      </Content>
      <Footer />
    </div>
  ),
);

CreateGroupPage.propTypes = {
  /** a map of errors to the matching field name, i.e. `{ email: 'Invalid email' }` will display that message until the email field */
  errors: PropTypes.objectOf(PropTypes.string),
  /** handles submissions of form */
  onSubmit: PropTypes.func.isRequired,
  /** Disable submit and show a spinner on button when set to true */
  submitting: PropTypes.bool,
  /** All props from `StyledCard` */
  ...StyledCard.propTypes,
};

CreateGroupPage.defaultProps = {
  errors: {},
  submitting: false,
};

export default withIntl(CreateGroupPage);
