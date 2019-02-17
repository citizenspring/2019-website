import React from 'react';
import PropTypes from '../lib/propTypes';
import withIntl from '../lib/withIntl';
import Footer from '../components/Footer';
import { get } from 'lodash';
import { Box, Flex } from '@rebass/grid';

import StyledInputField from '../components/StyledInputField';
import StyledInputGroup from '../components/StyledInputGroup';
import StyledSelect from '../components/StyledSelect';
import StyledInput from '../components/StyledInput';
import StyledTextarea from '../components/StyledTextarea';
import StyledButton from '../components/StyledButton';
import StyledCard from '../components/StyledCard';
import StyledCheckbox from '../components/StyledCheckbox';
import InputTypeLocation from '../components/InputTypeLocation';
import InputTypeTags from '../components/InputTypeTags';
import env from '../env.frontend';
import { FormattedMessage, defineMessages } from 'react-intl';
import slug from 'slug';

const startsAtOptions = ['Thu March 21st', 'Fri March 22nd', 'Sat March 23rd', 'Sun March 24th'];

const timeOptions = [];
for (let i = 8; i < 24; i++) {
  timeOptions.push(`${i}h`);
}

class CreateEventPage extends React.Component {
  static propTypes = {
    data: PropTypes.nodeType('Post'),
    /** a map of errors to the matching field name, i.e. `{ email: 'Invalid email' }` will display that message until the email field */
    errors: PropTypes.objectOf(PropTypes.string),
    /** handles submissions of form */
    onSubmit: PropTypes.func.isRequired,
    /** Disable submit and show a spinner on button when set to true */
    loading: PropTypes.bool,
    /** All props from `StyledCard` */
    ...StyledCard.propTypes,
  };

  constructor(props) {
    super(props);
    const data = props.data || {};
    if (data.startsAt) {
      const startsAt = new Date(Number(this.props.data.startsAt));
      data.startsAt = startsAtOptions[startsAt.getDate() - 21];
      data.startsAtTime = startsAt.getHours() + 'h';
      const endsAt = new Date(Number(this.props.data.endsAt));
      data.endsAtTime = endsAt.getHours() + 'h';
      console.log('>>> data', data);
    }

    this.onSubmit = this.onSubmit.bind(this);
    this.state = {
      form: {
        startsAt: 'Thu March 21st',
        startsAtTime: '10h',
        endsAtTime: '11h',
        ...data,
      },
      edited: {},
      errors: {},
    };

    const suggestionsArray = [
      'food',
      'shopping',
      'mobility',
      'coliving',
      'coworking',
      'homelessness',
      'integration',
      'workshop',
      'community place',
      'permaculture',
      'recycling',
      'gardening',
      'transition',
      'energy',
      'culture',
      'education',
      'family',
      'art',
      'well being',
      'technology',
      'research',
      'creative communities',
      'other communities',
      'local economy',
      'circular economy',
      'sustainability',
      'zero waste',
      'recycling',
      'second hand',
      'art',
      'repair café',
      'fablab',
      'citizenship',
      'solidarity',
      'housing',
      'collective',
      'cooperative',
      'social business',
      'vegan',
      'cafe',
    ];

    this.suggestions = suggestionsArray.map(s => {
      return { id: s, text: s };
    });

    this.languagesValues = [
      'English',
      'French',
      'Dutch',
      'Arabic',
      'Italian',
      'Polish',
      'Romanian',
      'Spanish',
      'Turkish',
      'Brusseleer',
    ];
    this.kidsFriendlyValues = ['babies', 'toddlers', 'kids'];
  }

  componentDidMount() {
    if (this.props.data.startsAt) {
      const startsAt = new Date(Number(this.props.data.startsAt));
      window.startsAt = startsAt;
      window.data = this.props.data;
    }
  }

  getFieldError(fieldname) {
    return this.state.errors[fieldname];
  }

  onChange(fieldname, value, add) {
    const newState = this.state;
    if (add !== undefined) {
      newState.form[fieldname] = newState.form[fieldname] || [];
      if (add) {
        newState.form[fieldname].push(value);
      } else {
        const newArray = newState.form[fieldname].filter(v => v !== value);
        newState.form[fieldname] = newArray;
      }
    } else {
      newState.form[fieldname] = value;
    }
    if (fieldname === 'name' && !this.state.edited.slug) {
      newState.form.slug = (slug(value) || '').toLowerCase();
    }
    newState.edited[fieldname] = true;
    this.setState(newState);
  }

  onSubmit(event) {
    event.preventDefault();
    return this.props.onSubmit(this.state.form);
  }

  getFieldProps(fieldname, value) {
    let checked;
    if (value) {
      checked = (get(this.props, `data.formData[${fieldname}]`) || []).includes(value);
    }

    return {
      fontSize: 'Paragraph',
      lineHeight: 'Paragraph',
      onChange: event => this.onChange(fieldname, event.target.value),
      type: 'text',
      checked,
      defaultValue: this.state.form[fieldname],
      width: 1,
      px: [1, 2, 3],
    };
  }

