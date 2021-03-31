/*
DISCLAIMER : some of the code below is going to hurt your eyes badly. I mean it. This was coded in 3 days and a lot of cups of coffee, to take part in Devpost Facebook Hackathon.
If, however, you're interested in the tech/concept, don't be that guy and contact me before copying/pasting :)

Stay safe, 
Sebastien Dubourg
*/


import * as THREE from '../libs/three/build/three.module.js';
import CityMap from './Grid.js';

export default class Humain extends THREE.Mesh {

    constructor(name, startingPos, isSick, guiGestes, guiPopular, guiTimeOutside) {
        super();
        this.pop = null;
        this.name = name;
        this.isSick = isSick;
        this.geometry = new THREE.SphereGeometry(0.15, 8, 8);
        this.materialHealthy = new THREE.MeshLambertMaterial({
            transparent: true,
            opacity: 0,
            color: 0x00FF00
        });
        this.materialInfected = new THREE.MeshLambertMaterial({
            transparent: true,
            opacity: 0,
            color: 0x0000FF
        });
        this.materialGestesBarriere = new THREE.MeshLambertMaterial({
            transparent: true,
            opacity: 0,
            color: 0x00FF00
        });
        // this.movespeed = Math.random() * 0.05;
        this.movespeed = 0.15;
        this.cityMap = null;
        this.grid = null;
        this.finder = new PF.AStarFinder();
        this.path = null;
        this.home = startingPos;
        this.goal = "home";
        //  this.path = this.finder.findPath(startingPos.x, startingPos.y, this.grid.nodes[10][10].x, this.grid.nodes[10][10].y, this.grid);
        this.lastPosOnGrid = new THREE.Vector3(startingPos.x, startingPos.y, 0);
        this.social = {
            popularity: (guiPopular == true) ? Math.random() * 0.0015 : Math.random() * 0.000015,
            isSocialising: false,
            elapsedTime: 0,
            cooldown: 0,
            //gestesBarriere: 0.015 //0.005 pour bien respecté - plus c'est bas plus ils sont respectés, moins il y a de chance d'être infecté
            gestesBarriere: (guiGestes == false) ? 0.1 : 0.015 //0.005 pour bien respecté - plus c'est bas plus ils sont respectés, moins il y a de chance d'être infecté
        }
        this.coefs = {
            exercice: 20,
            shop: 20,
            random: 0.25
        }
        this.needs = {
            shop: {
                in: 300,
                duration: 0,
                stamina: 100, //durée des courses
                done: false,
                isAShoppingDay: Math.round(Math.random())
            }, // si arrive à zéro, l'humain doit aller faire des courses
            exercice: {
                in: 100,
                duration: 0,
                stamina: 200 + (100 + Math.random() * 150), //durée du sport
                done: false,
                isASportsDay: Math.round(Math.random()) // si jour pair, jour de sport, sinon pas jour de sport
            }, // si arrive à zéro, l'humain ressent le besoin de sortir marcher
            dureeSortieAutorisee: guiTimeOutside,
            wakeTime: 6 + Math.floor(Math.random() * 3),
            sleep: null

        }
    }

    bustAMove() {
        var timeContainer = document.getElementById("hours");
        var dayContainer = document.getElementById("days");
        var time = parseInt(timeContainer.textContent, 10);
        var day = parseInt(dayContainer.textContent, 10);

        if (this.needs.sleep < time || time < this.needs.wakeTime) {
            this.goal = "home";
            // console.log("time to go home");
        } else {
            //go shop or go exercice
            if (this.needs.shop.duration > 0 && (day % 2) == this.needs.shop.isAShoppingDay) {
                this.goal = "shop";
            } else if (this.needs.exercice.duration > 0 && this.needs.exercice.done == false && (day % 2) == this.needs.exercice.isASportsDay) {
                this.goal = "exercice";
                //console.log("going running")
            } else {
                this.goal = "random";
            }
        }

        if (this.goal !== "exercice" || this.needs.sleep > time || this.goal !== "shop") {
            this.goal == "random";
        }

        // console.log(this.goal);

    }

    updateNeeds() {
        this.updateVisibility();
        //exercising needs
        if (this.needs.shop.duration < 1) { // only increment need to go do sports after shopping
            if (this.needs.exercice.done == false) {
                if (this.needs.exercice.in > 1) {
                    this.needs.exercice.in -= 0.5;
                } else {
                    this.needs.exercice.duration++;
                }

                if (this.needs.exercice.duration > this.needs.exercice.stamina) {
                    this.needs.exercice.done = true;
                }
            }
        }


        //shopping needs
        if (this.needs.shop.done == false) {
            if (this.needs.shop.in > 1) {
                this.needs.shop.in -= 0.5;
            } else {
                this.needs.shop.duration++;
            }

            if (this.needs.shop.duration > this.needs.shop.stamina) {
                this.needs.shop.done = true;
                //console.log("done shopping");
            }
        }

    }

    resetStats() {
        //exercice
        this.needs.exercice.duration = 0;
        this.needs.exercice.in = 100;
        this.needs.exercice.done = false;
        //shop
        this.needs.shop.duration = 0;
        this.needs.shop.in = 200 + (Math.random() * 200 + 100);
        this.needs.shop.done = false;
    }

