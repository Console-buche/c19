import * as THREE from '../libs/three/build/three.module.js';
import {
    FBXLoader
} from '../libs/three/loaders/FBXLoader.js';
export default class Park extends THREE.Mesh {
    constructor() {
        super();
        this.material = new THREE.MeshLambertMaterial({
            color: 0x228B22,
            side: THREE.DoubleSide
        });
        this.pts = []

    }

    create() {
		

        var geometry = new THREE.PlaneGeometry(8, 26, 12, 12);

        /*
                geometry.vertices.forEach(v => {
                    v.z += Math.random() * 0.25;
                });
        */
        geometry.translate(22, 13, 0);
        geometry.rotateX(90 * Math.PI / 180);
        geometry.translate(0, 0.05, 0); //rotate above ground after transform

        var m = new THREE.Mesh(geometry, this.material);
        m.receiveShadow = true;
        this.children.push(m);

        var geometry2 = new THREE.PlaneGeometry(6, 7, 12, 12);
        geometry2.translate(15, 3.5, 0);
        geometry2.rotateX(90 * Math.PI / 180);
        geometry2.translate(0, 0.05, 0); //rotate above ground after transform
        geometry2.computeBoundingSphere();
        var m2 = new THREE.Mesh(geometry2, this.material);
        m2.receiveShadow = true;

        this.children.push(m2);



    }


    createTree() {


        var tree = null;
        var loader = new FBXLoader();

        loader.load('../models/city/source/tree.fbx', function (object) {

            object.traverse(function (child) {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                    child.material.shininess = 0;
                    console.log(child);
                }
            });


            //object.visible = false;

            tree = object;
            tree.rotation.y = -1.56;
            tree.position.y = 2;
            tree.position.z = -7.5;
            tree.position.x = 7.5;
            //scene.add(cityModel);

            return tree;

        });


    }
}