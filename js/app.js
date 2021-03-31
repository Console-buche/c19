/*
DISCLAIMER : some of the code below is going to hurt your eyes badly. I mean it. This was coded in 3 days and a lot of cups of coffee, to take part in Devpost Facebook Hackathon.
If, however, you're interested in the tech/concept, don't be that guy and contact me before copying/pasting :)

Stay safe, 
Sebastien Dubourg
*/


import Humain from './classes/Humain.js';
import Building from './classes/Building.js';
import Clock from './classes/Clock.js';
import CityMap from './classes/Grid.js';
import Park from './classes/Park.js';
import MapPointer from './classes/Pointer.js';
import Hud from './classes/Hud.js';

import {
    OrbitControls
} from './libs/three/controls/OrbitControls.js';

import {
    FBXLoader
} from './libs/three/loaders/FBXLoader.js';

import * as THREE from './libs/three/build/three.module.js';
import {
    GUI
} from './libs/three/libs/dat.gui.module.js';

var clock = new Clock();

var params = {
    narrowScreen: false,
    simulationHasRunOnce: false,
    popTotal: 100,
    gui: {
        guiGestes: false,
        guiPopular: true,
        guiTimeAllowedOutside: 13
    },
    grid: {
        h: 26,
        w: 26
    },
    spawnZones: {
        housez: [
            [4, 1],
            [4, 7],
            [4, 13],
            [16, 2],
            [11, 1],
            [5, 14],
            [5, 8],
            [5, 2],
            [13, 16],
            [11, 14],
            [11, 8],
            [11, 2]
        ]
    },
    houses: {
        h0: {
            x: 4,
            y: 1
        },
        h1: {
            x: 4,
            y: 7
        },
        h2: {
            x: 4,
            y: 13
        },
        h3: {
            x: 16,
            y: 2
        },
        h4: {
            x: 11,
            y: 1
        },
        h5: {
            x: 5,
            y: 14
        },
        h6: {
            x: 5,
            y: 8
        },
        h7: {
            x: 5,
            y: 2
        },
        h8: {
            x: 13,
            y: 16
        },
        h9: {
            x: 11,
            y: 14
        },
        h10: {
            x: 11,
            y: 8
        },
        h11: {
            x: 11,
            y: 2
        }
    }
}

var population = [];
var map = new CityMap();
var grid = map.grid;
var citySet = new THREE.Object3D();
var mapPointers = null;

var hackGui = document.getElementsByClassName("main");
var startBtn = document.getElementById("startSim");
var aboutPanel = document.getElementById("about");
startBtn.addEventListener("mousedown", startSim);

function startSim() {

    var windowW = window.innerWidth;
    if (windowW < 900) {
        params.narrowScreen = true;
    }


    var hasRun = params.simulationHasRunOnce;
    if (hasRun) {
        location.reload();
    } else {
        params.simulationHasRunOnce = true;
        hackGui[0].style.display = "none";
        if (params.narrowScreen == true) aboutPanel.style.display = "none";
    }
    startBtn.style.background = "red";
    startBtn.textContent = "RESTART SIMULATION";
    //create propulation
    for (var i = 0; i < params.popTotal; i++) {

        var isSick = (i < 1) ? true : false;
        // console.log("Is sick : " + isSick)
        var spawn = params.spawnZones.housez[Math.floor(Math.random() * params.spawnZones.housez.length)];
        //var spawn = params.spawnZones.housez[0];
        //console.log(spawn)
        // var spawn = params.spawnZones.houses["h" + i]

        //console.log(spawn);

        var st = new THREE.Vector3(spawn[0], spawn[1], 0);

        //console.log(st);

        var h1 = new Humain("humain " + i, st, isSick, params.gui.guiGestes, params.gui.guiPopular, params.gui.guiTimeAllowedOutside);
        h1.call();

        //  console.log(h1.isSick);
        if (h1.isSick == true) {
            h1.material = new THREE.MeshBasicMaterial({
                color: 0xFF0000
            });
        } else {
            h1.material = h1.materialHealthy;
        }
        h1.material.needsUpdate = true;
        //console.log(h1.material);
        scene.add(h1);
        h1.position.x = h1.lastPosOnGrid.x;
        h1.position.z = 26 - h1.lastPosOnGrid.y;
        population.push(h1);
        //console.log(h1);

    }

    population.forEach(humain => humain.pop = population);

    var building = new Building("Home");
    building.call();

    clock.startClock();

    setNewCourse("home");
}


var scene = new THREE.Scene();