  render() {
    const { groupSlug, onSubmit, loading } = this.props;
    return (
      <div>
        <Box px={[1, 2, 2]}>
          <Box as="form" m={[0, 2, 2]} onSubmit={this.onSubmit} method="POST">
            <Box mb={3}>
              <StyledInputField label="Your personal email" htmlFor="email" error={this.getFieldError('email')}>
                {inputProps => (
                  <StyledInput {...inputProps} {...this.getFieldProps(inputProps.name)} type="email" required />
                )}
              </StyledInputField>
            </Box>
            <Box mb={3}>
              <StyledInputField label="Name of your collective" htmlFor="title" error={this.getFieldError('title')}>
                {inputProps => <StyledInput {...inputProps} {...this.getFieldProps(inputProps.name)} />}
              </StyledInputField>
            </Box>

            <Box mb={3}>
              <StyledInputField
                label="Quick description of your collective"
                description="(don't worry, you can refine this later)"
                htmlFor="collectiveDescription"
                error={this.getFieldError('collectiveDescription')}
              >
                {inputProps => <StyledTextarea rows={5} {...inputProps} {...this.getFieldProps(inputProps.name)} />}
              </StyledInputField>
            </Box>

            <Box mb={3}>
              <StyledInputField
                label="Website"
                description="URL of your website or of your Facebook page"
                htmlFor="collectiveWebsite"
                error={this.getFieldError('collectiveWebsite')}
              >
                {inputProps => <StyledInput {...inputProps} {...this.getFieldProps(inputProps.name)} />}
              </StyledInputField>
            </Box>

            <Box mb={3}>
              <StyledInputField
                label="Description of your open door"
                description="What will you do at your open door? What will people learn?"
                htmlFor="text"
                error={this.getFieldError('text')}
              >
                {inputProps => <StyledTextarea rows={5} {...inputProps} {...this.getFieldProps(inputProps.name)} />}
              </StyledInputField>
            </Box>

            <Flex>
              <Box mb={4} width={1 / 2}>
                <StyledInputField
                  label="When is your open door?"
                  htmlFor="startsAt"
                  error={this.getFieldError('startsAt')}
                >
                  {inputProps => (
                    <StyledSelect
                      options={startsAtOptions}
                      defaultValue={this.state.form[inputProps.name]}
                      {...inputProps}
                      {...this.getFieldProps(inputProps.name)}
                      onChange={({ key }) => this.onChange('startsAt', key)}
                    />
                  )}
                </StyledInputField>
              </Box>
              <Box mb={4} width={1 / 4}>
                <StyledInputField label="From" htmlFor="startsAtTime" error={this.getFieldError('startsAtTime')}>
                  {inputProps => (
                    <StyledSelect
                      options={timeOptions}
                      defaultValue={this.state.form[inputProps.name]}
                      {...inputProps}
                      {...this.getFieldProps(inputProps.name)}
                      onChange={({ key }) => this.onChange('startsAtTime', key)}
                    />
                  )}
                </StyledInputField>
              </Box>

              <Box mb={4} width={1 / 4}>
                <StyledInputField label="Till" htmlFor="endsAtTime" error={this.getFieldError('endsAtTime')}>
                  {inputProps => (
                    <StyledSelect
                      options={timeOptions}
                      defaultValue={this.state.form[inputProps.name]}
                      {...inputProps}
                      {...this.getFieldProps(inputProps.name)}
                      onChange={({ key }) => this.onChange('endsAtTime', key)}
                    />
                  )}
                </StyledInputField>
              </Box>
            </Flex>

            <Box mb={4}>
              <StyledInputField
                label="Location"
                description="Where will your open door take place?"
                htmlFor="location"
                error={this.getFieldError('location')}
              >
                {inputProps => (
                  <InputTypeLocation
                    {...this.getFieldProps(inputProps.name)}
                    onChange={location => this.onChange('location', location)}
                  />
                )}
              </StyledInputField>
            </Box>

            <Flex>
              <Box mb={4} width={2 / 3}>
                <StyledInputField
                  label="Languages"
                  description="What languages can you accommodate?"
                  htmlFor="languages"
                  error={this.getFieldError('languages')}
                >
                  {inputProps =>
                    this.languagesValues.map(value => (
                      <Box my={2}>
                        <StyledCheckbox
                          label={value}
                          {...inputProps}
                          {...this.getFieldProps(inputProps.name, value)}
                          onChange={val => this.onChange(inputProps.name, value, val.checked)}
                        />
                      </Box>
                    ))
                  }
                </StyledInputField>
              </Box>

              <Box mb={4} width={1 / 3}>
                <StyledInputField
                  label="Kids friendly"
                  description="Is your open door kid friendly?"
                  htmlFor="kidsFriendly"
                  error={this.getFieldError('kidsFriendly')}
                >
                  {inputProps =>
                    this.kidsFriendlyValues.map(value => (
                      <Box my={2}>
                        <StyledCheckbox
                          label={value}
                          {...inputProps}
                          {...this.getFieldProps(inputProps.name, value)}
                          onChange={val => this.onChange(inputProps.name, value, val.checked)}
                        />
                      </Box>
                    ))
                  }
                </StyledInputField>
              </Box>
            </Flex>

            <Box mb={4}>
              <StyledInputField
                label="Tags"
                description="Tags help people browse through all the citizen initiatives"
                htmlFor="tags"
                error={this.getFieldError('tags')}
              >
                {inputProps => (
                  <InputTypeTags
                    {...this.getFieldProps(inputProps.name)}
                    onChange={tags => this.onChange('tags', tags)}
                    suggestions={this.suggestions}
                  />
                )}
              </StyledInputField>
            </Box>

            <Box mb={4}>
              <StyledInputField
                label="Registration URL if any"
                description="Facebook event / Eventbrite - optional - please make sure you mention #CitizenSpring in the title/description of the event"
                htmlFor="website"
                error={this.getFieldError('website')}
              >
                {inputProps => <StyledInput {...inputProps} {...this.getFieldProps(inputProps.name)} />}
              </StyledInputField>
            </Box>

            <StyledButton
              buttonStyle="primary"
              width={1}
              type="submit"
              disabled={!this.state.form.email}
              fontWeight="600"
              loading={loading}
            >
              <FormattedMessage id="createGroup.submitBtn" defaultMessage="Register" />
            </StyledButton>
          </Box>
        </Box>
        <Footer />
      </div>
    );
  }
}

export default withIntl(CreateEventPage);
