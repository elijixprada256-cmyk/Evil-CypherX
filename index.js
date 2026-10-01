const http=require('http');
http.createServer((_,r)=>r.end('ALIVE')).listen(process.env.PORT||3000);
const {default:makeWASocket,useMultiFileAuthState}=require('@whiskeysockets/baileys');
const P=require('pino');
async function start(){
const {state,saveCreds}=await useMultiFileAuthState('./s');
const sock=makeWASocket({auth:state,logger:P({level:'silent'}),printQRInTerminal:false,browser:["Evil","Chrome","1.0"]});
sock.ev.on('creds.update',saveCreds);
sock.ev.on('connection.update',async(a)=>{
console.log(a);
if(a.connection==='open'){console.log('CONNECTED');return}
if(!sock.authState.creds.registered){
setTimeout(async()=>{
try{
let code=await sock.requestPairingCode("256767492955");
console.log("PAIR CODE: "+code);
}catch(e){
console.log("Retrying... "+e.message);
setTimeout(()=>start(),5000);
}
},8000);
}
});
}
start();
