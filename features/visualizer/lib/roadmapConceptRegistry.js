/**
 * roadmapConceptRegistry.js
 * Technical Specification Registry for Python Roadmap Anatomy Visualizations.
 * Calibrated to authentic Anatomy blueprint standards (Image 1: Horology Watch Caliber; Image 2: Raptor Test Stand).
 */

const DOMAIN_REGISTRY = {
  // Day 1: Course Introduction & Programming Foundations
  programming: {
    apparatus: 'translator_lathe_rig',
    specTitle: 'SOURCE TRANSLATOR LATHE',
    fig: 'Fig 1.2',
    phases: [
      'Phase 1: High-level Python source statement `print("Hello")` loaded into lexer head.',
      'Phase 2: Lexical analysis disassembles code into discrete syntactic tokens.',
      'Phase 3: Python compiler generates intermediate bytecode instructions (`LOAD_CONST 0`).',
      'Phase 4: Low-level binary electrical signals (0/1) dispatched to the hardware CPU.',
    ],
    telemetry: [
      'SRC: UTF-8 · 18 B · TOKEN [PRINT]',
      'LEX: OP_CODE · 0x01 · TOKEN [STR_CONST]',
      'BYTE: 0x6400 · 32 B · LOAD_CONST [0]',
      'CPU: 01001000 · 1.2V · BINARY [EXEC_OK]',
    ],
  },

  // Day 2: Variables & Memory
  memory: {
    apparatus: 'memory_vault_rig',
    specTitle: 'PYTHON MEMORY CALIBER',
    fig: 'Fig 2.3',
    phases: [
      'Slot 1: Variable `x` is assigned integer 10. Memory space allocated at 0x7FF0.',
      'Slot 2: Variable `y` is assigned string "Ignitio". Reference pointer secured at 0x7FF4.',
      'Slot 3: Boolean `isReady` assigned True. Reference clamp registered at 0x7FF8.',
      'Slot 4: Memory inspects allocation status. Variables are labels, values live in memory cells.',
    ],
    telemetry: [
      '0x7FF0 · 28 B · INT [10]',
      '0x7FF4 · 56 B · STR [\'Ignitio\']',
      '0x7FF8 · 28 B · BOOL [True]',
      '0x7FFC · 0 B · EMPTY [0x00]',
    ],
  },

  // Day 2: Interpreter Execution
  interpreter: {
    apparatus: 'interpreter_conveyor_rig',
    specTitle: 'PVM EXECUTION CONVEYOR',
    fig: 'Fig 2.2',
    phases: [
      'Phase 1: Python source code read into memory line by line.',
      'Phase 2: Virtual Machine compiler transforms AST into compact bytecode tape.',
      'Phase 3: Evaluation loop dispatches bytecode instruction to runtime frame.',
      'Phase 4: Output buffer flushes result directly to the terminal stdout stream.',
    ],
    telemetry: [
      'IO: STDIN · 42 B · STATUS [PARSING]',
      'AST: ROOT_NODE · 0x1A08 · DEPTH [3]',
      'PVM: EVAL_LOOP · PC: 0x001C · STACK [TOP]',
      'IO: STDOUT · 14 B · STREAM [FLUSH_OK]',
    ],
  },

  // Day 3: Data Types, Conversion & Operators
  types: {
    apparatus: 'type_inspector_rig',
    specTitle: 'TYPE INFERENCE SPECTROMETER',
    fig: 'Fig 3.1',
    phases: [
      'Vial 1: Integer literal `10` analyzed. Primitive value wrapped in PyObject container.',
      'Vial 2: String `"Python"` inspected. Immutable character buffer cached in heap.',
      'Vial 3: Floating point `3.14` measured. IEEE 754 64-bit precision allocated.',
      'Vial 4: Boolean `True` checked. Singleton instance addressed in memory table.',
    ],
    telemetry: [
      'OB_TYPE: <class \'int\'> · 0x10A9B0 · 28 B',
      'OB_TYPE: <class \'str\'> · 0x22C7E4 · 54 B',
      'OB_TYPE: <class \'float\'> · 0x33F891 · 24 B',
      'OB_TYPE: <class \'bool\'> · 0x00A1F0 · SINGLETON',
    ],
  },

  // Day 4: Strings, Indexing & Slicing
  strings: {
    apparatus: 'string_slicing_rig',
    specTitle: 'STRING SLICING CALIPER',
    fig: 'Fig 4.2',
    phases: [
      'Step 1: String sequence `"Python"` stored as contiguous indexed array in memory.',
      'Step 2: Forward indexing access `s[0] -> \'P\'` resolves direct zero-offset pointer.',
      'Step 3: Negative indexing `s[-1] -> \'n\'` evaluates reverse offset from length.',
      'Step 4: Slice range `s[1:4] -> \'yth\'` constructs new immutable sub-string window.',
    ],
    telemetry: [
      'INDEX: [0] · CHAR: \'P\' · OFFSET +0',
      'INDEX: [2] · CHAR: \'t\' · OFFSET +2',
      'INDEX: [-1] · CHAR: \'n\' · OFFSET LEN-1',
      'SLICE: [1:4] · SUB: \'yth\' · LEN: 3 B',
    ],
  },

  // Day 5: Conditional Statements & Lists
  conditionals: {
    apparatus: 'control_flow_rig',
    specTitle: 'CONTROL FLOW COMMUTATOR',
    fig: 'Fig 5.1',
    phases: [
      'Condition 1: Boolean expression evaluates operand truthiness (`score >= 90`).',
      'Condition 2: Truth branch triggers commutator gate to execute `if` block.',
      'Condition 3: False condition shifts control relay to alternate `elif` check.',
      'Condition 4: Default `else` bypass valve catches all remaining execution paths.',
    ],
    telemetry: [
      'GATE: TEST_COND · VAL: True · JUMP [TAKEN]',
      'REG: COND_A · EVAL: 0x01 · PATH [BRANCH_1]',
      'GATE: ELIF_BYPASS · VAL: False · JUMP [SKIP]',
      'COMMUTATOR: RESOLVED · PC: 0x0088 · END',
    ],
  },

  // Day 5: Lists & Sequences
  lists: {
    apparatus: 'dynamic_array_rig',
    specTitle: 'DYNAMIC ARRAY MATRIX',
    fig: 'Fig 5.3',
    phases: [
      'Slot 1: Dynamic array allocated with over-allocation headroom for O(1) appends.',
      'Slot 2: Contiguous memory slots store reference pointers to distinct heap objects.',
      'Slot 3: Append operation inserts new pointer and updates array internal length counter.',
      'Slot 4: Pop operation retrieves trailing element and frees reference slot.',
    ],
    telemetry: [
      'LIST_HDR: ob_size=4 · alloc=8 · 0x51A0',
      'PTR[0]: 0x7FF0 -> INT[10] · VALID',
      'PTR[1]: 0x7FF4 -> STR[\'Ignitio\'] · VALID',
      'PTR[2]: 0x7FF8 -> BOOL[True] · VALID',
    ],
  },

  // Day 6: Dictionaries & Sets
  dictionaries: {
    apparatus: 'hash_table_caliber_rig',
    specTitle: 'HASH TABLE CALIBER',
    fig: 'Fig 6.1',
    phases: [
      'Slot 1: String key `"name"` passed through Python SipHash hash algorithm.',
      'Slot 2: Computed hash value mapped to discrete sparse hash table index bucket.',
      'Slot 3: Key-value pair saved with collision probe resolution mechanism.',
      'Slot 4: O(1) direct dictionary lookup retrieves object pointer instantaneously.',
    ],
    telemetry: [
      'KEY: "name" · HASH: 0x9B4D · BUCKET [2]',
      'VAL: "Alice" · 0x88F0 · PTR [SECURED]',
      'COLLISION: NONE · PROBE: 0 · STATUS [OK]',
      'TABLE: entries=1 · dk_size=8 · LOAD 12.5%',
    ],
  },

  // Day 7: Loops & Iteration
  loops: {
    apparatus: 'loop_governor_rig',
    specTitle: 'CYCLE GOVERNOR & ITERATOR',
    fig: 'Fig 7.1',
    phases: [
      'Cycle 1: Iterator object initialized with internal counter cursor at index 0.',
      'Cycle 2: `__next__()` method invoked to extract next sequential sequence item.',
      'Cycle 3: Loop body executes state logic and increments step accumulator.',
      'Cycle 4: `StopIteration` signal tripped when sequence bounds reached; loop safely exits.',
    ],
    telemetry: [
      'ITER: init · CURSOR: 0 · RANGE [0..10]',
      'CYCLE: 01 · YIELD: item[0] · REG: 0x00',
      'CYCLE: 02 · YIELD: item[1] · REG: 0x01',
      'SIGNAL: StopIteration · TRIPPED · HALT',
    ],
  },

  // Day 8: Functions & Call Stack
  functions: {
    apparatus: 'call_stack_tower_rig',
    specTitle: 'CALL STACK KINEMATIC TOWER',
    fig: 'Fig 8.1',
    phases: [
      'Frame 1: Function call initiates new stack frame with local namespace.',
      'Frame 2: Formal parameter variables bind to caller argument values in memory.',
      'Frame 3: Function body executes inside encapsulated private scope.',
      'Frame 4: `return` expression yields value back to caller; frame pops off call stack.',
    ],
    telemetry: [
      'STACK_PTR: 0x3F80 · FRAME: main()',
      'PUSH_FRAME: calculate() · ARGS: (x=10)',
      'LOCAL_VARS: [result=20] · PC: 0x0032',
      'POP_FRAME: RET [20] · STACK_PTR: 0x3F80',
    ],
  },

  // Day 9: File Handling
  files: {
    apparatus: 'file_io_buffer_rig',
    specTitle: 'FILE I/O BUFFER RIG',
    fig: 'Fig 9.1',
    phases: [
      'Phase 1: `open("data.txt", "r")` requests file descriptor (FD) from the operating system.',
      'Phase 2: Sequential byte buffer streams 248 B of raw data from disk into 1024 B memory cache.',
      'Phase 3: UTF-8 decode drum converts raw byte punch-tape into a Python Unicode string object.',
      'Phase 4: `with` context manager closes the file descriptor (FD), flushing all I/O handles.',
    ],
    telemetry: [
      'FD: 0x0003 · MODE: "r" · PATH [data.txt]',
      'BUFFER: 1024 B · READ: 248 B · CACHED',
      'DECODE: UTF-8 · UNICODE: 14 lines',
      'FD: CLOSED · LEAK: 0 B · FLUSH [OK]',
    ],
  },

  // Day 3: Operators (arithmetic, comparison, logical)
  operators: {
    apparatus: 'logic_gate_rig',
    specTitle: 'LOGIC GATE EVALUATOR RIG',
    fig: 'Fig 3.2',
    phases: [
      'Gate 1: AND gate — both inputs must be True for the output to be True.',
      'Gate 2: OR gate — at least one input must be True for the output to be True.',
      'Gate 3: NOT gate — inverts a single boolean operand (True → False, False → True).',
      'Gate 4: Combined expression — `not (True and False) or True` evaluates to True.',
    ],
    telemetry: [
      'AND: True & False → False · EVAL [SHORT_CIRCUIT]',
      'OR:  False | True → True · EVAL [BRANCH_2]',
      'NOT: ~True → False · EVAL [INVERT]',
      'EXPR: not(T&F)|T → True · RESOLVED',
    ],
  },

  // Day 10: Object-Oriented Programming
  oop: {
    apparatus: 'object_blueprint_rig',
    specTitle: 'OBJECT BLUEPRINT VAULT',
    fig: 'Fig 10.1',
    phases: [
      'Blueprint 1: `class` definition constructs prototype type object in memory.',
      'Blueprint 2: Instantiation invokes `__new__` and allocates clean instance dictionary `__dict__`.',
      'Blueprint 3: `__init__` constructor sets instance attributes (`self.x = 10`).',
      'Blueprint 4: Bound method lookup traverses class MRO (Method Resolution Order).',
    ],
    telemetry: [
      'CLASS: Person · TYPE: <class \'type\'> · 0x90A0',
      'INSTANCE: 0x90C8 · DICT: {name: "Ignitio"}',
      'BOUND_METH: Person.speak -> self=0x90C8',
      'MRO: [Person -> object] · RESOLVED',
    ],
  },
};

