import * as THREE from 'three'
function arrayEquals(a, b) {
    return Array.isArray(a) &&
      Array.isArray(b) &&
      a.length === b.length &&
      a.every((val, index) => val === b[index]);
  }

export class Block{
    constructor(verts, color){
        this.verts = verts;
        if(this.verts.length > 0){
            this.geometry = new THREE.BufferGeometry();
            this.geometry.setAttribute('position', new THREE.BufferAttribute(this.verts, 3));
            this.material = new THREE.MeshBasicMaterial({color:color});
            this.mesh = new THREE.Mesh(this.geometry, this.material); 
        }
        // up, down, left, right, front, back
        this.adjacencies = [[],[],[],[],[],[]];
        this.CalculateNodes();
        
        
    }
    CalculateNodes(){
        // Front face (topleft clockwise): 2, 3, 1, 0
        // Back face (topleft clockwise): 6, 7, 5, 4
        const nodes = [[-1,-1,1],[1,-1,1],[-1,1,1],[1,1,1],[-1,-1,-1],[1,-1,-1],[-1,1,-1],[1,1,-1]];
        this.nodelist = [0,0,0,0,0,0,0,0];
        for(let i = 0; i < this.verts.length - 3; i+=3){
            for(let j = 0; j < 8; ++j){
                if(arrayEquals(nodes[j], [this.verts[i], this.verts[i+1],this.verts[i+2]])){
                    this.nodelist[j] = 1;
                    break;
                }
            }
        }
    }

    Analyze(blocks){
        // up down left right front back
        const faces = [[2,3,6,7], [0,1,5,4], [0,4,6,2], [1,5,7,3], [0,1,3,2], [4,5,7,6]];
        const facing = [[0,1,4,5], [2,3,7,6], [1,5,7,3],[0,4,6,2], [4,5,7,6],[0,1,3,2]]
        for(let j = 0; j < blocks.length; ++j){
            let block = blocks[j];
            for(let i = 0; i < 6; ++i){
                let count = 0;
                for(let k = 0; k < 4; ++k){
                    let face_idx = faces[i][k];
                    let facing_idx = facing[i][k];
                    if(block.nodelist[facing_idx] != this.nodelist[face_idx]){
                        break;
                    }
                    count++;
                }
                if (count < 4){
                    this.adjacencies[i].push(j);
                }
            }
        }
    }

    Rotate(degreesX, degreesY, color){
        let newMesh = new THREE.Mesh(this.mesh.geometry.clone(), this.mesh.material.clone());
        newMesh.rotateX(degreesX);
        newMesh.rotateY(degreesY);
        newMesh.updateMatrix();
        newMesh.geometry.applyMatrix4(newMesh.matrix);
        newMesh.matrix.identity();
        newMesh.position.set( 0, 0, 0 );
        newMesh.rotation.set( 0, 0, 0 );
        newMesh.scale.set( 1, 1, 1 );
        let b = new Block(newMesh.clone().geometry.getAttribute('position').array, color);
        return b;
    }

}