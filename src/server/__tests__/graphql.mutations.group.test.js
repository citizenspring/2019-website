import { graphqlQuery, db, inspectSpy, waitForCondition, inspectRows } from '../lib/jest';
import sinon from 'sinon';
import libemail from '../lib/email';
import models from '../models';

describe('user', () => {
  let sandbox, sendEmailSpy, user;

  beforeAll(db.reset);
  afterAll(db.close);
  beforeAll(() => {
    sandbox = sinon.createSandbox();
    sendEmailSpy = sandbox.spy(libemail, 'send');
  });

  beforeAll(async () => {
    user = await models.User.create({ email: 'user1@gmail.com' });
  });

  afterAll(() => sandbox.restore());

  describe('createGroup', () => {
    const createGroupQuery = `
    mutation createGroup($user: UserInputType!, $collective: GroupInputType!, $group: GroupInputType!) {
      createGroup(user: $user, collective: $collective, group: $group) {
        id
        slug
        name
        location {
          name
          address
          lat
          long
        }
        parentGroup {
          id
          slug
          name
        }
      }
    }
    `;

    it('creates a new group and emails a confirmation url', async () => {
      await models.Group.create({
        UserId: user.id,
        slug: 'brussels',
      });
      const userData = { email: 'bienetresolidaire@email.com' };
      const collective = {
        website: 'http://bienetresolidaire.com',
        name: 'Bien être solidaire',
        description: 'This is what we do',
        slug: 'bienetresolidaire',
      };

      const group = {
        name: 'Open Door Bien Etre Solidaire',
        description: 'Description of the open door',
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

      const res = await graphqlQuery(createGroupQuery, {
        group,
        user: userData,
        collective,
      });
      expect(res.errors).toBeUndefined();
      const groups = await models.Group.findAll();
      expect(groups.length).toEqual(3);
      expect(groups[1].type).toEqual('COLLECTIVE');
      expect(groups[2].type).toEqual('EVENT');
      expect(groups[1].status).toEqual('PENDING');
      expect(groups[2].status).toEqual('PENDING');
      expect(groups[2].locationName).toEqual(group.location.name);
      expect(groups[2].address).toEqual(group.location.address);
      expect(groups[2].city).toEqual(group.location.city);
      expect(groups[2].zipcode).toEqual(group.location.zipcode);
      expect(groups[2].geoLocationLatLong.coordinates).toEqual([group.location.lat, group.location.long]);
      expect(sendEmailSpy.callCount).toEqual(1);
      expect(sendEmailSpy.firstCall.args[0]).toEqual(userData.email);
      expect(sendEmailSpy.firstCall.args[1]).toEqual('Confirmation of your registration to Citizen Spring');
      expect(sendEmailSpy.firstCall.args[2]).toContain(`/api/approve?groupSlug=${collective.slug}`);
      expect(sendEmailSpy.firstCall.args[2]).toContain(`&token=`);
      expect(groups[2].formData).toEqual({ kidsFriendly: ['babies'], languages: ['French', 'English'] });
    });
  });
});
