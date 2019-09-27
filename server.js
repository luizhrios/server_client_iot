const net = require('net')
const fs = require('fs');
const os = require('os');

let status = {
  metal: false,
  vidro: false,
  plastico: false,
  papel: false
};
let config;

let configFile = fs.readFileSync('config.txt').toString();

let configRegex = /(?<name>\w+) (?<port>\d{2,5})/g;
let contentRegex = /(?<device>\w+) (?<command>\w+) (?<me>\w+)/g;

parseConfig();

function parseConfig() {
  config = configRegex.exec(configFile).groups
  config.ip = os.networkInterfaces().wlp1s0[0].address;
}

let server = net.createServer(undefined, (c) => {
  c.on('data', (data) => handleMessage(data.toString(), c))
}).listen(config.port, "0.0.0.0", () => {
  console.log(`Listening on ${config.ip}:${config.port}`)
});

function handleMessage(message, c) {
  content = contentRegex.exec(message);
  if (content) {
    content = content.groups
    handleCommand(content, c);
  }
}

function handleCommand(command, c) {
  console.log(`${content.device} connected`)
  c.write(`${config.name} ${''}`)
  c.name = content.device;
}

setInterval(() => {
  
}, config.updateInterval * 1000)