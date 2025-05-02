<script>
// Based on this tutorial: https://youtu.be/vM8M4QloVL0?si=d3p25EeE3_BAOvZB

import * as THREE from 'three'
import globeTexture from '@/assets/img/globe-texture.jpg'
import vertexShader from '@/assets/shaders/vertex.glsl'
import fragmentShader from '@/assets/shaders/fragment.glsl'

const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
const renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: true,
})
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setPixelRatio(window.devicePixelRatio)
document.body.appendChild(renderer.domElement)

// create a sphere
const sphere = new THREE.Mesh(
  new THREE.SphereGeometry(5, 50, 50),
  new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      globeTexture: {
        value: new THREE.TextureLoader().load(globeTexture),
      },
    },
  }),
)

scene.add(sphere)

camera.position.z = 10

// console.log(sphere)

function animate() {
  requestAnimationFrame(animate)
  renderer.render(scene, camera)
}

animate()
</script>
<template>
  <div></div>
</template>
<style scoped></style>
