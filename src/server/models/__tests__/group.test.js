import models from '../';
import { db } from '../../lib/jest';
let user;
describe('group model', async () => {
  beforeAll(db.reset);
  beforeAll(async () => {
    user = await models.User.create({ email: 'user@gmail.com' });
  });
  afterAll(db.close);
  it('creates a group with tags in group name and description', async () => {
    const group = await models.Group.create({
      name: 'This is a great group #education #todo',
      description: '#anothertag, and so more description',
      tags: ['tag1'],
      UserId: user.id,
    });
    expect(group.name).toEqual('This is a great group');
    expect(group.slug).toEqual('this-is-a-great-group');
    expect(group.tags).toEqual(['tag1', 'education', 'todo', 'anothertag']);
  });
  it('creates a new version when editing a group data', async () => {
    const group = await models.Group.create({
      slug: 'test',
      UserId: user.id,
      name: 'test group',
    });
    const newVersion = await group.edit({ description: 'new description' });
    expect(newVersion.GroupId).toEqual(group.id);
    expect(newVersion.version).toEqual(2);
    const versions = await models.Group.findAll({ where: { slug: 'test' } });
    expect(versions.length).toEqual(2);
    const latestVersion = await models.Group.findBySlug('test');
    expect(latestVersion.description).toEqual('new description');
  });
  it('publishes a pending version', async () => {
    const group = await models.Group.create({
      slug: 'test2',
      UserId: user.id,
      name: 'test group',
    });
    const newVersion = await group.edit({ description: 'new description', status: 'PENDING' });
    await newVersion.publish();
    expect(newVersion.status).toEqual('PUBLISHED');
  });

  describe('location', () => {
    it('fails if invalid country code', async () => {
      try {
        group = await user.createGroup({ slug: 'newgroup', countryCode: 'Belgium' });
      } catch (e) {
        expect(e.message).toEqual('Validation error: Invalid Country Code.');
      }
    });
    it('works if valid country code', async () => {
      let group;
      try {
        group = await user.createGroup({
          slug: 'newgroup',
          countryCode: 'BE',
          geoLocationLatLong: { type: 'Point', coordinates: [50.845568, 4.357482] },
        });
      } catch (e) {
        expect(e).toBeUndefined();
      }
    });
  });

  describe('followers', async () => {
    let group;
    beforeAll(async () => {
      group = await user.createGroup({ slug: 'newgroup' });
      await group.addFollowers([
        { name: 'xavier', email: 'xavier@email.com' },
        { firstName: 'dimitri', email: 'dimitri@email.com' },
        { email: user.email },
      ]);
    });
    it('adds followers', async () => {
      const members = await models.Member.findAll({ where: { role: 'FOLLOWER', GroupId: group.GroupId } });
      expect(members.length).toEqual(3);
    });
    it('gets followers', async () => {
      const followers = await group.getFollowers();
      expect(followers.length).toEqual(3);
    });
  });
});
