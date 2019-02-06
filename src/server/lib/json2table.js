export default function(json) {
  let template = strs => {
    return function(...vals) {
      return strs
        .map((s, i) => `${s}${vals[i] || ''}`)
        .join('')
        .replace(/\n/g, '<br>');
    };
  };

  let build = v => {
    if (v === null) return '';
    if (Array.isArray(v)) return buildArray(v);
    if (typeof v === 'object') return buildObject(v);
    return buildElement(v);
  };
  let buildElement = el => '<td valign="top">' + el + '</td>';
  let buildObject = obj => {
    let templ = template`<tr>${0}${1}</tr>`;
    return Object.keys(obj)
      .map(key => templ(build(key), build(obj[key])))
      .join('');
  };
  let buildArray = arr => {
    let templ = template`<table>${0}</table>`;
    return '<td valign="top">' + arr.map(el => templ(build(el))).join('') + '</td>';
  };

  return `<table>${build(json)}</table>`;
}
