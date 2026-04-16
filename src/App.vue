<script setup lang="ts">
import { ref } from 'vue'

type Operator = '+' | '-' | '×' | '÷' | '^' | null
type AngleMode = 'DEG' | 'RAD'

const display = ref('0')
const firstOperand = ref<number | null>(null)
const operator = ref<Operator>(null)
const waitingForSecondOperand = ref(false)
const angleMode = ref<AngleMode>('DEG')
const memory = ref(0)
const history = ref<string[]>([])
const mouseX = ref(50)
const mouseY = ref(50)

const MAX_HISTORY_ITEMS = 6

const setDisplayValue = (value: number) => {
  if (!Number.isFinite(value)) {
    display.value = 'Ошибка'
    firstOperand.value = null
    operator.value = null
    waitingForSecondOperand.value = false
    return false
  }

  display.value = `${parseFloat(value.toFixed(10))}`
  return true
}

const readDisplayValue = () => Number.parseFloat(display.value)

const clearAll = () => {
  display.value = '0'
  firstOperand.value = null
  operator.value = null
  waitingForSecondOperand.value = false
}

const backspace = () => {
  if (waitingForSecondOperand.value || display.value === 'Ошибка') return
  if (display.value.length <= 1 || (display.value.length === 2 && display.value.startsWith('-'))) {
    display.value = '0'
    return
  }
  display.value = display.value.slice(0, -1)
}

const inputDigit = (digit: string) => {
  if (display.value === 'Ошибка') clearAll()

  if (waitingForSecondOperand.value) {
    display.value = digit
    waitingForSecondOperand.value = false
    return
  }

  display.value = display.value === '0' ? digit : `${display.value}${digit}`
}

const inputDecimal = () => {
  if (display.value === 'Ошибка') clearAll()

  if (waitingForSecondOperand.value) {
    display.value = '0.'
    waitingForSecondOperand.value = false
    return
  }

  if (!display.value.includes('.')) display.value += '.'
}

const calculate = (left: number, right: number, op: Exclude<Operator, null>) => {
  switch (op) {
    case '+':
      return left + right
    case '-':
      return left - right
    case '×':
      return left * right
    case '÷':
      return right === 0 ? Number.NaN : left / right
    case '^':
      return left ** right
    default:
      return right
  }
}

const pushHistory = (entry: string) => {
  history.value = [entry, ...history.value].slice(0, MAX_HISTORY_ITEMS)
}

const handleOperator = (nextOperator: Exclude<Operator, null>) => {
  const inputValue = readDisplayValue()

  if (operator.value && waitingForSecondOperand.value) {
    operator.value = nextOperator
    return
  }

  if (firstOperand.value === null) {
    firstOperand.value = inputValue
  } else if (operator.value) {
    const result = calculate(firstOperand.value, inputValue, operator.value)
    const expression = `${firstOperand.value} ${operator.value} ${inputValue}`

    if (setDisplayValue(result)) {
      pushHistory(`${expression} = ${display.value}`)
      firstOperand.value = result
    }
  }

  waitingForSecondOperand.value = true
  operator.value = nextOperator
}

const evaluate = () => {
  if (!operator.value || firstOperand.value === null) return

  const inputValue = readDisplayValue()
  const expression = `${firstOperand.value} ${operator.value} ${inputValue}`
  const result = calculate(firstOperand.value, inputValue, operator.value)

  if (setDisplayValue(result)) {
    pushHistory(`${expression} = ${display.value}`)
    firstOperand.value = result
    operator.value = null
    waitingForSecondOperand.value = true
  }
}

const toggleSign = () => {
  if (display.value === '0' || display.value === 'Ошибка') return
  display.value = display.value.startsWith('-') ? display.value.slice(1) : `-${display.value}`
}

const percent = () => {
  if (display.value === 'Ошибка') return
  setDisplayValue(readDisplayValue() / 100)
}

const toRadians = (value: number) => (angleMode.value === 'DEG' ? (value * Math.PI) / 180 : value)

const applyUnary = (label: string, fn: (value: number) => number) => {
  if (display.value === 'Ошибка') return

  const input = readDisplayValue()
  const result = fn(input)

  if (setDisplayValue(result)) {
    pushHistory(`${label}(${input}) = ${display.value}`)
    waitingForSecondOperand.value = true
  }
}

const applyConstant = (value: number, label: 'π' | 'e') => {
  display.value = `${parseFloat(value.toFixed(10))}`
  waitingForSecondOperand.value = false
  pushHistory(`${label} = ${display.value}`)
}

