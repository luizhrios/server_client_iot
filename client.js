const net = require('net')
const server = require('./server');
const inquirer = require('inquirer')

let me = server.me;
let devices = server.devices;

actions = [{
    type: 'list',
    name: 'main',
    message: 'Client',
    choices: ['Connect']
}]

connectTo = [{
    type: 'list',
    name: 'device',
    message: 'Connect to',
    choices: devices
}]

askActions();
function askActions() {
    inquirer.prompt(actions).then(answers => {
        inquirer.prompt(connectTo).then(answers => {
            connect(answers.device)
            askActions();
        })
    })
}

function connect(name) {
    let device = devices.find(device => device.name === name);
    let server = net.createConnection(device, () => {
        console.log("Connected")
    }).on('data', (data) => console.log(`Sent from server: ${data.toString()}`))
        .on('error', (err) => {
            console.log(err)
        });
    server.write(`${me} CONECTAR ${name}`);
}