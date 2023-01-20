import * as THREE from 'three'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js'
import {TextGeometry} from 'three/examples/jsm/geometries/TextGeometry'
import {GLTFExporter} from 'three/examples/jsm/exporters/GLTFExporter'
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils'
import { Group } from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls'
import {Block} from './block.js'
import { Cell } from './cell.js';

class Demo {
  constructor(){
    this.Initialize();
  }

  Initialize(){
    this.threejs = new THREE.WebGL1Renderer();
    this.threejs.setPixelRatio(window.devicePixelRatio);
    this.threejs.setSize(window.innerWidth, window.innerHeight);
    this.threejs.shadowMap.enabled = true;

    document.body.appendChild(this.threejs.domElement);

    window.addEventListener('resize', () =>{
      this.OnWindowResize();
    }, false);

    const fov = 60;
    const aspect = 1920/1080;
    const nearClip = 1.0;
    const farClip = 1000.0;
    this.camera = new THREE.PerspectiveCamera(fov, aspect, nearClip, farClip);
    this.camera.position.z = 20

    this.scene = new THREE.Scene();

    let light = new THREE.PointLight(0xffffff, 1, 100);
    light.position.set(0,10,10)
    light.castShadow = true;

    this.scene.add(light);

    const controls = new OrbitControls(this.camera, this.threejs.domElement);
    controls.update();
    
    this.blocks = [];

    this.grid = [];
    this.DIM = 3;

    const loader = new FontLoader();

    loader.load( 'node_modules/three/examples/fonts/helvetiker_regular.typeface.json', function ( font ) {

      const geometry = new TextGeometry( 'Hello World!', {
        font: font,
        size: 0.5,
        height: 0.1,
      } );

      const textMat = new THREE.MeshNormalMaterial();
      const textMesh = new THREE.Mesh(geometry, textMat);
      textMesh.position.set(0,10);
      APP.scene.add(textMesh);
    } );

    

    // const geometry = new THREE.BufferGeometry();
    // const verts = new Float32Array([   
    //   1.0, -1.0,  1.0,
	  //   1.0, -1.0,  -1.0,
	  //   1.0,  1.0,  -1.0,
      
    //   1.0, -1.0,  -1.0,
	  //   -1.0, 1.0,  -1.0,
	  //   1.0,  1.0,  -1.0,

    //   1.0, -1.0,  -1.0,
	  //   -1.0, -1.0,  -1.0,
	  //   -1.0, 1.0,  -1.0,

    //   -1.0, -1.0,  -1.0,
    //   -1.0, -1.0,  1.0,
	  //   -1.0, 1.0,  -1.0,

    //   -1.0, -1.0,  -1.0,
    //   1.0, -1.0,  1.0,
	  //   -1.0, -1.0,  1.0,

    //   -1.0, -1.0,  -1.0,
    //   1.0, -1.0,  -1.0,
	  //   1.0, -1.0,  1.0,

    //   -1.0, -1.0,  1.0,
    //   1.0, 1.0,  -1.0,
	  //   -1.0, 1.0,  -1.0,

    //   -1.0, -1.0,  1.0,
    //   1.0, -1.0,  1.0,
	  //   1.0, 1.0,  -1.0,
    // ]);

    // geometry.setAttribute('position', new THREE.BufferAttribute(verts, 3));
    // const material = new THREE.MeshBasicMaterial({color:"#00ff83" });
    // const mesh = new THREE.Mesh(geometry, material);

    // this.scene.add(mesh);

    // let newMesh = new THREE.Mesh(mesh.geometry.clone(), mesh.material.clone());
    // newMesh.rotateX(Math.PI/2);
    // newMesh.updateMatrix();
    // newMesh.geometry.applyMatrix4(newMesh.matrix);
    // newMesh.matrix.identity();
    // newMesh.position.set( 0, 2, 0 );
    // newMesh.rotation.set( 0, 0, 0 );
    // newMesh.scale.set( 1, 1, 1 );

    // this.scene.add(newMesh);

    this.group = new Group();
    this.scene.add(this.group);
    this.Reset();
    this.RAF();
    this.OnWindowResize();

    document.addEventListener('keydown', (key)=>{
      switch(key.key){
        case " ":
          this.Generate();
          break;
        case "r":
          this.Reset();
          break;
        case "Enter":
          this.Download();
          break;
        case "c":
          console.log(this.group.children.length);
        default:
          break;
      }
      
    })
  }

