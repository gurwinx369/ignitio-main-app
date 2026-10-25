// public/workers/syntaxWorker.js
// Universal Syntax Highlighting Worker for C++, Python, C, and future languages

const GLOBAL_SYNTAX_COLORS = {
  keyword: '#8b5cf6',      // Vibrant royal purple
  type: '#0d9488',         // Deep teal
  builtin: '#2563eb',      // Sapphire blue
  preprocessor: '#d946ef', // Magenta / fuchsia
  string: '#d97706',       // Warm golden amber
  number: '#0284c7',       // Sky blue
  comment: '#64748b',      // Refined slate
  constant: '#e11d48',     // Rose red
  function: '#2563eb',     // Sapphire blue
  operator: '#334155',     // Slate dark
  bracket: '#475569',      // Slate 600
  punctuation: '#64748b',  // Slate 500
  variable: '#0f172a',     // Deep slate text
  text: '#0f172a'          // Default text color
};

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

function normalizeLanguage(lang) {
  if (!lang) return 'cpp';
  const lower = String(lang).toLowerCase().trim();
  if (lower === 'python' || lower === 'python3' || lower === 'py') return 'python';
  if (lower === 'c') return 'c';
  if (lower === 'cpp' || lower === 'c++' || lower === 'cxx') return 'cpp';
  return lower;
}

function tokenize(code, language) {
  const normLang = normalizeLanguage(language);
  const isPython = normLang === 'python';

  const tokens = [];
  let remaining = code;

  const patterns = [
    { type: 'comment-multi', pattern: /^\/\*[\s\S]*?\*\// },
    { type: 'comment-single', pattern: /^\/\/[^\n]*/ },
    ...(isPython
      ? [{ type: 'comment-hash', pattern: /^#[^\n]*/ }]
      : [
          { type: 'preprocessor', pattern: /^#\s*\w+/ },
          { type: 'comment-hash', pattern: /^#[^\n]*/ }
        ]),
    { type: 'string-triple-double', pattern: /^"""(?:\\.|[\s\S])*?"""/ },
    { type: 'string-triple-single', pattern: /^'''(?:\\.|[\s\S])*?'''/ },
    { type: 'string-prefixed', pattern: /^[frbFRB]"(?:[^"\\]|\\.)*"/ },
    { type: 'string-prefixed-single', pattern: /^[frbFRB]'(?:[^'\\]|\\.)*'/ },
    { type: 'string-double', pattern: /^"(?:[^"\\]|\\.)*"/ },
    { type: 'string-single', pattern: /^'(?:[^'\\]|\\.)*'/ },
    { type: 'string-backtick', pattern: /^`(?:[^`\\]|\\.)*`/ },
    { type: 'decorator', pattern: /^@\s*[a-zA-Z_]\w*/ },
    { type: 'number', pattern: /^(?:0[xX][0-9a-fA-F]+|0[bB][01]+|0[oO]?[0-7]+|\d+\.?\d*(?:[eE][+-]?\d+)?[fFuUlL]*|\.\d+(?:[eE][+-]?\d+)?[fFuUlL]*)/ },
    { type: 'operator', pattern: /^(?:==|!=|<=|>=|&&|\|\||\+\+|--|<<|>>|\+=|-=|\*=|\/=|%=|&=|\|=|\^=|->|\*\*|\/\/|[+\-*/%=&|<>!~^?:])/ },
    { type: 'bracket', pattern: /^[{}\[\]()]/ },
    { type: 'punctuation', pattern: /^[;,.:]/ },
    { type: 'whitespace', pattern: /^\s+/ },
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

function resolveStyle(token, language) {
  const normLang = normalizeLanguage(language);
  const langConfig = LANGUAGES[normLang];
  const { type, value } = token;

  if (type === 'comment-multi' || type === 'comment-single' || type === 'comment-hash') {
    return { color: GLOBAL_SYNTAX_COLORS.comment, italic: true };
  }
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
  if (type === 'preprocessor' || type === 'decorator') {
    return { color: GLOBAL_SYNTAX_COLORS.preprocessor, bold: true };
  }
  if (type === 'number') {
    return { color: GLOBAL_SYNTAX_COLORS.number };
  }
  if (type === 'bracket') {
    return { color: GLOBAL_SYNTAX_COLORS.bracket };
  }
  if (type === 'operator') {
    return { color: GLOBAL_SYNTAX_COLORS.operator };
  }
  if (type === 'punctuation') {
    return { color: GLOBAL_SYNTAX_COLORS.punctuation };
  }
  if (type === 'whitespace') {
    return { color: GLOBAL_SYNTAX_COLORS.text };
  }
  if (type === 'word') {
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

function highlight(code, language) {
  const tokens = tokenize(code, language);
  return tokens.map(token => {
    const style = resolveStyle(token, language);
    return {
      text: token.value,
      color: style.color,
      italic: style.italic || false,
      bold: style.bold || false
    };
  });
}

self.onmessage = function(e) {
  const { code, language } = e.data || {};
  if (typeof code !== 'string') return;
  const tokens = highlight(code, language || 'cpp');
  self.postMessage({ tokens, code });
};
