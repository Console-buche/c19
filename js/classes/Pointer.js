import * as THREE from '../libs/three/build/three.module.js';
export default class MapPointer extends THREE.Mesh {
    constructor() {
        super();
        
		this.pointers = [
						{
							img:"pointer_running.png",
							pos: {x: 22, y:4, z:15}
						},{
							img:"pointer_shopping.png",
							pos: {x: 3, y:4, z:3}
						}		
		]
    }

    create() {
		
		this.pointers.forEach((p) => {
			var material = new THREE.MeshLambertMaterial({
            side: THREE.DoubleSide,
			transparent:true,
			alphaTest:0.3
        });
			var tex = new THREE.TextureLoader().load("./img/"+p.img);
			tex.anisotropy = 16;
			
			
			var geometry = new THREE.PlaneGeometry(1, 2);
			var pointer = new THREE.Mesh(geometry, material);
			pointer.material.map = tex;
			console.log(pointer);
			pointer.position.set(p.pos.x, p.pos.y, p.pos.z);
			console.log(pointer);
			
			this.children.push(pointer);
			
		});

	}
	
	
}