/*
DISCLAIMER : some of the code below is going to hurt your eyes badly. I mean it. This was coded in 3 days and a lot of cups of coffee, to take part in Devpost Facebook Hackathon.
If, however, you're interested in the tech/concept, don't be that guy and contact me before copying/pasting :)

Stay safe, 
Sebastien Dubourg

//UNUSED PART
*/
import * as THREE from '../libs/three/build/three.module.js';

export default class Building extends THREE.Mesh {

    constructor(name, type) {
        super();
        this.name = name;
        this.type = type;
        this.geometry = new THREE.BoxGeometry(0.25, 0.25, 0.25);
        this.material = new THREE.MeshBasicMaterial({
            color: 0x00ff00
        });

        this.materialWall = new THREE.MeshBasicMaterial({
            color: 0xFFFFFF
        });

    }

    call() {
        console.log(this.name);
    }

}