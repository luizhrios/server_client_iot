const net = require('net')
const fs = require('fs');

let config;
let devices = [];
let readyDevices = [];

let devicesFile = fs.readFileSync('devices_list.txt').toString();
let configFile = fs.readFileSync('config.txt').toString();

parseConfig();
parseDevicesList();

function parseConfig() {
  let configRegex = /(?<name>\w+) (?<status>\w+) (?<updateInterval>\d{1,3}) (?<port>\d{2,5})/g;
  config = configRegex.exec(configFile).groups
}

function parseDevicesList() {
  let devicesRegex = /(?<name>\w+) (?<host>\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}) (?<port>\d{2,5})/g;
  let device;
  while ((device = devicesRegex.exec(devicesFile)) != null) {
    devices.push(device.groups)
  }
}

let server = net.createServer(undefined, (c) => {
  c.on('data', (data) => handleMessage(data, c))
  c.on('end', () => readyDevices.splice(readyDevices.findIndex(readyDevice => readyDevice === c)))
  c.on('error', (err) => handleDisconnect(c, err));
}).listen(config.port, "0.0.0.0");

function handleDisconnect(c, err) {
  let readyDevice = readyDevices.splice(readyDevices.findIndex(readyDevice => readyDevice === c));
  console.log(readyDevice.name);
}

function handleMessage(data, c) {
  if (config.status == 'ATIVADO') {
    if (!readyDevices.find(readyDevice => readyDevice === c)) {
      let content = data.toString();
      let contentRegex = /(?<device>\w+) (?<command>\w+) (?<me>\w+)/g;
      content = contentRegex.exec(content).groups;
      console.log(`${content.device} connected`)
      c.write(`${config.name} ${config.status} ${config.updateInterval}`)
      c.name = content.device;
      readyDevices.push(c)
    }
  }
  else {
    c.end('DESATIVADO')
  }
}

setInterval(() => {
  readyDevices.forEach(readyDevice => {
    readyDevice.write((Math.random() * 100).toString()+'\n')
  })
}, config.updateInterval * 1000)

module.exports = { me: config.name, devices }