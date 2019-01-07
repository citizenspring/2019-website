import templates, { render } from '../../server/templates';

const defaultData = {
  post: {
    groupSlug: 'communication',
    url: 'https://www.citizenspring.be/communication/hello-world-1',
    post: {
      ParentPostId: 1,
      html: '<p>Hello world</p>',
    },
    unsubscribe: {
      label: 'unsubscribe from this thread',
    },
  },
};
export function renderTemplate(req, res) {
  const { template } = req.params;
  if (!templates[template]) {
    return res.send('please provide a valid template name');
  }
  const data = defaultData[template];
  const { subject, text, html } = render(req.params.template, data);
  return res.send(html);
}
