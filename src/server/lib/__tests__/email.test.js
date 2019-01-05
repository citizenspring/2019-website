import libemail from '../email';
import email2 from '../../mocks/mailgun.email2.json';

describe('email', () => {
  it('parse headers', () => {
    const headers = libemail.parseHeaders(email2);
    expect(headers).toEqual({
      sender: 'firstrecipient@gmail.com',
      groupSlug: 'testgroup',
      tags: [],
      domain: 'citizenspring.be',
      email: 'testgroup@citizenspring.be',
      action: undefined,
      recipients: [{ name: 'First Sender', email: 'firstsender@gmail.com' }],
    });
  });
  it('ignores duplicate email recipients', () => {
    const headers = libemail.parseHeaders({
      sender: 'sender@gmail.com',
      recipient: 'recipient+tag1@hotmail.com',
      Cc: 'Carlos <cc@gmail.com>, recipient+tag2@hotmail.com, sender+newt@gmail.com',
    });
    expect(headers).toEqual({
      sender: 'sender@gmail.com',
      groupSlug: 'recipient',
      tags: ['tag1'],
      domain: 'hotmail.com',
      email: 'recipient@hotmail.com',
      action: undefined,
      recipients: [{ name: 'Carlos', email: 'cc@gmail.com' }],
    });
  });
});
