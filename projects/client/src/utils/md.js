import MarkdownIt from 'markdown-it';

const hyperReg = /(?:\])(\(.*?\))/g;
export const md2html = new MarkdownIt('default', { html: true });
export const getHtmlByMd = (md, isAnswer, loading) => {
  if (isAnswer && loading) {
    md += '<span class="flicker">&nbsp;</span>';
  }
  if (!md) {
    return '';
  }
  md = md.replace(hyperReg, ']');
  return md2html.render(md);
};
