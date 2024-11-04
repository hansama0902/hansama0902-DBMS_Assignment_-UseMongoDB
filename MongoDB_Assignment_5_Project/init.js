const { exec } = require('child_process');

// 定义 mongoimport 命令
const command = 'mongoimport -h localhost:27017 -d ieeevisTweets -c tweet --file ./db/ieeevis2020Tweets.dump --drop'
;
// 执行命令
exec(command, (error, stdout, stderr) => {
  if (error) {
    console.error(`Error executing command: ${error.message}`);
    return;
  }
  if (stderr) {
    console.error(`stderr: ${stderr}`);
    return;
  }
  console.log(`stdout: ${stdout}`);
});
