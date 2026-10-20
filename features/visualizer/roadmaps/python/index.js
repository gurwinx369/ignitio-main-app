import MemoryVaultRig from './MemoryVaultRig';
import InterpreterConveyorRig from './InterpreterConveyorRig';
import TypeInspectorRig from './TypeInspectorRig';
import TranslatorLatheRig from './TranslatorLatheRig';
import StringSlicingRig from './StringSlicingRig';
import ControlFlowRig from './ControlFlowRig';
import DynamicArrayRig from './DynamicArrayRig';
import HashTableCaliberRig from './HashTableCaliberRig';
import LoopGovernorRig from './LoopGovernorRig';
import CallStackTowerRig from './CallStackTowerRig';
import ObjectBlueprintRig from './ObjectBlueprintRig';
import LogicGateRig from './LogicGateRig';
import FileIOBufferRig from './FileIOBufferRig';
import GenericConceptRig from './GenericConceptRig';

export {
  MemoryVaultRig,
  InterpreterConveyorRig,
  TypeInspectorRig,
  TranslatorLatheRig,
  StringSlicingRig,
  ControlFlowRig,
  DynamicArrayRig,
  HashTableCaliberRig,
  LoopGovernorRig,
  CallStackTowerRig,
  ObjectBlueprintRig,
  LogicGateRig,
  FileIOBufferRig,
  GenericConceptRig,
};

/**
 * Static PythonApparatus Dispatcher Component
 * Satisfies React static components rules and provides stable component tree identity.
 */
export function PythonApparatus({ apparatusType, ...props }) {
  switch (apparatusType) {
    case 'memory_vault_rig':
      return <MemoryVaultRig {...props} />;
    case 'interpreter_conveyor_rig':
      return <InterpreterConveyorRig {...props} />;
    case 'type_inspector_rig':
      return <TypeInspectorRig {...props} />;
    case 'translator_lathe_rig':
      return <TranslatorLatheRig {...props} />;
    case 'string_slicing_rig':
      return <StringSlicingRig {...props} />;
    case 'control_flow_rig':
      return <ControlFlowRig {...props} />;
    case 'dynamic_array_rig':
      return <DynamicArrayRig {...props} />;
    case 'hash_table_caliber_rig':
      return <HashTableCaliberRig {...props} />;
    case 'loop_governor_rig':
      return <LoopGovernorRig {...props} />;
    case 'call_stack_tower_rig':
      return <CallStackTowerRig {...props} />;
    case 'object_blueprint_rig':
      return <ObjectBlueprintRig {...props} />;
    case 'logic_gate_rig':
      return <LogicGateRig {...props} />;
    case 'file_io_buffer_rig':
      return <FileIOBufferRig {...props} />;
    default:
      return <GenericConceptRig {...props} />;
  }
}

