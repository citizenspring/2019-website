import models from '../';
import { db } from '../../lib/jest';
let user, group;

describe('post model', () => {
  beforeAll(db.reset);
  beforeAll(async () => {
    user = await models.User.create({ email: 'user@gmail.com' });
    group = await models.Group.create({ UserId: user.id, slug: 'testgroup' });
  });
  afterAll(db.close);

  it('creates a post with tags', async () => {
    const post = await models.Post.create({
      title: 'This is a great post #education #todo',
      tags: ['tag1'],
      UserId: user.id,
      GroupId: group.id,
    });
    expect(post.title).toEqual('This is a great post');
    expect(post.slug).toEqual('this-is-a-great-post-1');
    expect(post.tags).toEqual(['tag1', 'education', 'todo']);
  });

  it('creates a new version when editing a post data', async () => {
    const post = await models.Post.create({
      slug: 'test',
      UserId: user.id,
      GroupId: group.id,
    });
    const newVersion = await post.edit({ title: 'new title' });
    expect(newVersion.PostId).toEqual(post.id);
    expect(newVersion.version).toEqual(2);
    const versions = await models.Post.findAll({ where: { PostId: post.PostId } });
    expect(versions.length).toEqual(2);
    const latestVersion = await models.Post.findBySlug(`test-${post.PostId}`);
    expect(latestVersion.title).toEqual('new title');
  });

  describe('followers', () => {
    let post;
    beforeAll(async () => {
      post = await user.createPost({ slug: 'newpost', GroupId: group.id });
      await post.addFollowers([
        { name: 'xavier', email: 'xavier@email.com' },
        { firstName: 'dimitri', email: 'dimitri@email.com' },
        { email: user.email },
      ]);
    });
    it('adds followers', async () => {
      const members = await models.Member.findAll({ where: { role: 'FOLLOWER', PostId: post.PostId } });
      expect(members.length).toEqual(3);
    });
    it('gets followers', async () => {
      const followers = await post.getFollowers();
      expect(followers.length).toEqual(3);
    });
  });
});
