/**
 * Created by DarkRider on 15.09.2014.
 */

var sinon = require("sinon");
var assert = require("assert");
var Task = require("../lib").Task;

describe("Test stopCriteria call order", function () {
    describe("Check first call", function () {
        var task;
        var i = 10;
        var res;

        var opts = {
            popSize: 1,
            stopCriteria: sinon.stub(),
            getRandomSolution: sinon.stub(),
            mutateProbability: 0,
            mutate: sinon.stub(),
            fitness: sinon.stub(),
            crossoverProbability: 1,
            crossover: sinon.stub()
        };
        opts.getRandomSolution.yields({x: 1});
        opts.mutate.yields({x: 0});
        opts.fitness.yields(++i);
        opts.crossover.yields({x: 2});
        opts.stopCriteria.returns(true);

        before(function (done) {
            task = new Task(opts);
            task.run(function (result) {
                res = result;
                done();
            });
        });

        it("Should call getRandomSolution once", function () {
            assert(opts.getRandomSolution.calledOnce);
        });

        it("Should not call crossover", function () {
            assert(!opts.crossover.called);
        });

        it("Should call fitness once", function () {
            assert(opts.fitness.calledOnce);
        });

        it("Should call stopCriteria once", function () {
            assert(opts.stopCriteria.calledOnce);
        });

        it("Should call stopCriteria first time on generation 0", function(){
            assert.equal(opts.stopCriteria.firstCall.thisValue.generation, 0);
        });

        it("Should call stopCriteria first time on object where statistics exists", function(){
            assert(opts.stopCriteria.firstCall.thisValue.statistics);
        });

        it("Should call stopCriteria first time on object with right statistics.max", function(){
            assert.equal(opts.stopCriteria.firstCall.thisValue.statistics.max.x, 1);
        });

        it("Should call stopCriteria first time on object with right statistics.maxScore", function(){
            assert.equal(opts.stopCriteria.firstCall.thisValue.statistics.maxScore, 11);
        });

        it("Should call stopCriteria first time on object with right statistics.min", function(){
            assert.equal(opts.stopCriteria.firstCall.thisValue.statistics.min.x, 1);
        });

        it("Should call stopCriteria first time on object with right statistics.minScore", function(){
            assert.equal(opts.stopCriteria.firstCall.thisValue.statistics.minScore, 11);
        });

        it("Should find max", function() {
            assert.equal(res.max.x, 1);
        });

        it("Should find maxScore", function() {
            assert.equal(res.maxScore, 11);
        });

        it("Should find min", function() {
            assert.equal(res.min.x, 1);
        });

        it("Should find minScore", function() {
            assert.equal(res.minScore, 11);
        });
    });

    describe("Check second call", function () {
        var task;
        var i = 10;
        var res;

        var opts = {
            popSize: 1,
            stopCriteria: sinon.stub(),
            getRandomSolution: sinon.stub(),
            mutateProbability: 0,
            mutate: sinon.stub(),
            fitness: sinon.stub(),
            crossoverProbability: 1,
            crossover: sinon.stub()
        };
        opts.getRandomSolution.yields({x: 1});
        opts.mutate.yields({x: 0});
        opts.fitness.onFirstCall().yields(++i);
        opts.fitness.onSecondCall().yields(++i);
        opts.crossover.yields({x: 2});
        opts.stopCriteria.onFirstCall().returns(false);
        opts.stopCriteria.onSecondCall().returns(true);

        before(function (done) {
            task = new Task(opts);
            task.run(function (result) {
                res = result;
                done();
            });
        });

        it("Should call getRandomSolution once", function () {
            assert(opts.getRandomSolution.calledOnce);
        });

        it("Should call crossover once", function () {
            assert(opts.crossover.calledOnce);
        });

        it("Should call fitness twice one for every of two generations", function () {
            assert(opts.fitness.calledTwice);
        });

        it("Should call stopCriteria twice one for every of two generations", function () {
            assert(opts.stopCriteria.calledTwice);
        });

        it("Should call stopCriteria second time on generation 1", function(){
            assert.equal(opts.stopCriteria.secondCall.thisValue.generation, 1);
        });

        it("Should call stopCriteria second time on object where statistics exists", function(){
            assert(opts.stopCriteria.secondCall.thisValue.statistics);
        });

        it("Should call stopCriteria second time on object with right statistics.max", function(){
            assert.equal(opts.stopCriteria.secondCall.thisValue.statistics.max.x, 2);
        });

        it("Should call stopCriteria second time on object with right statistics.maxScore", function(){
            assert.equal(opts.stopCriteria.secondCall.thisValue.statistics.maxScore, 12);
        });

        it("Should call stopCriteria second time on object with right statistics.min", function(){
            assert.equal(opts.stopCriteria.secondCall.thisValue.statistics.min.x, 2);
        });

        it("Should call stopCriteria second time on object with right statistics.minScore", function(){
            assert.equal(opts.stopCriteria.secondCall.thisValue.statistics.minScore, 12);
        });

        it("Should find max", function() {
            assert.equal(res.max.x, 2);
        });

        it("Should find max score", function() {
            assert.equal(res.maxScore, 12);
        });

        it("Should find min", function() {
            assert.equal(res.min.x, 1);
        });

        it("Should find minScore", function() {
            console.log(res);
            assert.equal(res.minScore, 11);
        });
    });

});