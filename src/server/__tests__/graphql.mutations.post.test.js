import { graphqlQuery, db, inspectSpy, waitForCondition, inspectRows } from '../lib/jest';
import sinon from 'sinon';
import libemail from '../lib/email';
import models from '../models';

describe('user', () => {
  let sandbox, sendEmailSpy, user, group;

  beforeAll(db.reset);
  afterAll(db.close);
  beforeAll(() => {
    sandbox = sinon.createSandbox();
    sendEmailSpy = sandbox.spy(libemail, 'send');
  });

  beforeAll(async () => {
    user = await models.User.create({ email: 'user1@gmail.com' });
    group = await models.Group.create({ slug: 'testgroup', UserId: user.id });
  });

  afterAll(() => sandbox.restore());

  describe('createPost', () => {
    const createPostQuery = `
    mutation createPost($user: UserInputType!, $post: PostInputType!, $group: GroupInputType!) {
      createPost(user: $user, post: $post, group: $group) {
        id
        slug
        title
        location {
          name
          address
          lat
          long
        }
        group {
          id
          slug
          name
        }
      }
    }
    `;

    it('creates a new pending post and emails a confirmation url', async () => {
      const userData = { email: 'bienetresolidaire@email.com' };

      const post = {
        title: 'Open Door Bien Etre Solidaire',
        text: 'Description of the open door',
        type: 'EVENT',
        startsAt: `${new Date()}`,
        endsAt: `${new Date()}`,
        website: 'https://eventbrite.com/...',
        location: {
          name: 'BeCentral',
          address: 'Cantersteen 12',
          zipcode: '1000',
          city: 'Brussels',
          countryCode: 'BE',
          lat: 50.8455124,
          long: 4.357472599999937,
        },
        formData: {
          languages: ['French', 'English'],
          kidsFriendly: ['babies'],
        },
        tags: ['tag1', 'tag2'],
      };

      const res = await graphqlQuery(createPostQuery, {
        post,
        group: { slug: 'testgroup' },
        user: userData,
      });
      expect(res.errors).toBeUndefined();
      const posts = await models.Post.findAll();
      inspectSpy(sendEmailSpy, 3);
      expect(posts.length).toEqual(1);
      expect(posts[0].type).toEqual('EVENT');
      expect(posts[0].status).toEqual('PENDING');
      expect(posts[0].locationName).toEqual(post.location.name);
      expect(posts[0].address).toEqual(post.location.address);
      expect(posts[0].city).toEqual(post.location.city);
      expect(posts[0].zipcode).toEqual(post.location.zipcode);
      expect(posts[0].geoLocationLatLong.coordinates).toEqual([post.location.lat, post.location.long]);
      expect(sendEmailSpy.callCount).toEqual(1);
      expect(sendEmailSpy.firstCall.args[0]).toEqual(userData.email);
      expect(sendEmailSpy.firstCall.args[1]).toEqual('Confirmation of your registration to Citizen Spring');
      expect(sendEmailSpy.firstCall.args[2]).toContain(`/api/approve?groupSlug=testgroup&postSlug=${posts[0].slug}`);
      expect(sendEmailSpy.firstCall.args[2]).toContain(`&token=`);
      expect(posts[0].formData).toEqual({ kidsFriendly: ['babies'], languages: ['French', 'English'] });
    });

    it.only('edits a published post and emails a confirmation url', async () => {
      const userData = { email: 'bienetresolidaire@email.com' };

      const postData = {
        title: 'Open Door Bien Etre Solidaire',
        text: 'Description of the open door',
        type: 'EVENT',
        startsAt: `${new Date()}`,
        endsAt: `${new Date()}`,
        website: 'https://eventbrite.com/...',
        location: {
          name: 'BeCentral',
          address: 'Cantersteen 12',
          zipcode: '1000',
          city: 'Brussels',
          countryCode: 'BE',
          lat: 50.8455124,
          long: 4.357472599999937,
        },
        formData: {
          languages: ['French', 'English'],
          kidsFriendly: ['babies'],
        },
        tags: ['tag1', 'tag2'],
      };

      const post = await user.createPost({ ...postData, GroupId: group.id, status: 'PUBLISHED' });

      const res = await graphqlQuery(createPostQuery, {
        post: {
          ...postData,
          title: 'edited: ' + postData.title,
          PostId: post.PostId,
        },
        group: { slug: 'testgroup' },
        user: userData,
      });
      res.errors && console.error(res.errors[0]);
      expect(res.errors).toBeUndefined();
      const posts = await models.Post.findAll();
      inspectSpy(sendEmailSpy, 3);
      expect(posts.length).toEqual(2);
      expect(posts[0].type).toEqual('EVENT');
      expect(posts[0].status).toEqual('PUBLISHED');
      expect(posts[1].status).toEqual('PENDING');
      expect(posts[0].locationName).toEqual(post.location.name);
      expect(posts[0].address).toEqual(post.location.address);
      expect(posts[0].city).toEqual(post.location.city);
      expect(posts[0].zipcode).toEqual(post.location.zipcode);
      expect(posts[0].geoLocationLatLong.coordinates).toEqual([post.location.lat, post.location.long]);
      expect(sendEmailSpy.callCount).toEqual(1);
      expect(sendEmailSpy.firstCall.args[0]).toEqual(userData.email);
      expect(sendEmailSpy.firstCall.args[1]).toEqual('please approve edit to event');
      expect(sendEmailSpy.firstCall.args[2]).toContain(`Bienetresolidaire has edited the event`);
      expect(sendEmailSpy.firstCall.args[2]).toContain(`/api/approve?groupSlug=testgroup&postSlug=${posts[0].slug}`);
      expect(sendEmailSpy.firstCall.args[2]).toContain(`&token=`);
      expect(posts[0].formData).toEqual({ kidsFriendly: ['babies'], languages: ['French', 'English'] });
    });
  });
});
