// background.js
/**
 * Dynamic 3D Network Animation Background
 * 
 * This animation creates a responsive, high-performance 3D network of nodes and edges
 * that simulates a data web/graph with subtle movement. It uses Three.js for efficient
 * WebGL rendering with optimized performance and includes reduced motion settings
 * for accessibility. The animation creates an ambient tech atmosphere with depth
 * and dimension while remaining subtle enough to sit behind content.
 */

import * as THREE from 'three';

class NetworkBackground {
  constructor(container, options = {}) {
    // Default configuration
    this.config = {
      particleCount: window.innerWidth < 768 ? 100 : 200,
      particleSize: 0.5,
      connectionDistance: 150,
      connectionOpacity: 0.15,
      colors: {
        particles: 0x00eaff, // Cyan
        connections: 0x2f81f7, // Blue
        background: 0x0d0d0d // Near black
      },
      depth: 400,
      speed: 0.2,
      followMouse: true,
      reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
      ...options
    };

    // Initialize properties
    this.container = container;
    this.width = container.offsetWidth;
    this.height = container.offsetHeight;
    this.mouseX = 0;
    this.mouseY = 0;
    this.particles = [];
    
    // Initialize scene
    this.init();
    this.setupEventListeners();
    this.animate();
  }

  init() {
    // Create renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Performance optimization
    this.container.appendChild(this.renderer.domElement);

    // Create scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(this.config.colors.background);
    
    // Create camera with perspective
    this.camera = new THREE.PerspectiveCamera(
      50, this.width / this.height, 1, 3000
    );
    this.camera.position.z = 1000;
    
    // Create particle geometry and material
    const particleGeometry = new THREE.BufferGeometry();
    const particleMaterial = new THREE.PointsMaterial({
      color: this.config.colors.particles,
      size: this.config.particleSize,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });
    
    // Create particles
    const particlePositions = new Float32Array(this.config.particleCount * 3);
    const particleSpeeds = new Float32Array(this.config.particleCount);
    
    for (let i = 0; i < this.config.particleCount; i++) {
      // Random position within a sphere
      const radius = Math.random() * this.config.depth;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      
      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);
      
      particlePositions[i * 3] = x;
      particlePositions[i * 3 + 1] = y;
      particlePositions[i * 3 + 2] = z;
      
      // Random speed multiplier
      particleSpeeds[i] = 0.5 + Math.random() * 0.5;
      
      // Store particles for animation
      this.particles.push({
        position: new THREE.Vector3(x, y, z),
        speed: particleSpeeds[i]
      });
    }
    
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    this.particleSystem = new THREE.Points(particleGeometry, particleMaterial);
    this.scene.add(this.particleSystem);
    
    // Create lines for connections
    this.lineMaterial = new THREE.LineBasicMaterial({
      color: this.config.colors.connections,
      transparent: true,
      opacity: this.config.connectionOpacity,
      blending: THREE.AdditiveBlending
    });
    
    // Initialize the lines - we'll update them dynamically
    this.lines = [];
  }
  
  setupEventListeners() {
    // Mouse movement tracking
    if (this.config.followMouse) {
      window.addEventListener('mousemove', (event) => {
        this.mouseX = (event.clientX - window.innerWidth / 2) * 0.05;
        this.mouseY = (event.clientY - window.innerHeight / 2) * 0.05;
      });

      // For touch screens
      window.addEventListener('touchmove', (event) => {
        if (event.touches.length > 0) {
          this.mouseX = (event.touches[0].clientX - window.innerWidth / 2) * 0.05;
          this.mouseY = (event.touches[0].clientY - window.innerHeight / 2) * 0.05;
        }
      });
    }
    
    // Resize handling
    window.addEventListener('resize', () => {
      this.width = this.container.offsetWidth;
      this.height = this.container.offsetHeight;
      
      this.camera.aspect = this.width / this.height;
      this.camera.updateProjectionMatrix();
      
      this.renderer.setSize(this.width, this.height);
    });
    
    // Reduced motion setting detection
    window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
      this.config.reducedMotion = e.matches;
    });
  }
  
  updateParticles(time) {
    const positions = this.particleSystem.geometry.attributes.position.array;
    
    // Remove old connections
    this.lines.forEach(line => this.scene.remove(line));
    this.lines = [];
    
    // Create new connections and update particle positions
    const connectionPoints = [];
    
    for (let i = 0; i < this.config.particleCount; i++) {
      const particle = this.particles[i];
      
      // Only animate if reduced motion is not active
      if (!this.config.reducedMotion) {
        // Calculate orbital motion path
        const speed = this.config.speed * particle.speed;
        const orbitRadius = particle.position.length();
        
        // Create circular orbit motion around center
        const currentX = positions[i * 3];
        const currentY = positions[i * 3 + 1];
        const currentZ = positions[i * 3 + 2];
        
        // Rotation around y-axis
        const cosY = Math.cos(speed * time * 0.0001);
        const sinY = Math.sin(speed * time * 0.0001);
        
        positions[i * 3] = currentX * cosY - currentZ * sinY;
        positions[i * 3 + 2] = currentX * sinY + currentZ * cosY;
        
        // Add subtle vertical pulsation
        positions[i * 3 + 1] = currentY + Math.sin(time * 0.001 * particle.speed) * 0.5;
      }
      
      // Add subtle camera movement response to mouse
      if (this.config.followMouse && !this.config.reducedMotion) {
        this.camera.position.x += (this.mouseX - this.camera.position.x) * 0.01;
        this.camera.position.y += (-this.mouseY - this.camera.position.y) * 0.01;
        this.camera.lookAt(this.scene.position);
      }
      
      // Connect particles that are close to each other
      const particlePosition = new THREE.Vector3(
        positions[i * 3],
        positions[i * 3 + 1],
        positions[i * 3 + 2]
      );
      
      for (let j = i + 1; j < this.config.particleCount; j++) {
        const otherPosition = new THREE.Vector3(
          positions[j * 3],
          positions[j * 3 + 1],
          positions[j * 3 + 2]
        );
        
        const distance = particlePosition.distanceTo(otherPosition);
        
        if (distance < this.config.connectionDistance) {
          // Adjust opacity based on distance
          const opacity = this.config.connectionOpacity * 
            (1 - distance / this.config.connectionDistance);
          
          connectionPoints.push({
            from: particlePosition.clone(),
            to: otherPosition.clone(),
            opacity
          });
        }
      }
    }
    
    // Update the positions buffer
    this.particleSystem.geometry.attributes.position.needsUpdate = true;
    
    // Create connection lines with proper opacity
    connectionPoints.forEach(connection => {
      const lineGeometry = new THREE.BufferGeometry().setFromPoints([
        connection.from,
        connection.to
      ]);
      
      const material = this.lineMaterial.clone();
      material.opacity = connection.opacity;
      
      const line = new THREE.Line(lineGeometry, material);
      this.scene.add(line);
      this.lines.push(line);
    });
  }
  
  animate() {
    const animate = (time) => {
      requestAnimationFrame(animate);
      
      this.updateParticles(time);
      this.renderer.render(this.scene, this.camera);
    };
    
    animate(0);
  }
}

export default NetworkBackground;