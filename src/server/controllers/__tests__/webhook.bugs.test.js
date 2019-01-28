import { db, inspectSpy, inspectRows } from '../../lib/jest';
import webhook from '../webhook';

import sinon from 'sinon';
import libemail from '../../lib/email';
import models from '../../models';

import email6 from '../../mocks/mailgun.email6.json';
import email7 from '../../mocks/mailgun.email7.json';
import email8 from '../../mocks/mailgun.email8.json';

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
  });

  afterAll(() => sandbox.restore());

  describe('when replying', () => {
    let posts;
    beforeAll(async () => {
      post = await user.createPost({
        GroupId: group.GroupId,
        title: 'first thread',
        EmailMessageId: '<testgroup/1/1@citizenspring.be>',
      });
      await user2.follow({ PostId: post.PostId });
      await webhook(req, res);

      // sending first email which creates one group, one post
      await webhook(req, res);

      // sending reply
      sendEmailSpy.resetHistory();
      req.body = email7;
      await webhook(req, res);
      posts = await models.Post.findAll();
    });

    afterAll(async () => {
      await models.Post.truncate();
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

  describe('when replying with group cced and some members', () => {
    let posts;
    beforeAll(async () => {
      sendEmailSpy.resetHistory();
      await group.addFollowers([{ email: 'xavier@domain.com' }, { email: 'jo@domain.com' }]);
      const req = { body: email8 };
      await webhook(req, res);
      posts = await models.Post.findAll();
    });
    it("cleans properly the html, doesn't send to people already cced", async () => {
      expect(sendEmailSpy.callCount).toEqual(2);
      expect(posts[0].html).toEqual(
        `<p>Hey David,<br><br>- Very good idea to reach Callup.io !<br><br>Hey Xavier,<br></p><p>- How about #BrusselsTogether ?&nbsp;</p><p>- For our next chicken meetup&nbsp;&nbsp;</p><p>: can it be on Wednesday 13. February ?<br>: can it be at BeCentral, a room where we can use a beamer ?</p><p><br>Thank you Brussels chickens !</p><p>Jo</p>`,
      );
    });
  });
});
