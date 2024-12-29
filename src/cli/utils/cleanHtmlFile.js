import fs from 'fs';
import * as parse5 from 'parse5';
function removeCommentsFromAST(node) {
  if (node.childNodes) {
    node.childNodes = node.childNodes.filter(child => child.nodeName !== '#comment');
    node.childNodes.forEach(removeCommentsFromAST);
  }
}
export async function cleanHTMLFile(filePath, dryMode) {
  const code = await fs.promises.readFile(filePath, 'utf-8');
  const document = parse5.parse(code);
  removeCommentsFromAST(document);
  const cleanedCode = parse5.serialize(document);
  if (dryMode) {
    if (cleanedCode !== code) {
      console.log("Changes detected in: ".concat(filePath));
    }
  } else {
    await fs.promises.writeFile(filePath, cleanedCode);
    console.log("Cleaned: ".concat(filePath));
  }
}