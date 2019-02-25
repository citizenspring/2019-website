import { db, inspectSpy } from '../../lib/jest';
import { edit } from '../emails';

import sinon from 'sinon';
import libemail from '../../lib/email';
import models from '../../models';

import { inspect } from 'util';

describe('emails controller', () => {
  let sandbox, sendEmailSpy, user, group;

  beforeAll(db.reset);
  afterAll(db.close);

  beforeAll(async () => {
    sandbox = sinon.createSandbox();
    sendEmailSpy = sandbox.spy(libemail, 'send');
    user = await models.User.create({ email: 'user1@gmail.com' });
    group = await models.Group.create({ UserId: user.id, name: 'marketing', slug: 'marketing' });
  });

  afterAll(() => sandbox.restore());

  describe('edit group', () => {
    it('publishes the edit if editor is admin', async () => {
      const editedPost = await edit(user.email, group.id, null, { description: 'new description' });
      expect(editedPost.status).toEqual('PUBLISHED');
      expect(editedPost.description).toEqual('new description');
      expect(sendEmailSpy.callCount).toEqual(1);
      expect(sendEmailSpy.firstCall.args[4].template).toEqual('groupEdited');
      expect(sendEmailSpy.firstCall.args[2]).toContain('published');
    });
    it('marks the edit as pending if editor is not an admin', async () => {
      sendEmailSpy.resetHistory();
      const user2 = await models.User.create({ email: 'user2@gmail.com' });
      const editedPost = await edit(user2.email, group.id, null, { description: 'new description' });
      expect(editedPost.status).toEqual('PENDING');
      expect(editedPost.description).toEqual('new description');
      expect(sendEmailSpy.callCount).toEqual(2);
      expect(sendEmailSpy.firstCall.args[4].template).toEqual('groupEdited');
      expect(sendEmailSpy.firstCall.args[2]).toContain('pending approval');
      expect(sendEmailSpy.secondCall.args[4].template).toEqual('approveEdit');
    });
  });
});
