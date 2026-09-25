// public/workers/syntaxWorker.js

const CPP_TOKENS = {
  keywords: [
    'auto', 'break', 'case', 'char', 'const', 'continue', 'default', 'do',
    'double', 'else', 'enum', 'extern', 'float', 'for', 'goto', 'if',
    'inline', 'int', 'long', 'register', 'restrict', 'return', 'short',
    'signed', 'sizeof', 'static', 'struct', 'switch', 'typedef', 'union',
    'unsigned', 'void', 'volatile', 'while', '_Bool', '_Complex', '_Imaginary',
    'class', 'public', 'private', 'protected', 'virtual', 'friend', 'new',
    'delete', 'this', 'operator', 'template', 'typename', 'namespace',
    'using', 'try', 'catch', 'throw', 'const_cast', 'dynamic_cast',
    'reinterpret_cast', 'static_cast', 'typeid', 'explicit', 'export',
    'mutable', 'nullptr', 'override', 'final', 'constexpr', 'decltype',
    'noexcept', 'thread_local', 'alignas', 'alignof'
  ],
  types: [
    'int', 'float', 'double', 'char', 'void', 'bool', 'long', 'short',
    'unsigned', 'signed', 'wchar_t', 'char16_t', 'char32_t', 'auto',
    'size_t', 'int8_t', 'int16_t', 'int32_t', 'int64_t',
    'uint8_t', 'uint16_t', 'uint32_t', 'uint64_t', 'string', 'vector',
    'map', 'set', 'unordered_map', 'unordered_set', 'pair', 'array'
  ],
  preprocessor: [
    '#include', '#define', '#undef', '#if', '#ifdef', '#ifndef', '#else',
    '#elif', '#endif', '#error', '#pragma', '#line', '#warning'
  ],
  constants: ['true', 'false', 'NULL', 'nullptr']
};

const SYNTAX_COLORS = {
  keyword: '#9334E6',
  type: '#267F00',
  preprocessor: '#9334E6',
  string: '#C53929',
  number: '#0066CC',
  comment: '#6A9955',
  function: '#795E26',
  operator: '#19183b',
  variable: '#19183b',
  constant: '#0066CC',
  bracket: '#19183b',
  text: '#19183b'
};

function tokenizeCpp(code) {
  const tokens = [];
  let remaining = code;

  const patterns = [
    { name: 'comment-multi', pattern: /^\/\*[\s\S]*?\*\// },
    { name: 'comment-single', pattern: /^\/\/[^\n]*/ },
    { name: 'string-double', pattern: /^"(?:[^"\\]|\\.)*"/ },
    { name: 'string-single', pattern: /^'(?:[^'\\]|\\.)*'/ },
    { name: 'preprocessor', pattern: /^#\s*\w+/ },
    { name: 'number', pattern: /^(?:0x[0-9a-fA-F]+|0b[01]+|0[0-7]*|\d+\.?\d*(?:[eE][+-]?\d+)?)[fFuUlL]{0,4}/ },
    { name: 'operator', pattern: /^[+\-*/%=&|<>!~^?:]+/ },
    { name: 'bracket', pattern: /^[{}\[\]()]/ },
    { name: 'punctuation', pattern: /^[;,.:]/ },
    { name: 'whitespace', pattern: /^\s+/ },
    { name: 'word', pattern: /^[a-zA-Z_][a-zA-Z0-9_]*/ }
  ];

  while (remaining.length > 0) {
    let matched = false;

    for (const { name, pattern } of patterns) {
      const match = remaining.match(pattern);
      if (match) {
        tokens.push({ type: name, value: match[0] });
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

function getTokenColor(token) {
  const { type, value } = token;

  if (type === 'comment-multi' || type === 'comment-single') return SYNTAX_COLORS.comment;
  if (type === 'string-double' || type === 'string-single') return SYNTAX_COLORS.string;
  if (type === 'preprocessor') return SYNTAX_COLORS.preprocessor;
  if (type === 'number') return SYNTAX_COLORS.number;
  if (type === 'bracket') return SYNTAX_COLORS.bracket;
  if (type === 'operator' || type === 'punctuation') return SYNTAX_COLORS.operator;
  if (type === 'whitespace') return SYNTAX_COLORS.text;
  if (type === 'word') {
    if (CPP_TOKENS.keywords.includes(value)) return SYNTAX_COLORS.keyword;
    if (CPP_TOKENS.types.includes(value)) return SYNTAX_COLORS.type;
    if (CPP_TOKENS.constants.includes(value)) return SYNTAX_COLORS.constant;
    return SYNTAX_COLORS.variable;
  }

  return SYNTAX_COLORS.text;
}

function highlightCpp(code) {
  const tokens = tokenizeCpp(code);
  return tokens.map(token => ({
    text: token.value,
    color: getTokenColor(token)
  }));
}

self.onmessage = function(e) {
  const code = e.data.code;
  if (typeof code !== 'string') return;
  const tokens = highlightCpp(code);
  self.postMessage({ tokens, code });
};
