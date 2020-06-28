const { program } = require('commander');
const { Download, analyzerEnum } = require('./main');

program
    .option('-t, --type <string>', Object.values(analyzerEnum).join(' | '))
    .requiredOption('-u, --url <string>', 'url')
    .parse(process.argv);

// console.log(program.opts());

// https://huaban.com/boards/30054730
Download.run(program.url, program.type).catch(e => {
    console.error(e.message);
});