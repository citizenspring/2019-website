import React from 'react';
import PropTypes from '../lib/propTypes';
import withIntl from '../lib/withIntl';
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
    if (props.data) {
      if (data.formData) {
        Object.keys(data.formData).map(key => {
          data[key] = data.formData[key];
        });
      }
      if (!data.startsAt || data.startsAt === '0') {
        delete data.startsAt;
        delete data.startsAtTime;
        delete data.endAtTime;
      } else {
        const startsAt = new Date(Number(this.props.data.startsAt));
        data.startsAt = startsAtOptions[startsAt.getDate() - 21];
        data.startsAtTime = startsAt.getHours() + 'h';
        const endsAt = new Date(Number(this.props.data.endsAt));
        data.endsAtTime = endsAt.getHours() + 'h';
      }
    }

    this.onSubmit = this.onSubmit.bind(this);
    this.state = {
      form: {
        startsAt: startsAtOptions[0],
        startsAtTime: timeOptions[2],
        endsAtTime: timeOptions[3],
        ...data,
      },
      edited: {},
      errors: {},
    };

    this.messages = defineMessages({
      'email.label': { id: 'form.createEvent.email.label', defaultMessage: 'Your personal email address' },
      'title.label': { id: 'form.createEvent.title.label', defaultMessage: 'Name of your collective' },
      'collectiveDescription.label': {
        id: 'form.createEvent.collectiveDescription.label',
        defaultMessage: 'Short description of your collective',
      },
      'collectiveDescription.description': {
        id: 'form.createEvent.collectiveDescription.description',
        defaultMessage: "(don't worry, you can refine this later)",
      },
      'collectiveWebsite.label': { id: 'form.createEvent.collectiveWebsite.label', defaultMessage: 'Website' },
      'collectiveWebsite.description': {
        id: 'form.createEvent.collectiveWebsite.description',
        defaultMessage: 'URL of your website or of your Facebook page',
      },
      'text.label': { id: 'form.createEvent.text.label', defaultMessage: 'Description of your open door' },
      'text.description': {
        id: 'form.createEvent.text.description',
        defaultMessage: 'What will you do at your open door? What will people learn?',
      },
      'startsAt.label': { id: 'form.createEvent.startsAt.label', defaultMessage: 'When is your open door?' },
      'startsAtTime.label': { id: 'form.createEvent.startsAtTime.label', defaultMessage: 'From' },
      'endsAtTime.label': { id: 'form.createEvent.endsAtTime.label', defaultMessage: 'Till' },
      'location.label': { id: 'form.createEvent.location.label', defaultMessage: 'Location' },
      'location.description': {
        id: 'form.createEvent.location.description',
        defaultMessage: 'Where will your open door take place?',
      },
      'language.label': { id: 'form.createEvent.language.label', defaultMessage: 'Languages' },
      'language.description': {
        id: 'form.createEvent.language.description',
        defaultMessage: 'What languages can you accommodate?',
      },
      'kidsFriendly.label': { id: 'form.createEvent.kidsFriendly.label', defaultMessage: 'Kids friendly' },
      'kidsFriendly.description': {
        id: 'form.createEvent.kidsFriendly.description',
        defaultMessage: 'Is your open door kid friendly?',
      },
      'tags.label': { id: 'form.createEvent.tags.label', defaultMessage: 'Tags' },
      'tags.description': {
        id: 'form.createEvent.tags.description',
        defaultMessage: 'Tags help people browse through all the citizen initiatives',
      },
      'website.label': { id: 'form.createEvent.website.label', defaultMessage: 'Registration URL if any' },
      'website.description': {
        id: 'form.createEvent.website.description',
        defaultMessage:
          'Facebook event / Eventbrite - optional - please make sure you mention #CitizenSpring in the title/description of the event',
      },
      'tags.food': { id: 'tags.food', defaultMessage: 'food' },
      'tags.shopping': { id: 'tags.shopping', defaultMessage: 'shopping' },
      'tags.mobility': { id: 'tags.mobility', defaultMessage: 'mobility' },
      'tags.coliving': { id: 'tags.coliving', defaultMessage: 'coliving' },
      'tags.coworking': { id: 'tags.coworking', defaultMessage: 'coworking' },
      'tags.homelessness': { id: 'tags.homelessness', defaultMessage: 'homelessness' },
      'tags.integration': { id: 'tags.integration', defaultMessage: 'integration' },
      'tags.workshop': { id: 'tags.workshop', defaultMessage: 'workshop' },
      'tags.community place': { id: 'tags.communityPlace', defaultMessage: 'community place' },
      'tags.permaculture': { id: 'tags.permaculture', defaultMessage: 'permaculture' },
      'tags.recycling': { id: 'tags.recycling', defaultMessage: 'recycling' },
      'tags.gardening': { id: 'tags.gardening', defaultMessage: 'gardening' },
      'tags.transition': { id: 'tags.transition', defaultMessage: 'transition' },
      'tags.energy': { id: 'tags.energy', defaultMessage: 'energy' },
      'tags.culture': { id: 'tags.culture', defaultMessage: 'culture' },
      'tags.education': { id: 'tags.education', defaultMessage: 'education' },
      'tags.family': { id: 'tags.family', defaultMessage: 'family' },
      'tags.art': { id: 'tags.art', defaultMessage: 'art' },
      'tags.well being': { id: 'tags.wellBeing', defaultMessage: 'well being' },
      'tags.technology': { id: 'tags.technology', defaultMessage: 'technology' },
      'tags.research': { id: 'tags.research', defaultMessage: 'research' },
      'tags.creative communities': { id: 'tags.creativeCommunities', defaultMessage: 'creative communities' },
      'tags.other communities': { id: 'tags.otherCommunities', defaultMessage: 'other communities' },
      'tags.local economy': { id: 'tags.localEconomy', defaultMessage: 'local economy' },
      'tags.circular economy': { id: 'tags.circularEconomy', defaultMessage: 'circular economy' },
      'tags.sustainability': { id: 'tags.sustainability', defaultMessage: 'sustainability' },
      'tags.zero waste': { id: 'tags.zeroWaste', defaultMessage: 'zero waste' },
      'tags.second hand': { id: 'tags.secondHand', defaultMessage: 'second hand' },
      'tags.art': { id: 'tags.art', defaultMessage: 'art' },
      'tags.repair café': { id: 'tags.repairCafe', defaultMessage: 'repair café' },
      'tags.fablab': { id: 'tags.food', defaultMessage: 'food' },
      'tags.citizenship': { id: 'tags.citizenship', defaultMessage: 'citizenship' },
      'tags.solidarity': { id: 'tags.solidarity', defaultMessage: 'solidarity' },
      'tags.housing': { id: 'tags.housing', defaultMessage: 'housing' },
      'tags.collective': { id: 'tags.collective', defaultMessage: 'collective' },
      'tags.cooperative': { id: 'tags.cooperative', defaultMessage: 'cooperative' },
      'tags.social business': { id: 'tags.socialBusiness', defaultMessage: 'social business' },
      'tags.vegan': { id: 'tags.vegan', defaultMessage: 'vegan' },
      'tags.cafe': { id: 'tags.cafe', defaultMessage: 'cafe' },
      'language.English': { id: 'language.English', defaultMessage: 'English' },
      'language.French': { id: 'language.French', defaultMessage: 'French' },
      'language.Dutch': { id: 'language.Dutch', defaultMessage: 'Dutch' },
      'language.Arabic': { id: 'language.Arabic', defaultMessage: 'Arabic' },
      'language.Italian': { id: 'language.Italian', defaultMessage: 'Italian' },
      'language.Polish': { id: 'language.Polish', defaultMessage: 'Polish' },
      'language.Romanian': { id: 'language.Romanian', defaultMessage: 'Romanian' },
      'language.Spanish': { id: 'language.Spanish', defaultMessage: 'Spanish' },
      'language.Turkish': { id: 'language.Turkish', defaultMessage: 'Turkish' },
      'language.Brusseleer': { id: 'language.Brusseleer', defaultMessage: 'Brusseleer' },
      'kidsFriendly.babies': { id: 'kidsFriendly.babies', defaultMessage: 'babies' },
      'kidsFriendly.toddlers': { id: 'kidsFriendly.toddlers', defaultMessage: 'toddlers' },
      'kidsFriendly.kids': { id: 'kidsFriendly.kids', defaultMessage: 'kids' },
    });

    this.languagesValues = Object.keys(this.messages)
      .filter(key => key.match(/^language\./))
      .map(key => key.replace(/^language\./, ''));
    this.kidsFriendlyValues = Object.keys(this.messages)
      .filter(key => key.match(/^kidsFriendly\./))
      .map(key => key.replace(/^kidsFriendly\./, ''));
    const suggestionsArray = Object.keys(this.messages)
      .filter(key => key.match(/^tags\./))
      .map(key => key.replace(/^tags\./, ''));
    console.log('>>> this.languagesValues', this.languagesValues);
    console.log('>>> this.languagesValues', this.kidsFriendlyValues);
    console.log('>>> suggestionsArray', suggestionsArray);
    this.suggestions = suggestionsArray.map(s => {
      console.log('>>> formatMessage id', `tags.${s}`);
      return { id: s, text: props.intl.formatMessage(this.messages[`tags.${s}`]) };
    });
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
    let defaultChecked;
    if (value) {
      defaultChecked = (get(this.props, `data.formData[${fieldname}]`) || []).includes(value);
    }

    return {
      fontSize: 'Paragraph',
      lineHeight: 'Paragraph',
      onChange: event => this.onChange(fieldname, event.target.value),
      type: 'text',
      defaultChecked,
      defaultValue: this.state.form[fieldname],
      width: 1,
      px: [1, 2, 3],
    };
  }

  render() {
    const { groupSlug, onSubmit, loading, intl } = this.props;
    return (
      <div>
        <Box px={[1, 2, 2]}>
          <Box as="form" m={[0, 2, 2]} onSubmit={this.onSubmit} method="POST">
            <Box mb={3}>
              <StyledInputField
                label={intl.formatMessage(this.messages['email.label'])}
                htmlFor="email"
                error={this.getFieldError('email')}
              >
                {inputProps => (
                  <StyledInput {...inputProps} {...this.getFieldProps(inputProps.name)} type="email" required />
                )}
              </StyledInputField>
            </Box>
            <Box mb={3}>
              <StyledInputField
                label={intl.formatMessage(this.messages['title.label'])}
                htmlFor="title"
                error={this.getFieldError('title')}
              >
                {inputProps => <StyledInput {...inputProps} {...this.getFieldProps(inputProps.name)} />}
              </StyledInputField>
            </Box>

            <Box mb={3}>
              <StyledInputField
                label={intl.formatMessage(this.messages['collectiveDescription.label'])}
                description={intl.formatMessage(this.messages['collectiveDescription.description'])}
                htmlFor="collectiveDescription"
                error={this.getFieldError('collectiveDescription')}
              >
                {inputProps => <StyledTextarea rows={5} {...inputProps} {...this.getFieldProps(inputProps.name)} />}
              </StyledInputField>
            </Box>

            <Box mb={3}>
              <StyledInputField
                label={intl.formatMessage(this.messages['collectiveWebsite.label'])}
                description={intl.formatMessage(this.messages['collectiveWebsite.description'])}
                htmlFor="collectiveWebsite"
                error={this.getFieldError('collectiveWebsite')}
              >
                {inputProps => <StyledInput {...inputProps} {...this.getFieldProps(inputProps.name)} />}
              </StyledInputField>
            </Box>

            <Box mb={3}>
              <StyledInputField
                label={intl.formatMessage(this.messages['text.label'])}
                description={intl.formatMessage(this.messages['text.description'])}
                htmlFor="text"
                error={this.getFieldError('text')}
              >
                {inputProps => <StyledTextarea rows={5} {...inputProps} {...this.getFieldProps(inputProps.name)} />}
              </StyledInputField>
            </Box>

            <Flex>
              <Box mb={4} width={1 / 2}>
                <StyledInputField
                  label={intl.formatMessage(this.messages['startsAt.label'])}
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
                <StyledInputField
                  label={intl.formatMessage(this.messages['startsAtTime.label'])}
                  htmlFor="startsAtTime"
                  error={this.getFieldError('startsAtTime')}
                >
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
                <StyledInputField
                  label={intl.formatMessage(this.messages['endsAtTime.label'])}
                  htmlFor="endsAtTime"
                  error={this.getFieldError('endsAtTime')}
                >
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
                label={intl.formatMessage(this.messages['location.label'])}
                description={intl.formatMessage(this.messages['location.description'])}
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
                  label={intl.formatMessage(this.messages['language.label'])}
                  description={intl.formatMessage(this.messages['language.description'])}
                  htmlFor="language"
                  error={this.getFieldError('language')}
                >
                  {inputProps =>
                    this.languagesValues.map(value => (
                      <Box my={2}>
                        <StyledCheckbox
                          label={intl.formatMessage(this.messages[`language.${value}`])}
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
                  label={intl.formatMessage(this.messages['kidsFriendly.label'])}
                  description={intl.formatMessage(this.messages['kidsFriendly.description'])}
                  htmlFor="kidsFriendly"
                  error={this.getFieldError('kidsFriendly')}
                >
                  {inputProps =>
                    this.kidsFriendlyValues.map(value => (
                      <Box my={2}>
                        <StyledCheckbox
                          label={intl.formatMessage(this.messages[`kidsFriendly.${value}`])}
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
                label={intl.formatMessage(this.messages['tags.label'])}
                description={intl.formatMessage(this.messages['tags.description'])}
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
                label={intl.formatMessage(this.messages['website.label'])}
                description={intl.formatMessage(this.messages['website.description'])}
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
              {get(this.props, 'data.PostId') && (
                <FormattedMessage id="editGroup.submitBtn" defaultMessage="suggest edit" />
              )}
              {!get(this.props, 'data.PostId') && (
                <FormattedMessage id="createGroup.submitBtn" defaultMessage="Register" />
              )}
            </StyledButton>
          </Box>
        </Box>
      </div>
    );
  }
}

export default withIntl(CreateEventPage);
