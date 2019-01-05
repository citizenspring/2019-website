import { db, inspectSpy } from '../../lib/test';
import webhook from '../webhook';
import { unfollow } from '../api';

import sinon from 'sinon';
import libemail from '../../lib/email';
import models from '../../models';

import email1 from '../../mocks/mailgun.email1.json';
import { inspect } from 'util';

const req = { body: email1 };
const res = { send: () => {} };

describe('webhook email', () => {
  let sandbox, sendEmailSpy, user;

  beforeAll(db.reset);
  afterAll(db.close);

  beforeAll(async () => {
    sandbox = sinon.createSandbox();
    sendEmailSpy = sandbox.spy(libemail, 'send');
    user = await models.User.create({ email: 'firstsender@gmail.com' });
  });

  afterAll(() => sandbox.restore());

  describe('sending first email in a thread', async () => {
    beforeAll(async () => {
      sendEmailSpy.resetHistory();
    });

    beforeAll(async () => {
      sendEmailSpy.resetHistory();
      await webhook(req, res);
    });

    it('creates a post', async () => {
      const post = await models.Post.findOne();
      expect(post.EmailMessageId).toEqual(email1['Message-Id']);
      expect(post.html).toEqual(email1['stripped-html']);
      expect(post.text).toEqual(email1['stripped-text']);
    });
    it('creates users for all persons cced', async () => {
      const users = await models.User.findAll({ order: [['email', 'ASC']] });
      expect(users.length).toEqual(2);
      expect(users.map(u => u.email)).toContain('firstrecipient@gmail.com');
    });

    it('creates the group and add creator and all persons cced as ADMIN and FOLLOWER of the group and the post', async () => {
      const group = await models.Group.findOne();
      expect(group.slug).toEqual('testgroup');
      const post = await models.Post.findOne();
      const postFollowers = await models.Member.findAll({ where: { PostId: post.PostId, role: 'FOLLOWER' } });
      expect(postFollowers.length).toEqual(2);
      const groupFollowers = await models.Member.findAll({ where: { GroupId: group.GroupId, role: 'FOLLOWER' } });
      expect(groupFollowers.length).toEqual(2);
      const admins = await models.Member.findAll({ where: { GroupId: group.id, role: 'ADMIN' } });
      expect(admins.length).toEqual(2);
    });

    it('sends the email to all followers of the group', async () => {
      expect(sendEmailSpy.callCount).toEqual(3);
      expect(sendEmailSpy.firstCall.args[0]).toEqual('firstsender@gmail.com');
      expect(sendEmailSpy.firstCall.args[1]).toEqual('New group email created');
      expect(sendEmailSpy.secondCall.args[0]).toEqual('firstsender@gmail.com');
      expect(sendEmailSpy.secondCall.args[1]).toContain('Message sent to testgroup');
      expect(sendEmailSpy.thirdCall.args[0]).toEqual('testgroup@citizenspring.be');
      expect(sendEmailSpy.thirdCall.args[4].cc).toEqual('firstrecipient@gmail.com');
      expect(sendEmailSpy.thirdCall.args[2]).toMatch('Click here to stop receiving new emails sent to testgroup@');
    });

    it('unsubscribes from the group', async () => {
      // Test unsubscribe from group
      const matches = sendEmailSpy.thirdCall.args[2].match(/\/api\/unfollow\?token=([^\s]+)/);
      const req = { query: { token: matches[1] } };
      const res = {
        send: msg => {
          expect(msg).toEqual('You have successfully unsubscribed from new messages sent to this group');
        },
      };
      await unfollow(req, res);
      const group = await models.Group.findOne();
      const user = await models.User.findByEmail('firstrecipient@gmail.com');
      const member = await models.Member.findOne({
        where: { role: 'FOLLOWER', UserId: user.id, GroupId: group.GroupId },
      });
      expect(member).toBeNull();
    });
  });
});
