// shikaku-game.js
import { ref, computed } from 'vue';

// 导出所有需要使用的函数和变量
export function getCellNumber(gameMap, row, col) {
  if (!gameMap || !Array.isArray(gameMap) || !gameMap[row] || gameMap[row][col] === undefined) {
    return 0;
  }
  return gameMap[row][col];
}

export function calculateRemainingCells(gridSize, selectedRectangles, isInitialized) {
  if (!isInitialized) return gridSize * gridSize;

  const total = gridSize * gridSize;
  const covered = Array(gridSize)
    .fill()
    .map(() => Array(gridSize).fill(false));

  let coveredCount = 0;

  selectedRectangles.forEach((rect) => {
    for (let r = rect.top; r < rect.top + rect.height; r++) {
      for (let c = rect.left; c < rect.left + rect.width; c++) {
        if (r >= 0 && r < gridSize && c >= 0 && c < gridSize && !covered[r][c]) {
          covered[r][c] = true;
          coveredCount++;
        }
      }
    }
  });

  return total - coveredCount;
}

export function calculateCellSize(gridSize) {
  if (gridSize === 6) return 60;
  if (gridSize === 8) return 50;
  return 42; // 10*10
}

// 数方地图类
class ShikakuMap {
  constructor(width, height, xpos = 0, ypos = 0) {
    this.width = width;
    this.height = height;
    this.xpos = xpos;
    this.ypos = ypos;
    this.randXPos = Math.floor(Math.random() * width);
    this.randYPos = Math.floor(Math.random() * height);
    this.subMaps = [];
    this.reset();
  }

  reset() {
    this.subMaps = [];
    this.busyGrid = Array(this.height)
      .fill()
      .map(() => Array(this.width).fill(0));
    this.numbersGrid = Array(this.height)
      .fill()
      .map(() => Array(this.width).fill(0));
  }

  generateBlocks(amount) {
    for (let generateAttempt = 0; generateAttempt < 1000; generateAttempt++) {
      let hasError = false;

      // 阶段1：放置初始区块
      for (let i = 0; i < amount; i++) {
        let addSucceed = false;

        for (let addAttempt = 0; addAttempt < 10; addAttempt++) {
          const width = 1;
          const height = 1;
          const xPos = Math.floor(Math.random() * this.width);
          const yPos = Math.floor(Math.random() * this.height);

          let block = new ShikakuMap(width, height, xPos, yPos);
          block = block.grow(); // 立即生长一次

          if (this.blockFits(block)) {
            this.addBlock(block);
            addSucceed = true;
            break;
          }
        }

        if (!addSucceed) {
          hasError = true;
          break;
        }
      }

      if (!hasError) {
        // 阶段2：优化生长
        for (let i = 0; i < 10000; i++) {
          const idx = Math.floor(Math.random() * amount);
          if (this.tryToGrowBlock(idx) === null) {
            if (this.availableSlots() === 0) {
              return true; // 生成成功
            }
          }
        }
      }

      this.reset();
    }

    return false; // 生成失败
  }

  removeBlock(blockIdx) {
    const block = this.subMaps[blockIdx];
    this.subMaps.splice(blockIdx, 1);

    for (let y = 0; y < block.height; y++) {
      for (let x = 0; x < block.width; x++) {
        this.busyGrid[block.ypos + y][block.xpos + x]--;
      }
    }

    this.numbersGrid[block.ypos + block.randYPos][block.xpos + block.randXPos] = 0;
    return block;
  }

  tryToGrowBlock(blockIdx) {
    const block = this.subMaps[blockIdx];
    const newBlock = block.grow();
    const oldBlock = this.removeBlock(blockIdx);

    if (this.blockFits(newBlock)) {
      this.addBlock(newBlock);
      return null;
    }

    this.addBlock(oldBlock);
    return 'nothing changed';
  }

  availableSlots() {
    let available = 0;
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        if (this.busyGrid[y][x] === 0) {
          available++;
        }
      }
    }
    return available;
  }

  blockFits(block) {
    if (block.size() < 2) {
      return false;
    }

    if (block.xpos < 0 || block.ypos < 0) {
      return false;
    }
    if (block.xpos + block.width > this.width || block.ypos + block.height > this.height) {
      return false;
    }

    for (let y = 0; y < block.height; y++) {
      for (let x = 0; x < block.width; x++) {
        if (this.busyGrid[block.ypos + y][block.xpos + x] > 0) {
          return false;
        }
      }
    }

    return true;
  }

  grow() {
    const biggerMap = new ShikakuMap(this.width, this.height, this.xpos, this.ypos);
    biggerMap.randXPos = this.randXPos;
    biggerMap.randYPos = this.randYPos;

    const direction = Math.floor(Math.random() * 4);
    switch (direction) {
      case 0: // 向右生长
        biggerMap.width++;
        break;
      case 1: // 向左生长
        biggerMap.xpos--;
        break;
      case 2: // 向下生长
        biggerMap.height++;
        break;
      case 3: // 向上生长
        biggerMap.ypos--;
        break;
    }

    return biggerMap;
  }

  addBlock(block) {
    if (!this.blockFits(block)) {
      throw new Error('The block does not fit in the current map');
    }

    this.subMaps.push(block);

    for (let y = 0; y < block.height; y++) {
      for (let x = 0; x < block.width; x++) {
        this.busyGrid[block.ypos + y][block.xpos + x]++;
      }
    }

    this.numbersGrid[block.ypos + block.randYPos][block.xpos + block.randXPos] = block.size();
    return this;
  }

  size() {
    return this.width * this.height;
  }

  blocks() {
    const blocks = [];
    if (this.subMaps.length > 0) {
      for (const subMap of this.subMaps) {
        blocks.push(...subMap.blocks());
      }
    } else {
      blocks.push(this);
    }
    return blocks;
  }
}

