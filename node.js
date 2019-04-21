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
  console.log('Connected. Happy chatting!\n');
})

//* ko se povezava prekine
node.on('disconnect', function() {
  console.log('Disconnected. Sorry.');
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
    console.log('*sporocilo - posiljam*');
    node.broadcast.write(line + '\n');
  }
});

//*
node.broadcast.pipe(process.stdout);

//* ob napaki vrzi izjemo
node.on('error', function(e) {throw e});

//* startaj vozlisce
node.start();

//* funkcija za preverjanje komande
function checkCommand(line) {
  if(line === '/mine') {
    process.stdout.write('blockchain not implemented yet!\n');
  } else {
    process.stdout.write('unknown command!\n');
  }
}
