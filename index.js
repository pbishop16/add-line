// #!/usr/bin/env node

const {
  Transform,
} = require('stream');
const chalk = require('chalk');
const clear = require('clear');
const fs = require('fs-extra');
const program = require('commander');
const {
  echo,
  exit,
} = require('shelljs');

function modFile(file) {
  let lineCount = 0;

  const addable = new Transform({
    transform(chunk, encoding, callback) {
      const string = chunk.toString();

      for (let i=1; i <= 1e1; i++) {
        lineCount += (string.match(/\n/g).length + 1);
        this.push(`${string}-(${i}:Line${lineCount}`);
      }

      callback();
    }
  });

  const modable = new Transform({
    transform(chunk, encoding, callback) {
      const lineArray = chunk.toString().split('\n').filter(l => l);
      const modifiedArray = lineArray.map(line => {
        return line;
      });

      this.push(modifiedArray.join(''));
      callback();
    }
  });

  const modable2 = new Transform({
    transform(chunk, encoding, callback) {
      const modifiedChunk = chunk.toString() + ':modified)\n';

      this.push(modifiedChunk);
      callback();
    }
  });

  if (typeof file !== 'string') {
    echo(chalk('File name must be a string'));
    exit(1);
  }

  const readable = fs.createReadStream(file);
  const writeable = fs.createWriteStream('test-file2.txt');

  readable
    .pipe(addable)
    .pipe(modable2)
    .pipe(writeable);
}

function addLine(file, target, input) {
  _checkForFile(file);

  return fs.readFile(file)
    .then(fileContent => {
      const inputLines = _contentToArray(input);
      const fileLines = _contentToArray(fileContent);
      let lineStatus = _checkIfModified(fileLines, inputLines);

      if (lineStatus.state === 'modified') {
        return lineStatus;
      };

      const insertAt = _findLine(target, fileLines);
      const numberOfLines = fileLines.length;
      let insertAfter = insertAt + 1;

      inputLines.forEach(line => {
        fileLines.splice(insertAfter, 0, line);
        ++insertAfter;
      });

      fs.writeFile(file, fileLines.join('\n'), (err) => {
        if (err) {
          throw err;
          exit(1);
        }

        lineStatus.state = 'complete';
        console.log('Content successfully added!');
      });

      return lineStatus;
    })
    .catch(e => {
      console.log(chalk.red(`Error => ${e}`));
      return e;
    });;
}

function modLine(file, target, positionIdentifier, input) {
  _checkForFile(file);

  fs.readFile(file)
    .then(fileContent => {
      const fileLines = _contentToArray(fileContent);
      const targetLine = fileLines.filter((line) => line.includes(target));
      const lineIndex = fileLines.indexOf(targetLine[0]);
      const targetLineArray = fileLines[lineIndex].split(positionIdentifier);

      targetLineArray.splice(1, 0, input + positionIdentifier);
      fileLines[lineIndex] = targetLineArray.join('');

      fs.writeFile(file, fileLines.join('\n'), (err) => {
        if (err) {
          throw err;
          exit(1);
        }

        console.log('Content successfully modified!');
      });

      return 'success';
    })
    .catch(e => {
      console.log(chalk.red(`Error => ${e}`));
      return e;
    });
}

function _checkIfModified(contentArray, inputArray) {
  const previouslyModifiedLine = contentArray.filter(line => {
    return line.includes(inputArray[0]);
  });

  if (previouslyModifiedLine.length) {
    return {
      state: 'modified',
      modifiedLine: previouslyModifiedLine,
    };
  }

  return {
    state: 'clean',
    modifiedLine: null,
  };
}

function _contentToArray(content) {
  let contentArray = content;

  if (typeof content !== 'array') {
    contentArray = content.toString().split(/\r|\n/g);;
  }

  return contentArray;
}

function _findLine(check, contentLines) {
  const result = [];
  contentLines.forEach(function(line) {
    if (line.includes(check)) {
      result.push(line);
    }
  });
  const index = contentLines.indexOf(result[0]);

  return index;
}

function _checkForFile(file) {
  fs.exists(file, exists => {
    if (!exists) {
      console.error(chalk.red(`File not present`));
      exit(1);
    }
  });
}

module.exports = {
  addLine,
  modLine,
};
