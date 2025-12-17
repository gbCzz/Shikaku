<template>
  <!-- 模板部分保持不变 -->
  <div class="shikaku-game">
    <!-- 游戏控制区域 -->
    <div class="game-controls">
      <button @click="submitSolution" class="control-btn submit-btn">提交</button>
      <button @click="clearSelections" class="control-btn clear-btn">清空</button>
      <button @click="resetGame" class="control-btn reset-btn">重置</button>
      <div class="game-info">
        <span>地图大小: {{ gridSize }}*{{ gridSize }}</span>
        <span>已选矩形: {{ selectedRectangles.length }}</span>
        <span>剩余格子: {{ remainingCells }}</span>
      </div>
    </div>

    <!-- 游戏主界面 -->
    <div class="game-main">
      <div
        class="game-grid-container"
        :style="{
          '--grid-size': gridSize,
          '--cell-size': `${cellSize}px`,
        }"
      >
        <!-- 加载状态 -->
        <div v-if="!isInitialized" class="loading-overlay">游戏初始化中...</div>

        <!-- 网格容器 -->
        <div
          v-else
          class="game-grid"
          @mousedown="startSelection"
          @mousemove="updateSelection"
          @mouseup="endSelection"
          @mouseleave="cancelSelection"
        >
          <!-- 网格线背景 -->
          <div class="grid-background">
            <!-- 水平线 -->
            <div
              v-for="i in gridSize + 1"
              :key="'h' + i"
              class="grid-line horizontal"
              :class="{ outer: i === 1 || i === gridSize + 1 }"
              :style="{ top: `${(i - 1) * cellSize}px` }"
            ></div>

            <!-- 垂直线 -->
            <div
              v-for="i in gridSize + 1"
              :key="'v' + i"
              class="grid-line vertical"
              :class="{ outer: i === 1 || i === gridSize + 1 }"
              :style="{ left: `${(i - 1) * cellSize}px` }"
            ></div>
          </div>

          <!-- 单元格内容 -->
          <div v-for="row in gridSize" :key="'row' + row" class="grid-row">
            <div
              v-for="col in gridSize"
              :key="'cell' + (row - 1) + '-' + (col - 1)"
              class="grid-cell"
              :data-row="row - 1"
              :data-col="col - 1"
            >
              <!-- 使用安全函数获取数字 -->
              <div v-if="getCellNumberLocal(row - 1, col - 1) !== 0" class="cell-number">
                {{ getCellNumberLocal(row - 1, col - 1) }}
              </div>
            </div>
          </div>

          <!-- 已选择的矩形 -->
          <div
            v-for="rect in selectedRectangles"
            :key="rect.id"
            class="rectangle"
            :style="{
              top: `${rect.top * cellSize}px`,
              left: `${rect.left * cellSize}px`,
              width: `${rect.width * cellSize}px`,
              height: `${rect.height * cellSize}px`,
            }"
            @click="removeRectangle(rect)"
          >
            <div class="rectangle-number">{{ rect.number }}</div>
          </div>

          <!-- 选择预览 -->
          <div
            v-if="isSelecting && currentSelection"
            class="selection-preview"
            :style="{
              top: `${currentSelection.top * cellSize}px`,
              left: `${currentSelection.left * cellSize}px`,
              width: `${currentSelection.width * cellSize}px`,
              height: `${currentSelection.height * cellSize}px`,
            }"
          >
            <!-- 添加起始点标记 -->
            <div
              v-if="currentSelection.startRow !== undefined"
              class="start-point-marker"
              :style="{
                top: `${(currentSelection.startRow - currentSelection.top) * cellSize}px`,
                left: `${(currentSelection.startCol - currentSelection.left) * cellSize}px`,
              }"
            ></div>
          </div>
        </div>
      </div>
    </div>

    <!-- 游戏状态提示 -->
    <div v-if="gameStatus" class="game-status" :class="gameStatus.type">
      {{ gameStatus.message }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import {
  getCellNumber,
  calculateRemainingCells,
  calculateCellSize,
  ShikakuMap,
  generateValidMap,
  generateFallbackMap,
  getCellFromEvent,
  rectanglesOverlap,
  handleKeyDown as importedHandleKeyDown
} from '../utils/shikaku-game.js';

// 游戏状态
const gridSize = ref(6);
const gameMap = ref([]);
const selectedRectangles = ref([]);
const isSelecting = ref(false);
const selectionStart = ref({ row: -1, col: -1 });
const currentSelection = ref(null);
const gameStatus = ref(null);
const isInitialized = ref(false);

// 使用导入的函数计算数字
const getCellNumberLocal = (row, col) => getCellNumber(gameMap.value, row, col);

// 计算剩余格子
const remainingCells = computed(() => {
  return calculateRemainingCells(gridSize.value, selectedRectangles.value, isInitialized.value);
});

// 单元格大小
const cellSize = computed(() => {
  return calculateCellSize(gridSize.value);
});

// 初始化游戏
function initGame() {
  // 随机选择地图大小
  const sizes = [6, 8, 10];
  gridSize.value = sizes[Math.floor(Math.random() * sizes.length)];

  // 清空游戏状态
  selectedRectangles.value = [];
  gameStatus.value = null;
  isSelecting.value = false;
  selectionStart.value = { row: -1, col: -1 };
  currentSelection.value = null;
  isInitialized.value = false;

  // 先初始化一个空的 gameMap
  gameMap.value = Array(gridSize.value)
    .fill()
    .map(() => Array(gridSize.value).fill(0));

  // 生成有效的数方地图
  generateValidMap(gridSize.value, gameMap.value);

  // 标记初始化完成
  setTimeout(() => {
    isInitialized.value = true;
  }, 100);
}

// 开始选择
function startSelection(event) {
  const cell = getCellFromEvent(event);
  if (!cell || event.button !== 0) return;

  isSelecting.value = true;
  selectionStart.value = { row: cell.row, col: cell.col };
  updateCurrentSelection(cell);
}

// 更新选择
function updateSelection(event) {
  if (!isSelecting.value) return;

  const cell = getCellFromEvent(event);
  if (cell) {
    updateCurrentSelection(cell);
  }
}

// 更新当前选择
function updateCurrentSelection(endCell) {
  const start = selectionStart.value;
  const end = endCell;

  // 计算矩形的位置和尺寸
  const top = Math.min(start.row, end.row);
  const left = Math.min(start.col, end.col);
  const bottom = Math.max(start.row, end.row);
  const right = Math.max(start.col, end.col);

  currentSelection.value = {
    top,
    left,
    width: right - left + 1,
    height: bottom - top + 1,
    // 保存原始起始点（用于正确显示预览）
    startRow: start.row,
    startCol: start.col,
  };
}

// 结束选择
function endSelection() {
  if (!isSelecting.value || !currentSelection.value) return;

  const rect = currentSelection.value;

  // 验证矩形
  if (validateRectangle(rect)) {
    // 添加矩形
    addRectangle(rect);
  }

  // 重置选择状态
  cancelSelection();
}

// 取消选择
function cancelSelection() {
  isSelecting.value = false;
  selectionStart.value = { row: -1, col: -1 };
  currentSelection.value = null;
}

// 验证矩形
function validateRectangle(rect) {
  const { top, left, width, height } = rect;

  // 检查边界
  if (top < 0 || left < 0 || top + height > gridSize.value || left + width > gridSize.value) {
    return false;
  }

  // 检查是否重叠
  for (const existingRect of selectedRectangles.value) {
    if (rectanglesOverlap(rect, existingRect)) {
      gameStatus.value = {
        type: 'error',
        message: '矩形之间不能重叠',
      };
      setTimeout(() => {
        gameStatus.value = null;
      }, 2000);
      return false;
    }
  }

  // 检查矩形内数字
  let numberCount = 0;
  let numberValue = 0;
  let numberPosition = null;

  for (let r = top; r < top + height; r++) {
    for (let c = left; c < left + width; c++) {
      if (getCellNumberLocal(r, c) !== 0) {
        numberCount++;
        numberValue = getCellNumberLocal(r, c);
        numberPosition = { row: r, col: c };
      }
    }
  }

  if (numberCount === 0) {
    gameStatus.value = {
      type: 'error',
      message: '矩形必须包含一个数字',
    };
    setTimeout(() => {
      gameStatus.value = null;
    }, 2000);
    return false;
  }

  if (numberCount > 1) {
    gameStatus.value = {
      type: 'error',
      message: '矩形只能包含一个数字',
    };
    setTimeout(() => {
      gameStatus.value = null;
    }, 2000);
    return false;
  }

  const rectSize = width * height;
  if (rectSize !== numberValue) {
    gameStatus.value = {
      type: 'error',
      message: `矩形大小(${rectSize})必须等于数字(${numberValue})`,
    };
    setTimeout(() => {
      gameStatus.value = null;
    }, 2000);
    return false;
  }

  return true;
}

// 添加矩形
function addRectangle(rect) {
  // 计算矩形内的数字
  let numberValue = 0;
  let numberPosition = null;

  for (let r = rect.top; r < rect.top + rect.height; r++) {
    for (let c = rect.left; c < rect.left + rect.width; c++) {
      if (getCellNumberLocal(r, c) !== 0) {
        numberValue = getCellNumberLocal(r, c);
        numberPosition = { row: r, col: c };
        break;
      }
    }
    if (numberValue !== 0) break;
  }

  const newRect = {
    id: Date.now() + Math.random(),
    top: rect.top,
    left: rect.left,
    width: rect.width,
    height: rect.height,
    number: numberValue,
    numberPosition,
  };

  selectedRectangles.value.push(newRect);

  gameStatus.value = {
    type: 'success',
    message: '矩形添加成功',
  };
  setTimeout(() => {
    gameStatus.value = null;
  }, 1000);
}

// 移除矩形
function removeRectangle(rect) {
  const index = selectedRectangles.value.findIndex((r) => r.id === rect.id);
  if (index !== -1) {
    selectedRectangles.value.splice(index, 1);
  }
}

// 清空选择
function clearSelections() {
  if (selectedRectangles.value.length === 0) return;

  if (confirm('确定要清空所有已选择的矩形吗？')) {
    selectedRectangles.value = [];
    gameStatus.value = {
      type: 'info',
      message: '已清空所有矩形',
    };
    setTimeout(() => {
      gameStatus.value = null;
    }, 1000);
  }
}

// 重置游戏
function resetGame() {
  if (confirm('确定要重置游戏吗？这将重新生成地图。')) {
    initGame();
    gameStatus.value = {
      type: 'info',
      message: '游戏已重置',
    };
    setTimeout(() => {
      gameStatus.value = null;
    }, 1000);
  }
}

// 提交解决方案
function submitSolution() {
  // 检查是否覆盖了所有格子
  const covered = Array(gridSize.value)
    .fill()
    .map(() => Array(gridSize.value).fill(false));

  let coveredCount = 0;

  selectedRectangles.value.forEach((rect) => {
    for (let r = rect.top; r < rect.top + rect.height; r++) {
      for (let c = rect.left; c < rect.left + rect.width; c++) {
        if (!covered[r][c]) {
          covered[r][c] = true;
          coveredCount++;
        }
      }
    }
  });

  const totalCells = gridSize.value * gridSize.value;

  if (coveredCount !== totalCells) {
    gameStatus.value = {
      type: 'error',
      message: `还需要覆盖 ${totalCells - coveredCount} 个格子`,
    };
    setTimeout(() => {
      gameStatus.value = null;
    }, 2000);
    return;
  }

  // 检查每个数字是否都有对应的矩形
  for (let r = 0; r < gridSize.value; r++) {
    for (let c = 0; c < gridSize.value; c++) {
      if (getCellNumberLocal(r, c) !== 0) {
        const hasRect = selectedRectangles.value.some(
          (rect) => rect.numberPosition.row === r && rect.numberPosition.col === c
        );

        if (!hasRect) {
          gameStatus.value = {
            type: 'error',
            message: `数字 ${getCellNumberLocal(r, c)} 没有对应的矩形`,
          };
          setTimeout(() => {
            gameStatus.value = null;
          }, 2000);
          return;
        }
      }
    }
  }

  // 成功
  gameStatus.value = {
    type: 'success',
    message: '恭喜！解答正确！',
  };
}

// 键盘快捷键
function handleKeyDown(event) {
  importedHandleKeyDown(event, cancelSelection, resetGame);
}

// 生命周期
onMounted(() => {
  initGame();
  window.addEventListener('keydown', handleKeyDown);
});
</script>

<style scoped>
.shikaku-game {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
  background: rgba(255,255,255,0);
  border-radius: 12px;
}

.game-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e5e7eb;
  flex-wrap: wrap;
}

