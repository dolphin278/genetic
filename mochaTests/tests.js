/**
 * Created by DarkRider on 07.09.2014.
 */

var sinon = require("sinon");
var assert = require("assert");
var Task = require("../lib").Task;

describe("Test run", function () {
    describe("Main scenario", function () {
        var task = new Task({});
        var result, emitedResults;
        var testdata = "testdata";

        before(function (done) {
            task.globalStatistics = testdata;
            task.init = sinon.stub();
            task.init.yields();
            task.loop = sinon.stub();
            task.loop.yields();
            task.calcFitness = sinon.stub();
            task.calcFitness.yields();
            task.calcStatistics = sinon.stub();
            task.calcStatistics.yields();
            task.on("run finished", function(res) {
                emitedResults = res;
            });
            task.run(function (res) {
                result = res;
                done();
            });
        });

        it("Should call init once", function (){
            assert(task.init.calledOnce);
        });
        it("Should call loop once", function (){
            assert(task.loop.calledOnce);
        });
        it("Should call calcFitness after init", function () {
            assert(task.calcFitness.calledAfter(task.init));
        });
        it("Should call calcStatistics after calcFitness", function () {
            assert(task.calcStatistics.calledAfter(task.calcFitness));
        });
        it("Should call loop called after calcStatistics", function (){
            assert(task.loop.calledAfter(task.calcStatistics));
        });
        it("Should call cb with result", function () {
            assert.equal(result, testdata);
        });
        it("Should emit result", function () {
            assert.equal(emitedResults, testdata);
        });
    });
});

describe("test init", function () {
    describe("Main scenario", function () {
        var testData = "Test data";
        var opts = {
            popSize: 10,
            getRandomSolution: sinon.stub()
        };
        var task;
        var result;

        before(function(done){
            task = new Task(opts);
            task.population = [];
            opts.getRandomSolution.yields(testData);
            task.on('init end', function (data) {
                result = data;
            });
            task.init(done);
        });

        it("Should generate popSize solutions", function(){
            assert.equal(task.population.length, opts.popSize);
        });

        it("Should generate solutions with test data", function(){
            task.population.map(function(solution) {
                assert.equal(solution, testData);
            });
        });

        it("Should emit solutions", function () {
            assert.equal(result, task.population);
        });
    });
    // TODO Look for variant with generator throwing error every time. It will cause indefinite loop.
});