const reciprocal = () => applyUnary('1/x', (value) => 1 / value)
const square = () => applyUnary('x²', (value) => value ** 2)
const squareRoot = () => applyUnary('√x', (value) => Math.sqrt(value))
const naturalLog = () => applyUnary('ln', (value) => Math.log(value))
const decimalLog = () => applyUnary('log', (value) => Math.log10(value))
const exponential = () => applyUnary('exp', (value) => Math.exp(value))
const sine = () => applyUnary('sin', (value) => Math.sin(toRadians(value)))
const cosine = () => applyUnary('cos', (value) => Math.cos(toRadians(value)))
const tangent = () => applyUnary('tan', (value) => Math.tan(toRadians(value)))

const memoryAdd = () => {
  if (display.value === 'Ошибка') return
  memory.value += readDisplayValue()
}

const memorySubtract = () => {
  if (display.value === 'Ошибка') return
  memory.value -= readDisplayValue()
}

const memoryRecall = () => {
  display.value = `${parseFloat(memory.value.toFixed(10))}`
  waitingForSecondOperand.value = false
}

const memoryClear = () => {
  memory.value = 0
}

const toggleAngleMode = () => {
  angleMode.value = angleMode.value === 'DEG' ? 'RAD' : 'DEG'
}

const updatePointer = (event: PointerEvent) => {
  const target = event.currentTarget as HTMLElement | null
  if (!target) return

  const { left, top, width, height } = target.getBoundingClientRect()
  mouseX.value = ((event.clientX - left) / width) * 100
  mouseY.value = ((event.clientY - top) / height) * 100
}
</script>

<template>
  <main
    class="calculator-page"
    :style="{ '--mouse-x': `${mouseX}%`, '--mouse-y': `${mouseY}%` }"
    @pointermove="updatePointer"
  >
    <div class="bg-orb orb-1" aria-hidden="true" />
    <div class="bg-orb orb-2" aria-hidden="true" />
    <div class="bg-grid" aria-hidden="true" />

    <section class="calculator" aria-label="Инженерный калькулятор">
      <p class="title">Инженерный калькулятор</p>
      <div class="meta-row">
        <button class="meta-chip" @click="toggleAngleMode">{{ angleMode }}</button>
        <span class="memory-indicator">M: {{ parseFloat(memory.toFixed(4)) }}</span>
      </div>
      <output class="display" aria-live="polite">{{ display }}</output>

      <div class="engineering-keys">
        <button class="key function" @click="sine">sin</button>
        <button class="key function" @click="cosine">cos</button>
        <button class="key function" @click="tangent">tan</button>
        <button class="key function" @click="naturalLog">ln</button>
        <button class="key function" @click="decimalLog">log</button>

        <button class="key function" @click="squareRoot">√x</button>
        <button class="key function" @click="square">x²</button>
        <button class="key function" @click="reciprocal">1/x</button>
        <button class="key function" @click="exponential">exp</button>
        <button class="key function" @click="handleOperator('^')">xʸ</button>

        <button class="key function" @click="applyConstant(Math.PI, 'π')">π</button>
        <button class="key function" @click="applyConstant(Math.E, 'e')">e</button>
        <button class="key function" @click="memoryAdd">M+</button>
        <button class="key function" @click="memorySubtract">M-</button>
        <button class="key function" @click="memoryRecall">MR</button>
      </div>

      <div class="keys">
        <button class="key function" @click="clearAll">AC</button>
        <button class="key function" @click="memoryClear">MC</button>
        <button class="key function" @click="backspace">⌫</button>
        <button class="key function" @click="toggleSign">+/-</button>
        <button class="key operator" @click="handleOperator('÷')">÷</button>

        <button class="key" @click="inputDigit('7')">7</button>
        <button class="key" @click="inputDigit('8')">8</button>
        <button class="key" @click="inputDigit('9')">9</button>
        <button class="key function" @click="percent">%</button>
        <button class="key operator" @click="handleOperator('×')">×</button>

        <button class="key" @click="inputDigit('4')">4</button>
        <button class="key" @click="inputDigit('5')">5</button>
        <button class="key" @click="inputDigit('6')">6</button>
        <button class="key operator" @click="handleOperator('-')">−</button>
        <button class="key operator" @click="handleOperator('+')">+</button>

        <button class="key" @click="inputDigit('1')">1</button>
        <button class="key" @click="inputDigit('2')">2</button>
        <button class="key" @click="inputDigit('3')">3</button>
        <button class="key zero" @click="inputDigit('0')">0</button>
        <button class="key" @click="inputDecimal">.</button>

        <button class="key equals" @click="evaluate">=</button>
      </div>

      <aside class="history" aria-label="История вычислений">
        <p class="history-title">История</p>
        <p v-if="history.length === 0" class="history-empty">Пока пусто</p>
        <ul v-else>
          <li v-for="entry in history" :key="entry">{{ entry }}</li>
        </ul>
      </aside>
    </section>
  </main>
</template>

<style scoped>
.calculator-page {
  --mouse-x: 50%;
  --mouse-y: 50%;
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 1.5rem;
  position: relative;
  overflow: hidden;
  isolation: isolate;
}