export const LEVEL_APPARATUS_MAP = {
  // Day 1
  PYTHON_BEGINNER_D1_02: 'translator_lathe_rig',
  PYTHON_BEGINNER_D1_06: 'translator_lathe_rig',

  // Day 2
  PYTHON_BEGINNER_D2_02: 'interpreter_conveyor_rig',
  PYTHON_BEGINNER_D2_03: 'memory_vault_rig',
  PYTHON_BEGINNER_D2_04: 'type_inspector_rig',
  PYTHON_BEGINNER_D2_05: 'memory_vault_rig',

  // Day 3
  PYTHON_BEGINNER_D3_01: 'type_inspector_rig',
  PYTHON_BEGINNER_D3_03: 'type_inspector_rig',
  PYTHON_BEGINNER_D3_06: 'type_inspector_rig',
  // D3_08: Operators — Arithmetic & Comparison → logic_gate_rig (NOT control_flow_rig)
  PYTHON_BEGINNER_D3_08: 'logic_gate_rig',
  // D3_09: Logical Operators AND/OR/NOT → logic_gate_rig
  PYTHON_BEGINNER_D3_09: 'logic_gate_rig',

  // Day 4
  PYTHON_BEGINNER_D4_02: 'string_slicing_rig',
  PYTHON_BEGINNER_D4_03: 'string_slicing_rig',
  PYTHON_BEGINNER_D4_04: 'string_slicing_rig',
  PYTHON_BEGINNER_D4_05: 'string_slicing_rig',
  PYTHON_BEGINNER_D4_06: 'string_slicing_rig',
  PYTHON_BEGINNER_D4_08: 'string_slicing_rig',

  // Day 5
  PYTHON_BEGINNER_D5_01: 'control_flow_rig',
  PYTHON_BEGINNER_D5_02: 'control_flow_rig',
  PYTHON_BEGINNER_D5_03: 'dynamic_array_rig',
  PYTHON_BEGINNER_D5_04: 'dynamic_array_rig',
  PYTHON_BEGINNER_D5_05: 'dynamic_array_rig',
  PYTHON_BEGINNER_D5_07: 'dynamic_array_rig',
  PYTHON_BEGINNER_D5_08: 'dynamic_array_rig',

  // Day 6
  PYTHON_BEGINNER_D6_01: 'hash_table_caliber_rig',
  PYTHON_BEGINNER_D6_03: 'hash_table_caliber_rig',
  PYTHON_BEGINNER_D6_04: 'hash_table_caliber_rig',
  PYTHON_BEGINNER_D6_05: 'hash_table_caliber_rig',
  PYTHON_BEGINNER_D6_06: 'hash_table_caliber_rig',
  PYTHON_BEGINNER_D6_08: 'hash_table_caliber_rig',
  PYTHON_BEGINNER_D6_09: 'hash_table_caliber_rig',
  PYTHON_BEGINNER_D6_10: 'hash_table_caliber_rig',

  // Day 7
  PYTHON_BEGINNER_D7_01: 'loop_governor_rig',
  PYTHON_BEGINNER_D7_02: 'loop_governor_rig',
  PYTHON_BEGINNER_D7_03: 'loop_governor_rig',
  PYTHON_BEGINNER_D7_12: 'loop_governor_rig',
  PYTHON_BEGINNER_D7_13: 'loop_governor_rig',
  PYTHON_BEGINNER_D7_14: 'loop_governor_rig',
  PYTHON_BEGINNER_D7_15: 'loop_governor_rig',
  PYTHON_BEGINNER_D7_16: 'loop_governor_rig',

  // Day 8
  PYTHON_BEGINNER_D8_01: 'call_stack_tower_rig',
  PYTHON_BEGINNER_D8_03: 'call_stack_tower_rig',
  PYTHON_BEGINNER_D8_04: 'call_stack_tower_rig',
  PYTHON_BEGINNER_D8_05: 'call_stack_tower_rig',

  // Day 9 — File Handling → file_io_buffer_rig (NOT interpreter_conveyor_rig)
  PYTHON_BEGINNER_D9_01: 'file_io_buffer_rig',
  PYTHON_BEGINNER_D9_02: 'file_io_buffer_rig',
  PYTHON_BEGINNER_D9_04: 'file_io_buffer_rig',
  PYTHON_BEGINNER_D9_05: 'file_io_buffer_rig',
  PYTHON_BEGINNER_D9_07: 'file_io_buffer_rig',
  PYTHON_BEGINNER_D9_08: 'file_io_buffer_rig',

  // Day 10
  PYTHON_BEGINNER_D10_01: 'object_blueprint_rig',
  PYTHON_BEGINNER_D10_02: 'object_blueprint_rig',
  PYTHON_BEGINNER_D10_03: 'object_blueprint_rig',
  PYTHON_BEGINNER_D10_07: 'object_blueprint_rig',
  PYTHON_BEGINNER_D10_08: 'object_blueprint_rig',
  PYTHON_BEGINNER_D10_09: 'object_blueprint_rig',
  PYTHON_BEGINNER_D10_11: 'object_blueprint_rig',
  PYTHON_BEGINNER_D10_14: 'object_blueprint_rig',
  PYTHON_BEGINNER_D10_15: 'object_blueprint_rig',
  PYTHON_BEGINNER_D10_16: 'object_blueprint_rig',
};

