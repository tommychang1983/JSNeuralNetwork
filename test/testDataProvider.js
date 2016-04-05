"use strict";
/**
 * Created by changqi on 4/3/16.
 *
 * Usage:
 * 1. install Nodeunit: npm install nodeunit -g
 * 2. execute: nodeunit testDataProvider.js
 */
const DataProvider = require('../src/DataProvider.js');


exports.testDataProvider = function(test){

    let dataProvider = new DataProvider('digit');

    dataProvider.convertMatrixData(dataProvider.trainDataPath,function(resultMatrix){
        test.equal(resultMatrix.data.length,5014);
        test.equal(resultMatrix.data[0].length,560);
        test.done();
    });
};
exports.testPrepareAllMatrixData =  function(test){
    let dataProvider = new DataProvider('digit');

    dataProvider.prepareAllMatrixData(function(value){
        console.log(value);
        test.done();
    });

};

exports.testPrepareAllMatrixDataFace =  function(test){
    let dataProvider = new DataProvider('face');

    dataProvider.prepareAllMatrixData(function(value){
        console.log(value);
        test.done();
    });

}