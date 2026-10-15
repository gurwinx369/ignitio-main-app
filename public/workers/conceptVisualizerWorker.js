/**
 * conceptVisualizerWorker.js
 * Dedicated Web Worker for Ignitio Concept Visualizer.
 * Offloads physics tick calculation, isometric 3D math projections,
 * and state-machine transitions so the main browser thread stays 60-120 FPS.
 */

// Isometric projection constants (30° elevation)
const ISO_COS = 0.86602540378; // cos(30°)
const ISO_SIN = 0.5;           // sin(30°)

function projectIso(x, y, z = 0, scale = 1, originX = 0, originY = 0) {
  const sx = originX + (x - y) * ISO_COS * scale;
  const sy = originY + (x + y) * ISO_SIN * scale - (z * scale);
  return { sx: Math.round(sx * 10) / 10, sy: Math.round(sy * 10) / 10 };
}

// Spring physics state
let springState = {
  pos: 0,
  target: 0,
  vel: 0,
  k: 0.15,
  damping: 0.78,
};

let currentApparatus = null;
let currentStep = 0;
let simulationState = {};

function stepSpring() {
  const force = -springState.k * (springState.pos - springState.target);
  springState.vel = (springState.vel + force) * springState.damping;
  springState.pos += springState.vel;
  return Math.abs(springState.vel) > 0.001 || Math.abs(springState.pos - springState.target) > 0.001;
}

self.onmessage = function (e) {
  const { type, payload } = e.data || {};

  switch (type) {
    case 'INIT': {
      currentApparatus = payload.apparatus || 'generic';
      currentStep = payload.initialStep || 0;
      simulationState = {
        step: currentStep,
        totalSteps: payload.totalSteps || 4,
        params: payload.params || {},
        variables: payload.variables || { x: 10, y: 'Ignitio', isReady: true },
        memory: payload.memory || [
          { address: '0x7FF0', label: 'x', value: 10, type: 'int', active: false },
          { address: '0x7FF4', label: 'y', value: "'Ignitio'", type: 'str', active: false },
          { address: '0x7FF8', label: 'isReady', value: 'True', type: 'bool', active: false },
          { address: '0x7FFC', label: '[free]', value: '0x00', type: 'empty', active: false },
        ],
        bytecode: payload.bytecode || [
          { op: 'LOAD_CONST', arg: '10', active: false },
          { op: 'STORE_NAME', arg: 'x', active: false },
          { op: 'LOAD_CONST', arg: "'Ignitio'", active: false },
          { op: 'STORE_NAME', arg: 'y', active: false },
        ],
        output: [],
      };

      springState.pos = currentStep * 100;
      springState.target = currentStep * 100;
      springState.vel = 0;

      sendFrameUpdate('INITIALIZED');
      break;
    }

    case 'SET_STEP': {
      const targetStep = Math.max(0, Math.min(payload.step, (simulationState.totalSteps || 4) - 1));
      currentStep = targetStep;
      simulationState.step = targetStep;
      springState.target = targetStep * 100;

      // Update state for the step
      applyStepState(targetStep);
      sendFrameUpdate('STEP_CHANGED');
      break;
    }

    case 'SET_VARIABLE': {
      const { name, value, typeName } = payload;
      if (simulationState.variables) {
        simulationState.variables[name] = value;
      }
      // Update memory slot if present
      const slot = simulationState.memory.find(m => m.label === name);
      if (slot) {
        slot.value = value;
        if (typeName) slot.type = typeName;
        slot.active = true;
      }
      springState.target += 5; // micro-pulse
      sendFrameUpdate('VARIABLE_UPDATED');
      break;
    }

    case 'RUN_TICK': {
      const isMoving = stepSpring();
      sendFrameUpdate('TICK', { isMoving });
      break;
    }

    case 'PROJECT_COORDS': {
      const points = payload.points || [];
      const scale = payload.scale || 1;
      const origin = payload.origin || { x: 0, y: 0 };
      const projected = points.map(p => projectIso(p.x, p.y, p.z || 0, scale, origin.x, origin.y));
      self.postMessage({
        type: 'PROJECTED_COORDS',
        requestId: payload.requestId,
        projected,
      });
      break;
    }

    default:
      break;
  }
};

function applyStepState(step) {
  // Update memory/bytecode highlights depending on apparatus & step
  if (currentApparatus === 'interpreter_conveyor_rig' || currentApparatus === 'interpreter-engine') {
    simulationState.bytecode.forEach((b, idx) => {
      b.active = idx === step;
    });
    if (step === 0) {
      simulationState.output = ['[PVM] Initializing Python Virtual Machine...'];
    } else if (step === 1) {
      simulationState.output = ['[PVM] Fetching bytecode: LOAD_CONST 10', '[PVM] Stack pushed: 10'];
    } else if (step === 2) {
      simulationState.output = ['[PVM] Executing STORE_NAME x', '[PVM] Memory allocated at 0x7FF0'];
      if (simulationState.memory[0]) simulationState.memory[0].active = true;
    } else if (step === 3) {
      simulationState.output = ['[PVM] Execution complete. Return code 0.'];
    }
  } else if (currentApparatus === 'memory_vault_rig' || currentApparatus === 'memory-vault') {
    simulationState.memory.forEach((m, idx) => {
      m.active = idx === step;
    });
  } else if (currentApparatus === 'type_inspector_rig' || currentApparatus === 'type-inspector') {
    if (simulationState.memory[step % simulationState.memory.length]) {
      simulationState.memory.forEach(m => { m.active = false; });
      simulationState.memory[step % simulationState.memory.length].active = true;
    }
  }
}

function sendFrameUpdate(reason, extra = {}) {
  // Dial gauge degrees: map 0..totalSteps to 30deg..150deg
  const total = Math.max(1, (simulationState.totalSteps || 4) - 1);
  const progress = currentStep / total;
  const needleDeg = 30 + progress * 120 + (springState.vel * 2);

  // Mechanical slider/carriage position
  const carriageX = springState.pos;

  self.postMessage({
    type: 'FRAME_UPDATE',
    reason,
    step: currentStep,
    totalSteps: simulationState.totalSteps || 4,
    springPos: Math.round(springState.pos * 10) / 10,
    carriageX: Math.round(carriageX * 10) / 10,
    needleDeg: Math.round(needleDeg * 10) / 10,
    simulationState: {
      ...simulationState,
    },
    ...extra,
  });
}
