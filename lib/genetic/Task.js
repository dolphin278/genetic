var async = require('async');
var EventEmitter = require('events').EventEmitter;
    
function Task(options) {
    this.generation = 0;
    this.popSize = options.popSize || 10;
    this.stopCriteria = options.stopCriteria;
    this.getRandomSolution = options.getRandomSolution;
    this.mutateProbability = options.mutateProbability;
    this.mutate = options.mutate;
    this.fitness = options.fitness;
    this.crossoverProbability = options.crossoverProbability;
    this.crossover = options.crossover;
    this.minimize = !!options.minimize;
}

Task.prototype = new EventEmitter();

Task.prototype.run = function (callback) {
    var self = this;
    self.population = [];
    this.emit('run start');
    async.series(
        [
            function (cb) { self.init(cb); },
            function (cb) { self.calcFitness(cb); },
            function (cb) { self.calcStatistics(cb) },
            function (cb) { self.loop(cb); }
        ],
        function (err) {
            if (err != null) {
                self.emit('error', err);
            }
            else {
                if (typeof(callback) == "function") {
                    callback(self.globalStatistics);
                }
                self.emit('run finished', self.globalStatistics);
            }
        }
    );
};

Task.prototype.init = function (callback) {
    var self = this;
    self.emit('init start');
    async.until(function () {
        return (self.population.length == self.popSize);
    }, function (callback) {
        self.getRandomSolution(function (solution) {
            self.population.push(solution);
            callback();
        });
    }, function (err) {
        if (err != null) {
            self.emit('error', err);
        }
        else {
            self.emit('init end', self.population);
            callback();
        }
    });
};

Task.prototype.loop = function (callback) {
    var self = this;
    self.emit('loop start');
    async.until(function () {
        return self.stopCriteria();
    }, function (cb) {
        self.iteration(function () {
            setImmediate(cb);
        });
    }, function (err) {
        if (err != null) {
            self.emit('error', err);
        }
        else {
            self.emit('loop end');
            callback();
        }
    });
};

Task.prototype.iteration = function (callback) {
    var self = this;
    ++self.generation;
    self.emit('iteration start', self.generation);
    async.series(
        [
            function (cb) { self.parentSelection(cb) },
            function (cb) { self.reproduction(cb) },
            function (cb) { self.childSelection(cb) },
            function (cb) { self.calcFitness(cb) },
            function (cb) { self.calcStatistics(cb) }
        ],
        function (err) {
            if (err != null) {
                self.emit('error', err);
            }
            else {
                self.emit('iteration end');
                callback();
            }
        }
    );
};

Task.prototype.calcFitness = function (callback) {
    var self = this;
    self.emit('calcFitness start');
    async.forEach(
        self.population,
        function (item, cb) {
            self.fitness(item, function (fitnessValue) {
                item.score = fitnessValue;
                cb();
            })
        },
        function (err) {
            if (err != null) {
                self.emit('error', err);
            }
            else {
                self.emit('calcFitness end', self.population);
                callback();
            }
        }
    );
};

Task.prototype.parentSelection = function (callback) {
    var self = this;
    self.emit('parent selection start');
    self.parents = [];
    async.forEach(
        self.population,
        function (item, callback) {
            self.parents.push(item);
            callback();
        },
        function (err) {
            if (err != null) {
                self.emit('error', err);
            }
            else {
                self.emit('parent selection end', self.parents);
                callback();
            }

        }
    );
};

Task.prototype.calcStatistics = function (callback) {
    // find abs(max) score
    var self = this;
    var max;
    var min;
    var sum = 0;
    self.emit('find sum');
    async.forEach(
        self.population,
        function (item, cb) {
            if (typeof(max) == "undefined") { max = item; }
            if (typeof(min) == "undefined") { min = item; }
            sum += item.score;
            if (item.score > max.score) { max = item; }
            if (item.score < min.score) { min = item; }
            cb();
        },
        function (err) {
            if (err != null) {
                self.emit('error', err);
            }
            else {
                self.statistics = {
                    minScore: min.score,
                    maxScore: max.score,
                    min: min,
                    max: max,
                    avg: sum / self.popSize,
                    sum: sum
                };
                if (self.globalStatistics == undefined) {
                    self.globalStatistics = self.statistics;
                } else {
                    if (self.globalStatistics.maxScore < max.score) {
                        self.globalStatistics.maxScore = max.score;
                        self.globalStatistics.max = max;
                    }
                    if (self.globalStatistics.minScore > min.score) {
                        self.globalStatistics.minScore = min.score;
                        self.globalStatistics.min = min;
                    }
                }
                self.emit('statistics', self.statistics);
                self.emit('find sum end', sum);
                callback();
            }
        }
    );
};

Task.prototype.reproduction = function (callback) {
    var self = this;
    self.emit('reproduction start');
    self.children = [];
    async.series(
        [
            function (callback) {
                // invert scores, if we minimize fitness
                var maxScore = Math.abs(self.statistics.maxScore);
                if (self.minimize) {
                    async.forEach(self.parents, function (item, cb) {
                        item.score *= -1;
                        item.score += maxScore;
                        setImmediate(function () { cb(); });
                    }, function (err) {
                        if (err != null) {
                            self.emit('error', err)
                        }
                    });
                }
                callback();
            },
            function (callback) {
                self.emit('child forming start');
                // transfer parent to children accordingly to normalized fitness
                async.until(
                    function () {
                        return (self.children.length == self.popSize);
                    },
                    function (cb) {
                        var point = Math.random() * self.statistics.sum;
                        var position = 0;
                        var level = self.parents[position].score;
                        var secondParent, secondParentPosition;
                        while (point > level) {
                            position++;
                            level += self.parents[position].score;
                        }
                        secondParentPosition = position;
                        secondParent = self.parents[secondParentPosition];
                        if (Math.random() < self.crossoverProbability) {
                            self.emit('crossover');
                            secondParentPosition = Math.floor(Math.random() * self.parents.length);
                            secondParent = self.parents[secondParentPosition];
                        }
                        self.crossover(self.parents[position], secondParent, function (child) {
                            if (Math.random() < self.mutateProbability) {
                                self.emit('mutate');
                                self.mutate(child, function (child) {
                                    self.children.push(child);
                                    cb();
                                })
                            }
                            else {
                                self.children.push(child);
                                cb();
                            }
                        })
                    },
                    function (err) {
                        if (err != null) {
                            self.emit('error', err);
                        }
                        else {
                            self.emit('child forming end', self.children);
                            callback();
                        }
                    }
                );
            }
        ],
        function (err) {
            if (err != null) {
                self.emit('error', err);
            }
            else {
                self.emit('reproduction end', self.children);
                callback();
            }
        }
    );
};

Task.prototype.childSelection = function (callback) {
    var self = this;
    self.emit('child selection start');
    self.population = [];
    async.forEach(self.children, function (item, callback) {
        self.population.push(item);
        callback();
    }, function (err) {
        if (err != null) {
            self.emit('error', err);
        }
        else {
            self.emit('child selection end', self.population);
            callback();
        }
    });
};

module.exports = Task;