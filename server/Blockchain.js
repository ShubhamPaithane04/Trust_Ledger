const crypto = require('crypto');

class Block {
  constructor(index, timestamp, data, previousHash = '') {
    this.index = index;
    this.timestamp = timestamp;
    this.data = data; // { productId, location, scanType }
    this.previousHash = previousHash;
    this.hash = this.calculateHash();
  }

  calculateHash() {
    return crypto
      .createHash('sha256')
      .update(
        this.index +
          this.previousHash +
          this.timestamp +
          JSON.stringify(this.data)
      )
      .digest('hex');
  }
}

class Blockchain {
  constructor() {
    this.chain = [this.createGenesisBlock()];
  }

  createGenesisBlock() {
    return new Block(0, new Date().toISOString(), { message: 'Genesis Block' }, '0');
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  addBlock(newBlock) {
    newBlock.previousHash = this.getLatestBlock().hash;
    newBlock.hash = newBlock.calculateHash();
    this.chain.push(newBlock);
  }

  // Returns the index of the first block that fails verification, or -1 if the chain is intact
  findInvalidBlock() {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];

      // Recalculate hash to ensure data hasn't been tampered with
      if (currentBlock.hash !== currentBlock.calculateHash()) {
        return i;
      }

      // Check if previous hash matches
      if (currentBlock.previousHash !== previousBlock.hash) {
        return i;
      }
    }
    return -1;
  }

  verifyChain() {
    return this.findInvalidBlock() === -1;
  }

  // Rebuild a chain from plain JSON, keeping stored hashes so tampering stays detectable
  static fromJSON(rawChain) {
    const blockchain = new Blockchain();
    blockchain.chain = rawChain.map((raw) => {
      const block = Object.create(Block.prototype);
      return Object.assign(block, raw);
    });
    return blockchain;
  }
}

module.exports = { Block, Blockchain };