var skycolor = new THREE.Color('black');
scene.background = skycolor;
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.x = 16;
camera.position.y = 29;
camera.position.z = 40;

//SKY

var skyTex = new THREE.TextureLoader().load("./img/sky.png", function (t) {
    var geometry = new THREE.SphereGeometry(23, 50, 200);
    var material = new THREE.MeshBasicMaterial({
        map: t,
        side: THREE.BackSide
    });
    var sphere = new THREE.Mesh(geometry, material);
    sphere.position.x = 13;
    sphere.position.z = 13;
    sphere.rotation.x = Math.PI;
    scene.add(sphere);
    clock.sky = sphere;
});

// LIGHTS

// lights

scene.add(new THREE.AmbientLight(0x666666));

var light = new THREE.DirectionalLight(0xdfebff, 1);
light.position.set(12, -12, 12);
light.position.multiplyScalar(1.3);

light.castShadow = true;

light.shadow.mapSize.width = 1024;
light.shadow.mapSize.height = 1024;

var d = 20;

light.shadow.camera.left = -d;
light.shadow.camera.right = d;
light.shadow.camera.top = d;
light.shadow.camera.bottom = -d;

light.shadow.camera.far = 1000;

scene.add(light);
clock.light = light;


var cityModel = null;


//console.log(grid);


//gridHelper();

var renderer = new THREE.WebGLRenderer({
    alpha: true
});
renderer.shadowMap.enabled = true;
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

var controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(12, 0, 12);

//controls.target.set(17, 15, 12);
controls.update();
console.log(controls);
controls.maxPolarAngle = 1.2;

controls.minDistance = 3;
controls.maxDistance = 40;

var geometry = new THREE.BoxGeometry(1, 1, 1);
var material = new THREE.MeshBasicMaterial({
    color: 0x00ff00
});
var cube = new THREE.Mesh(geometry, material);
scene.add(cube);
cube.visible = false;


//console.log(building);

var animate = function (t) {
    requestAnimationFrame(animate);
    population.forEach(human => {
        if (human.path !== null) {

            human.walkTo();
        }
    });

    //  console.log(camera.position);
    clock.update();
    renderer.render(scene, camera);

    TWEEN.update(t);

	if (mapPointers !== null) {
		mapPointers.children.forEach(p=> {
			p.lookAt(new THREE.Vector3(camera.position.x, p.position.y, camera.position.z));
			p.position.y = 4 + Math.sin(t / 1000) / 2;
		});
	}
};

animate();

function gridHelper() {
    var geometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
    var material = new THREE.MeshBasicMaterial({
        color: 0x0000ff
    });
    var point = new THREE.Mesh(geometry, material);
    grid.nodes.forEach((col) => {

        col.forEach((square) => {
            var c = point.clone();
            c.position.set(square.x, square.y, 0);

            var isWalkable = square.walkable;
            //if (isWalkable == false) console.log("false");
            if (isWalkable == false) {
                c.material = building.materialWall;
            }
            scene.add(c);
        });
    })
}

function setNewCourse(goal) {
    //console.log("new course set");
    var newGoal = goal;
    population.forEach(human => {
        human.setNewGoal(newGoal);
        // console.log(newGoal);
    });
}

//ground 
var geometry = new THREE.CircleGeometry(20, 64);
var material = new THREE.MeshBasicMaterial({
    color: 0x000000,
    transparent: true,
    opacity: 0.3
});
var circle = new THREE.Mesh(geometry, material);
circle.rotation.x = -Math.PI / 2;
circle.position.x = 13;
circle.position.y = -2
circle.position.z = 13;
scene.add(circle);
//citySet.add(socle);

// LOAD MODELS
// SHOP


var loader = new FBXLoader();

loader.load('models/city/source/socle.fbx', function (object) {

    object.traverse(function (child) {
        if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            child.material.shininess = 0;
            // console.log(child);
        }
    });

    object.scale.set(0.0125, 0.0125, 0.0125)
    //object.visible = false;

    cityModel = object;
    cityModel.rotation.y = -1.56;
    cityModel.position.y = 2;
    cityModel.position.z = -7.5;
    cityModel.position.x = 7.5;
    // console.log(cityModel);
    //scene.add(cityModel);

    citySet.add(cityModel);

});

loader.load('models/city/source/shop.fbx', function (object) {
    //loader.load('models/city/source/socle.fbx', function (object) {

    object.traverse(function (child) {
        if (child.isMesh) {
            child.castShadow = true;
            child.material.shininess = 0;
        }
    });

    object.scale.set(0.0125, 0.0125, 0.0125)
    //object.visible = false;

    cityModel = object;
    cityModel.rotation.y = -1.56;
    cityModel.position.y = 1;
    cityModel.position.z = -19.5;
    cityModel.position.x = 3.5;
    // console.log(cityModel);
    scene.add(cityModel);

    citySet.add(cityModel);

});

