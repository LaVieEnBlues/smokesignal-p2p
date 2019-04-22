const SHA256 = require ('crypto-js/sha256');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

class Transaction{
  constructor(from,to,ammount){
    this.from = from;
    this.to = to;
    this.ammount = ammount;
    this.timestamp = Date.now();
  }

  calculateHash(){
    return SHA256(this.from + this.to + this.ammount + this.timestamp).toString();
  }

  signTransaction(signingKey){
    if(signingKey.getPublic('hex') !== this.from){
      //throw new Error('Ne mores podpisati transakcij drugih denarnic');
      console.log('Ne mores podpisati transakcij drugih denarnic');
    }

    const hashTx = this.calculateHash();
    const sig = signingKey.sign(hashTx, 'base64');
    this.signature = sig.toDER('hex');
  }

  isValid(){
    if(this.from == null) return true;

    if(!this.signature || this.signature.length === 0){
      //throw new Error('Ni podpisa');
      console.log('Ni podpisa');
    }

    const publicKey = ec.keyFromPublic(this.from, 'hex');
    return publicKey.verify(this.calculateHash(), this.signature);
  }
}


class Block{
  constructor(index, timestamp, data, transactions, previousHash = ''){
    this.index = index;
    this.timestamp = timestamp;
    this.data = data;
    this.previousHash = previousHash;
    this.transactions = transactions;
    this.hash = this.calculateHash();
    this.nonce = 0;
  }

  calculateHash(){
    return SHA256(this.index + this.previousHash + this.timestamp + JSON.stringify(this.data) + JSON.stringify(this.transactions) + this.nonce).toString();
  }

  mineBlock(difficulty){
    while(this.hash.substring(0, difficulty) !== Array(difficulty + 1).join("0")){
      this.nonce++;
      this.hash = this.calculateHash();
    }
    console.log("Block mined " + this.hash);
  }

  hasValidTransaction(){
    for(const tx of this.transactions){
      if(!tx.isValid()){
        return false;
      }
    }
    return true;
  }
}


class Blockchain{
  constructor(){
    this.chain = [this.createFirstBlock()];
    this.difficulty = 2;
    this.pending = [];
    this.reward = 10;

  }

  createFirstBlock(){
    return new Block(0, Date.parse('2000-1-5'), "Prvi block",[] , "0");
  }

  getZadnjiBlock(){
    return this.chain[this.chain.length - 1];
  }

  getBlockchain(){
    return this.chain;
  }

  parseJson(obj) {
    this.chain = obj.chain;
    this.difficulty = obj.difficulty;
    this.pending = obj.pending;
    this.reward = obj.reward;

    return this;
  }
/*
  addBlock(newBlock){
    newBlock.previousHash = this.getZadnjiBlock().hash;
    newBlock.mineBlock(this.difficulty);
    this.chain.push(newBlock);
  }
*/

minePending(rewardAddress){
  let block = new Block(this.getZadnjiBlock().index+1,Date.now(), "podatki", this.pending, this.getZadnjiBlock().hash);
  block.mineBlock(this.difficulty);

    console.log('Uspesno majnamo');
    this.chain.push(block);

    this.pending = [
      new Transaction(null, rewardAddress, this.reward)
    ];
}

addTransaction(transaction){
  if(!transaction.from || !transaction.to){
    //throw new Error('Tranzakcija rabi naslova');
    console.log('Tranzakcija rabi naslova');
  }

  if(!transaction.isValid()){
    //throw new Error('Ni mogoce dodati neveljavne transakcije');
    console.log('Ni mogoce dodati neveljavne transakcije');
  }

  this.pending.push(transaction);
}

getBalance(address){
  let balance = 0;

  for(const block of this.chain){
    for(const trans of block.transactions){
      if(trans.from === address){
        balance -= trans.ammount;
      }
      if(trans.to === address){
        balance += trans.ammount;
      }
    }
  }
  return balance;
}

  isChainValid(){
    const realGenesis = JSON.stringify(this.createFirstBlock());
    if(realGenesis !== JSON.stringify(this.chain[0])){
      return false;
    }

      for(let i = 1; i<this.chain.length; i++){
        const currentBlock = this.chain[i];
        const previousBlock = this.chain[i-1];

        //console.log(JSON.stringify(currentBlock));
        //console.log(JSON.stringify(previousBlock));

        if(!currentBlock.hasValidTransaction()){
          return false;
        }

        if(currentBlock.hash !== currentBlock.calculateHash()){
          return false;
        }

        if(currentBlock.previousHash !== previousBlock.hash){
          return false;
        }
      }
      return true;
  }

  replaceChain(newBlocks){
    if(newBlocks.length > this.chain.length){
      console.log('Received blockchain is valid. Replacing current blockchain with received blockchain');
      this.chain = newBlocks;
    }
    else {
        console.log('Received blockchain invalid');
    }
  }
}

module.exports.Blockchain = Blockchain;
module.exports.Transaction = Transaction;
