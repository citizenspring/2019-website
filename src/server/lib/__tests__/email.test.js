import libemail from '../email';
import email2 from '../../mocks/mailgun.email2.json';

describe('email', () => {
  it('parse headers', () => {
    const headers = libemail.parseHeaders(email2);
    expect(headers).toEqual({
      sender: 'firstrecipient@gmail.com',
      tags: ['tag1'],
      group: {
        email: 'testgroup@citizenspring.be',
        slug: 'testgroup',
        domain: 'citizenspring.be',
      },
      action: undefined,
      recipients: [{ name: 'First Sender', email: 'firstsender@gmail.com' }],
    });
  });
  it('ignores duplicate email recipients', () => {
    const headers = libemail.parseHeaders({
      sender: 'sender@gmail.com',
      To: 'recipient+tag1@hotmail.com, recipient+tag2@hotmail.com',
      Cc: 'Carlos <cc@gmail.com>, recipient+tag2@hotmail.com, sender+newt@gmail.com',
    });
    expect(headers).toEqual({
      sender: 'sender@gmail.com',
      recipients: [
        { email: 'recipient+tag1@hotmail.com' },
        { email: 'recipient+tag2@hotmail.com' },
        { name: 'Carlos', email: 'cc@gmail.com' },
        { email: 'sender+newt@gmail.com' },
      ],
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
    expect(html).toEqual(
      `<p>Hello world<p>This is a test with multiple paragraphs.<p>Another one. Line 1. New line. Line 2 of same paragraph.<p>New paragraph.`,
    );
  });

  it('cleans the HTML', () => {
    const email = {
      'stripped-html': '<div dir=ltr></div><div dir=ltr>This is cool!</div><div dir=ltr></div>',
    };
    const html = libemail.getHTML(email);
    expect(html).toEqual('<p>This is cool!');
  });

  it('cleans the trialing empty div in HTML after removing signature', () => {
    const email = {
      'stripped-html':
        '<div dir="ltr"><br clear="all"><div><div dir="ltr" class="gmail_signature" data-smartmail="gmail_signature"><div>Koen Kuylen</div>\n<div><a href="mailto:xxxxxxxx@gmail.com" target="_blank">xxxxxxxx@gmail.com</a></div>\n<div>xxxx xx xx xx</div></div></div></div>\n',
    };
    const html = libemail.getHTML(email);
    expect(html).toEqual('');
  });

  it('cleans Samsung signature', () => {
    const email = {
      'stripped-html':
        '<html><head><meta http-equiv="Content-Type" content="text/html; charset=UTF-8"></head><body>👍<div><br></div><div><br></div><div><br></div><div><br></div><div id="composer_signature"><div style="font-size:85%;color:#575757" dir="auto">Verzonden vanaf mijn Samsung Galaxy-smartphone.</div></div></body></html>',
    };
    const html = libemail.getHTML(email);
    expect(html).toEqual('<p>👍');
  });

  it('cleans outlook html email with <b>', () => {
    const outlookHTML = `<!--StartFragment--><p  dir="ltr" style="line-height: 1.9872; margin: 0px; background-color: rgb(253, 253, 253);" data-mce-style="line-height: 1.9872; margin: 0px; background-color: #fdfdfd;"> <span style="font-size: 10pt; font-family: Arial; color: #38761d; background-color: transparent; font-weight: 400; font-style: normal; font-variant: normal; text-decoration: none; vertical-align: baseline; white-space: pre-wrap;" data-mce-style="font-size: 10pt; font-family: Arial; color: #38761d; background-color: transparent; font-weight: 400; font-style: normal; font-variant: normal; text-decoration: none; vertical-align: baseline; white-space: pre-wrap;" >Beste actieve burger </span></p><b style="font-weight: normal;" data-mce-style="font-weight: normal;"> <b style="font-weight: normal;" data-mce-style="font-weight: normal;"> <br /> </b></b><p dir="ltr" style="line-height: 1.9872; margin: 0px; background-color: rgb(253, 253, 253);" data-mce-style="line-height: 1.9872; margin: 0px; background-color: #fdfdfd;"> <span style="font-size: 10pt; font-family: Arial; color: #38761d; background-color: transparent; font-weight: 400; font-style: normal; font-variant: normal; text-decoration: none; vertical-align: baseline; white-space: pre-wrap;" data-mce-style="font-size: 10pt; font-family: Arial; color: #38761d; background-color: transparent; font-weight: 400; font-style: normal; font-variant: normal; text-decoration: none; vertical-align: baseline; white-space: pre-wrap;" >Tussen 21 en 24 maart 2019 organiseert #CitizenSpring🌱 opendeurdagen voor burgerinitiatieven. Het concept volgt het idee van een openbedrijvendag, maar dan voor burgerinitiatieven. Het doel van deze dagen is de zichtbaarheid van al deze actieve burgers te verhogen. </span></p>`;
    const email = {
      'stripped-html': outlookHTML,
    };
    const html = libemail.getHTML(email);
    expect(html).toEqual(
      `<p>Beste actieve burger<p>Tussen 21 en 24 maart 2019 organiseert #CitizenSpring🌱 opendeurdagen voor burgerinitiatieven. Het concept volgt het idee van een openbedrijvendag, maar dan voor burgerinitiatieven. Het doel van deze dagen is de zichtbaarheid van al deze actieve burgers te verhogen.`,
    );
  });

  it('removes signature from Huawei phones', () => {
    const email = {
      'stripped-signature': 'Sent from my Huawei phone',
      'stripped-html':
        'I saw another proposal from a girls and needs a clearer font<div>I&#39;ll try to improve those or adjust them.?&nbsp;<br /><br />Sent from my Huawei phone</div>',
    };
    const html = libemail.getHTML(email);
    expect(html).toEqual(
      `<p>I saw another proposal from a girls and needs a clearer font<br>I'll try to improve those or adjust them.?`,
    );
  });

  it('cleans outlook html email with markdown', () => {
    const email = {
      'stripped-html':
        '<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 3.2//EN">\n<HTML>\n<HEAD>\n<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=utf-8">\n<META NAME="Generator" CONTENT="MS Exchange Server version 16.0.11231.20122">\n<TITLE>code of conduct for coordination group</TITLE>\n</HEAD>\n<BODY>\n<!-- Converted from text/rtf format -->\n\n<P DIR=LTR><SPAN LANG="nl-be"></SPAN><SPAN LANG="en-gb"><FONT FACE="Calibri">Hi everyone</FONT></SPAN></P>\n\n<P DIR=LTR><SPAN LANG="nl-be"></SPAN><SPAN LANG="en-gb"><FONT FACE="Calibri">This ride towards 21-</FONT></SPAN><SPAN LANG="nl-be"></SPAN><SPAN LANG="en-gb"><FONT FACE="Calibri">24 March</FONT></SPAN><SPAN LANG="nl-be"></SPAN><SPAN LANG="en-gb"> <FONT FACE="Calibri">definitely feels like being in</FONT></SPAN><SPAN LANG="nl-be"></SPAN><SPAN LANG="en-gb"> <FONT FACE="Calibri">one of these Japanese express trains (de</FONT></SPAN><SPAN LANG="nl-be"></SPAN><SPAN LANG="en-gb"><FONT FACE="Calibri">finitely not a Belgian train).</FONT></SPAN><SPAN LANG="nl-be"></SPAN><SPAN LANG="en-gb"> <FONT FACE="Calibri">But a</FONT></SPAN><SPAN LANG="nl-be"></SPAN><SPAN LANG="en-gb"><FONT FACE="Calibri">t the very beginning</FONT></SPAN><SPAN LANG="nl-be"></SPAN><SPAN LANG="en-gb"><FONT FACE="Calibri">,</FONT></SPAN><SPAN LANG="nl-be"></SPAN><SPAN LANG="en-gb"><FONT FACE="Calibri"></FONT></SPAN><SPAN LANG="nl-be"></SPAN><SPAN LANG="en-gb"> <FONT FACE="Calibri">before the idea of the open days even,</FONT></SPAN><SPAN LANG="nl-be"></SPAN><SPAN LANG="en-gb"> <FONT FACE="Calibri">we tried writing a \'code of conduct\',</FONT></SPAN><SPAN LANG="nl-be"></SPAN><SPAN LANG="en-gb"><FONT FACE="Calibri"> a code that</FONT></SPAN><SPAN LANG="nl-be"></SPAN><SPAN LANG="en-gb"><FONT FACE="Calibri"> would</FONT></SPAN><SPAN LANG="nl-be"></SPAN><SPAN LANG="en-gb"> <FONT FACE="Calibri">create a safe space to experiment, to set a way of working with each other.</FONT></SPAN><SPAN LANG="nl-be"></SPAN><SPAN LANG="en-gb"><FONT FACE="Calibri"></FONT></SPAN><SPAN LANG="nl-be"></SPAN><SPAN LANG="en-gb"> <FONT FACE="Calibri">I thought it would be nice</FONT></SPAN><SPAN LANG="nl-be"></SPAN><SPAN LANG="en-gb"><FONT FACE="Calibri"> to</FONT></SPAN><SPAN LANG="nl-be"></SPAN><SPAN LANG="en-gb"><FONT FACE="Calibri"> have a look at it</FONT></SPAN><SPAN LANG="nl-be"></SPAN><SPAN LANG="en-gb"><FONT FACE="Calibri">,</FONT></SPAN><SPAN LANG="nl-be"></SPAN><SPAN LANG="en-gb"> <FONT FACE="Calibri">now, while we are so busy.</FONT></SPAN><SPAN LANG="nl-be"></SPAN><SPAN LANG="en-gb"> <FONT FACE="Calibri">CitizenSpring is</FONT></SPAN><SPAN LANG="nl-be"></SPAN><SPAN LANG="en-gb"> <FONT FACE="Calibri">a citizen initiative</FONT></SPAN><SPAN LANG="nl-be"></SPAN><SPAN LANG="en-gb"> <FONT FACE="Calibri">organizing the open days,</FONT></SPAN><SPAN LANG="nl-be"></SPAN><SPAN LANG="en-gb"> <FONT FACE="Calibri">finding a way to contribute and to act,</FONT></SPAN><SPAN LANG="nl-be"></SPAN><SPAN LANG="en-gb"> <FONT FACE="Calibri">but it might also be a</FONT></SPAN><SPAN LANG="nl-be"></SPAN><SPAN LANG="en-gb"> <FONT FACE="Calibri">bunch of</FONT></SPAN><SPAN LANG="nl-be"></SPAN><SPAN LANG="en-gb"><FONT FACE="Calibri"></FONT></SPAN><SPAN LANG="nl-be"></SPAN><SPAN LANG="en-gb"> <FONT FACE="Calibri">citizens</FONT></SPAN><SPAN LANG="nl-be"></SPAN><SPAN LANG="en-gb"> <FONT FACE="Calibri">experimenting being a</FONT></SPAN><SPAN LANG="nl-be"></SPAN><SPAN LANG="en-gb"> <FONT FACE="Calibri">diverse</FONT></SPAN><SPAN LANG="nl-be"></SPAN><SPAN LANG="en-gb"> <FONT FACE="Calibri">team, a crew, trying to work together and connect.</FONT></SPAN><SPAN LANG="nl-be"></SPAN><SPAN LANG="en-gb"><FONT FACE="Calibri"> And communicating openly about it while</FONT></SPAN><SPAN LANG="nl-be"></SPAN><SPAN LANG="en-gb"> <FONT FACE="Calibri">doing this</FONT></SPAN><SPAN LANG="nl-be"></SPAN><SPAN LANG="en-gb"><FONT FACE="Calibri"> (</FONT></SPAN><SPAN LANG="nl-be"></SPAN><SPAN LANG="en-gb"><FONT FACE="Calibri">e.g.</FONT></SPAN><SPAN LANG="nl-be"></SPAN><SPAN LANG="en-gb"> <FONT FACE="Calibri">via this</FONT></SPAN><SPAN LANG="nl-be"></SPAN><SPAN LANG="en-gb"> <FONT FACE="Calibri">really cool e-mailplatform)</FONT></SPAN><SPAN LANG="nl-be"></SPAN><SPAN LANG="en-gb"><FONT FACE="Calibri">.</FONT></SPAN><SPAN LANG="nl-be"></SPAN><SPAN LANG="en-gb">&nbsp;<FONT FACE="Calibri"></FONT></SPAN><SPAN LANG="nl-be"></SPAN><SPAN LANG="en-gb"> <FONT FACE="Calibri">Imagine lear</FONT></SPAN><SPAN LANG="nl-be"></SPAN><SPAN LANG="en-gb"><FONT FACE="Calibri">ning while doing</FONT></SPAN><SPAN LANG="nl-be"></SPAN><SPAN LANG="en-gb"></SPAN><SPAN LANG="en-gb"> <FONT FACE="Segoe UI Emoji">😊</FONT></SPAN><SPAN LANG="nl-be"></SPAN><SPAN LANG="en-gb"><FONT FACE="Calibri">.</FONT></SPAN><SPAN LANG="nl-be"></SPAN><SPAN LANG="en-gb"></SPAN></P>\n\n<P DIR=LTR><SPAN LANG="en-gb"><FONT FACE="Calibri">Here it is ...</FONT></SPAN><SPAN LANG="nl-be"></SPAN><SPAN LANG="en-gb"><FONT FACE="Calibri"></FONT></SPAN><SPAN LANG="nl-be"></SPAN><SPAN LANG="en-gb"> <FONT FACE="Calibri">Please feel very free to comment and add, share thoughts.</FONT></SPAN><SPAN LANG="nl-be"></SPAN><SPAN LANG="en-gb"></SPAN></P>\n\n<P DIR=LTR><SPAN LANG="nl-be"></SPAN><SPAN LANG="en-gb"></SPAN></P>\n\n<P DIR=LTR><SPAN LANG="nl-be"></SPAN><SPAN LANG="en-gb"><FONT FACE="Calibri"># Code of Conduct</FONT></SPAN><SPAN LANG="nl-be"></SPAN><SPAN LANG="en-gb"><FONT FACE="Calibri"></FONT></SPAN><SPAN LANG="nl-be"></SPAN><SPAN LANG="en-gb"> </SPAN></P>\n\n<P DIR=LTR><SPAN LANG="en-gb"><FONT FACE="Calibri">For the #CitizenSpring</FONT></SPAN><SPAN LANG="nl-be"></SPAN><SPAN LANG="nl-be"><FONT FACE="Segoe UI Emoji">🌱</FONT></SPAN><SPAN LANG="nl-be"></SPAN><SPAN LANG="en-gb"><FONT FACE="Calibri"> coordination group</FONT></SPAN><SPAN LANG="nl-be"></SPAN><SPAN LANG="en-gb"></SPAN></P>\n\n<P DIR=LTR><SPAN LANG="en-gb"><FONT FACE="Calibri">(version of</FONT></SPAN><SPAN LANG="nl-be"></SPAN><SPAN LANG="en-gb"> <FONT FACE="Calibri">27-12-2018)</FONT></SPAN><SPAN LANG="nl-be"></SPAN><SPAN LANG="en-gb"></SPAN></P>\n\n<P DIR=LTR><SPAN LANG="nl-be"></SPAN><SPAN LANG="en-gb"></SPAN></P>\n\n<P DIR=LTR><SPAN LANG="nl-be"></SPAN><SPAN LANG="en-gb"><FONT FACE="Calibri">##</FONT></SPAN><SPAN LANG="nl-be"></SPAN><SPAN LANG="en-gb"><FONT FACE="Calibri"></FONT></SPAN><SPAN LANG="nl-be"></SPAN><SPAN LANG="en-gb"> <FONT FACE="Calibri">Our Pledge</FONT></SPAN></P>\n\n<P DIR=LTR><SPAN LANG="en-gb"><FONT FACE="Calibri">In the interest of fostering an open and welcoming environment, we as</FONT></SPAN><SPAN LANG="nl-be"></SPAN><SPAN LANG="en-gb"><FONT FACE="Calibri"></FONT></SPAN><SPAN LANG="nl-be"></SPAN><SPAN LANG="en-gb"> <FONT FACE="Calibri">contributors and maintainers pledge to make participation in our project and</FONT></SPAN><SPAN LANG="nl-be"></SPAN><SPAN LANG="en-gb"><FONT FACE="Calibri"></FONT></SPAN><SPAN LANG="nl-be"></SPAN><SPAN LANG="en-gb"> <FONT FACE="Calibri">our community a harassment-free experience for everyone, regardless of age, body</FONT></SPAN><SPAN LANG="nl-be"></SPAN><SPAN LANG="en-gb"><FONT FACE="Calibri"></FONT></SPAN><SPAN LANG="nl-be"></SPAN><SPAN LANG="en-gb"> <FONT FACE="Calibri">size, disability, ethnicity, gender identity and expression, level of experience,</FONT></SPAN><SPAN LANG="nl-be"></SPAN><SPAN LANG="en-gb"><FONT FACE="Calibri"></FONT></SPAN><SPAN LANG="nl-be"></SPAN><SPAN LANG="en-gb"> <FONT FACE="Calibri">nationality, personal appearance, race, religion, or sexual identity and</FONT></SPAN><SPAN LANG="nl-be"></SPAN><SPAN LANG="en-gb"><FONT FACE="Calibri"></FONT></SPAN><SPAN LANG="nl-be"></SPAN><SPAN LANG="en-gb"> <FONT FACE="Calibri">orientation.</FONT></SPAN><SPAN LANG="nl-be"></SPAN><SPAN LANG="en-gb"></SPAN></P>\n\n<P DIR=LTR><SPAN LANG="nl-be"></SPAN><SPAN LANG="en-gb"></SPAN></P>\n\n<P DIR=LTR><SPAN LANG="nl-be"></SPAN><SPAN LANG="en-gb"><FONT FACE="Calibri">##</FONT></SPAN><SPAN LANG="nl-be"></SPAN><SPAN LANG="en-gb"><FONT FACE="Calibri"></FONT></SPAN><SPAN LANG="nl-be"></SPAN><SPAN LANG="en-gb"> <FONT FACE="Calibri">Our Standards</FONT></SPAN></P>\n\n<P DIR=LTR><SPAN LANG="nl-be"></SPAN><SPAN LANG="en-gb"><FONT FACE="Calibri">**</FONT></SPAN><SPAN LANG="nl-be"></SPAN><SPAN LANG="en-gb"><FONT FACE="Calibri">Examples of behavior that contribute to creating a positive, inclusive environment</FONT></SPAN></P>\n\n<P DIR=LTR><SPAN LANG="en-gb"><FONT FACE="Calibri">include:</FONT></SPAN><SPAN LANG="nl-be"></SPAN><SPAN LANG="en-gb"><FONT FACE="Calibri">**</FONT></SPAN><SPAN LANG="nl-be"></SPAN><SPAN LANG="en-gb"></SPAN></P>\n\n<P DIR=LTR><SPAN LANG="nl-be"></SPAN><SPAN LANG="en-gb"><FONT FACE="Calibri">-</FONT></SPAN><SPAN LANG="nl-be"></SPAN><SPAN LANG="en-gb"><FONT FACE="Calibri"> Using welcoming and inclusive language</FONT></SPAN></P>\n\n<P DIR=LTR><SPAN LANG="nl-be"></SPAN><SPAN LANG="en-gb"><FONT FACE="Calibri">-</FONT></SPAN><SPAN LANG="nl-be"></SPAN><SPAN LANG="en-gb"> <FONT FACE="Calibri">Being respectful of differing viewpoints and experiences</FONT></SPAN></P>\n\n<P DIR=LTR><SPAN LANG="nl-be"></SPAN><SPAN LANG="en-gb"><FONT FACE="Calibri">-</FONT></SPAN><SPAN LANG="nl-be"></SPAN><SPAN LANG="en-gb"> <FONT FACE="Calibri">Gracefully accepting constructive criticism</FONT></SPAN></P>\n\n<P DIR=LTR><SPAN LANG="nl-be"></SPAN><SPAN LANG="en-gb"><FONT FACE="Calibri">-</FONT></SPAN><SPAN LANG="nl-be"></SPAN><SPAN LANG="en-gb"> <FONT FACE="Calibri">Focusing on what is best for the community</FONT></SPAN></P>\n\n<P DIR=LTR><SPAN LANG="nl-be"></SPAN><SPAN LANG="en-gb"><FONT FACE="Calibri">-</FONT></SPAN><SPAN LANG="nl-be"></SPAN><SPAN LANG="en-gb"><FONT FACE="Calibri"> Action speaks louder than words. You don’t need to convince, you need to show.</FONT></SPAN></P>\n\n<P DIR=LTR><SPAN LANG="nl-be"></SPAN><SPAN LANG="en-gb"><FONT FACE="Calibri">-</FONT></SPAN><SPAN LANG="nl-be"></SPAN><SPAN LANG="en-gb"> <FONT FACE="Calibri">It’s not about winning as individuals, it’s about winning as a group</FONT></SPAN></P>\n\n<P DIR=LTR><SPAN LANG="nl-be"></SPAN><SPAN LANG="en-gb"><FONT FACE="Calibri">-</FONT></SPAN><SPAN LANG="nl-be"></SPAN><SPAN LANG="en-gb"><FONT FACE="Calibri"> Speak up. Don’t keep for yourself feelings that could kill your motivation to contribute. Others may feel the same way and we can’t fix something that we cannot see.</FONT></SPAN></P>\n\n<P DIR=LTR><SPAN LANG="nl-be"></SPAN><SPAN LANG="en-gb"><FONT FACE="Calibri">-</FONT></SPAN><SPAN LANG="nl-be"></SPAN><SPAN LANG="en-gb"><FONT FACE="Calibri"> Showing empathy towards other community members</FONT></SPAN></P>\n\n<P DIR=LTR><SPAN LANG="nl-be"></SPAN><SPAN LANG="en-gb"><FONT FACE="Calibri">-</FONT></SPAN><SPAN LANG="nl-be"></SPAN><SPAN LANG="en-gb"><FONT FACE="Calibri"> Done is better than perfect. Don’t ask for permission, ask for forgiveness (as long as you respect the points above)</FONT></SPAN></P>\n\n<P DIR=LTR><SPAN LANG="nl-be"></SPAN><SPAN LANG="en-gb"><FONT FACE="Calibri">-</FONT></SPAN><SPAN LANG="nl-be"></SPAN><SPAN LANG="en-gb"><FONT FACE="Calibri"> Don’t forget to take care of yourself. This is a marathon, not a sprint. Also, take care of each other. It’s easy to get overly excited about the movement and forget to take time off. That’s why we require everyone to be totally offline from the project at least one weekend per month.</FONT></SPAN></P>\n\n<P DIR=LTR><SPAN LANG="nl-be"></SPAN><SPAN LANG="en-gb"><FONT FACE="Calibri">-</FONT></SPAN><SPAN LANG="nl-be"></SPAN><SPAN LANG="en-gb"> <FONT FACE="Calibri">Support and encourage contributions: whenever someone contributes, it means that that person cares. They put time and energy. Acknowledge that and reward that. That doesn’t mean that you have to like all contributions or that all contributions will be used.</FONT></SPAN></P>\n\n<P DIR=LTR><SPAN LANG="nl-be"></SPAN><SPAN LANG="en-gb"><FONT FACE="Calibri">-</FONT></SPAN><SPAN LANG="nl-be"></SPAN><SPAN LANG="en-gb"> <FONT FACE="Calibri">Don’t judge, nothing is final, we are all here to do our best and we will keep improving over time.</FONT></SPAN></P>\n\n<P DIR=LTR><SPAN LANG="nl-be"></SPAN><SPAN LANG="en-gb"><FONT FACE="Calibri">**</FONT></SPAN><SPAN LANG="nl-be"></SPAN><SPAN LANG="en-gb"><FONT FACE="Calibri">Examples of unacceptable behavior by participants include:</FONT></SPAN><SPAN LANG="nl-be"></SPAN><SPAN LANG="en-gb"><FONT FACE="Calibri">**</FONT></SPAN><SPAN LANG="nl-be"></SPAN><SPAN LANG="en-gb"></SPAN></P>\n\n<P DIR=LTR><SPAN LANG="nl-be"></SPAN><SPAN LANG="en-gb"><FONT FACE="Calibri">-</FONT></SPAN><SPAN LANG="nl-be"></SPAN><SPAN LANG="en-gb"> <FONT FACE="Calibri">The use of sexualized language or imagery and unwelcome sexual attention or</FONT></SPAN><SPAN LANG="nl-be"></SPAN><SPAN LANG="en-gb"><FONT FACE="Calibri"></FONT></SPAN><SPAN LANG="nl-be"></SPAN><SPAN LANG="en-gb"> <FONT FACE="Calibri">advances</FONT></SPAN></P>\n\n<P DIR=LTR><SPAN LANG="nl-be"></SPAN><SPAN LANG="en-gb"><FONT FACE="Calibri">-</FONT></SPAN><SPAN LANG="nl-be"></SPAN><SPAN LANG="en-gb"><FONT FACE="Calibri"> Trolling, insulting/derogatory comments, and personal attacks</FONT></SPAN></P>\n\n<P DIR=LTR><SPAN LANG="nl-be"></SPAN><SPAN LANG="en-gb"><FONT FACE="Calibri">-</FONT></SPAN><SPAN LANG="nl-be"></SPAN><SPAN LANG="en-gb"><FONT FACE="Calibri"> Public or private harassment</FONT></SPAN></P>\n\n<P DIR=LTR><SPAN LANG="nl-be"></SPAN><SPAN LANG="en-gb"><FONT FACE="Calibri">-</FONT></SPAN><SPAN LANG="nl-be"></SPAN><SPAN LANG="en-gb"><FONT FACE="Calibri"> Publishing others\' private information, such as a physical or electronic</FONT></SPAN><SPAN LANG="nl-be"></SPAN><SPAN LANG="en-gb"><FONT FACE="Calibri"></FONT></SPAN><SPAN LANG="nl-be"></SPAN><SPAN LANG="en-gb"> <FONT FACE="Calibri">address, without explicit permission</FONT></SPAN></P>\n\n<P DIR=LTR><SPAN LANG="nl-be"></SPAN><SPAN LANG="en-gb"><FONT FACE="Calibri">-</FONT></SPAN><SPAN LANG="nl-be"></SPAN><SPAN LANG="en-gb"><FONT FACE="Calibri"> Other conduct which could reasonably be considered inappropriate in a</FONT></SPAN><SPAN LANG="nl-be"></SPAN><SPAN LANG="en-gb"><FONT FACE="Calibri"></FONT></SPAN><SPAN LANG="nl-be"></SPAN><SPAN LANG="en-gb"> <FONT FACE="Calibri">professional setting</FONT></SPAN></P>\n\n<P DIR=LTR><SPAN LANG="nl-be"></SPAN><SPAN LANG="en-gb"><FONT FACE="Calibri">##</FONT></SPAN><SPAN LANG="nl-be"></SPAN><SPAN LANG="en-gb"><FONT FACE="Calibri"></FONT></SPAN><SPAN LANG="nl-be"></SPAN><SPAN LANG="en-gb"> <FONT FACE="Calibri">Our Responsibilities</FONT></SPAN></P>\n\n<P DIR=LTR><SPAN LANG="en-gb"><FONT FACE="Calibri">We are all responsible for clarifying the standards of acceptable</FONT></SPAN><SPAN LANG="nl-be"></SPAN><SPAN LANG="en-gb"><FONT FACE="Calibri"></FONT></SPAN><SPAN LANG="nl-be"></SPAN><SPAN LANG="en-gb"> <FONT FACE="Calibri">behavior and are expected to take appropriate and fair corrective action in</FONT></SPAN><SPAN LANG="nl-be"></SPAN><SPAN LANG="en-gb"><FONT FACE="Calibri"></FONT></SPAN><SPAN LANG="nl-be"></SPAN><SPAN LANG="en-gb"> <FONT FACE="Calibri">response to any instances of unacceptable behavior.</FONT></SPAN></P>\n\n<P DIR=LTR><SPAN LANG="en-gb"><FONT FACE="Calibri">Core contributors have the right and responsibility to remove, edit, or</FONT></SPAN><SPAN LANG="nl-be"></SPAN><SPAN LANG="en-gb"><FONT FACE="Calibri"></FONT></SPAN><SPAN LANG="nl-be"></SPAN><SPAN LANG="en-gb"> <FONT FACE="Calibri">reject comments, commits, code, wiki edits, issues, and other contributions</FONT></SPAN><SPAN LANG="nl-be"></SPAN><SPAN LANG="en-gb"><FONT FACE="Calibri"></FONT></SPAN><SPAN LANG="nl-be"></SPAN><SPAN LANG="en-gb"> <FONT FACE="Calibri">that are not aligned to this Code of Conduct, or to ban temporarily or</FONT></SPAN><SPAN LANG="nl-be"></SPAN><SPAN LANG="en-gb"><FONT FACE="Calibri"></FONT></SPAN><SPAN LANG="nl-be"></SPAN><SPAN LANG="en-gb"> <FONT FACE="Calibri">permanently any contributor for other behaviors that they deem inappropriate,</FONT></SPAN><SPAN LANG="nl-be"></SPAN><SPAN LANG="en-gb"><FONT FACE="Calibri"></FONT></SPAN><SPAN LANG="nl-be"></SPAN><SPAN LANG="en-gb"> <FONT FACE="Calibri">threatening, offensive, or harmful.</FONT></SPAN></P>\n\n<P DIR=LTR><SPAN LANG="nl-be"></SPAN><SPAN LANG="en-gb"></SPAN></P>\n\n<P DIR=LTR><SPAN LANG="nl-be"></SPAN><SPAN LANG="en-gb"><FONT FACE="Calibri">##</FONT></SPAN><SPAN LANG="nl-be"></SPAN><SPAN LANG="en-gb"><FONT FACE="Calibri"></FONT></SPAN><SPAN LANG="nl-be"></SPAN><SPAN LANG="en-gb"> <FONT FACE="Calibri">Scope</FONT></SPAN></P>\n\n<P DIR=LTR><SPAN LANG="en-gb"><FONT FACE="Calibri">This Code of Conduct applies both within internal spaces and in public spaces</FONT></SPAN><SPAN LANG="nl-be"></SPAN><SPAN LANG="en-gb"><FONT FACE="Calibri"> t</FONT></SPAN><SPAN LANG="nl-be"></SPAN><SPAN LANG="en-gb"><FONT FACE="Calibri">hen an individual is representing the group or the movement. Examples of</FONT></SPAN><SPAN LANG="nl-be"></SPAN><SPAN LANG="en-gb"><FONT FACE="Calibri"></FONT></SPAN><SPAN LANG="nl-be"></SPAN><SPAN LANG="en-gb"> <FONT FACE="Calibri">representing the group or the movement include using an official group e-mail</FONT></SPAN><SPAN LANG="nl-be"></SPAN><SPAN LANG="en-gb"><FONT FACE="Calibri"></FONT></SPAN><SPAN LANG="nl-be"></SPAN><SPAN LANG="en-gb"> <FONT FACE="Calibri">address, posting via an official social media account, or acting as an appointed</FONT></SPAN><SPAN LANG="nl-be"></SPAN><SPAN LANG="en-gb"><FONT FACE="Calibri"></FONT></SPAN><SPAN LANG="nl-be"></SPAN><SPAN LANG="en-gb"> <FONT FACE="Calibri">representative at an online or offline event.</FONT></SPAN></P>\n\n<P DIR=LTR><SPAN LANG="nl-be"></SPAN><SPAN LANG="en-gb"></SPAN></P>\n\n<P DIR=LTR><SPAN LANG="en-gb"><FONT FACE="Calibri">##</FONT></SPAN><SPAN LANG="nl-be"></SPAN><SPAN LANG="en-gb"><FONT FACE="Calibri"></FONT></SPAN><SPAN LANG="nl-be"></SPAN><SPAN LANG="en-gb"> <FONT FACE="Calibri">Enforcement</FONT></SPAN></P>\n\n<P DIR=LTR><SPAN LANG="en-gb"><FONT FACE="Calibri">Instances of abusive, harassing, or otherwise unacceptable behavior may be</FONT></SPAN><SPAN LANG="nl-be"></SPAN><SPAN LANG="en-gb"><FONT FACE="Calibri"></FONT></SPAN><SPAN LANG="nl-be"></SPAN><SPAN LANG="en-gb"> <FONT FACE="Calibri">reported by contacting the Core Contributors (Leen &lt;leen.schelfhout@</FONT></SPAN><SPAN LANG="nl-be"></SPAN><SPAN LANG="en-gb"><FONT FACE="Calibri">telenet</FONT></SPAN><SPAN LANG="nl-be"></SPAN><SPAN LANG="en-gb"><FONT FACE="Calibri">.be&gt;, Xavier Damman &lt;xdamman@gmail.com&gt;). All complaints will be reviewed and investigated and will result in a response that is deemed necessary and appropriate to the circumstances. The core contributors are obligated to maintain confidentiality with regard to the reporter of an incident. </FONT></SPAN></P>\n\n<P DIR=LTR><SPAN LANG="en-gb"><FONT FACE="Calibri">The primary objective of the group is to keep harmony and be as inclusive as possible. As such, the first steps will always be to start conversation and find solution. Only if all other means of resolution have been exhausted, we reserve the right to exclude people who do &nbsp;not follow or enforce the Code of Conduct in good faith.</FONT></SPAN></P>\n\n<P DIR=LTR><SPAN LANG="nl-be"></SPAN><SPAN LANG="en-gb"></SPAN></P>\n\n<P DIR=LTR><SPAN LANG="en-gb"><FONT FACE="Calibri">##</FONT></SPAN><SPAN LANG="nl-be"></SPAN><SPAN LANG="en-gb"><FONT FACE="Calibri"></FONT></SPAN><SPAN LANG="nl-be"></SPAN><SPAN LANG="en-gb"> <FONT FACE="Calibri">Attribution</FONT></SPAN></P>\n\n<P DIR=LTR><SPAN LANG="en-gb"><FONT FACE="Calibri">This Code of Conduct is adapted from the [Contributor Covenant][homepage], version 1.4,</FONT></SPAN></P>\n\n<P DIR=LTR><SPAN LANG="en-gb"><FONT FACE="Calibri">available at [<A HREF="http://contributor-covenant.org/version/1/4">http://contributor-covenant.org/version/1/4</A>][version]</FONT></SPAN></P>\n\n<P DIR=LTR><SPAN LANG="en-gb"><FONT FACE="Calibri">[homepage]: <A HREF="http://contributor-covenant.org">http://contributor-covenant.org</A></FONT></SPAN></P>\n\n<P DIR=LTR><SPAN LANG="en-gb"><FONT FACE="Calibri">[version]: <A HREF="http://contributor-covenant.org/version/1/4/">http://contributor-covenant.org/version/1/4/</A></FONT></SPAN></P>\n\n<P DIR=LTR><SPAN LANG="nl-be"></SPAN><SPAN LANG="en-gb"></SPAN></P>\n\n</BODY>\n</HTML>',
    };
    const html = libemail.getHTML(email);
    expect(html).toEqual(
      `<p>code of conduct for coordination group<p>Hi everyone<p>This ride towards 21-24 March definitely feels like being in one of these Japanese express trains (definitely not a Belgian train). But at the very beginning, before the idea of the open days even, we tried writing a 'code of conduct', a code that would create a safe space to experiment, to set a way of working with each other. I thought it would be nice to have a look at it, now, while we are so busy. CitizenSpring is a citizen initiative organizing the open days, finding a way to contribute and to act, but it might also be a bunch of citizens experimenting being a diverse team, a crew, trying to work together and connect. And communicating openly about it while doing this (e.g. via this really cool e-mailplatform). Imagine learning while doing 😊.<p>Here it is ... Please feel very free to comment and add, share thoughts.<h1 id=code-of-conduct>Code of Conduct</h1><p>For the #CitizenSpring🌱 coordination group<p>(version of 27-12-2018)<h2 id=our-pledge>Our Pledge</h2><p>In the interest of fostering an open and welcoming environment, we as contributors and maintainers pledge to make participation in our project and our community a harassment-free experience for everyone, regardless of age, body size, disability, ethnicity, gender identity and expression, level of experience, nationality, personal appearance, race, religion, or sexual identity and orientation.<h2 id=our-standards>Our Standards</h2><p>**Examples of behavior that contribute to creating a positive, inclusive environment<p>include:**<ul><li><p>Using welcoming and inclusive language<li><p>Being respectful of differing viewpoints and experiences<li><p>Gracefully accepting constructive criticism<li><p>Focusing on what is best for the community<li><p>Action speaks louder than words. You don’t need to convince, you need to show.<li><p>It’s not about winning as individuals, it’s about winning as a group<li><p>Speak up. Don’t keep for yourself feelings that could kill your motivation to contribute. Others may feel the same way and we can’t fix something that we cannot see.<li><p>Showing empathy towards other community members<li><p>Done is better than perfect. Don’t ask for permission, ask for forgiveness (as long as you respect the points above)<li><p>Don’t forget to take care of yourself. This is a marathon, not a sprint. Also, take care of each other. It’s easy to get overly excited about the movement and forget to take time off. That’s why we require everyone to be totally offline from the project at least one weekend per month.<li><p>Support and encourage contributions: whenever someone contributes, it means that that person cares. They put time and energy. Acknowledge that and reward that. That doesn’t mean that you have to like all contributions or that all contributions will be used.<li><p>Don’t judge, nothing is final, we are all here to do our best and we will keep improving over time.</ul><p><strong>Examples of unacceptable behavior by participants include:</strong><ul><li><p>The use of sexualized language or imagery and unwelcome sexual attention or advances<li><p>Trolling, insulting/derogatory comments, and personal attacks<li><p>Public or private harassment<li><p>Publishing others' private information, such as a physical or electronic address, without explicit permission<li><p>Other conduct which could reasonably be considered inappropriate in a professional setting</ul><h2 id=our-responsibilities>Our Responsibilities</h2><p>We are all responsible for clarifying the standards of acceptable behavior and are expected to take appropriate and fair corrective action in response to any instances of unacceptable behavior.<p>Core contributors have the right and responsibility to remove, edit, or reject comments, commits, code, wiki edits, issues, and other contributions that are not aligned to this Code of Conduct, or to ban temporarily or permanently any contributor for other behaviors that they deem inappropriate, threatening, offensive, or harmful.<h2 id=scope>Scope</h2><p>This Code of Conduct applies both within internal spaces and in public spaces then an individual is representing the group or the movement. Examples of representing the group or the movement include using an official group e-mail address, posting via an official social media account, or acting as an appointed representative at an online or offline event.<h2 id=enforcement>Enforcement</h2><p>Instances of abusive, harassing, or otherwise unacceptable behavior may be reported by contacting the Core Contributors (Leen &lt;leen.schelfhout@telenet.be>, Xavier Damman &lt;xdamman@gmail.com>). All complaints will be reviewed and investigated and will result in a response that is deemed necessary and appropriate to the circumstances. The core contributors are obligated to maintain confidentiality with regard to the reporter of an incident.<p>The primary objective of the group is to keep harmony and be as inclusive as possible. As such, the first steps will always be to start conversation and find solution. Only if all other means of resolution have been exhausted, we reserve the right to exclude people who do not follow or enforce the Code of Conduct in good faith.<h2 id=attribution>Attribution</h2><p>This Code of Conduct is adapted from the <a href=http://contributor-covenant.org>Contributor Covenant</a>, version 1.4,<p>available at <a href=http://contributor-covenant.org/version/1/4/>http://contributor-covenant.org/version/1/4</a>`,
    );
  });

  it('cleans html from facebook', () => {
    const email = {
      'stripped-html': `<br><br>[40] <a href="https://l.facebook.com/l.php?u=https%3A%2F%2Fwww.bruzz.be%2Fstedenbouw%2Fwoningen-hotel-en-openbare-ruimte-muntcentrum-2019-01-28%3Ffbclid%3DIwAR3jN3fR2fs6czLNF58ntN7baSpoRhj66CjENY8CxeV2mEwjph_CUYlpc_I&#x26h=AT386hBCXcOs33bbprawmWTpTiAZ_9exoxbbt2Fe1DkD3pRxoT9W9hzXvvNT5XqiPg71dOY1ZIszdgXyxufWMQo1ejIyWSFztlSxq2c0JdmJ2jjNaPgFi4RZJig2GpfaYnSUSi5OkHhuCzhwjHQDlEwbkA"rel="nofollow noopener" data-lynx-mode=async target=_blank>https://www.bruzz.be/<wbr><span class=word_break></span>stedenbouw/<wbr><span class=word_break></span>woningen-hotel-en-openbare-<wbr><span class=word_break></span>ruimte-muntcentrum-2019-01<wbr><span class=word_break></span>-28</a><br>`,
    };
    const html = libemail.getHTML(email);
    expect(html).toEqual(
      `<p><br>[40] <a href="https://l.facebook.com/l.php?u=https%3A%2F%2Fwww.bruzz.be%2Fstedenbouw%2Fwoningen-hotel-en-openbare-ruimte-muntcentrum-2019-01-28%3Ffbclid%3DIwAR3jN3fR2fs6czLNF58ntN7baSpoRhj66CjENY8CxeV2mEwjph_CUYlpc_I&#x26h=AT386hBCXcOs33bbprawmWTpTiAZ_9exoxbbt2Fe1DkD3pRxoT9W9hzXvvNT5XqiPg71dOY1ZIszdgXyxufWMQo1ejIyWSFztlSxq2c0JdmJ2jjNaPgFi4RZJig2GpfaYnSUSi5OkHhuCzhwjHQDlEwbkA">https://www.bruzz.be/stedenbouw/woningen-hotel-en-openbare-ruimte-muntcentrum-2019-01-28</a>`,
    );
  });

  it("doesn't convert emails sent using Thunderbird to <code>", () => {
    const email = {
      'stripped-html':
        '<html>\n  <head>\n    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">\n  </head>\n  <body text="#000000" bgcolor="#FFFFFF">\n    <p>Dear Adrian,</p>\n    <p>I am wondering if you had time to read my previous emails - we\'ve\n      been connected by Xavier. It would be great to present the <a\n        moz-do-not-send="true"\n        href="https://activismincubator.eu/find-your-voice/in-detail">Find\n        Your Voice</a> project at Citizen Spring. It is a project that\n      gives girls and young women technical, digital and creative skills\n      to make a short video on a topic they care about. As such it aims\n      to promote voices of women online - have them speak on a diversity\n      of topics and make sure they participate in the public debate.</p>\n    <p>Xavier has mentioned that it\'d be possible to make a presentation\n      of this project at your space in the EU quarter. This would be\n      great as the project is hosted by other cultural institutions and\n      we do not have a fixed space yet.</p>\n    <p>We could make a short presentation on the project and show\n      previews or ready videos made by some of the participants. Two of\n      them have told me they should be ready with their final video by\n      then. We could have a little debate / conversation about the\n      online presence of young women after the more formal part.</p>\n    <p>Would this be possible to organise? March 21 would be the most\n      preferred date for us.<br>\n    </p>\n    <p>I am looking forward to hearing from you,</p>\n    <p>Paulina</p>\n    <p><span style="mso-bidi-font-family:Calibri;mso-bidi-theme-font:\n        minor-latin">Paulina Banaś<br>\n        Project Leader<br>\n        <a href="https://activismincubator.eu/">European Activism\n          Incubator</a></span></p>\n    <p><br>\n    </p>\n  </body>\n</html>\n',
    };
    const html = libemail.getHTML(email);
    expect(html).toEqual(
      `<p>Dear Adrian,<p>I am wondering if you had time to read my previous emails - we've been connected by Xavier. It would be great to present the <a href=https://activismincubator.eu/find-your-voice/in-detail>Find Your Voice</a> project at Citizen Spring. It is a project that gives girls and young women technical, digital and creative skills to make a short video on a topic they care about. As such it aims to promote voices of women online - have them speak on a diversity of topics and make sure they participate in the public debate.<p>Xavier has mentioned that it'd be possible to make a presentation of this project at your space in the EU quarter. This would be great as the project is hosted by other cultural institutions and we do not have a fixed space yet.<p>We could make a short presentation on the project and show previews or ready videos made by some of the participants. Two of them have told me they should be ready with their final video by then. We could have a little debate / conversation about the online presence of young women after the more formal part.<p>Would this be possible to organise? March 21 would be the most preferred date for us.<br><p>I am looking forward to hearing from you,<p>Paulina<p>Paulina Banaś<br>Project Leader<br><a href=https://activismincubator.eu/>European Activism Incubator</a></p>`,
    );
  });

  it('cleans outlook html email', () => {
    const outlookHTML = `
    <!--[if gte mso 9]><xml>
     <o:OfficeDocumentSettings>
      <o:AllowPNG/>
      <o:PixelsPerInch>96</o:PixelsPerInch>
     </o:OfficeDocumentSettings>
    </xml><![endif]-->
    
    <!--[if gte mso 9]><xml>
     <w:WordDocument>
      <w:View>Normal</w:View>
      <w:Compatibility>
       <w:BreakWrappedTables/>
      </w:Compatibility>
      <m:mathPr>
       <m:mathFont m:val="Cambria Math"/>
       <m:brkBin m:val="before"/>
    </xml><![endif]--><!--[if gte mso 9]><xml>
     <w:LatentStyles DefLockedState="false" DefUnhideWhenUsed="false"
      DefSemiHidden="false" DefQFormat="false" DefPriority="99"
      LatentStyleCount="382">
      <w:LsdException Locked="false" Priority="0" QFormat="true" Name="Normal"/>
      <w:LsdException Locked="false" Priority="9" QFormat="true" Name="heading 1"/>
      <w:LsdException Locked="false" Priority="9" SemiHidden="true"
       UnhideWhenUsed="true" QFormat="true" Name="heading 2"/>
      <w:LsdException Locked="false" Priority="9" SemiHidden="true"
       UnhideWhenUsed="true" QFormat="true" Name="heading 3"/>
      <w:LsdException Locked="false" Priority="9" SemiHidden="true"
       UnhideWhenUsed="true" QFormat="true" Name="heading 4"/>
      <w:LsdException Locked="false" Priority="9" SemiHidden="true"
       UnhideWhenUsed="true" QFormat="true" Name="heading 5"/>
      <w:LsdException Locked="false" Priority="9" SemiHidden="true"
       UnhideWhenUsed="true" QFormat="true" Name="heading 6"/>
      <w:LsdException Locked="false" Priority="9" SemiHidden="true"
       UnhideWhenUsed="true" QFormat="true" Name="heading 7"/>
      <w:LsdException Locked="false" Priority="9" SemiHidden="true"
       UnhideWhenUsed="true" QFormat="true" Name="heading 8"/>
      <w:LsdException Locked="false" Priority="9" SemiHidden="true"
       UnhideWhenUsed="true" QFormat="true" Name="heading 9"/>
      <w:LsdException Locked="false" SemiHidden="true" UnhideWhenUsed="true"
       Name="index 1"/>
     </w:LatentStyles>
    </xml><![endif]-->
    
    <!--[if gte mso 10]>
    <style>
     /* Style Definitions */
    table.MsoNormalTable
            {mso-style-name:"Tableau Normal";
            mso-tstyle-rowband-size:0;
            mso-tstyle-colband-size:0;
            mso-style-noshow:yes;
            mso-style-priority:99;
            mso-style-parent:"";
            mso-padding-alt:0cm 5.4pt 0cm 5.4pt;
            mso-para-margin:0cm;
            mso-para-margin-bottom:.0001pt;
            mso-pagination:widow-orphan;
            font-size:12.0pt;
            font-family:Calibri;
            mso-ascii-font-family:Calibri;
            mso-ascii-theme-font:minor-latin;
            mso-hansi-font-family:Calibri;
            mso-hansi-theme-font:minor-latin;
            mso-fareast-language:EN-US;}
    </style>
    <![endif]-->
    
    
    
    <!--StartFragment--><p class="MsoNormal"><b class=""><span lang="EN-US" class="">20/1/2019 - Phone call – Sandra and Elena <o:p class=""></o:p></span></b></p><p class="MsoNormal"><span lang="EN-US" class="">&nbsp;</span></p><p class="MsoNormal"><span lang="EN-US" class="">Elena is a
    Graphic Designer and has experience in giving advice to her clients about the
    visual of their company. Elena was already an observer of Citizenspring through
    Facebook. Leen introduced Elena to Sandra, that is taking care of the arts.<o:p class=""></o:p></span></p><p class="MsoNormal"><span lang="EN-US" class="">&nbsp;</span></p><p class="MsoNormal"><b class=""><span lang="EN-US" class="">Proposition</span></b><span lang="EN-US" class=""><o:p class=""></o:p></span></p><p class="MsoListParagraphCxSpFirst" style="text-indent:-18.0pt;mso-list:l0 level1 lfo1"><!--[if !supportLists]--><span lang="EN-US" class="">-<span style="font-size: 7pt; font-family: 'Times New Roman';" class="">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
    </span></span><!--[endif]--><span lang="EN-US" class="">The idea of citizenspring needs to be translated into a visual language.
    <o:p class=""></o:p></span></p><p class="MsoListParagraphCxSpLast" style="text-indent:-18.0pt;mso-list:l0 level1 lfo1"><!--[if !supportLists]--><span lang="EN-US" class="">-<span style="font-size: 7pt; font-family: 'Times New Roman';" class="">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
    </span></span><!--[endif]--><span lang="EN-US" class="">The
    symbol ‘</span><span lang="EN-US" style="font-family:&quot;Apple Color Emoji&quot;;
    mso-fareast-font-family:&quot;Apple Color Emoji&quot;;mso-bidi-font-family:&quot;Apple Color Emoji&quot;;
    mso-ansi-language:EN-US" class="">(x)</span><span lang="EN-US" class="">’ was already used a lot
    in the communication. It was well received and could maybe be used as a
    starting point for the graphic design.</span><span lang="EN-US" class=""><o:p class=""></o:p></span></p><p class="MsoNormal"><span lang="EN-US" class="">&nbsp;</span></p><p class="MsoNormal"><b class=""><span lang="EN-US" class="">Brainstorming<o:p class=""></o:p></span></b></p><p class="MsoListParagraphCxSpFirst" style="text-indent:-18.0pt;mso-list:l0 level1 lfo1"><!--[if !supportLists]--><span lang="EN-US" class="">-<span style="font-size: 7pt; font-family: 'Times New Roman';" class="">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
    </span></span><!--[endif]--><span lang="EN-US" class="">The visual needs to reflects the key values (participation, transparency,
    inclusiveness)<b class=""><o:p class=""></o:p></b></span></p><p class="MsoListParagraphCxSpMiddle" style="text-indent:-18.0pt;mso-list:l0 level1 lfo1"><!--[if !supportLists]--><span lang="EN-US" class="">-<span style="font-size: 7pt; font-family: 'Times New Roman';" class="">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
    </span></span><!--[endif]--><span lang="EN-US" style="font-family:&quot;Apple Color Emoji&quot;;
    mso-fareast-font-family:&quot;Apple Color Emoji&quot;;mso-bidi-font-family:&quot;Apple Color Emoji&quot;;
    mso-ansi-language:EN-US" class="">(x)</span><span lang="EN-US" class="">can be used additionally
    in communication, but doesn’t reflects the visual identity of the movement. </span><b class=""><span lang="EN-US"class=""><o:p class=""></o:p></span></b></p><p class="MsoListParagraphCxSpMiddle" style="margin-left:72.0pt;mso-add-space:
    auto;text-indent:-18.0pt;mso-list:l0 level2 lfo1"><!--[if !supportLists]--><span lang="EN-US" style="font-family:&quot;Courier New&quot;;mso-fareast-font-family:&quot;Courier New&quot;;
    mso-ansi-language:EN-US" class="">o<span style="font-size: 7pt; font-family: 'Times New Roman';" class="">&nbsp;&nbsp;
    </span></span><!--[endif]--><span lang="EN-US" class="">The green color could be
    interpreted as political, so not neutral</span><b class=""><span lang="EN-US" class=""><o:p class=""></o:p></span></b></p><p class="MsoListParagraphCxSpMiddle" style="margin-left:72.0pt;mso-add-space:
    auto;text-indent:-18.0pt;mso-list:l0 level2 lfo1"><!--[if !supportLists]--><span lang="EN-US" style="font-family:&quot;Courier New&quot;;mso-fareast-font-family:&quot;Courier New&quot;;
    mso-ansi-language:EN-US" class="">o<span style="font-size: 7pt; font-family: 'Times New Roman';" class="">&nbsp;&nbsp;
    </span></span><!--[endif]--><span lang="EN-US" class="">It should be experienced
    as something neutral, inclusive and withdrawing all boundaries that people can
    experience to participate </span><span lang="EN-US" class=""><o:p class=""></o:p></span></p><p class="MsoListParagraphCxSpMiddle" style="margin-left:72.0pt;mso-add-space:
    auto;text-indent:-18.0pt;mso-list:l0 level2 lfo1"><!--[if !supportLists]--><span lang="EN-US" style="font-family:&quot;Courier New&quot;;mso-fareast-font-family:&quot;Courier New&quot;;
    mso-ansi-language:EN-US" class="">o<span style="font-size: 7pt; font-family: 'Times New Roman';" class="">&nbsp;&nbsp;
    </span></span><!--[endif]--><span lang="EN-US" class="">The strength of cz is that they want to proposed something new. The logo
    has to reflect this newness and freshness. It must reflect an alternative to
    the existing structures. <o:p class=""></o:p></span></p><p class="MsoListParagraphCxSpLast" style="text-indent:-18.0pt;mso-list:l0 level1 lfo1"><!--[if !supportLists]--><span lang="EN-US" class="">-<span style="font-size: 7pt; font-family: 'Times New Roman';" class="">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
    </span></span><!--[endif]--><span lang="EN-US" class="">The aim of the visual is to stay stable through all the period. (e.g. it
    still beused in 10 years) <o:p class=""></o:p></span></p><p class="MsoNormal"><span lang="EN-US" class="">&nbsp;</span></p><p class="MsoListParagraph" style="text-indent:-18.0pt;mso-list:l0 level1 lfo1"><!--[if !supportLists]--><span lang="EN-US" class="">-<span style="font-size: 7pt; font-family: 'Times New Roman';" class="">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
    </span></span><!--[endif]--><span lang="EN-US" class="">The logo will afterwards be integrated on all the pictures and video’s
    that will be made in the context of citizenspring. <o:p class=""></o:p></span></p><p class="MsoNormal"><span lang="EN-US" class="">&nbsp;</span></p><p class="MsoNormal"><b class=""><span lang="EN-US" class="">Outcome: <o:p class=""></o:p></span></b></p><p class="MsoListParagraphCxSpFirst" style="text-indent:-18.0pt;mso-list:l0 level1 lfo1"><!--[if !supportLists]--><span lang="EN-US" class="">-<span style="font-size: 7pt; font-family: 'Times New Roman';" class="">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
    </span></span><!--[endif]--><span lang="EN-US" class="">Elena will give two propositions by next meeting (next Sunday). It will
    be a drawn proposition, in black and white. Colors will be added afterwards. <o:p class=""></o:p></span></p><p class="MsoListParagraphCxSpMiddle" style="text-indent:-18.0pt;mso-list:l0 level1 lfo1"><!--[if !supportLists]--><span lang="EN-US" class="">-<span style="font-size: 7pt; font-family: 'Times New Roman';" class="">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
    </span></span><!--[endif]--><span lang="EN-US" class="">She’ll send it so Sandra, that will propose it to the group. The people
    that are present will be invited to give feedback.<o:p class=""></o:p></span></p><p class="MsoListParagraphCxSpLast" style="text-indent:-18.0pt;mso-list:l0 level1 lfo1"><!--[if !supportLists]--><span lang="EN-US" class="">-<span style="font-size: 7pt; font-family: 'Times New Roman';" class="">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
    </span></span><!--[endif]--><span lang="EN-US" class="">Sandra will start documenting the meetings with pictures,filming and
    recording sound. <o:p class=""></o:p></span></p><p class="MsoNormal"><span lang="EN-US" class="">&nbsp;</span></p><p class="MsoNormal"><span lang="EN-US" class="">&nbsp;</span></p>
    
    <!--EndFragment-->`;
    const email = {
      'stripped-html': outlookHTML,
    };
    const html = libemail.getHTML(email);
    expect(html).toEqual(
      `<p><b>20/1/2019 - Phone call – Sandra and Elena</b><p>Elena is a Graphic Designer and has experience in giving advice to her clients about the visual of their company. Elena was already an observer of Citizenspring through Facebook. Leen introduced Elena to Sandra, that is taking care of the arts.<p><b>Proposition</b><ul><li><p>The idea of citizenspring needs to be translated into a visual language.<li><p>The symbol ‘(x)’ was already used a lot in the communication. It was well received and could maybe be used as a starting point for the graphic design.</ul><p><b>Brainstorming</b><ul><li><p>The visual needs to reflects the key values (participation, transparency, inclusiveness)<b></b><li><p>(x)can be used additionally in communication, but doesn’t reflects the visual identity of the movement. <b></b><ul><li><p>The green color could be interpreted as political, so not neutral<b></b><li><p>It should be experienced as something neutral, inclusive and withdrawing all boundaries that people can experience to participate<li><p>The strength of cz is that they want to proposed something new. The logo has to reflect this newness and freshness. It must reflect an alternative to the existing structures.</ul><li><p>The aim of the visual is to stay stable through all the period. (e.g. it still beused in 10 years)</ul><ul><li>The logo will afterwards be integrated on all the pictures and video’s that will be made in the context of citizenspring.</ul><p><b>Outcome:</b><ul><li><p>Elena will give two propositions by next meeting (next Sunday). It will be a drawn proposition, in black and white. Colors will be added afterwards.<li><p>She’ll send it so Sandra, that will propose it to the group. The people that are present will be invited to give feedback.<li><p>Sandra will start documenting the meetings with pictures,filming and recording sound.</ul>`,
    );
  });

  it('cleans the html with markdown and TOC', async () => {
    const email = {
      'body-plain':
        '# Title \r\n## Table of contents \r\n## Subtitle 1 \r\nHere is a [link](https://opencollective.com) and a **bold** and some <i>italic</i> and html link <a href="https://google.com">https://google.com</a>\r\n## Subtitle2\r\nthat will open their doors during the Citizen Spring.\r\nFeel free to edit this list to add your initiative.\r\n\r\nCategory | Name | Description | Place | Dates | website\r\n-------- | ---- | ----------- | ----- | ----- | -------\r\nsustainability | Sustainable Brussels | Your guide to the green face of Brussels. | | | http://sustainablebrussels.be\r\n',
      'stripped-html':
        '<p># Title \r\n## Table of contents \r\n## Subtitle 1 \r\nHere is a [link](https://opencollective.com) and a **bold** and some <i>italic</i> and html link <a href="https://google.com">https://google.com</a>\r\n## Subtitle2\r\nthat will open their doors during the Citizen Spring.\r\nFeel free to edit this list to add your initiative.\r\n\r\nCategory | Name | Description | Place | Dates | website\r\n-------- | ---- | ----------- | ----- | ----- | -------\r\nsustainability | Sustainable Brussels | Your guide to the green face of Brussels. | | | http://sustainablebrussels.be\r\n</p>',
    };
    const html = await libemail.getHTML(email);
    expect(html).toEqual(
      `<h1 id=title>Title</h1><h2 id=table-of-contents>Table of contents</h2><ul><li><a href=#subtitle-1>Subtitle 1</a><li><a href=#subtitle2>Subtitle2</a></ul><h2 id=subtitle-1>Subtitle 1</h2><p>Here is a <a href=https://opencollective.com>link</a> and a <strong>bold</strong> and some <i>italic</i> and html link <a href=https://google.com>https://google.com</a><h2 id=subtitle2>Subtitle2</h2><p>that will open their doors during the Citizen Spring. Feel free to edit this list to add your initiative.<table><thead><tr><th>Category<th>Name<th>Description<th>Place<th>Dates<th>website<tbody><tr><td>sustainability<td>Sustainable Brussels<td>Your guide to the green face of Brussels.<td><td><td><a href=http://sustainablebrussels.be>http://sustainablebrussels.be</a></table>`,
    );
  });

  it('removes quoted email and email signature from gmail', () => {
    const html =
      '<html><head></head><body><div dir="ltr"><div dir="ltr">Hello Citizens,<div><br></div><div>A small question, would it be feasible and/or useful to associate with this platform:&#160;<a href="https://www.callup.io/">https://www.callup.io/</a> ?</div><div><br></div><div>One of it\'s goal is to list all the citizens and transitions initiatives.</div><div><br></div></div></div><br><br clear="all"><div><br></div>-- <br><div class="gmail_signature" dir="ltr"><div dir="ltr"><div><div dir="ltr"><div><div dir="ltr"><div><div dir="ltr"><div><div dir="ltr"><div>xxxxx xxxxx<br><br>+32 (0)00 000 00 00</div><div><a href="mailto:xxxxxx.xxxxx@gmail.com" target="_blank">xxxxx.xxxxx@gmail.com</a><br><a href="https://www.linkedin.com/in/xxxxxx/" target="_blank">Linkedin</a><br><a href="https://twitter.com/xxxxx" target="_blank">Twitter</a></div><div><br></div><div>Longue vie a la <a href="http://monnaiebruxelloise.be" target="_blank">Zinne</a>!</div></div></div></div></div></div></div></div></div></div></div>\n</body></html>';
    const res = libemail.getHTML({ 'stripped-html': html });
    expect(res).toEqual(
      `<p>Hello Citizens,<p>A small question, would it be feasible and/or useful to associate with this platform: <a href=https://www.callup.io/>https://www.callup.io/</a> ?<p>One of it's goal is to list all the citizens and transitions initiatives.`,
    );
  });

  it('removes signature from AppleMail', () => {
    const html = `<html><head><meta content="text/html; charset=utf-8" http-equiv="content-type"></head><body dir="auto">Hello now I got the newsletter 14 times!<div>Greetings&#160;</div><div>Hadewig<br><br><div id="AppleMailSignature" dir="ltr">Verstuurd vanaf mijn iPhone</div></div></body></html>`;
    const res = libemail.getHTML({ 'stripped-html': html });
    expect(res).toEqual(`<p>Hello now I got the newsletter 14 times!<br>Greetings<p>Hadewig`);
  });

  it('creates paragraphs', () => {
    const email = {
      'stripped-html':
        '<div>We will gather</div><div><br></div><div>Let me know <a href="mailto:info@citizenspring.be">info@citizenspring.be</a></div><div><b><br></b></div><div><b>French</b></div>',
    };
    const html = libemail.getHTML(email);
    expect(html).toEqual(
      '<p>We will gather<p>Let me know <a href=mailto:info@citizenspring.be>info@citizenspring.be</a><p><b>French</b>',
    );
  });
});
