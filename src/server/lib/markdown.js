import unified from 'unified';
import markdown from 'remark-parse';
import remark2rehype from 'remark-rehype';
import raw from 'rehype-raw';
import stringify from 'rehype-stringify';
import minify from 'rehype-preset-minify';
import toc from 'remark-toc';
import slug from 'remark-slug';

const processor = unified()
  .use(markdown)
  .use(slug)
  .use(toc)
  .use(remark2rehype, { allowDangerousHTML: true })
  .use(raw)
  .use(minify)
  .use(stringify);

export default function(text) {
  return processor.processSync(text).toString();
}
