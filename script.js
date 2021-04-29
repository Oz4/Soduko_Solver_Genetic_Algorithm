    "use strict";
    //genetic algorithm
    let List = [0,0,6,0,0,0,0,0,0,  
                0,8,0,0,5,4,2,0,0,  
                0,4,0,0,9,0,0,7,0,
                0,0,7,9,0,0,3,0,0,  
                0,0,0,0,8,0,4,0,0,  
                6,0,0,0,0,0,1,0,0,  
                2,0,3,0,0,0,0,0,1,  
                0,0,0,5,0,0,0,4,0,
                0,0,8,3,0,0,5,0,2];

    let initialSudokuList = [];
    let populationSize = 500;
    let mutateRate = 3;//between 1 and 10 for the best result the higher the more random the outcome is
    let bestOrderEver;
    let generationCount = 0;
    function SudokuCell(value){
        this.value = value;
        this.staticCell = false;
        this.editable = true;
    }
    //--------
    {
        //Converting soduko List to Object
        let k = 0;
        for (let i = 0; i < 9; i++) {
            initialSudokuList[i] = [];
            for (let j = 0; j < 9; j++) {
                initialSudokuList[i].push(new SudokuCell(List[k]));
                if(List[k] != 0) {initialSudokuList[i][j].editable = false; initialSudokuList[i][j].staticCell = true;}
                k++;
            }
        }
        createTable(initialSudokuList,"initialTable");
       
    }
    {
        function contains(list,num){
            for (let i = 0; i < 9; i++) {
                if(list[i].value == num){ 
                    return true;}
            }
            return false;
        }

        function generateRandomRow(list){
            let row = list.slice();//copy the list
            for (let i = 0; i < 9; i++) {
                if(row[i].editable == true){
                    let randomNum = Math.floor(Math.random() * 9) + 1;
                    while(contains(row,randomNum)){
                        randomNum = Math.floor(Math.random() * 9) + 1;
                    }
                    row[i].value = randomNum;
                }
            }
            return row;
        }
        for (let i = 0; i < 9; i++) {
            initialSudokuList[i] = generateRandomRow(initialSudokuList[i]);
        }
    }
    //--------
    let parentA,parentB,child;
    function Population(object){

        this.object = object;
        this.newGeneration = function(){
            generationCount++;
            let newPopulation = [];
            for(let i = 0 ; i < this.object.length ; i++){
                parentA = probPicker(this.object.slice());
                parentB = probPicker(this.object.slice());
                child  = crossOver(parentA,parentB);    
                for (let j = 0; j < Math.floor(Math.random() *3); j++) {
                    child.mutate(Math.floor(Math.random() * (mutateRate)));
                }
                newPopulation.push(child);
            }        
            this.object = newPopulation;
        }
        this.calculateFitness = function(){//calculate all the new generation fitnesses
            for (let i = 0; i <  this.object.length; i++) {
                this.object[i].calculateDnaFitness();
            }
        }
        this.normalizeFitness = function(){//find the probabilty of each DNA the fitter the higher probability it has
            let sum = 0;
            for(let i = 0 ; i < this.object.length ; i++){
                sum += this.object[i].fitnessInverted;
            }
            for(let i = 0 ; i < this.object.length ; i++){
                this.object[i].probapility += this.object[i].fitnessInverted / sum;
                
            }
        }

    }

    function DNA(list){
        this.newList = list.slice();
        this.fitness = 0;
        this.fitnessInverted = 0;
        this.probapility = 0;
        this.shuffle = function(){
            for(let k = 0 ; k < 9 ; k++){
                var j, x, i;
                for (i = 9 - 1; i > 0; i--) {
                    j = Math.floor(Math.random() * (i + 1));
                    if(this.newList[k][i].editable && this.newList[k][j].editable){
                        x = this.newList[k][i];
                        this.newList[k][i] = this.newList[k][j];
                        this.newList[k][j] = x;
                    }
                }  
            }      
        }
        //HERE i find how many duplicates in a colomn in the first loop, and the second loop finds how many duplicates in a box (3x3 area of the sudoku)
        this.calculateDnaFitness = function(){
            this.fitness = 0;
            for (let i = 0; i < 9; i++) {
                for (let j = 0; j < 9; j++) {
                    if(findDuplicatesInCol(j,this.newList,i)){
                        this.fitness++;
                    }
                }
            }
            for (let row = 0; row < 3 ; row ++ ) {
                for (let col = 0; col < 3 ; col ++ ) {                    
                    for (let i = 0; i < 3 ;  i++ ) {
                        for (let j = 0; j < 3 ; j ++ ) {
                            if(findDuplicatesInBox(row,col,this.newList[row * 3 + i][col * 3 + j].value,this.newList ,i ,j )){
                                this.fitness++;
                            }
                        }
                    } 
                }
            }
            this.fitnessInverted = 1 / this.fitness;
        }
        //pick a random row and 2 random colomns in the same row,then swap them,can happen many times based on the mutation rate
        this.mutate = function(mutationRate){
            for(let t = 0 ; t < mutationRate ; t ++){
                let k = Math.floor(Math.random() * (8));
                let j, x, i;
                i = Math.floor(Math.random() * (8));
                let endpoint = Math.floor(Math.random() * (8));
                j = (i + endpoint ) % 9;
                if(this.newList[k][i].editable && this.newList[k][j].editable ){
                    x = this.newList[k][i];
                    this.newList[k][i] = this.newList[k][j];
                    this.newList[k][j] = x;
                }
            }
        } 
    }
    // create the first initial population with random shuffled DNAs
    let temppopulation = [];
    for(let i = 0 ; i < populationSize ; i ++){
        let initList = initialSudokuList.map(inner => inner.slice());
        let newDna = new DNA(initList);
        newDna.shuffle();
        temppopulation.push(newDna);
    }
    // create the main population,
    let population = new Population(temppopulation);
    bestOrderEver = population.object[0];
    createTable(population.object[0].newList,"finalTable");
    let scoreid = document.createElement("span");
    scoreid.id = "score";
    let  tablefinal = document.getElementById("finalTable");
    tablefinal.append(scoreid);

    render();
    // in render function the population will advance every iteration 
    function render() {
        
        population.calculateFitness();
        population.normalizeFitness();
        population.newGeneration();// here i have mutation and crossOver
        
        let bestIndex = findBestFit(population.object)[1];
        console.log("Best fitness Score : "+bestOrderEver.fitness + " Duplicates");
        alterTABLE(bestOrderEver.newList,bestOrderEver.fitness);

        if(population.object[bestIndex].fitness == 0 ) return 0;
         window.requestAnimationFrame(render);
    };

    function createTable(list,id){
        let body = document.getElementsByTagName("body")[0];
        let table = document.createElement("TABLE");
        table.id = id;
        table.className += "paleBlueRows";
        let tableBody = document.createElement("TBODY");
        table.appendChild(tableBody);
        for (let i = 0; i < 9; i++) {
            let tr = document.createElement("TR");
            tableBody.appendChild(tr);
            for (let j = 0; j < 9; j++) {
                let td = document.createElement("TD");
                tr.appendChild(td);
                if(list[i][j].value != 0)
                    td.innerHTML = list[i][j].value;
            }    
        }
        body.appendChild(table);   
        let br = document.createElement("br");
        body.appendChild(br);
    }
    function alterTABLE(list,score){
        var table = document.getElementById("finalTable");
        for (var i = 0, row; row = table.rows[i]; i++) {
            for (var j = 0, col; col = row.cells[j]; j++) {
                if(list[i][j].editable)
                    row.cells[j].innerHTML = list[i][j].value;
            }  
        }
        scoreid.innerHTML = "Best fitness score : " + score + " Duplicates"
    }
    function findDuplicatesInCol(index,list,col){
        for(let i = 0 ; i < 9 ; i ++){
            if(list[index][col].value == list[i][col].value && index != i){
                return true;
            }
        }
        return false;
    }
    function findDuplicatesInBox(row , col , value,list , a, b){        
        for (let i = 0; i < 3 ;  i++ ) {
            for (let j = 0; j < 3 ; j ++ ) {
                if(list[row * 3 + i][col * 3 + j].value == value && (a != i || b != j)){
                    return true;
                }
            }
        } 
        return false;    
        
    }
    //this is a probability picker the better the fitness of a DNA the more often it will be picked (this is not the lucky wheel approach rather a basket that is full of items approach as it worked better)
    function probPicker(list){
        let index = 0;
        let random = Math.random();
        while (random > 0) {
            random = random - list[index].probapility;
            index++;
        }
        
        index--; 
        return list[index];
    }
    function findBestFit(list){
        let min = Infinity;
        let index = Infinity;
        for(let i = 0 ; i < list.length ; i++){
            if(list[i].fitness < min){
                min = list[i].fitness;
                index = i;
            }
        }
        if(bestOrderEver.fitness > list[index].fitness) {            
            bestOrderEver.fitness = list[index].fitness;
             bestOrderEver.newList = list[index].newList.map(inner => inner.slice());
        };
        return [min,index];
    }
    function crossOver(parentAcopy , parentBcopy){

        let parentA = new DNA(parentAcopy.newList.map(inner => inner.slice()));
        let parentB = new DNA(parentBcopy.newList.map(inner => inner.slice()));
        // swap random rows from parenta with random rows from parent b and viceversa then pick the best outcome
        for (let i = 0; i < Math.random()* 8; i++) {
            parentA.newList[i] = parentB.newList[i];
        }
        for (let i = 5; i < (Math.random()* 3) + 5; i++) {
            parentA.newList[i] = parentB.newList[i];
        }
        for (let i = 3; i < (Math.random()* 6) + 3; i++) {
            parentB.newList[i] = parentA.newList[i];
        }
        for (let i = 7; i < (Math.random()* 2) + 7; i++) {
            parentB.newList[i] = parentA.newList[i];
        }
        parentA.calculateDnaFitness();
        parentB.calculateDnaFitness();
        child = parentB;
        if(parentA.fitness < parentB.fitness)
            child = parentA;

        return child;
    }