.bg-orb {
  position: absolute;
  width: 28rem;
  height: 28rem;
  border-radius: 999px;
  filter: blur(26px);
  opacity: 0.55;
  z-index: -3;
  pointer-events: none;
}

.orb-1 {
  background: radial-gradient(circle at 30% 30%, #38bdf8, rgba(56, 189, 248, 0));
  animation: floatOrb 11s ease-in-out infinite alternate;
}

.orb-2 {
  background: radial-gradient(circle at 30% 30%, #8b5cf6, rgba(139, 92, 246, 0));
  animation: floatOrb 13s ease-in-out infinite alternate-reverse;
}

.bg-grid {
  position: absolute;
  inset: -40%;
  background:
    radial-gradient(circle at var(--mouse-x) var(--mouse-y), rgba(56, 189, 248, 0.2), rgba(2, 6, 23, 0) 35%),
    linear-gradient(rgba(148, 163, 184, 0.08) 1px, transparent 1px),
    linear-gradient(90deg, rgba(148, 163, 184, 0.08) 1px, transparent 1px);
  background-size: auto, 40px 40px, 40px 40px;
  transform: perspective(500px) rotateX(60deg) translateY(26%);
  z-index: -4;
  animation: pulseGrid 8s ease-in-out infinite;
}

.calculator {
  width: min(100%, 560px);
  backdrop-filter: blur(16px);
  background: rgba(15, 23, 42, 0.78);
  border: 1px solid rgba(148, 163, 184, 0.22);
  border-radius: 1.25rem;
  padding: 1rem;
  box-shadow:
    0 24px 40px rgba(15, 23, 42, 0.35),
    0 0 0 1px rgba(148, 163, 184, 0.1);
}

.title {
  margin: 0;
  color: #cbd5e1;
  font-size: 0.95rem;
  letter-spacing: 0.05em;
}

.meta-row {
  margin-top: 0.55rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.meta-chip {
  border: 1px solid rgba(148, 163, 184, 0.45);
  background: rgba(51, 65, 85, 0.5);
  color: #f8fafc;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.25rem 0.7rem;
  cursor: pointer;
}

.memory-indicator {
  color: #94a3b8;
  font-size: 0.8rem;
}

.display {
  display: block;
  width: 100%;
  margin-top: 0.75rem;
  margin-bottom: 1rem;
  padding: 1rem;
  border-radius: 0.85rem;
  background: rgba(2, 6, 23, 0.92);
  color: #f8fafc;
  text-align: right;
  font-size: clamp(1.8rem, 5vw, 2.5rem);
  font-weight: 700;
  min-height: 4.5rem;
  overflow: hidden;
  text-overflow: ellipsis;
}

.engineering-keys,
.keys {
  display: grid;
  gap: 0.55rem;
}

.engineering-keys {
  grid-template-columns: repeat(5, minmax(0, 1fr));
  margin-bottom: 0.65rem;
}

.keys {
  grid-template-columns: repeat(5, minmax(0, 1fr));
}

.key {
  border: 0;
  border-radius: 0.75rem;
  min-height: 3rem;
  font-size: 1rem;
  font-weight: 650;
  background: #1e293b;
  color: #e2e8f0;
  cursor: pointer;
  transition: transform 120ms ease, filter 120ms ease;
}

.key:hover {
  filter: brightness(1.15);
}

.key:active {
  transform: scale(0.97);
}

.function {
  background: #334155;
}

.operator,
.equals {
  background: linear-gradient(135deg, #f59e0b, #f97316);
  color: #0f172a;
}

.zero {
  grid-column: span 2;
}

.history {
  margin-top: 1rem;
  padding: 0.8rem;
  border-radius: 0.8rem;
  background: rgba(2, 6, 23, 0.65);
  border: 1px solid rgba(148, 163, 184, 0.2);
}

.history-title {
  margin: 0;
  color: #cbd5e1;
  font-weight: 600;
  font-size: 0.9rem;
}

.history-empty {
  margin: 0.5rem 0 0;
  color: #64748b;
}

.history ul {
  margin: 0.5rem 0 0;
  padding-left: 1rem;
  color: #e2e8f0;
  display: grid;
  gap: 0.35rem;
  font-size: 0.85rem;
}

@keyframes floatOrb {
  from {
    transform: translate(-36vw, -28vh) scale(0.95);
  }
  to {
    transform: translate(34vw, 20vh) scale(1.1);
  }
}

@keyframes pulseGrid {
  0%,
  100% {
    opacity: 0.65;
  }
  50% {
    opacity: 1;
  }
}

@media (max-width: 640px) {
  .calculator {
    width: min(100%, 440px);
  }

  .engineering-keys,
  .keys {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  .zero {
    grid-column: span 1;
  }
}
</style>
