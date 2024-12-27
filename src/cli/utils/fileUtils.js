import fs from "fs";

// Function to read a file
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

// Function to write content to a file
export function writeFile(filePath, content) {
  return new Promise((resolve, reject) => {
    fs.writeFile(filePath, content, "utf-8", (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

// Function to check if a path is a directory
export function isDirectory(filePath) {
  return new Promise((resolve) => {
    fs.lstat(filePath, (err, stats) => {
      if (err) {
        resolve(false);
      } else {
        resolve(stats.isDirectory());
      }
    });
  });
}

// Function to read the contents of a directory
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

// Utility function to read a JSON file and parse it
export function readJsonFile(filePath) {
  try {
    const data = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    throw new Error(`Error reading or parsing the file: ${filePath}`);
  }
}

// Utility function to check if a file exists
export function fileExists(filePath) {
  return fs.existsSync(filePath);
}

// Utility function to write to a file
export function writeJsonFile(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    throw new Error(`Error writing to the file: ${filePath}`);
  }
}

// Function to delete a file
export function unlink(filePath) {
  return new Promise((resolve, reject) => {
    fs.unlink(filePath, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}