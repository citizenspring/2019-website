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
      groupSlug: undefined,
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
      `<p><b>20/1/2019 - Phone call – Sandra and Elena</b><p><p>Elena is a Graphic Designer and has experience in giving advice to her clients about the visual of their company. Elena was already an observer of Citizenspring through Facebook. Leen introduced Elena to Sandra, that is taking care of the arts.<p><p><b>Proposition</b><p>- The idea of citizenspring needs to be translated into a visual language.<p>- The symbol ‘(x)’ was already used a lot in the communication. It was well received and could maybe be used as a starting point for the graphic design.<p><p><b>Brainstorming</b><p>- The visual needs to reflects the key values (participation, transparency, inclusiveness)<b></b><p>- (x)can be used additionally in communication, but doesn’t reflects the visual identity of the movement. <b></b><p>o The green color could be interpreted as political, so not neutral<b></b><p>o It should be experienced as something neutral, inclusive and withdrawing all boundaries that people can experience to participate<p>o The strength of cz is that they want to proposed something new. The logo has to reflect this newness and freshness. It must reflect an alternative to the existing structures.<p>- The aim of the visual is to stay stable through all the period. (e.g. it still beused in 10 years)<p><p>- The logo will afterwards be integrated on all the pictures and video’s that will be made in the context of citizenspring.<p><p><b>Outcome:</b><p>- Elena will give two propositions by next meeting (next Sunday). It will be a drawn proposition, in black and white. Colors will be added afterwards.<p>- She’ll send it so Sandra, that will propose it to the group. The people that are present will be invited to give feedback.<p>- Sandra will start documenting the meetings with pictures,filming and recording sound.`,
    );
  });

  it('cleans the html with markdown and TOC', async () => {
    const email = {
      'body-plain':
        '# Title \r\n## Table of contents \r\n## Subtitle 1 \r\nHere is a **list** of <i>confirmed</i> <a href="https://google.com">initiatives</a>\r\n## Subtitle2\r\nthat will open their doors during the Citizen Spring.\r\nFeel free to edit this list to add your initiative.\r\n\r\nCategory | Name | Description | Place | Dates | website\r\n-------- | ---- | ----------- | ----- | ----- | -------\r\nsustainability | Sustainable Brussels | Your guide to the green face of Brussels. | | | http://sustainablebrussels.be\r\n',
      'stripped-html':
        '<p># Title \r\n## Table of contents \r\n## Subtitle 1 \r\nHere is a **list** of <i>confirmed</i> <a href="https://google.com">initiatives</a>\r\n## Subtitle2\r\nthat will open their doors during the Citizen Spring.\r\nFeel free to edit this list to add your initiative.\r\n\r\nCategory | Name | Description | Place | Dates | website\r\n-------- | ---- | ----------- | ----- | ----- | -------\r\nsustainability | Sustainable Brussels | Your guide to the green face of Brussels. | | | http://sustainablebrussels.be\r\n</p>',
    };
    const html = await libemail.getHTML(email);
    expect(html).toEqual(
      `<h1>Title</h1><h2>Table of contents</h2><ul><li><a href=#subtitle-1>Subtitle 1</a><li><a href=#subtitle2>Subtitle2</a></ul><h2>Subtitle 1</h2><p>Here is a <strong>list</strong> of <i>confirmed</i> <a href=https://google.com>initiatives</a><h2>Subtitle2</h2><p>that will open their doors during the Citizen Spring. Feel free to edit this list to add your initiative.<table><thead><tr><th>Category<th>Name<th>Description<th>Place<th>Dates<th>website<tbody><tr><td>sustainability<td>Sustainable Brussels<td>Your guide to the green face of Brussels.<td><td><td><a href=http://sustainablebrussels.be>http://sustainablebrussels.be</a></table>`,
    );
  });

  it('removes quoted email and email signature from gmail', () => {
    const html =
      '<html><head></head><body><div dir="ltr"><div dir="ltr">Hello Citizens,<div><br></div><div>A small question, would it be feasible and/or useful to associate with this platform:&#160;<a href="https://www.callup.io/">https://www.callup.io/</a> ?</div><div><br></div><div>One of it\'s goal is to list all the citizens and transitions initiatives.</div><div><br></div></div></div><br><br clear="all"><div><br></div>-- <br><div class="gmail_signature" dir="ltr"><div dir="ltr"><div><div dir="ltr"><div><div dir="ltr"><div><div dir="ltr"><div><div dir="ltr"><div>xxxxx xxxxx<br><br>+32 (0)00 000 00 00</div><div><a href="mailto:xxxxxx.xxxxx@gmail.com" target="_blank">xxxxx.xxxxx@gmail.com</a><br><a href="https://www.linkedin.com/in/xxxxxx/" target="_blank">Linkedin</a><br><a href="https://twitter.com/xxxxx" target="_blank">Twitter</a></div><div><br></div><div>Longue vie a la <a href="http://monnaiebruxelloise.be" target="_blank">Zinne</a>!</div></div></div></div></div></div></div></div></div></div></div>\n</body></html>';
    const res = libemail.getHTML({ 'stripped-html': html });
    expect(res).toEqual(
      `<p>Hello Citizens,<br><p>A small question, would it be feasible and/or useful to associate with this platform: <a href=https://www.callup.io/>https://www.callup.io/</a> ?<p>One of it's goal is to list all the citizens and transitions initiatives.`,
    );
  });
  it('removes signature from AppleMail', () => {
    const html = `<html><head><meta content="text/html; charset=utf-8" http-equiv="content-type"></head><body dir="auto">Hello now I got the newsletter 14 times!<div>Greetings&#160;</div><div>Hadewig<br><br><div id="AppleMailSignature" dir="ltr">Verstuurd vanaf mijn iPhone</div></div></body></html>`;
    const res = libemail.getHTML({ 'stripped-html': html });
    expect(res).toEqual(`<p>Hello now I got the newsletter 14 times!Greetings<p>Hadewig`);
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
