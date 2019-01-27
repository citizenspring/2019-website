import { db, inspectSpy } from '../../lib/jest';
import webhook from '../webhook';
import { unfollow } from '../api';

import sinon from 'sinon';
import libemail from '../../lib/email';
import models from '../../models';

import email6 from '../../mocks/mailgun.email6.json';
import email7 from '../../mocks/mailgun.email7.json';
import { inspect } from 'util';

const req = { body: email6 };
const res = { send: () => {} };

describe('webhook bugs', () => {
  let sandbox, sendEmailSpy, user, user2, group, post;

  beforeAll(db.reset);
  afterAll(db.close);

  beforeAll(async () => {
    sandbox = sinon.createSandbox();
    sendEmailSpy = sandbox.spy(libemail, 'send');
    user = await models.User.create({ email: 'firstsender@gmail.com' });
    user2 = await models.User.create({ email: 'firstrecipient@gmail.com' });
    group = await user.createGroup({ slug: 'testgroup' });
    post = await user.createPost({
      GroupId: group.GroupId,
      title: 'first thread',
      EmailMessageId: '<testgroup/1/1@citizenspring.be>',
    });
    await user2.follow({ PostId: post.PostId });
    await webhook(req, res);
    const users = await models.User.findAll();
    expect(users.length).toEqual(2);
  });

  afterAll(() => sandbox.restore());

  describe('when replying', () => {
    let posts;
    beforeAll(async () => {
      // sending first email which creates one group, one post
      await webhook(req, res);

      // sending reply
      sendEmailSpy.resetHistory();
      req.body = email7;
      await webhook(req, res);
      posts = await models.Post.findAll();
    });
    it("doesn't create a new user for the testgroup", async () => {
      const users = await models.User.findAll();
      expect(users.length).toEqual(2);
    });
    it('only send to the first sender', async () => {
      expect(sendEmailSpy.callCount).toEqual(1);
      expect(sendEmailSpy.firstCall.args[0]).toEqual('testgroup@citizenspring.be');
      expect(sendEmailSpy.firstCall.args[4].cc).toEqual(email6.sender);
      expect(sendEmailSpy.firstCall.args[1]).toEqual(email6.subject);
    });

    it('attaches the post to the thread', async () => {
      expect(posts[0].UserId).toEqual(1);
      expect(posts[2].UserId).toEqual(2);
      expect(posts[3].ParentPostId).toEqual(posts[0].PostId);
      expect(posts[3].text).toContain('This is a response from gmail from iPhone');
    });

    it('adds the followers', async () => {
      const followers = await models.Member.findAll({ where: { PostId: posts[0].PostId, role: 'FOLLOWER' } });
      // 2 followers: sender of first email, sender of reply (it should ignore testgroup+tag1@citizenspring.be cced)
      expect(followers.length).toEqual(2);
    });
  });
});
