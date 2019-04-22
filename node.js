var smoke = require('smokesignal');
var readline = require('readline');
var {Blockchain} = require('./blockchain.js');

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
  console.log(node.peers.inList());
});

//* ko se povezava prekine
node.on('disconnect', function() {
  console.log('Disconnected. Sorry.');
});

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
    //console.log('*ukaz*')
    checkCommand(line);

  } else {

    //* vse drugo ni ukaz
    console.log('*foo*');
    node.broadcast.write(line + '\n');
  }
});





//* incoming chat
//node.broadcast.pipe(process.stdout);

var rb = readline.createInterface({
  input: node.broadcast,
  output: process.stdout,
  terminal: false
});

rb.on('line', function (line) {




  //* prenesen chain je v spremenljivki line (string)
  //* implementiraj string to chain



  arr = line.split('^');
  chain = arr[1];
  //console.log(chain);

  var temp = new Blockchain();
  temp = temp.parseJson(JSON.parse(chain));
  console.log(temp);

  //* preveri, če je chain validen



});



//* prenesen tekst pipamo v rb stream
node.broadcast.pipe(rb);

//* ob napaki vrzi izjemo
node.on('error', function(e) {throw e});

//* startaj vozlisce
node.start();


ex = new Blockchain();


//* funkcija za preverjanje komande
function checkCommand(line) {
  if(line === '/mine') {

    ex.minePending(4);
    var myChain = String(port) + '^' + JSON.stringify(ex) + '^\n';
    console.log(ex);
    node.broadcast.write(myChain);
    //console.log(ex);

  } else if (line === '/addr'){

    process.stdout.write(addr);

  } else if (line === '/block'){

    var temp = new Blockchain();
    temp = temp.parseJson(JSON.parse(chain));
    console.log(temp);

  } else {
    process.stdout.write('unknown command!\n');
  }
}

//console.log(ex.getZadnjiBlock());