/**
 * Determines whether the "Visualize It" button should be displayed for a given level.
 * Strictly gatekeeps non-conceptual lessons (introductions, setup, assignments, recaps).
 */
export function shouldShowVisualizer(level = {}) {
  if (level?.visualization?.apparatus) return true;
  if (level?.id && LEVEL_APPARATUS_MAP[level.id]) return true;
  return false;
}

/**
 * Resolves full Anatomy visualization metadata for any level in the Python roadmap.
 */
export function getConceptVisualization(level = {}) {
  const mappedApparatus = level.visualization?.apparatus || (level.id && LEVEL_APPARATUS_MAP[level.id]);

  if (mappedApparatus) {
    // Find matching domain definition
    const matchedDomain = Object.values(DOMAIN_REGISTRY).find(
      (entry) => entry.apparatus === mappedApparatus
    );
    if (matchedDomain) {
      return { ...matchedDomain, levelTitle: level.title };
    }
  }

  const id = (level.id || '').toLowerCase();
  const concept = (level.concept || '').toLowerCase();
  const title = (level.title || '').toLowerCase();
  const text = `${id} ${concept} ${title}`;

  // Domain matching priority (ordered: more-specific first)
  if (text.includes('variable') || text.includes('memory') || text.includes('vault')) {
    return { ...DOMAIN_REGISTRY.memory, levelTitle: level.title };
  }
  if (text.includes('interpreter') || text.includes('execute') || text.includes('virtual machine') || text.includes('pvm')) {
    return { ...DOMAIN_REGISTRY.interpreter, levelTitle: level.title };
  }
  // Operators checked before generic 'type' to avoid wrong routing
  if (text.includes('logical') || text.includes('and, or') || text.includes('not operator') || text.includes('arithmetic') || text.includes('comparison operator')) {
    return { ...DOMAIN_REGISTRY.operators, levelTitle: level.title };
  }
  if (text.includes('type') || text.includes('id()') || text.includes('conversion')) {
    return { ...DOMAIN_REGISTRY.types, levelTitle: level.title };
  }
  if (text.includes('string') || text.includes('slice') || text.includes('index') || text.includes('escape')) {
    return { ...DOMAIN_REGISTRY.strings, levelTitle: level.title };
  }
  if (text.includes('condition') || text.includes('if') || text.includes('elif') || text.includes('else')) {
    return { ...DOMAIN_REGISTRY.conditionals, levelTitle: level.title };
  }
  if (text.includes('list') || text.includes('tuple') || text.includes('array')) {
    return { ...DOMAIN_REGISTRY.lists, levelTitle: level.title };
  }
  if (text.includes('dict') || text.includes('set') || text.includes('hash') || text.includes('key')) {
    return { ...DOMAIN_REGISTRY.dictionaries, levelTitle: level.title };
  }
  if (text.includes('loop') || text.includes('while') || text.includes('for') || text.includes('break') || text.includes('continue')) {
    return { ...DOMAIN_REGISTRY.loops, levelTitle: level.title };
  }
  if (text.includes('function') || text.includes('def') || text.includes('return') || text.includes('argument') || text.includes('parameter') || text.includes('stack')) {
    return { ...DOMAIN_REGISTRY.functions, levelTitle: level.title };
  }
  if (text.includes('file') || text.includes('open') || text.includes('read') || text.includes('write') || text.includes('fd') || text.includes('buffer')) {
    return { ...DOMAIN_REGISTRY.files, levelTitle: level.title };
  }
  if (text.includes('object') || text.includes('class') || text.includes('oop') || text.includes('inherit') || text.includes('self')) {
    return { ...DOMAIN_REGISTRY.oop, levelTitle: level.title };
  }
  if (text.includes('program') || text.includes('translat') || text.includes('binary') || text.includes('intro')) {
    return { ...DOMAIN_REGISTRY.programming, levelTitle: level.title };
  }

  // Universal fallback for any general Python concept
  return {
    apparatus: 'memory_vault_rig',
    specTitle: 'PYTHON TECHNICAL CALIBER',
    fig: 'Fig 1.1',
    phases: [
      `Phase 1: Concept \`${level.concept || level.title || 'Instruction'}\` initialized in execution registry.`,
      'Phase 2: Syntax parsing validates language tokens and creates bytecode references.',
      'Phase 3: Execution cycle resolves variables, memory registers, and operations.',
      'Phase 4: Output telemetry verified against Python runtime specifications.',
    ],
    telemetry: [
      'SPEC: ACTIVE · 32 B · INIT [OK]',
      'TOKENS: VALID · 0x002A · AST [LINKED]',
      'EXEC: RUNNING · 0x7FF0 · PC: 0x0014',
      'TELEMETRY: VERIFIED · 0 ERRORS · PASS',
    ],
    levelTitle: level.title,
  };
}
