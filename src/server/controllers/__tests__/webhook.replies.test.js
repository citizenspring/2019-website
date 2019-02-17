import { db, inspectSpy } from '../../lib/jest';
import webhook from '../webhook';
import { unfollow } from '../api';

import sinon from 'sinon';
import libemail from '../../lib/email';
import models from '../../models';

import email1 from '../../mocks/mailgun.email1.json';
import email2 from '../../mocks/mailgun.email2.json';
import email3 from '../../mocks/mailgun.email3.json';
import email4 from '../../mocks/mailgun.email4.json';
import { inspect } from 'util';

const req = { body: email1 };
const res = { send: () => {} };

describe('webhook replies', () => {
  let sandbox, sendEmailSpy, user;

  beforeAll(db.reset);
  afterAll(db.close);

  beforeAll(async () => {
    sandbox = sinon.createSandbox();
    sendEmailSpy = sandbox.spy(libemail, 'send');
    user = await models.User.create({ email: 'firstsender@gmail.com' });
  });

  afterAll(() => sandbox.restore());

  describe('reply by email using Message-Id header', () => {
    let posts;
    beforeAll(async () => {
      // sending first email which creates one group, one post
      await webhook(req, res);

      // sending reply
      sendEmailSpy.resetHistory();
      req.body = email2;
      await webhook(req, res);
      posts = await models.Post.findAll();
    });
    it('only send to the first sender', async () => {
      expect(sendEmailSpy.callCount).toEqual(1);
      expect(sendEmailSpy.firstCall.args[0]).toEqual('testgroup@citizenspring.be');
      expect(sendEmailSpy.firstCall.args[4].cc).toEqual(email1.sender);
      expect(sendEmailSpy.firstCall.args[1]).toEqual(email2.subject);
    });

    it('attaches the post to the thread', async () => {
      expect(posts[0].UserId).toEqual(1);
      expect(posts[1].UserId).toEqual(2);
      expect(posts[1].ParentPostId).toEqual(posts[0].PostId);
      expect(posts[1].text).toMatch(/Replying to all/);
    });

    it('adds the followers', async () => {
      const followers = await models.Member.findAll({ where: { PostId: posts[0].PostId, role: 'FOLLOWER' } });
      // 2 followers: sender of first email, sender of reply (it should ignore testgroup+tag1@citizenspring.be cced)
      expect(followers.length).toEqual(2);
    });
  });

  describe('reply by email using thread email address', () => {
    let posts;
    beforeAll(async () => {
      // sending first email which creates one group, one post
      await webhook(req, res);

      // sending reply
      sendEmailSpy.resetHistory();
      req.body = {
        ...email2,
        'Message-Id': `${Math.round(Math.random() * 10000000)}`,
        To: '"testgroup@citizenspring.be" <testgroup/1/1@citizenspring.be>',
        'In-Reply-To': '<testgroup/1/1@citizenspring.be>',
      };
      await webhook(req, res);
      posts = await models.Post.findAll();
    });
    it('only send to the first sender', async () => {
      expect(sendEmailSpy.callCount).toEqual(1);
      expect(sendEmailSpy.firstCall.args[0]).toEqual('testgroup@citizenspring.be');
      expect(sendEmailSpy.firstCall.args[4].cc).toEqual(email1.sender);
      expect(sendEmailSpy.firstCall.args[4].from).toEqual('First Recipient <testgroup@citizenspring.be>');
      expect(sendEmailSpy.firstCall.args[1]).toEqual(email2.subject);
    });

    it('attaches the post to the thread', async () => {
      expect(posts[0].UserId).toEqual(1);
      expect(posts[1].UserId).toEqual(2);
      expect(posts[1].ParentPostId).toEqual(posts[0].PostId);
      expect(posts[1].text).toMatch(/Replying to all/);
    });

    it('adds the followers', async () => {
      const followers = await models.Member.findAll({ where: { PostId: posts[0].PostId, role: 'FOLLOWER' } });
      // 2 followers: sender of first email, sender of reply (it should ignore testgroup+tag1@citizenspring.be cced)
      expect(followers.length).toEqual(2);
    });
  });

  describe('notifications', () => {
    it("don't send to followers of the group that don't follow the thread", async () => {
      sendEmailSpy.resetHistory();
      const group = await models.Group.findOne();
      await group.addFollowers([{ email: 'groupfollower@gmail.com' }]);
      const post = await models.Post.findOne();
      await post.addFollowers([{ email: 'threadfollower@gmail.com' }]);
      // sending reply
      req.body['Message-Id'] = `${Math.round(Math.random() * 10000000)}`;
      await webhook(req, res);
      expect(sendEmailSpy.callCount).toEqual(2);
      expect([sendEmailSpy.args[0][4].cc, sendEmailSpy.args[1][4].cc]).toContain(email1.sender);
      expect([sendEmailSpy.args[0][4].cc, sendEmailSpy.args[1][4].cc]).toContain('threadfollower@gmail.com');
      expect(sendEmailSpy.firstCall.args[2]).toMatch('unfollow this thread');
      expect(sendEmailSpy.secondCall.args[2]).toMatch('unfollow this thread');

      // Test unsubscribe from thread
      const matches = sendEmailSpy.secondCall.args[2].match(/\/api\/unfollow\?token=([^\s]+)/);
      req.query = { token: matches[1] };
      res.send = msg => {
        expect(msg).toEqual('You have successfully unsubscribed from future updates to this thread');
      };
      await unfollow(req, res);
      const user = await models.User.findByEmail(sendEmailSpy.secondCall.args[4].cc);
      const member = await models.Member.findOne({ where: { role: 'FOLLOWER', UserId: user.id, PostId: post.PostId } });
      expect(member).toBeNull();
    });
  });
});
