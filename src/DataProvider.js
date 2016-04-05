"use strict";
/**
 * Created by changqi on 4/3/16.
 * Filter Data and get back batched dataset.
 */
const fs = require('fs');
const readline = require('readline');
var linearAlgebra = require('linear-algebra')(),     // initialise it
    Vector = linearAlgebra.Vector,
    Matrix = linearAlgebra.Matrix;


const DATA_PATH = __dirname + "/../data/data/";
const config = {
    'digit':{
        imgHeight :20,
        imgWidth :28
    },
    'face':{
        imgHeight : 68,
        imgWidth : 60
    }
}

module.exports = class DataProvider{

    constructor(type){
        this.type = type = type.toLowerCase();
        if(type != 'digit' && type != 'face') throw Exception('Unsupport Data Type.(Not face or digit)');
        this.trainDataPath = DATA_PATH + `${type}data/${type}datatrain`;
        this.trainLabelsPath = DATA_PATH + `${type}data/${type}datatrainlabels`;;
        this.validateDataPath = DATA_PATH + `${type}data/${type}datavalidation`;
        this.validateLabelsPath = DATA_PATH + `${type}data/${type}datavalidationlabels`;
        this.testDataPath = DATA_PATH + `${type}data/${type}datatest`;
        this.testLabelsPath = DATA_PATH + `${type}data/${type}datatestlabels`;

    }

    prepareAllMatrixData(callback){

        this.trainDataset = {
            data : null,
            label : null
        };
        this.validateDataset = {
            data:null,
            label : null
        };
        this.testDataset = {
            data : null,
            label : null
        };

        let self = this;

        let p1 = new Promise(function(resolve,reject){
            self.convertMatrixData(self.trainDataPath,function(resultMatrix){
                self.trainDataset.data = resultMatrix;
                resolve();
            });
        });
        let p2 = new Promise(function(resolve,reject){
            self.convertMatrixData(self.validateDataPath,function(resultMatrix){
                self.validateDataset.data = resultMatrix;
                resolve();
            });
        });
        let p3 = new Promise(function(resolve,reject){
            self.convertMatrixData(self.testDataPath,function(resultMatrix){
                self.testDataset.data = resultMatrix;
                resolve();
            });
        });
        let p4 = new Promise(function(resolve,reject){
            self.convertMatrixLabel(self.trainLabelsPath,function(resultMatrix){
                self.trainDataset.label = resultMatrix;
                resolve();
            })
        });
        let p5 = new Promise(function(resolve,reject){
            self.convertMatrixLabel(self.validateLabelsPath,function(resultMatrix){
                self.validateDataset.label = resultMatrix;
                resolve();
            })
        });
        let p6 = new Promise(function(resolve,reject){
            self.convertMatrixLabel(self.testLabelsPath,function(resultMatrix){
                self.testDataset.label = resultMatrix;
                resolve();
            })
        });

        Promise.all([p1,p2,p3,p4,p5,p6]).then(function(value){
            callback(self);
        })

    }
    convertMatrixLabel(filePath,callback){

        let args = config[this.type];
        const rl = readline.createInterface({
            input: fs.createReadStream(filePath)
        });

        let isNewCase = true;
        let testcase = [];
        let testcasesMatrix = null;
        let self = this;
        rl.on('line', (line) => {
            if(line.trim() != ''){
                testcase.push(parseInt(line));
            }
        }).on('close',function(){
            testcasesMatrix = new Matrix(testcase).trans();
            console.info('===>finished all labels: '+testcase.length+", type:"+self.type+', filePath'+filePath+'\n');
            callback(testcasesMatrix);
        });

    }


    convertMatrixData(filePath,callback){
        let args = config[this.type];
        const rl = readline.createInterface({

            input: fs.createReadStream(filePath)
        });

        let isNewCase = true;
        let testcase = [];
        let testcasesArr = [];
        let testcasesMatrix = null;
        var index = 0;
        let self = this;
        rl.on('line', (line) => {
            if(line.trim() == ''){
                //blank row.
                isNewCase = true;
                if(testcase.length !=0){
                    if(testcase.length < args.imgHeight){
                        let zeros = args.imgHeight - testcase.length;
                        let addArr = Matrix.zero(zeros,args.imgWidth);
                        for(let i=0,len=addArr.data.length;i<len;i++){
                            testcase.push(addArr.data[i]);
                        }
                    }

                    // console.log(`idx: ${index++} and testcase length: ${testcase.length}`);
                    //end of the test case, so store into matrix
                    let oneDimensionArr = [];
                    for(let i =0,len=testcase.length;i<len;i++){
                        oneDimensionArr = oneDimensionArr.concat(testcase[i]);
                    }
                    testcasesArr.push(oneDimensionArr);
                    // console.info('===>finish one test case with length:'+oneDimensionArr.length);
                    testcase = [];
                }
            }else{
                // initial new test case array.
                testcase.push(this._parseDataLine(line));
                isNewCase = false;
            }

        }).on('close',function(){
            testcasesMatrix = new Matrix(testcasesArr);
            console.info('===>finished all cases: '+testcasesArr.length+"x"+testcasesArr[0].length+", type:"+self.type+', filePath'+filePath+'\n');
            callback(testcasesMatrix);
        });


    }

    /**
     * Parse space,#,+ into integer code.
     * @param line
     * @private
     */
    _parseDataLine(line){
        line = line.replace(/#/g,1).replace(/\+/g,2).replace(/\s/g,0).split('');
        return line;
    }


}

