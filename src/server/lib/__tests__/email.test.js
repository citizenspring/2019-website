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

  it('cleans the HTML', () => {
    const email = {
      'body-plain':
        'Hello world\r\n\r\nThis is a test with multiple paragraphs. \r\n\r\nAnother one. Line 1. New line.\r\nLine 2 of same paragraph. \r\n\r\nNew paragraph. ',
      'stripped-html':
        '<p>Hello world\r\n\r\nThis is a test with multiple paragraphs. \r\n\r\nAnother one. Line 1. New line.\r\nLine 2 of same paragraph. \r\n\r\nNew paragraph.</p>',
      'stripped-text':
        'Hello world\r\n\r\nThis is a test with multiple paragraphs. \r\n\r\nAnother one. Line 1. New line.\r\nLine 2 of same paragraph. \r\n\r\nNew paragraph.',
    };
    const html = libemail.getHTML(email);
    expect(html).toEqual(`<p>Hello world</p>

<p>This is a test with multiple paragraphs. </p>

<p>Another one. Line 1. New line.<br />
Line 2 of same paragraph. </p>

<p>New paragraph.</p>
`);
  });
});
