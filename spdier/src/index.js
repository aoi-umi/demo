const { Download } = require('./main');

let args = process.argv.slice(2);
if (!args.length) {
    console.error('please input the url');
    return false;
}

// https://huaban.com/boards/30054730
Download.run(args[0], args[1]).catch(e => {
    console.error(e.message);
});