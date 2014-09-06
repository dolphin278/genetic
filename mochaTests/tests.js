/**
 * Created by DarkRider on 07.09.2014.
 */

var sinon = require("sinon");
var assert = require("assert");
var Task = require("../lib").Task;

describe("test init", function () {
    describe("Main scenario", function () {
        var testData = "Test data";
        var opts = {
            popSize: 10,
            getRandomSolution: sinon.stub()
        };
        var task;

        before(function(done){
            task = new Task(opts);
            task.population = [];
            opts.getRandomSolution.yields(testData);
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
    });
});