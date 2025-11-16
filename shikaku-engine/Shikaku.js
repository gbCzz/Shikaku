import Block from "./Block.js";

export default class ShikakuMap {
    constructor(width, height) {
        this.Width = width;
        this.Height = height;

        this.SubMaps = [];
        this.Reset();
    }

    // ---------------------------------------------------------
    // 初始化网格
    // ---------------------------------------------------------
    Reset() {
        this.SubMaps = [];
        this.BusyGrid = Array(this.Height)
            .fill()
            .map(() => Array(this.Width).fill(0));

        this.NumbersGrid = Array(this.Height)
            .fill()
            .map(() => Array(this.Width).fill(0));
    }

    // ---------------------------------------------------------
    // 判断 block 是否在地图内 & 不冲突
    // ---------------------------------------------------------
    BlockFits(block) {
        if (
            block.x < 0 ||
            block.y < 0 ||
            block.x + block.width > this.Width ||
            block.y + block.height > this.Height
        ) {
            return false;
        }

        for (let y = block.y; y < block.y + block.height; y++) {
            for (let x = block.x; x < block.x + block.width; x++) {
                if (this.BusyGrid[y][x] !== 0) return false;
            }
        }

        return true;
    }

    // ---------------------------------------------------------
    // 把 block 放入地图
    // ---------------------------------------------------------
    AddBlock(block) {
        if (!this.BlockFits(block)) return false;

        this.SubMaps.push(block);

        for (let y = block.y; y < block.y + block.height; y++) {
            for (let x = block.x; x < block.x + block.width; x++) {
                this.BusyGrid[y][x] = 1;
                this.NumbersGrid[y][x] = block.size();
            }
        }

        return true;
    }

    // ---------------------------------------------------------
    // 用 RNG 扩张某块
    // ---------------------------------------------------------
    GrowBlock(block, rng) {
        const dirs = ["up", "down", "left", "right"];
        const dir = rng.pick(dirs);

        const newBlock = block.grow(dir);
        return this.BlockFits(newBlock) ? newBlock : block;
    }

    // ---------------------------------------------------------
    // 随机从点生成一个“尽可能大”的 block
    // ---------------------------------------------------------
    createRandomBlock(x, y, rng) {
        let block = new Block(x, y, 1, 1);

        for (let i = 0; i < 20; i++) {
            const grown = this.GrowBlock(block, rng);
            block = grown;
        }
        return this.BlockFits(block) ? block : null;
    }

    // ---------------------------------------------------------
    // 文本显示
    // ---------------------------------------------------------
    toString() {
        let str = "";
        for (let y = 0; y < this.Height; y++) {
            str += this.NumbersGrid[y].map((n) => (n || ".").toString()).join(" ");
            str += "\n";
        }
        return str;
    }

    // ---------------------------------------------------------
    // 外部接口：ShikakuMap.Generate()
    // ---------------------------------------------------------
    static Generate(width, height, options = {}) {
        return ShikakuMap.Generator.generate(width, height, options);
    }
}

// ======================================================================
// 内部 RNG 工具
// ======================================================================
ShikakuMap.RNG = class {
    constructor(seed = Date.now()) {
        this.seed = seed;
    }

    next() {
        this.seed = (this.seed * 1664525 + 1013904223) % 4294967296;
        return this.seed / 4294967296;
    }

    int(min, max) {
        return Math.floor(this.next() * (max - min)) + min;
    }

    pick(arr) {
        return arr[this.int(0, arr.length)];
    }
};

// ======================================================================
// 内部 Generator：整套地图生成算法
// ======================================================================
ShikakuMap.Generator = class {
    static generate(width, height, options = {}) {
        const opt = Object.assign(
            {
                seed: Date.now(),
                maxBlocks: 40
            },
            options
        );

        const rng = new ShikakuMap.RNG(opt.seed);
        const map = new ShikakuMap(width, height);

        for (let i = 0; i < opt.maxBlocks; i++) {
            const x = rng.int(0, width);
            const y = rng.int(0, height);

            if (map.BusyGrid[y][x] !== 0) continue;

            const block = map.createRandomBlock(x, y, rng);
            if (block) map.AddBlock(block);
        }

        return map;
    }
};
