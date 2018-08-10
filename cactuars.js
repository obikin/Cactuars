// Author : /u/Obikin89

/***********************
	DATA
***********************/

const UNIT_MAX_5 = 1137652;
const UNIT_MAX_6 = 1993672;
const UNIT_MAX_7 = 46646922;

const METAL_CACTUAR = 10000;
const METAL_CACTUAR_MAX = 410000;
const METAL_CACTUAR_BEST_LIMIT = 335000;
const METAL_CACTUAR_BEST_LIMIT_EVENT = 350000;

const GIGANTUAR = 30000;
const GIGANTUAR_MAX = 1290000;
const GIGANTUAR_BEST_LIMIT = 1055000;
const GIGANTUAR_BEST_LIMIT_EVENT = 1090000;

const KING_MINI = 100000;
const KING_MINI_MAX = 4500000;
const KING_MINI_BEST_LIMIT = 3670000;
const KING_MINI_BEST_LIMIT_EVENT = 3820000;

const GREAT_SUCCESS = 0.09;
const AMAZING_SUCCESS = 0.01;

const GREAT_SUCCESS_EVENT = 0.4;
const AMAZING_SUCCESS_EVENT = 0.1;

/***********************
	PARAMETERS
************************
	PROGRAM : 
		1 - FIND BEST LIMIT FOR KING MINITUARS
		2 - FIND BEST LIMIT FOR GIGANTUARS
		3 - FIND BEST LIMIT FOR METAL CACTUARS
		4 - FIND BEST LIMITS FOR ALL CACTUARS
		5 - KING MINI LIMIT = MAX XP (average XP when not taking the threshold into account when leveling a single king minituar)
		6 - GIGANTUAR LIMIT = MAX XP (average XP when not taking the threshold into account when leveling a single gigantuar)
		7 - FIND AVERAGE NUMBER OF CACTUARS TO MAX A UNIT
		8 - FIND AVERAGE XP PER CACTUAR

	NB_TRIES :
		number of iterations, the larger the better the results become... but the longer it takes.

	LIMIT_STEP :
		when trying to find the best limit (when to stop leveling cactuars), will check limits for each step (there is too much randomness for an exact answer, 5000 is good enough), higher steps means the program will end faster.
	
	FUSING_EVENT :
		0 - No Fusing Event
		1 - Fusing event is on !
	
	USE_X :
		when trying to find out the average number of cactuars it takes to max a unit, choose the type of cactuars you use.
		0 - Don't use it
		1 - use it !

	UNIT_START :
		when trying to find out the average number of cactuars it takes to max a unit, start at 0 (when you want to max a 5* a 6*) or UNIT_MAX_6 (when you want to max a 7*).
	UNIT_MAX :
		when trying to find out the average number of cactuars it takes to max a unit, use : UNIT_MAX_5, UNIT_MAX_6 or UNIT_MAX_7.
*/
const PROGRAM = 8;
const NB_TRIES = 100000;
const LIMIT_STEP = 5000;
const FUSING_EVENT = 0;

// for program 7
const USE_METAL_CACTUARS = 0;
const USE_GIGANTUARS = 0;
const USE_KING_MINI = 1;
const UNIT_START = UNIT_MAX_6;
const UNIT_MAX = UNIT_MAX_7;

/***********************
	FUNCTIONS
***********************/

// -- fuse

/*
	source : amount of experience of the cactuar that will be fused
	target : amount of experience of the unit or cactuar receiving the source cactuar
	target_max : maximum amout of experience the target can have
	great_success : chance for great success when fusing
	amazing_success : chance for amazing succes when fusing

	returns the amount of experience of the target after fusing
*/

function fuse(source, target, target_max, great_plus_amazing_success, amazing_success){
	let success = Math.random();
	if (success < amazing_success){
		target += (source*2);
	}
	else if (success < great_plus_amazing_success){
		target += (source*1.5);
	}
	else{
		target += source;
	}

	if (target > target_max) {
		target = target_max;
	}

	return Math.floor(target);
}

