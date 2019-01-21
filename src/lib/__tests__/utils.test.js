import * as utils from '../utils';

describe('frontend utils', () => {
  it('keeps urls short', () => {
    const html = `<p><a href="https://google.com">https://google.com</a></p><p><a href="https://docs.google.com/document/d/1SE2Hbirao-nz-ckFF9bVzNfOioBhoKNUnVYBc2IUDG8/edit?usp=sharing">https://docs.google.com/document/d/1SE2Hbirao-nz-ckFF9bVzNfOioBhoKNUnVYBc2IUDG8/edit?usp=sharing</a></p>`;
    const res = utils.keepAnchorsShort(html);
    expect(res).toEqual(
      `<p><a href=\"https://google.com\">https://google.com</a></p><p><a href=\"https://docs.google.com/document/d/1SE2Hbirao-nz-ckFF9bVzNfOioBhoKNUnVYBc2IUDG8/edit?usp=sharing\">docs.google.com/document/d/1SE2Hbirao-n…</a></p>`,
    );
  });
});
