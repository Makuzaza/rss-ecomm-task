export const getFirstParagraph = (html: string) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const firstParagraph = doc.querySelector("p");
  return firstParagraph ? firstParagraph.outerHTML : html;
};

export const hasMultipleParagraphs = (html: string) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  return doc.querySelectorAll("p").length > 1;
};