// -- cactuars to max a cactuar

/*
	limit : amount of experience we stop fusing the cactuar to new ones
	cactuar_start_xp : amount of experience the cactuar starts with
	cactuar_xp : amount of experience a new cactuar brings
	cactuar_max : amount of experience the cactuar can stock
	great_success : chance for great success when fusing
	amazing_success : chance for amazing succes when fusing

	Tries to fuse cactuars together until they reach the limit a specific number of times (NB_TRIES)
	Prints in the console : the limit|average experience of a cactuar|average number of cactuars to reach the limit

	returns an array with the results
*/

function maxCactuar(limit, cactuar_start_xp, cactuar_xp, cactuar_max, great_success, amazing_success){

	let results = {
		limit: limit,
		cactuars: 0,
		xp: 0,
		average_xp: 0
	};

	for (var i = NB_TRIES; i >= 1; i--) {
		let cactuar = cactuar_start_xp;
		let max = 0;
		let nbCactuars = 1;
		while(max == 0){
			if(cactuar >= limit){
				results.cactuars += nbCactuars;
				results.xp += cactuar;
				results.average_xp = Math.floor(results.xp/results.cactuars);
				max = 1;
			}
			else{
				// fusing the proper way :
				cactuar = fuse(cactuar, cactuar_xp, cactuar_max, great_success, amazing_success);
				// fusing the wrong way :
//				cactuar = fuse(cactuar_xp, cactuar, cactuar_max, great_success, amazing_success);
				nbCactuars+=1;
			}
		}
	}

	console.log(results.limit +"|"+ results.average_xp +"|"+ (results.cactuars/NB_TRIES) +"|");

	return results;
}

// -- find best limit

/*
	cactuar_start_xp : amount of experience the cactuar starts with
	cactuar_xp : amount of experience a new cactuar brings
	cactuar_max : amount of experience the cactuar can stock
	max_limit : maximum limit tested
	lower_limit : lower limit tested
	limit_step : from maximum limit tested, tests limits for values lower by this number  until it reaches the lower limit.
	great_success : chance for great success when fusing
	amazing_success : chance for amazing succes when fusing

	Tries to fuse cactuars together until they reach the limit a specific number of times (NB_TRIES)
	Prints in the console : the limit|average experience of a cactuar|average number of cactuars to reach the limit for each limit tested

	returns approximatively the best limit tested.
*/

function findBestLimit(cactuar_start_xp, cactuar_xp, cactuar_max, max_limit, lower_limit, limit_step, great_success, amazing_success){

	let results = [];

	console.log("FIND BEST LIMIT FROM "+ max_limit +" TO "+ lower_limit +" WITH "+ limit_step +" STEPS AND "+ NB_TRIES +" TRIES.");

	console.log("LIMIT | XP PER CACTUAR | CACTUARS");
	
	var tested_limit = max_limit;
	while(tested_limit >= lower_limit) {
		results.push(maxCactuar(tested_limit, cactuar_start_xp, cactuar_xp, cactuar_max, great_success, amazing_success));
		tested_limit -= limit_step;
	}

	let best_limit = '';
	let best_test = 0;

	for (var i = results.length - 5; i >= 4; i--) {
		let test = results[i-4].average_xp + results[i-3].average_xp + results[i-2].average_xp + results[i-1].average_xp + results[i].average_xp + results[i+1].average_xp + results[i+2].average_xp + results[i+3].average_xp + results[i+4].average_xp;
		if (test > best_test) {
			best_limit = results[i];
			best_test = test;
		}
	}

	console.log("\nBEST LIMIT : "+ best_limit.limit +"\nAverage number of cactuars : "+ best_limit.cactuars/NB_TRIES +"\nAverage xp per cactuar : "+ best_limit.average_xp);
	return best_limit;
}

// -- find average number of cactuars with multiple types to max a unit

