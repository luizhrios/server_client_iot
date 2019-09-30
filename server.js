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

let configRegex = /(?<name>\w+) (?<port>\d{2,5})/;
let contentRegex = /(?<device>\w+) (?<command>\w+) (?<me>\w+)/;

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

function handleCommand(content, c) {
  console.log(`${content.device} connected: ${content.command}`)
  if (content.command === 'STATUS')
    c.end(`${config.name} ${status.metal ? 1 : 0} ${status.vidro ? 1 : 0} ${status.plastico ? 1 : 0} ${status.papel ? 1 : 0}\n`)
  else if (content.command === 'CARREGAR') {
    let n = 0;
    for (const material in status) {
      if (status[material] && n++ < 2)
        status[material] = false;
    }
    c.end(`${config.name} OK`);
  }
}

setInterval(() => {
  for (const material in status) {
    if (!status[material]) {
      status[material] = true;
      break;
    }
  }
}, 10000)