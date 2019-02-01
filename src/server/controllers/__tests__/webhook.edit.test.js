import { db, inspectSpy, inspectRows } from '../../lib/jest';
import webhook from '../webhook';
import { unfollow } from '../api';

import sinon from 'sinon';
import libemail from '../../lib/email';
import models from '../../models';

import email1 from '../../mocks/mailgun.email1.json';

const req = {
  body: {
    From: 'First Sender <firstsender@gmail.com>',
    sender: 'firstsender@gmail.com',
    recipient: 'testgroup/edit@citizenspring.be',
    subject: 'new group name',
    'stripped-text': 'new group description',
  },
};
const res = { send: () => {} };

describe('webhook edit', () => {
  let sandbox, sendEmailSpy, user, group;

  beforeAll(db.reset);
  afterAll(db.close);

  beforeAll(async () => {
    sandbox = sinon.createSandbox();
    sendEmailSpy = sandbox.spy(libemail, 'send');
    user = await models.User.create({ email: 'firstsender@gmail.com' });
    group = await user.createGroup({ slug: 'testgroup', name: 'test group', description: 'first description' });
  });

  afterAll(() => sandbox.restore());

  describe('edit group', () => {
    beforeAll(async () => {
      sendEmailSpy.resetHistory();
      await webhook(req, res);
    });
    it('updates the title and description of the group if sender is admin', async () => {
      const groups = await models.Group.findAll();
      expect(groups.length).toEqual(2);
      expect(groups[0].status).toEqual('ARCHIVED');
      expect(groups[1].status).toEqual('PUBLISHED');
      expect(groups[1].slug).toEqual('testgroup');
      expect(groups[1].name).toEqual(req.body.subject);
      expect(groups[1].description).toEqual(req.body['stripped-text']);
    });
  });
  describe('edit post', () => {
    let post;
    beforeEach(async () => {
      sendEmailSpy.resetHistory();
      post = await models.Post.create({ UserId: user.id, GroupId: group.id, title: 'title v1' });
      req.body.recipient = `testgroup/${post.PostId}/edit@citizenspring.be`;
      req.body.subject = 'Title v2';
      req.body['stripped-html'] = '<p>This is the v2 of my post</p>';
    });
    it('updates the title and body of the post if sender is admin', async () => {
      req.body['Message-Id'] = `${Math.round(Math.random() * 10000000)}`;
      await webhook(req, res);
      const posts = await models.Post.findAll();
      expect(posts.length).toEqual(2);
      expect(posts[0].status).toEqual('ARCHIVED');
      expect(posts[1].status).toEqual('PUBLISHED');
      expect(posts[1].PostId).toEqual(posts[0].PostId);
      expect(posts[1].title).toEqual(req.body.subject);
      expect(posts[1].html).toEqual('<p>This is the v2 of my post');
      await models.Post.truncate();
    });
    it('creates a new pending version if the author of the edit is not an admin', async () => {
      await models.User.create({ email: 'anotheruser@gmail.com' });
      req.body.sender = 'anotheruser@gmail.com';
      req.body['Message-Id'] = `${Math.round(Math.random() * 10000000)}`;
      await webhook(req, res);
      const posts = await models.Post.findAll();
      expect(posts.length).toEqual(2);
      expect(posts[0].status).toEqual('PUBLISHED');
      expect(posts[1].status).toEqual('PENDING');
      expect(posts[1].PostId).toEqual(posts[0].PostId);
      expect(posts[1].title).toEqual(req.body.subject);
      expect(posts[1].html).toEqual('<p>This is the v2 of my post');
    });
  });
});
