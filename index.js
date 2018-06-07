// #!/usr/bin/env node

const chalk = require('chalk');
const clear = require('clear');
const program = require('commander');

runProgram();

function runProgram() {
  const fileContent = 'Top of file content\nsome content 1\nsome content 2\nsome content 3\nBottom of file content';
  const fileLines = contentToArray(fileContent);
  const numberOfLines = fileLines.length;
  const input = ' sadfsf saflkjslf\n fasdlfkslk aslfksjd\n alsfk sfsdf\n adflkjfe weflekfj';
  const inputLines = contentToArray(input);
  const insertAt = findLine('content 2', fileLines);
  let insertAfter = insertAt + 1;

  inputLines.forEach(function(line) {
    fileLines.splice(insertAfter, 0, line);
    insertAfter++;
  });

  console.log(fileLines.join('\n'));
}

function contentToArray(content) {
  return content.split(/\r|\n/g);
}

function findLine(check, contentLines) {
  const result = [];
  contentLines.forEach(function(line) {
    if (line.includes(check)) {
      result.push(line);
    }
  });
  const index = contentLines.indexOf(result[0]);

  return index;
}
