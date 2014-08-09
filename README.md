# Genetic

Genetic is a [node.js](http://nodejs.org) implementation of genetic optimization algorithms. It's pretty asyncronous, so you can use it in your web applications without risking of blocking your application.

## Download

Releases are available for download from
[GitHub](https://github.com/dolphin278/genetic/downloads).
Alternatively, you can install using Node Package Manager (npm):

    npm install genetic

## How to use

For this example we will optimize parameters of function

    f(a,b,c) = a^2+b+c

which is pretty straightforward. We will try to find best values to maximize value of entire function - which, as you could easily see are a = 1, b = 1 and c = 1 with optimal function value equals to 3 (we assume that a, b and c belongs to interval [0,1)).

A possible set of (a,b,c) values we will call a 'solution'. 

*All solutions in genetic are treated as hash objects without function members.*

*Note: don't use field named `score` - it's reserved for internal use*

All code for the example could be found in 'test/mytest.js' file as a part of the package. Feel free to use it as a template for your solutions.

To use genetic you need to provide several functions specific to your problem, and pass them as members of `options` object used as an argument to `genetic.Task` class constructor.

### getRandomSolution(callback)

This function used by genetic to generate random solution.

__Arguments__

* callback(solution) - function to call when you create your random solution.

__Example__

For our example it could look like:

    function getRandomSolution(callback) {
      var solution = { a: Math.random(), b: Math.random(), c: Math.random() }
      callback(solution)
    }
    

### fitness(solution, callback)

One of the most important functions - it's responsible to calculate measure how good your solution is. For example, in [Travelling salesman problem](http://en.wikipedia.org/wiki/Travelling_salesman_problem) it's a total distance traveled.

*Note: calculated values must be non-negative*

__Arguments__

* solution - solution you must calculate fitness for
* callback(fitnessValue) - function to call when you calculated fitness function value

__Example__

For our example it could look like:

    function fitness(solution, callback) {
      callback(Math.pow(solution.a,2)+solution.b+solution.c)
    }

### mutate(solution, callback)

Function to mutate solution. Probability of mutation is defined by `mutateProbability` field of `options` object (see below).
Mutation is used to slightly alter one of your existing solution (mostly random) to provide diversity in you developing population.

*Note: It will be better, if you create a new solution object instead of modifying original, passed as argument* 

__Arguments__

* solution - existing solution to mutate
* callback(mutatedSolution) - function to call with you new mutated solution as argument

__Example__

For our example it randomly changes one of our solution field to random one. It also could be not modified at all, but it's not an issue for our example. For real problems you better to ensure that some changes will be made actually.

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

### crossover(parent1, parent2, callback)

A function for two parents reproduction - it should produce a new solution by mixing attributes of parents.

*Note: produce child as a new object, don't modify parents.*

__Arguments__

* parent1, parent2 - existing solutions to act as parents for new one
* callback(childSolution) - function to call with you new child solution as argument

__Example__

For our example it could look like:

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
    
### stopCriteria()

This is a *syncronous* function which determines how long genetic algorithm will work. During the process it will act as a 'until' criteria - so algorithm stops, when this function returns true.

*Note: this function will work in context of our `Task` (this = Task object), so you could refer to Task object fields to determine time to stop. You could inspect source code of '/lib/genetic/Task.js' to figure out possible data to determine your stopping condition on.*

__Example__

In our example we will just iterate our algorithm for limited number of times. Do write it, we use `Task` field named `generation` that acts like a counter for number of current generation. So, to run for 100 generations we will write it as follows:

    function stopCriteria() {
      return (this.generation == 100)
    }

Other options to stopping criterias is a time bounds, founding stable solutions, and other - you could look in the appropriate papers and books for ideas. I will try to implement some standard realizations you could use as part of the library to avoid writing this function each time manually.

## Task instantiation

Actual work starts when you prepare `options` object and pass it to `Task` class constructor. Let's examine `options` object structure:

     options = { getRandomSolution : getRandomSolution  // previously described to produce random solution
            , popSize : 500  // population size
            , stopCriteria : stopCriteria  // previously described to act as stopping criteria for entire process
            , fitness : fitness  // previously described to measure how good your solution is
            , minimize : false  // whether you want to minimize fitness function. default is `false`, so you can omit it
            , mutateProbability : 0.1  // mutation chance per single child generation
            , mutate : mutate  // previously described to implement mutation
            , crossoverProbability : 0.3 // crossover chance per single child generation
            , crossover : crossover // previously described to produce child solution by combining two parents
          }

Then you create instance of `Task` class:

    var Task = require('genetic').Task
      , taskInstance = new Task(options)

And invoke `run` method:

    t.run(function (stats) { console.log('results', stats)})

When the run completes you'll get best/worst solution on the event 'run finished' (see earlier) or as argument to callback function passed to 'run' method.

      { minScore: 0.011558832842334069,
        maxScore: 1.72994095208024,
        min: 
         { a: 0.034523882903158665,
           b: 0.0032279810402542353,
           c: 0.007138953311368823 },
        max: 
         { a: 0.8740309532731771,
           b: 0.922393745277077,
           c: 0.04361709952354431 },
        avg: 0.1829793990352273,
      }

The same object is passed with event 'statistics' emitted on each new generation iteration - so you can monitor how you process goes.

## Event model

Genetic implements sophisticated event model so you can control how your optimization process works. I will fill this chapter later. Meanwhile you could examine shipped sample - look in 'test/mytest.js' file.