.control-btn {
  padding: 12px 28px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 120px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.control-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.submit-btn {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
}

.clear-btn {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
}

.reset-btn {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
}

.game-info {
  display: flex;
  gap: 24px;
  font-size: 15px;
  color: #4b5563;
  background: #f9fafb;
  padding: 12px 24px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.game-info span {
  font-weight: 500;
}

.game-main {
  margin-bottom: 30px;
}

.game-grid-container {
  position: relative;
  width: fit-content;
  margin: 0 auto;
  background: white;
  padding: 2px;
}

.game-grid {
  position: relative;
  display: grid;
  grid-template-columns: repeat(var(--grid-size), var(--cell-size));
  grid-template-rows: repeat(var(--grid-size), var(--cell-size));
  border: 2px solid #1f2937;
  border-radius: 4px;
  overflow: hidden;
  background: white;
}

.grid-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.grid-line {
  position: absolute;
  background-color: #d1d5db;
}

.grid-line.horizontal {
  width: 100%;
  height: 1px;
  left: 0;
}

.grid-line.vertical {
  height: 100%;
  width: 1px;
  top: 0;
}

.grid-line.outer {
  background-color: #1f2937;
  height: 2px;
  width: 2px;
}

.grid-line.outer.horizontal {
  height: 2px;
}

.grid-line.outer.vertical {
  width: 2px;
}

.grid-row {
  display: contents;
}

.grid-cell {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 0;
  box-sizing: border-box;
  z-index: 1;
}

.grid-cell:hover {
  background-color: rgba(59, 130, 246, 0.05);
}

.cell-number {
  font-size: 22px;
  font-weight: 700;
  color: #1f2937;
  z-index: 2;
  user-select: none;
}

.rectangle {
  position: absolute;
  background-color: rgba(59, 130, 246, 0.2);
  border: 2px solid #3b82f6;
  border-radius: 4px;
  cursor: pointer;
  z-index: 3;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.rectangle:hover {
  background-color: rgba(59, 130, 246, 0.3);
  transform: scale(1.01);
}

.rectangle-number {
  font-size: 18px;
  font-weight: 700;
  color: #1e40af;
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.8);
  user-select: none;
}

.selection-preview {
  position: absolute;
  background-color: rgba(139, 92, 246, 0.15);
  border: 2px dashed #8b5cf6;
  border-radius: 4px;
  pointer-events: none;
  z-index: 4;
}

.game-status {
  text-align: center;
  padding: 14px;
  margin-top: 20px;
  border-radius: 8px;
  font-weight: 600;
  animation: fadeIn 0.3s ease;
  border: 1px solid transparent;
}

.game-status.success {
  background-color: #d1fae5;
  color: #065f46;
  border-color: #a7f3d0;
}

.game-status.error {
  background-color: #fee2e2;
  color: #991b1b;
  border-color: #fecaca;
}

.game-status.info {
  background-color: #dbeafe;
  color: #1e40af;
  border-color: #bfdbfe;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .shikaku-game {
    padding: 15px;
    margin: 10px;
  }

  .game-controls {
    flex-direction: column;
    gap: 12px;
  }

  .control-btn {
    width: 100%;
    max-width: 280px;
  }

  .game-info {
    width: 100%;
    justify-content: space-around;
    padding: 10px;
  }

  .game-info span {
    text-align: center;
    flex: 1;
  }
}

@media (max-width: 480px) {
  .shikaku-game {
    padding: 10px;
  }

  .control-btn {
    padding: 10px 20px;
    font-size: 14px;
  }

  .game-info {
    font-size: 13px;
  }

  .cell-number {
    font-size: 18px;
  }

  .rectangle-number {
    font-size: 16px;
  }
}

/* 起始点标记 */
.start-point-marker {
  position: absolute;
  width: 6px;
  height: 6px;
  background: #ef4444;
  border-radius: 50%;
  border: 2px solid white;
  transform: translate(-50%, -50%);
  pointer-events: none;
}
</style>