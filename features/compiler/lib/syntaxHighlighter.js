/**
 * Universal Syntax Highlighting Engine & Global Color Scheme
 * Provides consistent, rich syntax coloring for C++, Python, C, and future languages.
 */

// Global color scheme calibrated for clean readability and high contrast on compiler backgrounds
export const GLOBAL_SYNTAX_COLORS = {
  keyword: '#8b5cf6',      // Vibrant royal purple (def, if, class, return, for, while, import)
  type: '#0d9488',         // Deep teal (int, str, float, bool, vector, void, list, dict)
  builtin: '#2563eb',      // Sapphire blue (print, cout, printf, len, range, input)
  preprocessor: '#d946ef', // Magenta / fuchsia (#include, #define, @decorator)
  string: '#d97706',       // Warm golden amber ("Hello", 'text', """docstring""")
  number: '#0284c7',       // Sky blue (42, 3.14, 0x1f)
  comment: '#64748b',      // Refined slate (clean, distinguishable, non-distracting)
  constant: '#e11d48',     // Rose red (True, False, None, nullptr, NULL, true, false)
  function: '#2563eb',     // Sapphire blue for function calls
  operator: '#334155',     // Slate dark (+, -, *, ==, !=, in, and, or)
  bracket: '#475569',      // Slate 600 ( (, ), {, }, [, ] )
  punctuation: '#64748b',  // Slate 500 ( ;, ,, :, . )
  variable: '#0f172a',     // Deep slate text for general identifiers
  text: '#0f172a'          // Default text color
};

// Language-specific dictionaries
const LANGUAGES = {
  cpp: {
    keywords: new Set([
      'auto', 'break', 'case', 'catch', 'class', 'constexpr', 'const_cast',
      'continue', 'decltype', 'default', 'delete', 'do', 'dynamic_cast',
      'else', 'enum', 'explicit', 'export', 'extern', 'final', 'for',
      'friend', 'goto', 'if', 'inline', 'mutable', 'namespace', 'new',
      'noexcept', 'operator', 'override', 'private', 'protected', 'public',
      'register', 'reinterpret_cast', 'restrict', 'return', 'sizeof', 'static',
      'static_cast', 'struct', 'switch', 'template', 'this', 'thread_local',
      'throw', 'try', 'typedef', 'typeid', 'typename', 'union', 'using',
      'virtual', 'volatile', 'while'
    ]),
    types: new Set([
      'int', 'float', 'double', 'char', 'void', 'bool', 'long', 'short',
      'unsigned', 'signed', 'wchar_t', 'char16_t', 'char32_t', 'size_t',
      'int8_t', 'int16_t', 'int32_t', 'int64_t', 'uint8_t', 'uint16_t',
      'uint32_t', 'uint64_t', 'string', 'vector', 'map', 'set', 'unordered_map',
      'unordered_set', 'pair', 'array', 'queue', 'stack', 'deque', 'list'
    ]),
    builtins: new Set([
      'std', 'cout', 'cin', 'endl', 'cerr', 'printf', 'scanf', 'make_pair',
      'push_back', 'pop_back', 'size', 'begin', 'end', 'sort', 'min', 'max',
      'swap', 'substr', 'find', 'clear', 'empty'
    ]),
    constants: new Set(['true', 'false', 'NULL', 'nullptr'])
  },
  c: {
    keywords: new Set([
      'auto', 'break', 'case', 'const', 'continue', 'default', 'do',
      'else', 'enum', 'extern', 'for', 'goto', 'if', 'inline', 'register',
      'restrict', 'return', 'sizeof', 'static', 'struct', 'switch',
      'typedef', 'union', 'volatile', 'while'
    ]),
    types: new Set([
      'int', 'float', 'double', 'char', 'void', 'long', 'short', 'signed',
      'unsigned', 'size_t', 'FILE', 'bool', 'int8_t', 'int16_t', 'int32_t',
      'int64_t', 'uint8_t', 'uint16_t', 'uint32_t', 'uint64_t'
    ]),
    builtins: new Set([
      'printf', 'scanf', 'malloc', 'calloc', 'realloc', 'free', 'exit',
      'memcpy', 'memset', 'strlen', 'strcpy', 'strncpy', 'strcmp', 'strcat',
      'fopen', 'fclose', 'fread', 'fwrite', 'fprintf', 'fscanf', 'sprintf',
      'sscanf', 'putchar', 'getchar', 'puts', 'gets', 'abs', 'sqrt', 'pow'
    ]),
    constants: new Set(['NULL', 'true', 'false', 'EOF', 'EXIT_SUCCESS', 'EXIT_FAILURE'])
  },
  python: {
    keywords: new Set([
      'def', 'class', 'return', 'yield', 'lambda', 'if', 'elif', 'else',
      'for', 'while', 'break', 'continue', 'pass', 'import', 'from', 'as',
      'try', 'except', 'finally', 'raise', 'with', 'assert', 'async',
      'await', 'global', 'nonlocal', 'del'
    ]),
    wordOperators: new Set(['and', 'or', 'not', 'in', 'is']),
    types: new Set([
      'int', 'float', 'str', 'bool', 'list', 'dict', 'set', 'tuple',
      'bytes', 'bytearray', 'complex', 'object', 'type', 'frozenset'
    ]),
    builtins: new Set([
      'print', 'input', 'len', 'range', 'enumerate', 'zip', 'map', 'filter',
      'sum', 'min', 'max', 'abs', 'round', 'open', 'sorted', 'reversed',
      'isinstance', 'issubclass', 'id', 'repr', 'iter', 'next', 'super',
      'any', 'all', 'dir', 'help', 'format', 'getattr', 'setattr', 'hasattr',
      'append', 'extend', 'pop', 'remove', 'index', 'count', 'keys', 'values', 'items'
    ]),
    constants: new Set(['True', 'False', 'None', 'Ellipsis', 'NotImplemented'])
  }
};

