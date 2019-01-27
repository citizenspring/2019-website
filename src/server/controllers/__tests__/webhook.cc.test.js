import { db, inspectSpy } from '../../lib/jest';
import webhook from '../webhook';
import { unfollow } from '../api';

import sinon from 'sinon';
import libemail from '../../lib/email';
import models from '../../models';

import email1 from '../../mocks/mailgun.email1.json';

const req = { body: email1 };
const res = { send: () => {} };

describe('webhook email, testgroup@citizenspring.be in cc', () => {
  let sandbox, sendEmailSpy, user;

  beforeAll(db.reset);
  afterAll(db.close);

  beforeAll(async () => {
    sandbox = sinon.createSandbox();
    sendEmailSpy = sandbox.spy(libemail, 'send');
    user = await models.User.create({ email: 'firstsender@gmail.com' });
  });

  beforeEach(async () => {
    sendEmailSpy.resetHistory();
  });

  afterAll(() => sandbox.restore());

  describe('sending email and cc a new group', () => {
    beforeAll(async () => {
      req.body.To = 'firstreceiver@gmail.com';
      req.body.recipient = req.body.To;
      req.body.Cc = 'testgroup@citizenspring.be';
      await webhook(req, res);
    });

    it('creates a group', async () => {
      const groups = await models.Group.findAll();
      expect(groups.length).toEqual(1);
      expect(groups[0].slug).toEqual('testgroup');
    });
  });
});
