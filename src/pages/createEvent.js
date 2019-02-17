import React from 'react';
import PropTypes from 'prop-types';
import withIntl from '../lib/withIntl';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { get, pick } from 'lodash';
import { FormattedMessage, defineMessages } from 'react-intl';

import CreateEvent from '../containers/CreateEventPage';
import CreateEventPending from '../containers/CreateEventPending';
import TopBar from '../components/TopBar';
import { Title, Content, Description } from '../styles/layout';

class CreateEventPage extends React.Component {
  static getInitialProps({ query: { groupSlug } }) {
    const scripts = { googleMaps: true }; // Used in <InputTypeLocation>
    return { scripts, groupSlug };
  }
  constructor(props) {
    super(props);
    this.state = { view: 'create', form: {} };
    this.onSubmit = this.onSubmit.bind(this);
    // this.onSubmit({
    //   startsAt: 'Thu March 21st',
    //   startsAtTime: '10h',
    //   endsAtTime: '11h',
    //   email: 'xdamman@gmail.com',
    //   title: 'frida',
    //   collectiveDescription: 'frida description',
    //   collectiveWebsite: 'frida.brussels',
    //   eventDescription: 'description',
    //   languages: ['French', 'English'],
    //   location: {
    //     name: 'EAT WELL',
    //     address: null,
    //     zipcode: '1000',
    //     city: 'Brussel',
    //     countryCode: 'BE',
    //     lat: 50.8450035,
    //     long: 4.35811769999998,
    //   },
    //   kidsFriendly: ['kids'],
    //   tags: ['cooperative', 'family'],
    //   eventUrl: 'facebookUrl',
    // });
  }

  async componentDidMount() {}

  async onSubmit(form) {
    console.log('>>> form', form);
    const startsAtDate = form.startsAt.replace(/.*[^\d]([0-9]+)[^\d].*/, '$1');
    const startsAt = new Date(`2019-03-${startsAtDate} ${form.startsAtTime.replace('h', ':00')}`);
    const endsAt = new Date(`2019-03-${startsAtDate} ${form.endsAtTime.replace('h', ':00')}`);
    const user = { email: form.email };

    const group = { slug: this.props.groupSlug };
    const post = {
      type: 'EVENT',
      title: form.title,
      text: form.text,
      website: form.website,
      location: form.location,
      startsAt,
      endsAt,
      tags: form.tags,
      formData: pick(form, [
        'languages',
        'kidsFriendly',
        'collectiveName',
        'collectiveDescription',
        'collectiveWebsite',
      ]),
    };
    const res = await this.props.createPost({ post, user, group });
    console.log('>>> res', res);
    this.setState({ view: 'pending', form, post: get(res, 'data.createPost') });
  }

  render() {
    <div>
      <TopBar group={{ slug: this.props.groupSlug }} />
      <Content>
        <Title>
          <FormattedMessage id="event.create.title" defaultMessage="Register your Citizen Initiative" />
        </Title>
        {this.state.view === 'pending' && (
          <CreateEventPending email={get(this.state, 'form.email')} group={get(this.state, 'post.group')} />
        )}
        {this.state.view !== 'pending' && <CreateEvent groupSlug={this.props.groupSlug} onSubmit={this.onSubmit} />}
      </Content>
    </div>;
  }
}

const createPostMutation = gql`
  mutation createPost($user: UserInputType!, $post: PostInputType!, $group: GroupInputType!) {
    createPost(user: $user, post: $post, group: $group) {
      id
      slug
      group {
        slug
        name
      }
      createdAt
    }
  }
`;

const addMutation = graphql(createPostMutation, {
  props: ({ ownProps, mutate }) => ({
    createPost: async ({ user, post, group }) => {
      return await mutate({
        variables: { user, post, group },
      });
    },
  }),
});

export default withIntl(addMutation(CreateEventPage));
