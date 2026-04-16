<script setup lang="ts">
import { ref } from 'vue'

type Operator = '+' | '-' | '×' | '÷' | null

const display = ref('0')
const firstOperand = ref<number | null>(null)
const operator = ref<Operator>(null)
const waitingForSecondOperand = ref(false)

const clearAll = () => {
  display.value = '0'
  firstOperand.value = null
  operator.value = null
  waitingForSecondOperand.value = false
}

const inputDigit = (digit: string) => {
  if (waitingForSecondOperand.value) {
    display.value = digit
    waitingForSecondOperand.value = false
    return
  }

  display.value = display.value === '0' ? digit : `${display.value}${digit}`
}

const inputDecimal = () => {
  if (waitingForSecondOperand.value) {
    display.value = '0.'
    waitingForSecondOperand.value = false
    return
  }

  if (!display.value.includes('.')) {
    display.value += '.'
  }
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
    default:
      return right
  }
}

const handleOperator = (nextOperator: Exclude<Operator, null>) => {
  const inputValue = Number.parseFloat(display.value)

  if (operator.value && waitingForSecondOperand.value) {
    operator.value = nextOperator
    return
  }

  if (firstOperand.value === null) {
    firstOperand.value = inputValue
  } else if (operator.value) {
    const result = calculate(firstOperand.value, inputValue, operator.value)
    display.value = Number.isNaN(result) ? 'Ошибка' : `${parseFloat(result.toFixed(10))}`
    firstOperand.value = Number.isNaN(result) ? null : result
  }

  waitingForSecondOperand.value = true
  operator.value = nextOperator
}

const evaluate = () => {
  if (!operator.value || firstOperand.value === null) {
    return
  }

  const inputValue = Number.parseFloat(display.value)
  const result = calculate(firstOperand.value, inputValue, operator.value)

  display.value = Number.isNaN(result) ? 'Ошибка' : `${parseFloat(result.toFixed(10))}`
  firstOperand.value = Number.isNaN(result) ? null : result
  operator.value = null
  waitingForSecondOperand.value = true
}

const toggleSign = () => {
  if (display.value === '0' || display.value === 'Ошибка') {
    return
  }

  display.value = display.value.startsWith('-') ? display.value.slice(1) : `-${display.value}`
}

const percent = () => {
  if (display.value === 'Ошибка') {
    return
  }

  const value = Number.parseFloat(display.value) / 100
  display.value = `${parseFloat(value.toFixed(10))}`
}
</script>

<template>
  <main class="calculator-page">
    <section class="calculator" aria-label="Калькулятор">
      <p class="title">Калькулятор</p>
      <output class="display" aria-live="polite">{{ display }}</output>

      <div class="keys">
        <button class="key function" @click="clearAll">AC</button>
        <button class="key function" @click="toggleSign">+/-</button>
        <button class="key function" @click="percent">%</button>
        <button class="key operator" @click="handleOperator('÷')">÷</button>

        <button class="key" @click="inputDigit('7')">7</button>
        <button class="key" @click="inputDigit('8')">8</button>
        <button class="key" @click="inputDigit('9')">9</button>
        <button class="key operator" @click="handleOperator('×')">×</button>

        <button class="key" @click="inputDigit('4')">4</button>
        <button class="key" @click="inputDigit('5')">5</button>
        <button class="key" @click="inputDigit('6')">6</button>
        <button class="key operator" @click="handleOperator('-')">−</button>

        <button class="key" @click="inputDigit('1')">1</button>
        <button class="key" @click="inputDigit('2')">2</button>
        <button class="key" @click="inputDigit('3')">3</button>
        <button class="key operator" @click="handleOperator('+')">+</button>

        <button class="key zero" @click="inputDigit('0')">0</button>
        <button class="key" @click="inputDecimal">.</button>
        <button class="key operator" @click="evaluate">=</button>
      </div>
    </section>
  </main>
</template>

<style scoped>
.calculator-page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 1.5rem;
}

.calculator {
  width: min(100%, 360px);
  background: #0f172a;
  border-radius: 1.25rem;
  padding: 1rem;
  box-shadow: 0 20px 40px rgba(15, 23, 42, 0.35);
}

.title {
  margin: 0;
  color: #94a3b8;
  font-size: 0.9rem;
  letter-spacing: 0.04em;
}

.display {
  display: block;
  width: 100%;
  margin-top: 0.75rem;
  margin-bottom: 1rem;
  padding: 1rem;
  border-radius: 0.85rem;
  background: #020617;
  color: #f8fafc;
  text-align: right;
  font-size: clamp(2rem, 8vw, 2.75rem);
  font-weight: 700;
  min-height: 4.75rem;
  overflow: hidden;
  text-overflow: ellipsis;
}

.keys {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.6rem;
}

.key {
  border: 0;
  border-radius: 0.8rem;
  min-height: 3.25rem;
  font-size: 1.2rem;
  font-weight: 600;
  background: #1e293b;
  color: #e2e8f0;
  cursor: pointer;
}

.key:hover {
  filter: brightness(1.15);
}

.key:active {
  transform: scale(0.98);
}

.function {
  background: #334155;
}

.operator {
  background: #f59e0b;
  color: #0f172a;
}

.zero {
  grid-column: span 2;
}
</style>
