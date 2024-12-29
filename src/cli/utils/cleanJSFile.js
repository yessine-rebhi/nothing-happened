import { transformAsync } from '@babel/core';
import fs from 'fs';
const removeCommentsPlugin = () => ({
  visitor: {
    Program(path) {
      path.node.body.forEach(node => {
        if (node.leadingComments) delete node.leadingComments;
        if (node.trailingComments) delete node.trailingComments;
      });
    }
  }
});
export async function cleanJavaScriptFile(filePath) {
  let dryMode = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
  try {
    const originalCode = await fs.promises.readFile(filePath, 'utf-8');
    const {
      code: cleanedCode
    } = await transformAsync(originalCode, {
      presets: [['@babel/preset-env', {
        targets: "> 0.25%, not dead",
        modules: false
      }]],
      plugins: [removeCommentsPlugin],
      comments: false
    });
    if (dryMode) {
      if (cleanedCode !== originalCode) {
        console.log("Changes detected in: ".concat(filePath));
      }
    } else {
      if (cleanedCode !== originalCode) {
        await fs.promises.writeFile(filePath, cleanedCode, 'utf-8');
        console.log("Cleaned: ".concat(filePath));
      } else {
        console.log("No changes required for: ".concat(filePath));
      }
    }
  } catch (error) {
    console.error("Error cleaning file ".concat(filePath, ": ").concat(error.message));
  }
}