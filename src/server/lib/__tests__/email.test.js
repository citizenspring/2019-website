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

  it('removes quoted email and email signature from gmail', () => {
    const html =
      '<html><head></head><body><div dir="ltr"><div dir="ltr">Hello Citizens,<div><br></div><div>A small question, would it be feasible and/or useful to associate with this platform:&#160;<a href="https://www.callup.io/">https://www.callup.io/</a> ?</div><div><br></div><div>One of it\'s goal is to list all the citizens and transitions initiatives.</div><div><br></div></div></div><br><br clear="all"><div><br></div>-- <br><div class="gmail_signature" dir="ltr"><div dir="ltr"><div><div dir="ltr"><div><div dir="ltr"><div><div dir="ltr"><div><div dir="ltr"><div>xxxxx xxxxx<br><br>+32 (0)00 000 00 00</div><div><a href="mailto:xxxxxx.xxxxx@gmail.com" target="_blank">xxxxx.xxxxx@gmail.com</a><br><a href="https://www.linkedin.com/in/xxxxxx/" target="_blank">Linkedin</a><br><a href="https://twitter.com/xxxxx" target="_blank">Twitter</a></div><div><br></div><div>Longue vie a la <a href="http://monnaiebruxelloise.be" target="_blank">Zinne</a>!</div></div></div></div></div></div></div></div></div></div></div>\n</body></html>';
    const res = libemail.getHTML({ 'stripped-html': html });
    expect(res).toEqual(
      `<p>Hello Citizens,<br></p><p>A small question, would it be feasible and/or useful to associate with this platform:&#160;<a href="https://www.callup.io/">https://www.callup.io/</a> ?</p><p>One of it's goal is to list all the citizens and transitions initiatives.</p>`,
    );
  });

  it('creates paragraphs', () => {
    const email = {
      'stripped-html':
        '<div>We will gather</div><div><br></div><div>Let me know <a href="mailto:info@citizenspring.be">info@citizenspring.be</a></div><div><b><br></b></div><div><b>French</b></div>',
    };
    const html = libemail.getHTML(email);
    expect(html).toEqual(
      '<p>We will gather</p><p>Let me know <a href="mailto:info@citizenspring.be">info@citizenspring.be</a></p><p><b>French</b></p>',
    );
  });
});