  InitializeBlocks(){
    this.blocks[0] = new Block(new Float32Array([
      -1.0, -1.0,  1.0,
	    1.0, -1.0,  1.0,
	    1.0,  1.0,  1.0,

      1.0,  1.0,  1.0,
      -1.0,  1.0,  1.0,
      -1.0, -1.0,  1.0,

      1.0, -1.0,  1.0,
	    1.0, 1.0,  -1.0,
	    1.0,  1.0,  1.0,
      
      1.0, -1.0,  1.0,
	    1.0, -1.0,  -1.0,
	    1.0,  1.0,  -1.0,
      
      1.0, -1.0,  -1.0,
	    -1.0, 1.0,  -1.0,
	    1.0,  1.0,  -1.0,

      1.0, -1.0,  -1.0,
	    -1.0, -1.0,  -1.0,
	    -1.0, 1.0,  -1.0,

      -1.0, -1.0,  -1.0,
      -1.0, 1.0,  1.0,
	    -1.0, 1.0,  -1.0,

      -1.0, -1.0,  -1.0,
      -1.0, -1.0,  1.0,
	    -1.0, 1.0,  1.0,

      -1.0, 1.0,  1.0,
      1.0, 1.0,  -1.0,
	    -1.0, 1.0,  -1.0,

      -1.0, 1.0,  1.0,
      1.0, 1.0,  1.0,
	    1.0, 1.0,  -1.0,

      -1.0, -1.0,  -1.0,
      1.0, -1.0,  1.0,
	    -1.0, -1.0,  1.0,

      -1.0, -1.0,  -1.0,
      1.0, -1.0,  -1.0,
	    1.0, -1.0,  1.0,
    ]), "#00ff83");

    this.blocks[1] = new Block(new Float32Array([   
      1.0, -1.0,  1.0,
	    1.0, -1.0,  -1.0,
	    1.0,  1.0,  -1.0,
      
      1.0, -1.0,  -1.0,
	    -1.0, 1.0,  -1.0,
	    1.0,  1.0,  -1.0,

      1.0, -1.0,  -1.0,
	    -1.0, -1.0,  -1.0,
	    -1.0, 1.0,  -1.0,

      -1.0, -1.0,  -1.0,
      -1.0, -1.0,  1.0,
	    -1.0, 1.0,  -1.0,

      -1.0, -1.0,  -1.0,
      1.0, -1.0,  1.0,
	    -1.0, -1.0,  1.0,

      -1.0, -1.0,  -1.0,
      1.0, -1.0,  -1.0,
	    1.0, -1.0,  1.0,

      -1.0, -1.0,  1.0,
      1.0, 1.0,  -1.0,
	    -1.0, 1.0,  -1.0,

      -1.0, -1.0,  1.0,
      1.0, -1.0,  1.0,
	    1.0, 1.0,  -1.0,
    ]), "#048BA8");

    this.blocks[2] = this.blocks[1].Rotate(Math.PI/2,0,"#EFEA5A");
    this.blocks[3] = this.blocks[1].Rotate(-Math.PI/2,0,"#A4036F");
    this.blocks[4] = this.blocks[1].Rotate(Math.PI,0,"#F29E4C");
    this.blocks[5] = this.blocks[1].Rotate(0,Math.PI/2,"#EAD7D1");
    this.blocks[6] = this.blocks[1].Rotate(0,-Math.PI/2,"#E28413");
    this.blocks[7] = this.blocks[1].Rotate(0, Math.PI, "#9792E3");
    this.blocks[8] = this.blocks[1].Rotate(Math.PI, Math.PI/2, "#8D6346");
    this.blocks[9] = this.blocks[1].Rotate(Math.PI, -Math.PI/2, "#9842f5");
    //this.blocks[9] = new Block([],"#000000");

  }

  Setup(){
    for(let i = 0; i < this.blocks.length; ++i){
      const block = this.blocks[i];
      block.Analyze(this.blocks);
    }
    this.Redo();
  }

  Redo(){
    for(let i = 0; i < this.DIM*this.DIM*this.DIM; ++i){
      this.grid[i] = new Cell(this.blocks.length);
    }
  }

  Reset(){
    for(let i = this.group.children.length-1; i >= 0; --i){
      let b = this.group.children[i];
      this.group.remove(b);
      b.geometry.dispose();
      b.material.dispose()
      b = undefined;
    }
    this.InitializeBlocks();
    this.Setup();
  }

  Download(){
    const tempScene = new THREE.Scene();
    const exporter = new GLTFExporter(); 
    
    let meshes = []
    let materials = []
    for(let block of this.group.children){
      //block.geometry.setIndex(new THREE.BufferAttribute(block.geometry.getAttribute('position'), 3));
      //meshes.push(block.geometry);
      //materials.push(block.material);
      tempScene.add(block);
    }

    //const geometry = BufferGeometryUtils.mergeBufferGeometries(meshes);
    //const tempMesh = new THREE.Mesh(geometry, materials);
    //tempScene.add(tempMesh);
    exporter.parse(tempScene, (gltf) => {
      var output = JSON.stringify(gltf);
      console.log(output);
      const blob = new Blob([output], {type: 'model/gltf+json'});
      var link = document.createElement('a');
      link.style.display = 'none';
      document.body.appendChild(link);
      link.href = URL.createObjectURL(blob);
      link.download = "creation.gltf";
      link.click();

      document.body.removeChild(link);
    })

    

  }

