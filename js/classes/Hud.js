/*
DISCLAIMER : some of the code below is going to hurt your eyes badly. I mean it. This was coded in 3 days and a lot of cups of coffee, to take part in Devpost Facebook Hackathon.
If, however, you're interested in the tech/concept, don't be that guy and contact me before copying/pasting :)

Stay safe, 
Sebastien Dubourg
*/
import * as THREE from '../libs/three/build/three.module.js';

export default class Park extends THREE.Mesh {
    constructor() {
        super();
        this.material = new THREE.MeshLambertMaterial({
            color: 0xFFFFFF,
            side: THREE.FrontSide,
            transparent: true
        });

    }

    init() {

        var loader = new THREE.TextureLoader().load("./img/stayHome.png");
        loader.anisotropy = 16;
        this.material.map = loader;

        var geometry = new THREE.PlaneGeometry(26, 7, 32);
        this.geometry = geometry;
        this.position.x = 13;
        this.position.y = 7;

    }



}