    setNewGoal(goal) {


        //update grid
        this.updateGrid();

        //   console.log(goal);
        if (goal == "random") {
            //   var desired = new THREE.Vector3(this.grid.nodes[ranX][ranX].x, this.grid.nodes[ranY][ranY].y, 0);
            //   this.path = this.finder.findPath(this.lastPosOnGrid.x, this.lastPosOnGrid.y, desired.x, desired.y, this.grid);
            this.nextMoveInArea("streets");
        } else if (goal == "home") {

            this.getHome();
        } else if (goal == "exercice") {
            this.nextMoveInArea("park");
        } else if (goal == "shop") {
            this.nextMoveInArea("shop");
        }



        //  console.log(this.path);
    }

    walkTo() {
        // console.log(this.needs.wakeTime);
        this.updateNeeds();
        this.bustAMove();

        //console.log(this.goal);
        //si les humains ne sont pas en train de socialiser
        if (this.social.isSocialising == true) {
            this.socialInteraction();
        } else

            //alors ils marchent
            if (this.path.length > 0 && this.path !== null) {



                //délai avant prochaine rencontre possible
                this.social.cooldown = (this.social.cooldown > 0) ? this.social.cooldown - 1 : 0;

                //   console.log("walk to");
                let p = this.path[0];
                //    console.log(p);
                let tPos = new THREE.Vector3().copy(new THREE.Vector3(p[0], 0, 25 - p[1]));
                let d = this.position.distanceTo(tPos);

                if (d > 1) {

                    let desired = new THREE.Vector3().subVectors(tPos, this.position);

                    desired.normalize();
                    desired.multiplyScalar(this.movespeed);

                    this.position.add(desired);


                } else if (this.path.length > 0) {
                    this.lastPosOnGrid.x = p[0];
                    this.lastPosOnGrid.y = p[1];
                    this.path.shift();
                }
            } else {
                //    console.log("finished");


                if (this.goal == "shop" && this.needs.shop.done == false && this.path == null) {
                    return;
                } else {
                    this.path = null;
                    this.setNewGoal(this.goal);
                }

            }

        this.bumpIntoSomeone();
    }

    bumpIntoSomeone() {
        //console.log(this.social.gestesBarriere);
        this.pop.forEach(humain => {
            if (humain !== this) {
                let d = humain.position.distanceTo(this.position);
                if (d < 1.3) {

                    //test social : les humains peuvent se connaître et ont une probabilité de s'arrêtent pour socialiser
                    var socialTest = Math.random();
                    if (socialTest < this.social.popularity && this.social.isSocialising == false && this.social.cooldown < 1) {
                        this.social.isSocialising = true;
                        humain.social.isSocialising = true;
                    }

                    //en cas de rencontre, on s'arrête et on discute. Si la personne est malade alors proba d'infection
                    if (humain.isSick == true && this.social.isSocialising == true) {
                        this.testInfection("Promiscuite");
                    }

                    //Autre cas : vérification gestes barrière : si non respecté, probabilité de tomber malade en croisant
                    //d'autres personnes. Pas d'interaction, seulement croisement du chemin.
                    var testGestes = Math.random();
                    if (testGestes < this.social.gestesBarriere && humain.isSick == true) {
                        this.testInfection("Mains");
                    }

                }
            }
        })
    }

    testInfection(cause) {

        if (this.goal !== "home") {
            var willInfect = Math.random();
            var coeffed = this.social.gestesBarriere * this.coefs[this.goal];
            // console.log(coeffed);
            if (willInfect < coeffed && this.isSick == false) {
                this.material = this.materialInfected;
                this.isSick = true;
                //    console.log("Nouveau cas de transmission : " + cause)
                var stats = document.getElementById("stats" + cause);
                var current = parseInt(stats.textContent, 10);
                current++;
                stats.textContent = current;
            } else {
                if (this.isSick == false) this.material = this.materialGestesBarriere;
            }
        }

    }

    socialInteraction() {
        if (this.social.isSocialising == true) {
            this.social.elapsedTime += 1;
            if (this.social.elapsedTime > 100) {
                this.social.isSocialising = false;
                this.social.elapsedTime = 0;
                this.social.cooldown = 100;
            }
        }
    }

    getHome() {
        // console.log("going home");
        this.path = null;
        this.path = this.finder.findPath(this.lastPosOnGrid.x, this.lastPosOnGrid.y, this.home.x, this.home.y, this.grid);
        if (this.path.length < 2) {
            this.resetStats();
        }
    }

    updateVisibility() {
        if (this.path.length < 1 && this.goal == "home") {
            if (this.material.opacity > 0) {
                this.material.opacity -= 0.05;
            }

        } else if (this.goal !== "home") {
            if (this.material.opacity < 1) {
                this.material.opacity += 0.05;
            }
        }
    }

    nextMoveInArea(place) {
        //get random location in park
        //first select area of park
        //  console.log(this.grid);
        let area = this.cityMap.areas[place];
        let goToArea = Math.floor(Math.random(area.length));
        var desired = this.cityMap.areas[place][goToArea];
        var x = desired.xMin + Math.floor(Math.random() * (desired.xMax - desired.xMin));
        var y = desired.yMin + Math.floor(Math.random() * (desired.yMax - desired.yMin));
        //console.log(x);
        this.path = null;
        this.path = this.finder.findPath(this.lastPosOnGrid.x, this.lastPosOnGrid.y, x, y, this.grid);
    }



    call() {
        // console.log(this.name);
        let map = new CityMap();
        this.cityMap = map;
        this.grid = map.grid;

        this.needs.sleep = this.needs.wakeTime + this.needs.dureeSortieAutorisee;
        // console.log(this.grid);
        // console.log(this.home);
        this.finder.dontCrossCorners = "Never";
        // console.log(this.finder);
    }

    updateGrid() {
        let map = new CityMap();
        this.grid = map.grid;
    }

}