/*
	cactuar_types : values for each cactuar used { name: "Gigantuars", xp: GIGANTUAR, max: GIGANTUAR_MAX, limit: GIGANTUAR_BEST_LIMIT} in an array (from lower to higher)
	unit_start_xp : amount of experience the unit starts with
	unit_max_xp : amount of experience the unit needs to reach max level
	great_success : chance for great success when fusing
	amazing_success : chance for amazing succes when fusing

	Tries to fuse cactuars together until they reach their limit (or the maximum amount of xp required for the unit) then fuse them to the unit until the unit reaches max level, a specific number of times (NB_TRIES)
	Prints in the console : the number of tries, total xp and average number of cactuars for each type

	returns an array with the number of catuars for each type
*/

function maxUnit(cactuar_types, unit_start_xp, unit_max_xp, great_success, amazing_success){

	let cactuars = [];
	for (var i = cactuar_types.length - 1; i >= 0; i--) {
		cactuars.push(0);
	}

	for (var y = NB_TRIES; y >= 1; y--) {

		let unit = {
			xp : unit_start_xp,
			max: unit_max_xp
		}

		while(unit.xp < unit.max){
			let cactuar = cactuar_types[0].xp;
			
			// ---------------------------------------
			// to start with a fusion of 10 King Mini
//				cactuar = cactuar_start_xp = fuse(KING_MINI*10, KING_MINI, KING_MINI_MAX, great_success, amazing_success);
//				cactuars[0] += 10;
			// ---------------------------------------

			for (var i = 0; i < cactuar_types.length; i++) {
				let limit = ((unit.xp+cactuar_types[i].limit) < unit.max)? cactuar_types[i].limit : (unit.max - unit.xp);

				while(cactuar < limit) {
					// fusing the right way :
					cactuar = fuse(cactuar, cactuar_types[i].xp, cactuar_types[i].max, great_success, amazing_success);
					// fusing the wrong way :
//					cactuar = fuse(cactuar_types[i].xp, cactuar, cactuar_types[i].max, great_success, amazing_success);
					cactuars[i]+=1;
				}

			}

			unit.xp = fuse(cactuar, unit.xp, unit.max, great_success, amazing_success);
		}
	}

	console.log("NB_TRIES : "+ NB_TRIES +"\nTotal xp : "+ (unit_max_xp - unit_start_xp));
	for (var i = 0; i < cactuars.length; i++) {
		cactuars[i] = cactuars[i]/NB_TRIES;
		console.log("Average number of "+ cactuar_types[i].name +" : "+ cactuars[i]);
	}
	return cactuars;
}

/**********************
	Main
***********************/

if(FUSING_EVENT){
	var limit_king_mini = KING_MINI_BEST_LIMIT_EVENT;
	var limit_gigantuar = GIGANTUAR_BEST_LIMIT_EVENT;
	var limit_cactuar = METAL_CACTUAR_BEST_LIMIT_EVENT;
	var fuse_great = GREAT_SUCCESS_EVENT + AMAZING_SUCCESS_EVENT;
	var fuse_amazing = AMAZING_SUCCESS_EVENT;
}
else{
	var limit_king_mini = KING_MINI_BEST_LIMIT;
	var limit_gigantuar = GIGANTUAR_BEST_LIMIT;
	var limit_cactuar = METAL_CACTUAR_BEST_LIMIT;
	var fuse_great = GREAT_SUCCESS + AMAZING_SUCCESS;
	var fuse_amazing = AMAZING_SUCCESS;
}

var cactuar_types = [];

