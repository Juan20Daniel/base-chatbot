const fs = require('fs');
const qrcode = require('qrcode-terminal');
const { Client } = require('whatsapp-web.js');
const { createClient } = require('./controllers/handle')
const { connectionReady, connectionLost } = require('./controllers/connection')
const SESSION_FILE_PATH = './session.json';
var client;
var sessionData;
//Escuchamos cuando entre un mensaje 
const listenMessage = () => client.on('message', async msg => {
    const { from, body, hasMedia } = msg;
    console.log(from, body, hasMedia );
    sendMessage(from, "Hola bro")
});
//Enviamos mensaje
const sendMessage = (to, message) => {
    client.sendMessage(to, message)
} 
//Para no tener que escanear de nuevo
const withSession = () => {
    console.log(`Validando session con Whatsapp...`);
    sessionData = require(SESSION_FILE_PATH);
    client = new Client(createClient(sessionData,true));

    client.on('ready', () => {
        connectionReady()
        sendMessage('5213141023884@c.us', 'Hola prro')
    });

    client.on('auth_failure', () => connectionLost());
    client.initialize();
}
//Generamos un QRCODE para iniciar sesion
const withOutSession = () => {
    console.log('No tenemos session guardada');
    client = new Client(createClient());

    client.on('qr', qr => {
        qrcode.generate(qr, { small: true });
    });

    client.on('ready', (a) => {
        connectionReady()
        listenMessage()
    });
    client.on('authenticated', (session) => {
        sessionData = session;
        if(sessionData){
            fs.writeFile(SESSION_FILE_PATH, JSON.stringify(session), function (err) {
                if (err) {
                    console.log(`Ocurrio un error con el archivo: `, err);
                }
            });
        }
    });
    client.initialize();
}
(fs.existsSync(SESSION_FILE_PATH)) ? withSession() : withOutSession();