// Universal fallback keywords and types for future languages (JS/TS, Rust, Go, Java, etc.)
const UNIVERSAL_KEYWORDS = new Set([
  'function', 'func', 'fn', 'def', 'sub', 'var', 'let', 'const', 'val',
  'mut', 'public', 'private', 'protected', 'package', 'import', 'export',
  'from', 'as', 'return', 'if', 'else', 'elif', 'for', 'while', 'loop',
  'break', 'continue', 'switch', 'case', 'default', 'match', 'struct',
  'class', 'interface', 'trait', 'impl', 'type', 'enum', 'new', 'this',
  'self', 'async', 'await', 'try', 'catch', 'finally', 'throw', 'raise',
  'yield', 'use', 'mod', 'crate'
]);

const UNIVERSAL_TYPES = new Set([
  'string', 'str', 'int', 'i8', 'i16', 'i32', 'i64', 'i128', 'u8', 'u16',
  'u32', 'u64', 'u128', 'isize', 'usize', 'float', 'f32', 'f64', 'bool',
  'boolean', 'char', 'void', 'any', 'unknown', 'never', 'number', 'object',
  'array', 'slice', 'map', 'set', 'list', 'tuple', 'dict'
]);

const UNIVERSAL_CONSTANTS = new Set([
  'true', 'false', 'True', 'False', 'null', 'nil', 'None', 'NULL', 'nullptr',
  'undefined', 'NaN', 'Infinity'
]);

const UNIVERSAL_BUILTINS = new Set([
  'print', 'println', 'printf', 'console', 'log', 'len', 'range', 'input',
  'main', 'cout', 'cin', 'endl', 'panic', 'assert'
]);

/**
 * Normalizes language string
 */
export function normalizeLanguage(lang) {
  if (!lang) return 'cpp';
  const lower = String(lang).toLowerCase().trim();
  if (lower === 'python' || lower === 'python3' || lower === 'py') return 'python';
  if (lower === 'c') return 'c';
  if (lower === 'cpp' || lower === 'c++' || lower === 'cxx') return 'cpp';
  return lower;
}

/**
 * Universal multi-language tokenizer
 * Automatically parses Python, C, C++, and future languages using universal grammar rules
 */