switch(PROGRAM){
	case 1: 
		// FIND BEST LIMIT KING MINI
		console.log("Calculating the best limit for King Minituars...");
		//findBestLimit(cactuar_start_xp, cactuar_xp, cactuar_max, max_limit, lower_limit, limit_step, great_success, amazing_success)
		findBestLimit(KING_MINI, KING_MINI, KING_MINI_MAX, 4000000, 3500000, LIMIT_STEP, fuse_great, fuse_amazing);
		break;

	case 2:
		// FIND BEST LIMIT GIGANTUAR
		console.log("Calculating the best limit for Gigantuars...");
		//findBestLimit(cactuar_start_xp, cactuar_xp, cactuar_max, max_limit, lower_limit, limit_step, great_success, amazing_success)
		findBestLimit(GIGANTUAR, GIGANTUAR, GIGANTUAR_MAX, 1200000, 900000, LIMIT_STEP, fuse_great, fuse_amazing);
		break;

	case 3: 
		// FIND BEST LIMIT METAL CACTUAR
		console.log("Calculating the best limit for Metal Cactuars...");
		//findBestLimit(cactuar_start_xp, cactuar_xp, cactuar_max, max_limit, lower_limit, limit_step, great_success, amazing_success)
		findBestLimit(METAL_CACTUAR, METAL_CACTUAR, METAL_CACTUAR_MAX, 400000, 290000, LIMIT_STEP, fuse_great, fuse_amazing);
		break;

	case 4:
		// FIND BEST LIMITS
		console.log("Calculating the best limits for all cactuars...");
		limit_king_mini = findBestLimit(KING_MINI, KING_MINI, KING_MINI_MAX, 4000000, 3500000, LIMIT_STEP, fuse_great, fuse_amazing);
		limit_gigantuar = findBestLimit(GIGANTUAR, GIGANTUAR, GIGANTUAR_MAX, 1200000, 900000, LIMIT_STEP, fuse_great, fuse_amazing);
		limit_cactuar = findBestLimit(METAL_CACTUAR, METAL_CACTUAR, METAL_CACTUAR_MAX, 400000, 290000, LIMIT_STEP, fuse_great, fuse_amazing);

		console.log("BEST LIMITS :\nKing Minituars : "+ limit_king_mini.limit + "\nGigantuars : "+ limit_gigantuar.limit + "\nCactuars : "+ limit_cactuar.limit);
		break;

	case 5:
		// KING MINI MAX XP
		console.log("LIMIT | XP PER CACTUAR | CACTUARS");
		//maxCactuar(limit, cactuar_start_xp, cactuar_xp, cactuar_max, great_success, amazing_success)
		maxCactuar(KING_MINI_MAX, KING_MINI, KING_MINI, KING_MINI_MAX, fuse_great, fuse_amazing);
		break;

	case 6:
		// GIGANTUAR MAX XP
		console.log("LIMIT | XP PER CACTUAR | CACTUARS");
		//maxCactuar(limit, cactuar_start_xp, cactuar_xp, cactuar_max, great_success, amazing_success)
		maxCactuar(GIGANTUAR_MAX, GIGANTUAR, GIGANTUAR, GIGANTUAR_MAX, fuse_great, fuse_amazing);
		break;

	case 7:
		// FIND AVERAGE NUMBER OF CACTUARS TO MAX A UNIT
		console.log("Calculating the average number of cactuars required to level a unit...");

		if(USE_METAL_CACTUARS){
			cactuar_types.push({ name: "Metal Cactuars", xp: METAL_CACTUAR, max: METAL_CACTUAR_MAX, limit: limit_cactuar});
		}
		if(USE_GIGANTUARS){
			cactuar_types.push({ name: "Gigantuars", xp: GIGANTUAR, max: GIGANTUAR_MAX, limit: limit_gigantuar});
		}
		if(USE_KING_MINI){
			cactuar_types.push({ name: "King Minituars", xp: KING_MINI, max: KING_MINI_MAX, limit: limit_king_mini});
		}

		// maxUnit(cactuar_types, unit_start_xp, unit_max_xp, great_success, amazing_success)
		maxUnit(cactuar_types, UNIT_START, UNIT_MAX, fuse_great, fuse_amazing);
		break;

	case 8:
		// FIND AVERAGE XP PER CACTUAR
		console.log("Calculating the average amount of experience per cactuar...");

		cactuar_types.unshift({ name: "King Minituars", xp: KING_MINI, max: KING_MINI_MAX, limit: limit_king_mini});
		console.log("MAX 5* UNIT WITH KING MINITUARS");
		let max5 = maxUnit(cactuar_types, 0, UNIT_MAX_5, fuse_great, fuse_amazing);
		console.log("\nMAX 6* UNIT WITH KING MINITUARS");
		let max6 = maxUnit(cactuar_types, 0, UNIT_MAX_6, fuse_great, fuse_amazing);
		console.log("\nMAX 7* UNIT WITH KING MINITUARS");
		let max7 = maxUnit(cactuar_types, UNIT_MAX_6, UNIT_MAX_7, fuse_great, fuse_amazing);

		let king_mini_xp = (UNIT_MAX_5 + UNIT_MAX_7) / (max5[0] + max6[0] + max7[0]);

		console.log("\nTOTAL : \nKing Minituars : "+ (max5[0] + max6[0] + max7[0]) +" ("+ king_mini_xp +" xp on average.");

		cactuar_types.unshift({ name: "Gigantuars", xp: GIGANTUAR, max: GIGANTUAR_MAX, limit: limit_gigantuar});
		console.log("\nMAX 5* UNIT WITH KING MINITUARS + GIGANTUARS");
		max5 = maxUnit(cactuar_types, 0, UNIT_MAX_5, fuse_great, fuse_amazing);
		console.log("\nMAX 6* UNIT WITH KING MINITUARS + GIGANTUARS");
		max6 = maxUnit(cactuar_types, 0, UNIT_MAX_6, fuse_great, fuse_amazing);
		console.log("\nMAX 7* UNIT WITH KING MINITUARS + GIGANTUARS");
		max7 = maxUnit(cactuar_types, UNIT_MAX_6, UNIT_MAX_7, fuse_great, fuse_amazing);

		let gigantuar_xp = ((UNIT_MAX_5 + UNIT_MAX_7) - king_mini_xp * (max5[1] + max6[1] + max7[1])) / (max5[0] + max6[0] + max7[0]);

		console.log("\nTOTAL :");
		console.log("King Minituars : "+ (max5[1] + max6[1] + max7[1]) +" ("+ king_mini_xp +" xp on average.");
		console.log("Gigantuars : "+ (max5[0] + max6[0] + max7[0]) +" ("+ gigantuar_xp +" xp on average.");

		cactuar_types.unshift({ name: "Metal Cactuars", xp: METAL_CACTUAR, max: METAL_CACTUAR_MAX, limit: limit_cactuar});
		console.log("\nMAX 5* UNIT WITH KING MINITUARS + GIGANTUARS + METAL CACTUARS");
		max5 = maxUnit(cactuar_types, 0, UNIT_MAX_5, fuse_great, fuse_amazing);
		console.log("\nMAX 6* UNIT WITH KING MINITUARS + GIGANTUARS + METAL CACTUARS");
		max6 = maxUnit(cactuar_types, 0, UNIT_MAX_6, fuse_great, fuse_amazing);
		console.log("\nMAX 7* UNIT WITH KING MINITUARS + GIGANTUARS + METAL CACTUARS");
		max7 = maxUnit(cactuar_types, UNIT_MAX_6, UNIT_MAX_7, fuse_great, fuse_amazing);

		let metal_cactuar_xp = ((UNIT_MAX_5 + UNIT_MAX_7) - king_mini_xp * (max5[2] + max6[2] + max7[2]) - gigantuar_xp * (max5[1] + max6[1] + max7[1])) / (max5[0] + max6[0] + max7[0]);

		console.log("\nTOTAL :");
		console.log("King Minituars : "+ (max5[2] + max6[2] + max7[2]) +" ("+ king_mini_xp +" xp on average.");
		console.log("Gigantuars : "+ (max5[1] + max6[1] + max7[1]) +" ("+ gigantuar_xp +" xp on average.");
		console.log("Metal Cactuars : "+ (max5[0] + max6[0] + max7[0]) +" ("+ metal_cactuar_xp +" xp on average.");

		console.log("\nAVERAGE XP :\nKing Minituars : "+ Math.round(king_mini_xp) + "\nGigantuars : "+ Math.round(gigantuar_xp) + "\nCactuars : "+ Math.round(metal_cactuar_xp));
		break;

	default: console.log("choose a  program.");
}
