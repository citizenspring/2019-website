import { db, inspectSpy, inspectRows } from '../../lib/jest';
import webhook from '../webhook';
import { unfollow } from '../api';

import sinon from 'sinon';
import libemail from '../../lib/email';
import models from '../../models';

const req = {
  body: {
    From: 'First Sender <firstsender@gmail.com>',
    sender: 'firstsender@gmail.com',
    recipient: 'registrations/submit@citizenspring.be',
    subject: 'follow group name',
    'stripped-text': `Just send this email to register

---
slug: newgroup
startsAt: Thursday March 21st
startsAtTime: 10h
endsAtTime: 11h
name: collective name
website: website
description:
  description
  multiline

  more lines
eventDescription: description of the event
location:
  name: BeCentral
  address: Cantersteen 12
  zipcode: '1000'
  city: Bruxelles
  countryCode: BE
  lat: 50.8455124
  long: 4.357472599999937
languages:
  - English
  - French
kidsFriendly:
  - babies
  - kids
tags:
  - tag1
  - transition
  - technology
eventUrl: registrationUrl
---`,
    'message-url': 'https://api.mailgun.com/3213211212',
    'Message-Id': Math.round(Math.random() * 1000000),
  },
};
const res = { send: () => {} };

describe('webhook follow', () => {
  let sandbox, sendEmailSpy, user, newGroup;

  beforeAll(db.reset);
  afterAll(db.close);

  beforeAll(async () => {
    sandbox = sinon.createSandbox();
    sendEmailSpy = sandbox.spy(libemail, 'send');
    user = await models.User.create({ email: 'creator@gmail.com' });
    await user.createGroup({
      slug: 'registrations',
      name: 'registrations group',
      description: 'place to send registration forms',
    });
    const templatesGroup = await user.createGroup({
      slug: 'templates',
      name: 'templates group',
      status: 'PUBLISHED',
      description: 'places to keep templates for new groups',
    });
    await user.createPost({ GroupId: templatesGroup.GroupId, slug: 'contribute', title: 'How to contribute?' });
  });

  afterAll(() => sandbox.restore());

  describe('new user submit', () => {
    describe('submit form', () => {
      beforeAll(async () => {
        sendEmailSpy.resetHistory();
        await webhook(req, res);
      });
      it('receives the confirmJoinGroup email', async () => {
        expect(sendEmailSpy.callCount).toEqual(1);
        expect(sendEmailSpy.firstCall.args[0]).toEqual(req.body.sender);
        expect(sendEmailSpy.firstCall.args[1]).toEqual('Confirmation of your registration to Citizen Spring');
      });

      it('creates a post', async () => {
        const post = await models.Post.findOne({ where: { title: 'collective name' } });
        expect(post.title).toEqual('collective name');
        expect(post.tags).toEqual(['tag1', 'transition', 'technology']);
      });

      it('creates a group for the collective and a group for the event', async () => {
        const groups = await models.Group.findAll();
        expect(groups.length).toEqual(4);
        newGroup = groups[2];
        expect(newGroup.name).toEqual('collective name');
        expect(newGroup.tags).toEqual(['tag1', 'transition', 'technology']);
        expect(groups[3].type).toEqual('EVENT');
        expect(groups[3].description).toEqual('description of the event');
        expect(groups[3].ParentGroupId).toEqual(newGroup.GroupId);
      });

      it('creates a contribute post in the new group', async () => {
        const post = await models.Post.findOne({ where: { GroupId: newGroup.GroupId } });
        expect(post.status).toEqual('PUBLISHED');
        expect(post.title).toEqual('How to contribute?');
      });
    });
  });
});
