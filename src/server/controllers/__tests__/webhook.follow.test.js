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
    To: 'testgroup/follow@citizenspring.be',
    subject: 'follow group name',
    'stripped-text': 'random email text',
    'message-url': 'https://api.mailgun.com/3213211212',
    'Message-Id': Math.round(Math.random() * 1000000),
  },
};
const res = { send: () => {} };

describe('webhook follow', () => {
  let sandbox, sendEmailSpy, user, group, post;

  beforeAll(db.reset);
  afterAll(db.close);

  beforeAll(async () => {
    sandbox = sinon.createSandbox();
    sendEmailSpy = sandbox.spy(libemail, 'send');
    user = await models.User.create({ email: 'creator@gmail.com' });
    group = await user.createGroup({ slug: 'testgroup', name: 'test group', description: 'first description' });
    post = await user.createPost({ title: 'new post', GroupId: group.GroupId });
  });

  afterAll(() => sandbox.restore());

  describe('new user follow', () => {
    describe('follow group', () => {
      beforeAll(async () => {
        sendEmailSpy.resetHistory();
        await webhook(req, res);
      });
      it('receives the confirmJoinGroup email', async () => {
        expect(sendEmailSpy.callCount).toEqual(1);
        expect(sendEmailSpy.firstCall.args[0]).toEqual(req.body.sender);
        expect(sendEmailSpy.firstCall.args[1]).toEqual('Action required: please confirm to join the testgroup group');
      });

      it("doesn't create a post", async () => {
        const totalPosts = await models.Post.count();
        expect(totalPosts).toEqual(1);
      });
    });
    describe('follow thread', () => {
      beforeAll(async () => {
        sendEmailSpy.resetHistory();
        req.body.To = `testgroup/${post.PostId}/follow@citizenspring.be`;
        req.body['Message-Id'] = Math.round(Math.random() * 1000000);
        await webhook(req, res);
      });
      it('receives the confirmFollowThread email', async () => {
        expect(sendEmailSpy.callCount).toEqual(1);
        expect(sendEmailSpy.firstCall.args[0]).toEqual(req.body.sender);
        expect(sendEmailSpy.firstCall.args[1]).toEqual('Action required: please confirm to follow the thread new post');
      });
      it("doesn't create a post", async () => {
        const totalPosts = await models.Post.count();
        expect(totalPosts).toEqual(1);
      });
    });
  });

  describe('existing user follow', () => {
    describe('follow group', () => {
      beforeAll(async () => {
        sendEmailSpy.resetHistory();
        await models.User.findOrCreate({ email: 'firstsender@gmail.com' });
        req.body.To = `testgroup/follow@citizenspring.be`;
        req.body['Message-Id'] = Math.round(Math.random() * 1000000);
        await webhook(req, res);
      });

      it('follows the groups', async () => {
        expect(sendEmailSpy.callCount).toEqual(1);
        expect(sendEmailSpy.firstCall.args[0]).toEqual(req.body.sender);
        expect(sendEmailSpy.firstCall.args[1]).toEqual('You are now following testgroup@citizenspring.be');
      });
      it("doesn't create a post", async () => {
        const totalPosts = await models.Post.count();
        expect(totalPosts).toEqual(1);
      });
    });
    describe('follow thread', () => {
      beforeAll(async () => {
        sendEmailSpy.resetHistory();
        await models.User.findOrCreate({ email: 'firstsender@gmail.com' });
        req.body.To = `testgroup/${post.PostId}/follow@citizenspring.be`;
        req.body['Message-Id'] = Math.round(Math.random() * 1000000);
        await webhook(req, res);
      });

      it('follows the thread', async () => {
        expect(sendEmailSpy.callCount).toEqual(1);
        expect(sendEmailSpy.firstCall.args[0]).toEqual(req.body.sender);
        expect(sendEmailSpy.firstCall.args[1]).toContain('You are now following the thread');
      });
      it("doesn't create a post", async () => {
        const totalPosts = await models.Post.count();
        expect(totalPosts).toEqual(1);
      });
    });
  });
});
