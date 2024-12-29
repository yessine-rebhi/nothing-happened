import discardComments from 'postcss-discard-comments';
import fs from 'fs';
import postcss from 'postcss';
export async function cleanCSSFile(filePath, dryMode) {
  const code = await fs.promises.readFile(filePath, 'utf-8');
  const result = await postcss([discardComments()]).process(code, {
    from: filePath
  });
  const cleanedCode = result.css;
  if (dryMode) {
    if (cleanedCode !== code) {
      console.log("Changes detected in: ".concat(filePath));
    }
  } else {
    await fs.promises.writeFile(filePath, cleanedCode);
    console.log("Cleaned: ".concat(filePath));
  }
}