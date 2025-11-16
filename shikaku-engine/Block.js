export default class Block {
    constructor(x, y, width, height, numX = null, numY = null) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.numX = numX;
        this.numY = numY;
    }

    size() {
        return this.width * this.height;
    }

    contains(px, py) {
        return px >= this.x && px < this.x + this.width &&
               py >= this.y && py < this.y + this.height;
    }

    toPlain() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height,
            numX: this.numX,
            numY: this.numY,
            size: this.size()
        };
    }
    
    grow(direction) {
    const newBlock = new Block(this.x, this.y, this.width, this.height);
    
    switch(direction) {
        case 'up':
            newBlock.y--;
            newBlock.height++;
            break;
        case 'down':
            newBlock.height++;
            break;
        case 'left':
            newBlock.x--;
            newBlock.width++;
            break;
        case 'right':
            newBlock.width++;
            break;
    }
    return newBlock;
}
}