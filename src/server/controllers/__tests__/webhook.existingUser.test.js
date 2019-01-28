import { db, inspectSpy } from '../../lib/jest';
import webhook from '../webhook';
import { unfollow } from '../api';

import sinon from 'sinon';
import libemail from '../../lib/email';
import models from '../../models';

import email1 from '../../mocks/mailgun.email1.json';

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

  describe('sending first email to testgroup@citizenspring.be and cc firstrecipient', () => {
    beforeAll(async () => {
      sendEmailSpy.resetHistory();
      await webhook(req, res);
    });

    it('creates the group and add creator and all persons cced as ADMIN and FOLLOWER of the group and the post', async () => {
      const group = await models.Group.findOne();
      expect(group).toExist;
      expect(group.slug).toEqual('testgroup');
      const post = await models.Post.findOne();
      const postFollowers = await models.Member.findAll({ where: { PostId: post.PostId, role: 'FOLLOWER' } });
      expect(postFollowers.length).toEqual(2);
      const groupFollowers = await models.Member.findAll({ where: { GroupId: group.GroupId, role: 'FOLLOWER' } });
      expect(groupFollowers.length).toEqual(2);
      const admins = await models.Member.findAll({ where: { GroupId: group.id, role: 'ADMIN' } });
      expect(admins.length).toEqual(2);
    });

    it('creates a post', async () => {
      const post = await models.Post.findOne();
      expect(post.EmailMessageId).toEqual(email1['Message-Id']);
      expect(post.html).toEqual(libemail.getHTML(email1));
      expect(post.text).toEqual(email1['stripped-text']);
    });

    it('creates users for all persons cced', async () => {
      const users = await models.User.findAll({ order: [['email', 'ASC']] });
      expect(users.length).toEqual(2);
      expect(users.map(u => u.email)).toContain('firstrecipient@gmail.com');
    });

    it('sends the email to all followers of the group except people cced', async () => {
      expect(sendEmailSpy.callCount).toEqual(2);
      expect(sendEmailSpy.firstCall.args[0]).toEqual('firstsender@gmail.com');
      expect(sendEmailSpy.firstCall.args[1]).toEqual('New group email created');
      expect(sendEmailSpy.secondCall.args[0]).toEqual('firstsender@gmail.com');
      expect(sendEmailSpy.secondCall.args[1]).toContain('Message sent to the testgroup');
    });
  });
});
