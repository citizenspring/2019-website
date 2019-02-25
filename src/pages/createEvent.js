import React from 'react';
import PropTypes from 'prop-types';
import withIntl from '../lib/withIntl';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { get, pick } from 'lodash';
import { FormattedMessage, defineMessages } from 'react-intl';
import Footer from '../components/Footer';

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
    const startsAtDate = form.startsAt.replace(/.*[^\d]([0-9]+)[^\d].*/, '$1');
    const startsAt = new Date();
    startsAt.setMonth(2);
    startsAt.setDate(startsAtDate);
    startsAt.setHours(form.startsAtTime.replace('h', ''));
    startsAt.setMinutes(0);
    const endsAt = new Date();
    endsAt.setMonth(2);
    endsAt.setDate(startsAtDate);
    endsAt.setHours(form.endsAtTime.replace('h', ''));
    endsAt.setMinutes(0);
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
    const group = { slug: this.props.groupSlug, name: this.props.groupSlug };
    return (
      <div>
        <TopBar group={group} />
        <Content>
          <Title>
            <FormattedMessage id="event.create.title" defaultMessage="Register your Citizen Initiative" />
          </Title>
          {this.state.view === 'pending' && (
            <CreateEventPending email={get(this.state, 'form.email')} group={get(this.state, 'post.group')} />
          )}
          {this.state.view !== 'pending' && <CreateEvent groupSlug={group.slug} onSubmit={this.onSubmit} />}
        </Content>
        <Footer group={group} />
      </div>
    );
  }
}

const createPostMutation = gql`
  mutation createPost($user: UserInputType!, $post: PostInputType!, $group: GroupInputType!) {
    createPost(user: $user, post: $post, group: $group) {
      id
      slug
      startsAt
      endsAt
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
