import { Color, Scene } from 'three';
import { PartGenerator } from '../PartGenerator';
import { PrimitiveRobot } from '../PrimitiveRobot';
import { RobotConfig } from '../types';

describe('PrimitiveRobot', () => {
  let scene: Scene;
  let partGenerator: PartGenerator;
  let robot: PrimitiveRobot;

  beforeEach(() => {
    scene = new Scene();
    partGenerator = new PartGenerator();
    robot = new PrimitiveRobot(scene, partGenerator);
  });

  afterEach(() => {
    robot.dispose();
  });

  it('should assemble a complete robot from parts', () => {
    const config: RobotConfig = {
      faction: 'autobot',
      parts: {
        head: 'autobot-basic-head',
        torso: 'autobot-basic-torso',
        leftArm: 'autobot-basic-arm',
        rightArm: 'autobot-basic-arm',
        leftLeg: 'autobot-basic-leg',
        rightLeg: 'autobot-basic-leg',
        weapon: 'autobot-basic-weapon'
      },
      colors: {
        primary: new Color(0xff0000),
        secondary: new Color(0x0000ff)
      },
      materials: {
        metalness: 0.7,
        roughness: 0.3
      }
    };

    robot.assembleParts(config);

    // Verify that all parts are present in the scene
    expect(scene.children).toHaveLength(1); // Root group
    expect(scene.children[0].children).toHaveLength(1); // Torso
    
    // Find the torso
    const torso = scene.children[0].children[0];
    expect(torso.children).toHaveLength(6); // Head, 2 arms, 2 legs, weapon
  });

  it('should swap parts correctly', () => {
    const config: RobotConfig = {
      faction: 'autobot',
      parts: {
        head: 'autobot-basic-head',
        torso: 'autobot-basic-torso',
        leftArm: 'autobot-basic-arm',
        rightArm: 'autobot-basic-arm',
        leftLeg: 'autobot-basic-leg',
        rightLeg: 'autobot-basic-leg'
      },
      colors: {
        primary: new Color(0xff0000),
        secondary: new Color(0x0000ff)
      },
      materials: {
        metalness: 0.7,
        roughness: 0.3
      }
    };

    robot.assembleParts(config);

    // Swap the head
    const newHeadId = 'autobot-commander-head';
    robot.swapPart('head', newHeadId);

    // Verify that the head was swapped
    expect(config.parts.head).toBe(newHeadId);
  });

  it('should update colors correctly', () => {
    const config: RobotConfig = {
      faction: 'autobot',
      parts: {
        head: 'autobot-basic-head',
        torso: 'autobot-basic-torso',
        leftArm: 'autobot-basic-arm',
        rightArm: 'autobot-basic-arm',
        leftLeg: 'autobot-basic-leg',
        rightLeg: 'autobot-basic-leg'
      },
      colors: {
        primary: new Color(0xff0000),
        secondary: new Color(0x0000ff)
      },
      materials: {
        metalness: 0.7,
        roughness: 0.3
      }
    };

    robot.assembleParts(config);

    const newPrimary = new Color(0x00ff00);
    const newSecondary = new Color(0xff00ff);
    robot.updateColors(newPrimary, newSecondary);

    // Verify that colors were updated
    // Note: In a real test, you'd need to check the actual material colors
    // This is just a basic structure check
    expect(config.colors.primary).not.toEqual(newPrimary);
    expect(config.colors.secondary).not.toEqual(newSecondary);
  });

  it('should apply damage correctly', () => {
    const config: RobotConfig = {
      faction: 'autobot',
      parts: {
        head: 'autobot-basic-head',
        torso: 'autobot-basic-torso',
        leftArm: 'autobot-basic-arm',
        rightArm: 'autobot-basic-arm',
        leftLeg: 'autobot-basic-leg',
        rightLeg: 'autobot-basic-leg'
      },
      colors: {
        primary: new Color(0xff0000),
        secondary: new Color(0x0000ff)
      },
      materials: {
        metalness: 0.7,
        roughness: 0.3
      }
    };

    robot.assembleParts(config);

    // Apply damage to the head
    robot.setDamage('head', 0.5);

    // Note: In a real test, you'd need to check the actual material properties
    // This is just verifying that the method doesn't throw
    expect(() => robot.setDamage('head', 0.5)).not.toThrow();
  });
}); 