import * as THREE from 'three';
import { CombatEvent } from './types';

interface FloatingText {
  text: string;
  position: THREE.Vector3;
  color: string;
  scale: number;
  opacity: number;
  velocity: THREE.Vector3;
  lifetime: number;
}

export class CombatUI {
  private scene: THREE.Scene;
  private camera: THREE.Camera;
  private floatingTexts: FloatingText[] = [];
  private readonly TEXT_LIFETIME = 1.0; // seconds
  private readonly TEXT_FADE_TIME = 0.5; // seconds
  private readonly TEXT_RISE_SPEED = 2.0; // units per second
  private readonly CHILD_FRIENDLY_COLORS = {
    damage: '#ff4444',
    heal: '#44ff44',
    shield: '#4444ff',
    energy: '#ffff44',
    transform: '#ff44ff'
  };

  constructor(scene: THREE.Scene, camera: THREE.Camera) {
    this.scene = scene;
    this.camera = camera;
  }

  public handleCombatEvent(event: CombatEvent): void {
    if (!event.position) return;

    switch (event.type) {
      case 'damage':
        this.createFloatingText(
          event.amount?.toString() || '0',
          event.position,
          this.CHILD_FRIENDLY_COLORS.damage
        );
        break;
      case 'heal':
        this.createFloatingText(
          `+${event.amount || 0}`,
          event.position,
          this.CHILD_FRIENDLY_COLORS.heal
        );
        break;
      case 'effect':
        this.createStatusIcon(event.position, event.visualEffect || 'effect');
        break;
      case 'transform':
        this.createTransformEffect(event.position);
        break;
      case 'victory':
        this.createVictoryText(event.position);
        break;
      case 'defeat':
        this.createDefeatText(event.position);
        break;
    }
  }

  private createFloatingText(text: string, position: THREE.Vector3, color: string): void {
    const floatingText: FloatingText = {
      text,
      position: position.clone(),
      color,
      scale: 1.0,
      opacity: 1.0,
      velocity: new THREE.Vector3(0, this.TEXT_RISE_SPEED, 0),
      lifetime: this.TEXT_LIFETIME
    };

    this.floatingTexts.push(floatingText);
  }

  private createStatusIcon(position: THREE.Vector3, effectType: string): void {
    // Implementation for status effect icons
    // This would create a 2D sprite or 3D icon above the character
  }

  private createTransformEffect(position: THREE.Vector3): void {
    // Implementation for transformation effect text
    // This would create a special text effect for transformations
  }

  private createVictoryText(position: THREE.Vector3): void {
    this.createFloatingText(
      'VICTORY!',
      position,
      this.CHILD_FRIENDLY_COLORS.energy
    );
  }

  private createDefeatText(position: THREE.Vector3): void {
    this.createFloatingText(
      'DEFEAT',
      position,
      this.CHILD_FRIENDLY_COLORS.damage
    );
  }

  public update(deltaTime: number): void {
    // Update floating texts
    this.floatingTexts = this.floatingTexts.filter(text => {
      text.lifetime -= deltaTime;
      text.position.add(text.velocity.clone().multiplyScalar(deltaTime));

      // Fade out
      if (text.lifetime < this.TEXT_FADE_TIME) {
        text.opacity = text.lifetime / this.TEXT_FADE_TIME;
      }

      return text.lifetime > 0;
    });
  }

  public render(): void {
    // Render floating texts
    this.floatingTexts.forEach(text => {
      // Convert 3D position to 2D screen position
      const screenPosition = new THREE.Vector3();
      screenPosition.copy(text.position);
      screenPosition.project(this.camera);

      // Calculate screen coordinates
      const x = (screenPosition.x + 1) * window.innerWidth / 2;
      const y = (-screenPosition.y + 1) * window.innerHeight / 2;

      // Create or update text element
      this.updateTextElement(text, x, y);
    });
  }

  private updateTextElement(text: FloatingText, x: number, y: number): void {
    // Implementation for updating text elements in the DOM
    // This would create or update HTML elements for the floating text
  }

  public dispose(): void {
    // Clean up any DOM elements
    this.floatingTexts = [];
  }
} 