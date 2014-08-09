var Task = require('../lib').Task
  , options = { getRandomSolution : getRandomSolution
              , popSize : 500
              , stopCriteria : stopCriteria
              , fitness : fitness
              , minimize : false
              , mutateProbability : 0.1
              , mutate : mutate
              , crossoverProbability : 0.3
              , crossover : crossover
              }
  , util = require('util')

function crossover(parent1, parent2, callback) {
  var child = {}
  if (Math.random()>0.5) {
    child.a = parent1.a    
  }
  else {
    child.a = parent2.a
  }
  if (Math.random()>0.5) {
    child.b = parent1.b
  }
  else {
    child.b = parent2.b
  }
  if (Math.random()>0.5) {
    child.c = parent1.c
  }
  else {
    child.c = parent2.c
  }
  callback(child)
}

function mutate(solution, callback) {
  if (Math.random()<0.3) {
    solution.a = Math.random()
  }
  if (Math.random()<0.3) {
    solution.b = Math.random()
  }
  if (Math.random()<0.3) {
    solution.c = Math.random()
  }
  callback(solution)
}

function getRandomSolution(callback) {
  var solution = { a: Math.random(), b: Math.random(), c: Math.random() }
  callback(solution)
}

function stopCriteria() {
  return (this.generation == 1000)
}

function fitness(solution, callback) {
  callback(Math.pow(solution.a,2)+solution.b+solution.c)
}

console.log('=== TEST BEGINS === ')
var
  t = new Task(options)
// t.on('run start', function () { console.log('run start'); util.log('run') })
// t.on('run finished', function (results) { console.log('run finished - ', results); util.log('run')})
// t.on('init start', function () { console.log('init start') })
// t.on('init end', function (pop) { console.log('init end', pop) })
// t.on('loop start', function () { console.log('loop start') })
// t.on('loop end', function () { console.log('loop end') })
// t.on('iteration start', function (generation) { console.log('iteration start - ',generation) })
// t.on('iteration end', function () { console.log('iteration end') })
// t.on('calcFitness start', function () { console.log('calcFitness start') })
// t.on('calcFitness end', function (pop) { console.log('calcFitness end', pop) })
// t.on('parent selection start', function () { console.log('parent selection start') })
// t.on('parent selection end', function (parents) { console.log('parent selection end ',parents) })
// t.on('reproduction start', function () { console.log('reproduction start') })
// 
// t.on('find sum', function () { console.log('find sum') })
// t.on('find sum end', function (sum) { console.log('find sum end', sum) })

// t.on('statistics', function (statistics) { console.log('statistics',statistics)})
// 
// t.on('normalize start', function () { console.log('normalize start') })
// t.on('normalize end', function (normalized) { console.log('normalize end',normalized) })
// t.on('child forming start', function () { console.log('child forming start') })
// t.on('child forming end', function (children) { console.log('child forming end',children) })
// t.on('child selection start', function () { console.log('child selection start') })
// t.on('child selection end', function (population) { console.log('child selection end',population) })
// 
// t.on('mutate', function () { console.log('MUTATION!') })
// 
// 
// t.on('reproduction end', function (children) { console.log('reproduction end',children) })
// 
t.on('error', function (error) { console.log('ERROR - ', error) })
t.run(function (stats) { console.log('results', stats)})