var houses = [];

// HOUSES
loader.load('models/city/source/house3.fbx', function (object) {
    //loader.load('models/city/source/socle.fbx', function (object) {

    object.traverse(function (child) {
        if (child.isMesh) {
            child.castShadow = true;
            child.material.shininess = 0;
        }
    });

    var sc = 0.005;
    object.scale.set(sc, sc, sc)
    object.position.set(12, 0.8, 5);
    //object.visible = false;

    // object.rotation.y = -1.56;

    object.position.z = -2;
    object.position.x = 2;
    houses.push(object);

    loader.load('models/city/source/house2.fbx', function (object) {
        //loader.load('models/city/source/socle.fbx', function (object) {

        object.traverse(function (child) {
            if (child.isMesh) {
                child.castShadow = true;
                child.material.shininess = 0;
            }
        });

        var sc = 0.005;
        object.scale.set(sc, sc, sc)
        object.position.set(12, 0.8, 5);
        //object.visible = false;

        // object.rotation.y = -1.56;

        object.position.z = -2;
        object.position.x = 2;
        houses.push(object);

        // HOUSES
        loader.load('models/city/source/house.fbx', function (object) {
            //loader.load('models/city/source/socle.fbx', function (object) {

            object.traverse(function (child) {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.material.shininess = 0;
                }
            });

            var sc = 0.005;
            object.scale.set(sc, sc, sc)
            object.position.set(12, 0.8, 5);
            //object.visible = false;

            // object.rotation.y = -1.56;

            object.position.z = -1.5;
            object.position.x = 1.5;
            object.rotation.y = (Math.random() > 0.5) ? 1.56 : 0;
            scene.add(object);
            citySet.add(object)

            houses.push(object);
            //console.log(object);




            var newHouse = houses[Math.floor(Math.random() * houses.length)];
            var h2 = newHouse.clone();
            h2.position.x = 1.5;
            h2.position.z = -7.5;
            h2.rotation.y = (Math.random() > 0.5) ? 1.56 : 0;
            scene.add(h2);
            citySet.add(h2)

            var newHouse = houses[Math.floor(Math.random() * houses.length)];
            var h3 = newHouse.clone();
            h3.position.z = -13.5;
            h3.position.x = 1.5;
            h3.rotation.y = (Math.random() > 0.5) ? 1.56 : 0;
            scene.add(h3);
            citySet.add(h3)


            var newHouse = houses[Math.floor(Math.random() * houses.length)];
            var h4 = newHouse.clone();
            h4.position.x = 7.5;
            h4.position.z = -13.5;
            h4.rotation.y = (Math.random() > 0.5) ? 1.56 : 0;
            scene.add(h4);
            citySet.add(h4);


            var newHouse = houses[Math.floor(Math.random() * houses.length)];
            var h5 = newHouse.clone();
            h5.position.x = 7.5;
            h5.position.z = -7.5;
            h5.rotation.y = (Math.random() > 0.5) ? 1.56 : 0;
            scene.add(h5);
            citySet.add(h5);

            var newHouse = houses[Math.floor(Math.random() * houses.length)];
            var h6 = newHouse.clone();
            h6.position.x = 7.5;
            h6.position.z = -1.5;
            h6.rotation.y = (Math.random() > 0.5) ? 1.56 : 0;
            scene.add(h6);
            citySet.add(h6)


            var newHouse = houses[Math.floor(Math.random() * houses.length)];
            var h7 = newHouse.clone();
            h7.position.x = 13.5;
            h7.position.z = -1.5;
            h7.rotation.y = (Math.random() > 0.5) ? 1.56 : 0;
            scene.add(h7);
            citySet.add(h7);

            var newHouse = houses[Math.floor(Math.random() * houses.length)];
            var h8 = newHouse.clone();
            h8.position.x = 13.5;
            h8.position.z = -7.5;
            h8.rotation.y = (Math.random() > 0.5) ? 1.56 : 0;
            scene.add(h8);
            citySet.add(h8);

            var newHouse = houses[Math.floor(Math.random() * houses.length)];
            var h9 = newHouse.clone();
            h9.position.x = 13.5;
            h9.position.z = -13.5;
            h9.rotation.y = (Math.random() > 0.5) ? 1.56 : 0;
            scene.add(h9);
            citySet.add(h9);

			//setup park
            var park = new Park();
            park.create();
            citySet.add(park);
            //console.log(park);

            var tree = null;
            var loader = new FBXLoader();

            loader.load('models/city/source/tree.fbx', function (object) {

                object.traverse(function (child) {
                    if (child.isMesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;
                        child.material.shininess = 0;
                    }
                });

                tree = object;
                tree.scale.set(Math.random() * 0.01 + 0.01, Math.random() * 0.01 + 0.01, Math.random() * 0.01 + 0.01);
                tree.position.y = 0;


                map.trees.forEach(spot => {
                    let t = tree.clone();
                    t.castShadow = true;
                    citySet.add(t)
                    t.rotation.y = Math.random() * Math.PI;
                    t.position.x = spot[0];
                    t.position.z = spot[1];
                })

                citySet.add(tree);
            });
			
			
			mapPointers = new MapPointer();
			console.log(mapPointers)
			mapPointers.create();
			citySet.add(mapPointers);

            scene.add(citySet)
            citySet.position.z = 26;
            citySet.position.y = -0.75;

        });

    });

});