export { ShikakuMap };

export function generateValidMap(gridSize, gameMap) {
  const size = gridSize;

  // 根据地图大小确定区块数量
  let blockCount;
  if (size === 6) blockCount = 8;
  else if (size === 8) blockCount = 11;
  else blockCount = 16; // 10*10

  const maxAttempts = 100;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    // 使用正确的生成算法
    const shikaku = new ShikakuMap(size, size);

    // 尝试生成谜题
    if (shikaku.generateBlocks(blockCount)) {
      // 生成成功，更新 gameMap
      const newGameMap = Array(size)
        .fill()
        .map(() => Array(size).fill(0));

      // 将生成的数字复制到 gameMap
      for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
          if (shikaku.numbersGrid[r][c] > 0) {
            newGameMap[r][c] = shikaku.numbersGrid[r][c];
          }
        }
      }

      // 验证至少有一个数字
      let hasNumbers = false;
      for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
          if (getCellNumber(newGameMap, r, c) > 0) {
            hasNumbers = true;
            break;
          }
        }
        if (hasNumbers) break;
      }

      if (hasNumbers) {
        // 更新原始数组
        for (let r = 0; r < size; r++) {
          for (let c = 0; c < size; c++) {
            gameMap[r][c] = newGameMap[r][c];
          }
        }
        return; // 生成成功
      }
    }
  }

  // 如果多次尝试失败，使用备用方案
  generateFallbackMap(gridSize, gameMap);
}

export function generateFallbackMap(gridSize, gameMap) {
  const size = gridSize;

  // 清空数组
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      gameMap[r][c] = 0;
    }
  }

  if (size === 6) {
    const preset = [
      [0, 0, 4, 0, 0, 0],
      [0, 0, 0, 0, 3, 0],
      [8, 0, 4, 0, 0, 0],
      [0, 0, 0, 2, 0, 5],
      [0, 6, 0, 0, 0, 0],
      [0, 0, 0, 4, 0, 0],
    ];
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        gameMap[r][c] = preset[r][c];
      }
    }
  } else if (size === 8) {
    const preset = [
      [6, 0, 0, 0, 0, 0, 3, 0],
      [0, 0, 6, 0, 0, 2, 0, 0],
      [0, 0, 0, 3, 0, 0, 0, 4],
      [0, 0, 0, 0, 7, 0, 0, 0],
      [0, 0, 4, 0, 0, 0, 4, 0],
      [4, 0, 0, 4, 0, 0, 0, 0],
      [0, 2, 0, 0, 0, 4, 0, 5],
      [0, 0, 0, 0, 0, 6, 0, 0],
    ];
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        gameMap[r][c] = preset[r][c];
      }
    }
  } else {
    const preset = [
      [0, 0, 0, 6, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 4, 0, 0, 0, 0],
      [0, 0, 6, 0, 0, 0, 0, 6, 0, 0],
      [0, 0, 0, 0, 8, 0, 0, 0, 0, 8],
      [0, 6, 0, 0, 0, 0, 8, 0, 0, 0],
      [0, 0, 0, 6, 0, 0, 0, 0, 4, 0],
      [4, 0, 0, 0, 0, 6, 0, 0, 0, 0],
      [0, 0, 8, 0, 0, 0, 0, 6, 0, 0],
      [0, 0, 0, 0, 6, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 8, 0, 0, 0],
    ];
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        gameMap[r][c] = preset[r][c];
      }
    }
  }
}

export function getCellFromEvent(event) {
  const cell = event.target.closest('.grid-cell');
  if (!cell) return null;

  const row = parseInt(cell.dataset.row);
  const col = parseInt(cell.dataset.col);

  return { row, col };
}

export function rectanglesOverlap(rect1, rect2) {
  return !(
    rect1.left + rect1.width <= rect2.left ||
    rect2.left + rect2.width <= rect1.left ||
    rect1.top + rect1.height <= rect2.top ||
    rect2.top + rect2.height <= rect1.top
  );
}

export function handleKeyDown(event, cancelSelection, resetGame) {
  if (event.key === 'Escape') {
    cancelSelection();
  }

  if (event.key === 'r' && event.ctrlKey) {
    event.preventDefault();
    resetGame();
  }
}