  Generate(){
    for(let i = this.group.children.length-1; i >= 0; --i){
      let b = this.group.children[i];
      this.group.remove(b);
      b.geometry.dispose();
      b.material.dispose()
      b = undefined;
    }
    for(let i = 0; i < this.DIM; ++i){
      for(let j = 0; j < this.DIM; ++j){
        for(let k = 0; k < this.DIM; ++k){
          let cell = this.grid[i*this.DIM*this.DIM + j * this.DIM + k];
          if(cell.collapsed){
            let idx = cell.options[0];
            let b =this.blocks[idx].mesh.clone();
            b.position.set(2*i,2*j,2*k);
            this.group.add(b);
          }
        }
      }
    }

    let copy = this.grid.slice();
    copy = copy.filter((x) => !x.collapsed);
    if(copy.length == 0){
      return;
    }

    copy.sort((a,b) => {
      return a.options.length - b.options.length;
    });

    let len = copy[0].options.length;
    let stopIndex = 0;
    for (let i = 1; i < copy.length; i++) {
      if (copy[i].options.length > len) {
        stopIndex = i;
        break;
      }
    }

    if (stopIndex > 0) copy.splice(stopIndex);
    const r1 = Math.floor((Math.random()*copy.length))
    const cell = copy[r1];
    cell.collapsed = true;
    const r = Math.floor(Math.random()*cell.options.length)
    //console.log(r);
    const pick = cell.options[r];
    // if (pick == undefined) {
    //   this.Redo();
    //   return;
    // }
    cell.options = [pick];



    //let visited = Set()
    let next = [];
    for(let i = 0; i < this.DIM; ++i){
      for(let j = 0; j < this.DIM; ++j){
        for(let k = 0; k < this.DIM; ++k){
          let idx = i * this.DIM * this.DIM + j * this.DIM + k;
          //console.log(idx);
          if(this.grid[idx].collapsed){
            next[idx] = this.grid[idx];
          }else{
            let opts = new Array(this.blocks.length).fill(0).map((x,i)=> i);
            if(i > 0){
              let left = this.grid[(i-1)*this.DIM*this.DIM+j*this.DIM+k];
              let valid = new Set();
              for(let option of left.options){
                let v =this.blocks[option].adjacencies[3];
                for(let o of v){
                  valid.add(o);
                }
              }
              
              this.updateOptions(opts, valid);
            }
            if(i < this.DIM-1){
              let right = this.grid[(i+1)*this.DIM*this.DIM+j*this.DIM+k];
              let valid = new Set();
              for(let option of right.options){
                let v =this.blocks[option].adjacencies[2];
                for(let o of v){
                  valid.add(o);
                }
              }
              this.updateOptions(opts, valid);
            }
            if(j > 0){
              let back = this.grid[i*this.DIM*this.DIM+(j-1)*this.DIM+k];
              let valid = new Set();
              for(let option of back.options){
                let v =this.blocks[option].adjacencies[4];
                for(let o of v){
                  valid.add(o);
                }
              }
              this.updateOptions(opts, valid);
              
            }
            if(j < this.DIM-1){
              let front = this.grid[i*this.DIM*this.DIM+(j+1)*this.DIM+k];
              let valid = new Set();
              for(let option of front.options){
                let v =this.blocks[option].adjacencies[5];
                
                for(let o of v){
                  valid.add(o);
                }
              }
              this.updateOptions(opts, valid);
              
            }
            if(k > 0){
              let down = this.grid[i*this.DIM*this.DIM+j*this.DIM+(k-1)];
              let valid = new Set();
              for(let option of down.options){
                let v =this.blocks[option].adjacencies[0];
                for(let o of v){
                  valid.add(o);
                }
              }
              this.updateOptions(opts, valid);
              
            }
            if(k < this.DIM-1){
              let up = this.grid[i*this.DIM*this.DIM+j*this.DIM+(k+1)];
              let valid = new Set();
              for(let option of up.options){
                let v =this.blocks[option].adjacencies[1];
                for(let o of v){
                  valid.add(o);
                }
              }
              this.updateOptions(opts, valid);
              
            }
            next[idx] = new Cell(opts);
            
          }
        }
      }
    }
    //console.log(next);
    this.grid = next;
    this.Generate();
  }

  // DFS(x,y,z,visited){
  //   let idx = x*this.DIM*this.DIM+y*this.DIM+z;
  //   if(x < 0 || y < 0 || z < 0 || x == this.DIM || y == this.DIM || z == this.DIM || this.grid[idx].collapsed){
  //     return;
  //   }
  //   if(visited.has(idx)){
  //     return;
  //   }
  //   visited.add(idx);


  // }

  RAF(){
    requestAnimationFrame(() => {
      this.threejs.render(this.scene, this.camera);
      //this.Generate();
      this.RAF();
    });
  }

  OnWindowResize(){
    this.camera.aspect = window.innerWidth/window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.threejs.setSize(window.innerWidth, window.innerHeight);
  }

  updateOptions(options, valid){
    for(let i = options.length - 1; i >= 0; i--){
      let option = options[i];
      if(!valid.has(option)){
        options.splice(i,1);
      }
    }
  }
}



let APP = null
window.addEventListener('DOMContentLoaded', ()=>{
  APP = new Demo();
});