makeParkWalls();

function makeParkWalls() {

    //top wall
    let params = {
        height: 1.5,
        depth: 0.25
    };
    let parkWalls = [{
            name: "topWall",
            width: 14,
            x: 19,
            y: params.height / 2,
            z: -26,
            rotY: 0
        }, {
            name: "rightMostWall",
            width: 26,
            x: 26,
            y: params.height / 2,
            z: -13.25,
            rotY: 1.56
        }, {
            name: "bottomMostWall",
            width: 8,
            x: 22,
            y: params.height / 2,
            z: 0,
            rotY: 0
        }, {
            name: "bottomLeftWallBelowEntrance",
            width: 3,
            x: 18,
            y: params.height / 2,
            z: -1.5,
            rotY: 1.56
        },
        {
            name: "bottomLeftWallAboveEntrance",
            width: 5,
            x: 18,
            y: params.height / 2,
            z: -7.5,
            rotY: 1.56
        }, {
            name: "leftWallBelowCorner",
            width: 7,
            x: 18,
            y: params.height / 2,
            z: -15.5,
            rotY: 1.56
        }, {
            name: "leftWallAboveCorner",
            width: 6,
            x: 15,
            y: params.height / 2,
            z: -19,
            rotY: 0
        }, {
            name: "to²eftEntranceBottomWall",
            width: 2.5,
            x: 12,
            y: params.height / 2,
            z: -20,
            rotY: 1.56
        }, {
            name: "topLeftEntranceTopWall",
            width: 2.5,
            x: 12,
            y: params.height / 2,
            z: -24.5,
            rotY: 1.56
        }
    ]


    var material = new THREE.MeshLambertMaterial({
        color: 0xB8B09B
    });

    parkWalls.forEach(wall => {
        var geometry = new THREE.BoxGeometry(wall.width, params.height, params.depth);
        var cube = new THREE.Mesh(geometry, material);


        cube.translateX(params.width / 2);
        cube.position.x = wall.x;
        cube.position.y = params.height / 2;
        cube.position.z = wall.z;
        cube.rotation.y = wall.rotY;

        citySet.add(cube);

    });

}

var hud = new Hud();
hud.init();
scene.add(hud);


// GUI
var hudParams = {
    "Show Info Panel": true,
    "Population": 100,
    "Respect of safety instructions": false,
    "High number of social interactions": true,
    "Hours allowed outside one's home": 13
};
var gui = new GUI();

var showPanel = gui.add(hudParams, 'Show Info Panel');
var setPop = gui.add(hudParams, 'Population', 0, 200);
var setGestes = gui.add(hudParams, 'Respect of safety instructions');
var setPopular = gui.add(hudParams, 'High number of social interactions');
var setTimeAllowedOutside = gui.add(hudParams, "Hours allowed outside one's home", 0, 13);

showPanel.onChange((e) => {
    var state = e;
    var panel = document.getElementById("about");
    panel.style.display = (state == true) ? "block" : "none";
})

setPop.onChange((e) => {
    var pop = Math.floor(e);
    params.popTotal = pop;
})

setGestes.onChange((e) => {
    var gestes = e;
    params.gui.guiGestes = gestes;
})

setPopular.onChange((e) => {
    var isPopular = e;
    params.gui.guiPopular = isPopular;
})

setTimeAllowedOutside.onChange((e) => {
    var isPopular = e;
    params.gui.guiTimeAllowedOutside = isPopular;
})