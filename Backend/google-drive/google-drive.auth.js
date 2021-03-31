const fs = require('fs')
const path = require('path')
const readline = require('readline')
const { google } = require('googleapis')
const colors = require('colors');
const ErrorResponse = require('../utils/errorResponse')
const SCOPES = ['https://www.googleapis.com/auth/drive'];
const TOKEN_PATH = path.join(__dirname, 'token.json');

const credentials = JSON.parse(fs.readFileSync(path.join(__dirname, './credentials.json'), {encoding:'utf8', flag:'r'}))
const {client_secret, client_id, redirect_uris} = credentials.installed;
const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0])
const token = JSON.parse(fs.readFileSync(TOKEN_PATH), {encoding:'utf8', flag:'r'})
oAuth2Client.setCredentials(token)

console.log("Sucessfuly completed Google Drive Auth".red.bold)
module.exports = oAuth2Client

// function getNewToken(oAuth2Client) {
//   const authUrl = oAuth2Client.generateAuthUrl({
//     access_type: 'offline',
//     scope: SCOPES,
//   });
//   console.log('Authorize this app by visiting this url:', authUrl);
//   const rl = readline.createInterface({
//     input: process.stdin,
//     output: process.stdout,
//   });
//   rl.question('Enter the code from that page here: ', (code) => {
//     rl.close();
//     oAuth2Client.getToken(code, (err, token) => {
//       if (err) return console.error('Error retrieving access token', err);
//       oAuth2Client.setCredentials(token);
//       // Store the token to disk for later program executions
//       fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
//         if (err) console.error(err);
//         console.log('Token stored to', TOKEN_PATH);
//       });
//     })
//   })
// }

// getNewToken(oAuth2Client)