export function tokenizeCode(code, language = 'cpp') {
  const normLang = normalizeLanguage(language);
  const langConfig = LANGUAGES[normLang] || null;
  const isPython = normLang === 'python';

  const tokens = [];
  let remaining = code;

  // Patterns ordered by specificity
  const patterns = [
    // Multi-line comments: /* ... */
    { type: 'comment-multi', pattern: /^\/\*[\s\S]*?\*\// },
    // Single-line C/C++/JS comments: // ...
    { type: 'comment-single', pattern: /^\/\/[^\n]*/ },
    // Python comments or hash comments: # ... (except C preprocessor #include, #define)
    ...(isPython
      ? [{ type: 'comment-hash', pattern: /^#[^\n]*/ }]
      : [
          { type: 'preprocessor', pattern: /^#\s*\w+/ },
          { type: 'comment-hash', pattern: /^#[^\n]*/ }
        ]),
    // Python triple-quoted strings (multiline docstrings)
    { type: 'string-triple-double', pattern: /^"""(?:\\.|[\s\S])*?"""/ },
    { type: 'string-triple-single', pattern: /^'''(?:\\.|[\s\S])*?'''/ },
    // Prefixed strings in Python (f"...", r"...", b"...")
    { type: 'string-prefixed', pattern: /^[frbFRB]"(?:[^"\\]|\\.)*"/ },
    { type: 'string-prefixed-single', pattern: /^[frbFRB]'(?:[^'\\]|\\.)*'/ },
    // Double-quoted strings
    { type: 'string-double', pattern: /^"(?:[^"\\]|\\.)*"/ },
    // Single-quoted strings
    { type: 'string-single', pattern: /^'(?:[^'\\]|\\.)*'/ },
    // Backtick template strings
    { type: 'string-backtick', pattern: /^`(?:[^`\\]|\\.)*`/ },
    // Decorators (@property, @decorator)
    { type: 'decorator', pattern: /^@\s*[a-zA-Z_]\w*/ },
    // Numbers: hex, binary, octal, floats, ints
    { type: 'number', pattern: /^(?:0[xX][0-9a-fA-F]+|0[bB][01]+|0[oO]?[0-7]+|\d+\.?\d*(?:[eE][+-]?\d+)?[fFuUlL]*|\.\d+(?:[eE][+-]?\d+)?[fFuUlL]*)/ },
    // Operators
    { type: 'operator', pattern: /^(?:==|!=|<=|>=|&&|\|\||\+\+|--|<<|>>|\+=|-=|\*=|\/=|%=|&=|\|=|\^=|->|\*\*|\/\/|[+\-*/%=&|<>!~^?:])/ },
    // Brackets
    { type: 'bracket', pattern: /^[{}\[\]()]/ },
    // Punctuation
    { type: 'punctuation', pattern: /^[;,.:]/ },
    // Whitespace
    { type: 'whitespace', pattern: /^\s+/ },
    // Words / Identifiers
    { type: 'word', pattern: /^[a-zA-Z_][a-zA-Z0-9_]*/ }
  ];

  while (remaining.length > 0) {
    let matched = false;

    for (const { type, pattern } of patterns) {
      const match = remaining.match(pattern);
      if (match) {
        tokens.push({ type, value: match[0] });
        remaining = remaining.slice(match[0].length);
        matched = true;
        break;
      }
    }

    if (!matched) {
      tokens.push({ type: 'text', value: remaining[0] });
      remaining = remaining.slice(1);
    }
  }

  return tokens;
}

/**
 * Resolves token styling based on the global color scheme and language configuration
 */
export function resolveTokenStyle(token, language = 'cpp') {
  const normLang = normalizeLanguage(language);
  const langConfig = LANGUAGES[normLang];
  const { type, value } = token;

  // Comments (styled with slate and italic for modern aesthetic)
  if (type === 'comment-multi' || type === 'comment-single' || type === 'comment-hash') {
    return { color: GLOBAL_SYNTAX_COLORS.comment, italic: true };
  }

  // Strings
  if (
    type === 'string-triple-double' ||
    type === 'string-triple-single' ||
    type === 'string-prefixed' ||
    type === 'string-prefixed-single' ||
    type === 'string-double' ||
    type === 'string-single' ||
    type === 'string-backtick'
  ) {
    return { color: GLOBAL_SYNTAX_COLORS.string };
  }

  // Preprocessor or Decorator
  if (type === 'preprocessor' || type === 'decorator') {
    return { color: GLOBAL_SYNTAX_COLORS.preprocessor, bold: true };
  }

  // Numbers
  if (type === 'number') {
    return { color: GLOBAL_SYNTAX_COLORS.number };
  }

  // Brackets
  if (type === 'bracket') {
    return { color: GLOBAL_SYNTAX_COLORS.bracket };
  }

  // Operators & Punctuation
  if (type === 'operator') {
    return { color: GLOBAL_SYNTAX_COLORS.operator };
  }
  if (type === 'punctuation') {
    return { color: GLOBAL_SYNTAX_COLORS.punctuation };
  }
  if (type === 'whitespace') {
    return { color: GLOBAL_SYNTAX_COLORS.text };
  }

  // Word token resolution
  if (type === 'word') {
    // 1. Language-specific lookup
    if (langConfig) {
      if (langConfig.keywords && langConfig.keywords.has(value)) {
        return { color: GLOBAL_SYNTAX_COLORS.keyword, bold: true };
      }
      if (langConfig.wordOperators && langConfig.wordOperators.has(value)) {
        return { color: GLOBAL_SYNTAX_COLORS.operator, bold: true };
      }
      if (langConfig.types && langConfig.types.has(value)) {
        return { color: GLOBAL_SYNTAX_COLORS.type };
      }
      if (langConfig.builtins && langConfig.builtins.has(value)) {
        return { color: GLOBAL_SYNTAX_COLORS.builtin };
      }
      if (langConfig.constants && langConfig.constants.has(value)) {
        return { color: GLOBAL_SYNTAX_COLORS.constant, bold: true };
      }
    }

    // 2. Universal lookup (guarantees future languages immediately look beautiful)
    if (UNIVERSAL_KEYWORDS.has(value)) {
      return { color: GLOBAL_SYNTAX_COLORS.keyword, bold: true };
    }
    if (UNIVERSAL_TYPES.has(value)) {
      return { color: GLOBAL_SYNTAX_COLORS.type };
    }
    if (UNIVERSAL_CONSTANTS.has(value)) {
      return { color: GLOBAL_SYNTAX_COLORS.constant, bold: true };
    }
    if (UNIVERSAL_BUILTINS.has(value)) {
      return { color: GLOBAL_SYNTAX_COLORS.builtin };
    }

    return { color: GLOBAL_SYNTAX_COLORS.variable };
  }

  return { color: GLOBAL_SYNTAX_COLORS.text };
}

/**
 * Highlights any code into token segments with universal color scheme
 */
export function highlightCode(code, language = 'cpp') {
  if (typeof code !== 'string') return [];
  const tokens = tokenizeCode(code, language);
  return tokens.map(token => {
    const style = resolveTokenStyle(token, language);
    return {
      text: token.value,
      color: style.color,
      italic: style.italic || false,
      bold: style.bold || false
    };
  });
}
