const {Blockchain, Transaction} = require('./blockchain');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

var smoke = require('smokesignal');
var readline = require('readline');

//* kodiranje med vozlisci
process.stdin.setEncoding('utf8');

//* localhost ip naslov
var ip = '192.168.2.178';

//* prvi argument je port, na katerem poslusamo
var port = parseInt(process.argv[2]);

//* ostali argumenti so porti, na katere se hočemo povezati
//* in se shranijo v polje
seed_arr = [];
for(var i = 3; i < process.argv.length; i++) {
  seed_arr.push({
    port: parseInt(process.argv[i]),
    address: ip
  });
}

//* ustvarimo vozlisce s svojim naslovom
//* in naslovi ostalih vozlisc
var node = smoke.createNode({
  port: port
, address: smoke.localIp(ip)
, seeds: seed_arr
});

//* izpisemo svoje podatke
console.log('Port', node.options.port);
console.log('IP', node.options.address);
console.log('ID', node.id);

console.log('Connecting...');

//* ko se povezava vzpostavi
node.on('connect', function() {
  console.log('Connected.\n');
  console.log(node.peers.inList());
})

//* ko se povezava prekine
node.on('disconnect', function() {
  console.log('Disconnected.');
})

//* navaden chat med vozlisci
//* za nas ni pomembno
//process.stdin.pipe(node.broadcast).pipe(process.stdout);

//* posiljanje kontroliranih podatkov med vozlisci
var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

rl.on('line', function (line) {
  if(line[0] === '/') {
    //* ukaz se zacne z '/'
    console.log('*ukaz*')
    checkCommand(line);

  } else {

    //* vse drugo ni ukaz
    console.log('*foo*');
    node.broadcast.write(line + '\n');
  }
});

//* incoming chat
//node.broadcast.pipe(process.stdout);

//* shranimo string chaina, ki ga dobimo
last_received_line = "";

var rb = readline.createInterface({
  input: node.broadcast,
  output: process.stdout,
  terminal: false
});

rb.on('line', function (line) {

  var arr = line.split('^');
  var chain = arr[1];
  //console.log(chain);

  var temp = new Blockchain();
  temp = temp.parseJson(JSON.parse(chain));
  console.log(temp.getBlockchain());

  //if(temp.isChainValid() == true){
    ex.replaceChain(temp);
  //}
});

//* prenesen tekst pipamo v rb stream
node.broadcast.pipe(rb);

//* ob napaki vrzi izjemo
node.on('error', function(e) {throw e});

//* startaj vozlisce
node.start();

//* funkcija za preverjanje komande
const key = ec.genKeyPair();
const publicKey = key.getPublic('hex');
const privateKey= key.getPrivate('hex');

const myKey = ec.keyFromPrivate(privateKey);
const myAddress = myKey.getPublic('hex')

ex = new Blockchain();
console.log(ex.getZadnjiBlock());

//* funkcija za preverjanje komande
function checkCommand(line) {
   if(line[0] == '/' && line[1] == 'p' && line[2] == 'o' && line[3] == 's' && line[4] == 'l' && line[5] == 'i' ){
       var temp = line.split('-');
        console.log(temp[0]);
       console.log("Naslov: " + temp[1]);
       const tx1 = new Transaction(myAddress, temp[1], parseInt(temp[2], 10));
      tx1.signTransaction(myKey);
      ex.addTransaction(tx1);
   }

 else if(line === '/mine') {

    ex.minePending(myAddress);
    var myChain = String(port) + '^' + JSON.stringify(ex) + '^\n';
    //console.log(myChain);
    node.broadcast.write(myChain);
  }
  else if (line === '/last_received_line'){
    process.stdout.write(last_received_line);
    last_received_line = "";
  }
  else if(line === '/celotna') {
    //console.log(ex.getBlockchain());
    console.log(ex);
  }
  else if(line === '/zadnji') {
    console.log(ex.getZadnjiBlock());
  }
  else if(line === '/balance') {
    console.log(ex.getBalance(myAddress));
  }
  else if(line === '/valid') {
    console.log(ex.isChainValid());
  }

  else if(line === '/mojnaslov') {
    console.log(myAddress);
  }


  else {
    console.log('unknown command!');
  };
}
