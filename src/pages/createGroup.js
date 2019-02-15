import React from 'react';
import PropTypes from 'prop-types';
import withIntl from '../lib/withIntl';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { get, pick } from 'lodash';

import CreateGroup from '../containers/CreateGroupPage';
import CreateGroupPending from '../containers/CreateGroupPending';

class CreateGroupPage extends React.Component {
  static getInitialProps({ query: { groupSlug } }) {
    const scripts = { googleMaps: true }; // Used in <InputTypeLocation>
    return { scripts, groupSlug };
  }
  constructor(props) {
    super(props);
    this.state = { view: 'create' };
    this.onSubmit = this.onSubmit.bind(this);
    // this.onSubmit({
    //   startsAt: 'Thu March 21st',
    //   startsAtTime: '10h',
    //   endsAtTime: '11h',
    //   email: 'xdamman@gmail.com',
    //   name: 'Frida',
    //   slug: 'frida',
    //   description: 'frida description',
    //   website: 'frida.brussels',
    //   eventDescription: 'event description',
    //   location: {
    //     name: 'EAT WELL',
    //     address: null,
    //     zipcode: '1000',
    //     city: 'Brussel',
    //     countryCode: 'BE',
    //     lat: 50.8450035,
    //     long: 4.35811769999998,
    //   },
    //   languages: ['English', 'French'],
    //   kidsFriendly: ['toddlers', 'kids', 'babies'],
    //   tags: ['family', 'cooperative'],
    //   eventUrl: 'event url',
    // });
  }

  async componentDidMount() {}

  async onSubmit(form) {
    console.log('>>> form', form);
    const startsAtDate = form.startsAt.replace(/.*[^\d]([0-9]+)[^\d].*/, '$1');
    const startsAt = new Date(`2019-03-${startsAtDate} ${form.startsAtTime.replace('h', ':00')}`);
    const endsAt = new Date(`2019-03-${startsAtDate} ${form.endsAtTime.replace('h', ':00')}`);
    const collective = pick(form, ['slug', 'name', 'description', 'website', 'tags']);
    const user = { email: form.email };
    const group = {
      description: form.eventDescription,
      startsAt,
      endsAt,
      website: form.eventUrl,
      location: form.location,
      tags: form.tags,
    };
    const res = await this.props.createGroup({ group, user, collective });
    this.setState({ view: 'pending', form });
  }

  render() {
    if (this.state.view === 'pending') {
      return <CreateGroupPending email={get(this.state, 'form.email')} group={get(res, 'data.createGroup.group')} />;
    } else {
      return <CreateGroup groupSlug={this.props.groupSlug} onSubmit={this.onSubmit} />;
    }
  }
}

const createGroupMutation = gql`
  mutation createGroup($user: UserInputType!, $collective: GroupInputType!, $group: GroupInputType!) {
    createGroup(user: $user, collective: $collective, group: $group) {
      id
      slug
      name
      createdAt
    }
  }
`;

const addMutation = graphql(createGroupMutation, {
  props: ({ ownProps, mutate }) => ({
    createGroup: async ({ user, collective, group }) => {
      return await mutate({
        variables: { group, user, collective },
      });
    },
  }),
});

export default withIntl(addMutation(CreateGroupPage));
