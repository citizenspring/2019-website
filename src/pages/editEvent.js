import React from 'react';
import PropTypes from 'prop-types';
import withIntl from '../lib/withIntl';
import { graphql, compose } from 'react-apollo';
import gql from 'graphql-tag';
import { get, pick, omit } from 'lodash';
import { FormattedMessage, defineMessages } from 'react-intl';

import CreateEvent from '../containers/CreateEventPage';
import CreateEventPending from '../containers/CreateEventPending';
import Footer from '../components/Footer';
import TopBar from '../components/TopBar';
import { Title, Content, Description } from '../styles/layout';

class CreateEventPage extends React.Component {
  static getInitialProps({ query: { eventSlug } }) {
    const scripts = { googleMaps: true }; // Used in <InputTypeLocation>
    return { scripts, eventSlug };
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
      PostId: get(this.props, 'data.Post.PostId'),
      title: form.title,
      text: form.text,
      website: form.website,
      location: omit(form.location, ['__typename']),
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
    try {
      console.log('>>> graphql query with post', post);
      const res = await this.props.createPost({ post, user, group });
      console.log('>>> res', res);
      this.setState({ view: 'pending', form, post: get(res, 'data.createPost') });
    } catch (e) {
      console.error('>>> editEvent.onSubmit error', e);
    }
  }

  render() {
    const { data } = this.props;
    if (data.loading)
      return (
        <div>
          <FormattedMessage id="loading" defaultMessage="loading" />
        </div>
      );
    const event = data.Post;
    console.log('>>> event to edit', data);
    return (
      <div>
        <TopBar group={{ slug: this.props.groupSlug }} />
        <Content>
          <Title>
            <FormattedMessage id="event.edit.title" defaultMessage="Suggest an edit to this event" />
          </Title>
          {this.state.view === 'pending' && (
            <CreateEventPending email={get(this.state, 'form.email')} group={get(this.state, 'post.group')} />
          )}
          {this.state.view !== 'pending' && (
            <CreateEvent groupSlug={this.props.groupSlug} onSubmit={this.onSubmit} data={event} />
          )}
        </Content>
        <Footer />
      </div>
    );
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

const getDataQuery = gql`
  query Post($eventSlug: String) {
    Post(postSlug: $eventSlug) {
      id
      PostId
      slug
      title
      text
      tags
      startsAt
      endsAt
      website
      formData
      location {
        name
        address
        zipcode
        city
        countryCode
        lat
        long
      }
    }
  }
`;

export const addData = graphql(getDataQuery);

const addGraphQL = compose(
  addMutation,
  addData,
);

export default withIntl(addGraphQL(CreateEventPage));
