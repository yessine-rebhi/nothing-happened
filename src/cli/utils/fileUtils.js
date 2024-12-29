import fs from "fs";
export function readFile(filePath) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, "utf-8", (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}
export function writeFile(filePath, content) {
  return new Promise((resolve, reject) => {
    fs.writeFile(filePath, content, "utf-8", err => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}
export function isDirectory(filePath) {
  return new Promise(resolve => {
    fs.lstat(filePath, (err, stats) => {
      if (err) {
        resolve(false);
      } else {
        resolve(stats.isDirectory());
      }
    });
  });
}
export function readdir(directoryPath) {
  return new Promise((resolve, reject) => {
    fs.readdir(directoryPath, (err, files) => {
      if (err) {
        reject(err);
      } else {
        resolve(files);
      }
    });
  });
}
export function readJsonFile(filePath) {
  try {
    const data = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    throw new Error("Error reading or parsing the file: ".concat(filePath));
  }
}
export function fileExists(filePath) {
  return fs.existsSync(filePath);
}
export function writeJsonFile(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    throw new Error("Error writing to the file: ".concat(filePath));
  }
}
export function unlink(filePath) {
  return new Promise((resolve, reject) => {
    fs.unlink(filePath, err => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}