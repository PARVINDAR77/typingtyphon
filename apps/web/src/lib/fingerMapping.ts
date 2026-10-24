export type FingerId =
  | 'left-pinky'
  | 'left-ring'
  | 'left-middle'
  | 'left-index'
  | 'thumb'
  | 'right-index'
  | 'right-middle'
  | 'right-ring'
  | 'right-pinky';

export interface FingerInfo {
  id: FingerId;
  name: string;
  hand: 'left' | 'right';
  color: string;
  badgeBg: string;
  badgeBorder: string;
}

export const FINGER_DATA: Record<FingerId, FingerInfo> = {
  'left-pinky': {
    id: 'left-pinky',
    name: 'Left Pinky',
    hand: 'left',
    color: '#ec4899', // Vivid Rose/Pink
    badgeBg: 'rgba(236, 72, 153, 0.16)',
    badgeBorder: 'rgba(236, 72, 153, 0.45)',
  },
  'left-ring': {
    id: 'left-ring',
    name: 'Left Ring',
    hand: 'left',
    color: '#3b82f6', // Vivid Royal Blue
    badgeBg: 'rgba(59, 130, 246, 0.16)',
    badgeBorder: 'rgba(59, 130, 246, 0.45)',
  },
  'left-middle': {
    id: 'left-middle',
    name: 'Left Middle',
    hand: 'left',
    color: '#06b6d4', // Vivid Cyan
    badgeBg: 'rgba(6, 182, 212, 0.16)',
    badgeBorder: 'rgba(6, 182, 212, 0.45)',
  },
  'left-index': {
    id: 'left-index',
    name: 'Left Index',
    hand: 'left',
    color: '#10b981', // Vivid Emerald Green
    badgeBg: 'rgba(16, 185, 129, 0.16)',
    badgeBorder: 'rgba(16, 185, 129, 0.45)',
  },
  thumb: {
    id: 'thumb',
    name: 'Thumb',
    hand: 'left', // Shared by both thumbs
    color: '#8b5cf6', // Vivid Purple/Violet
    badgeBg: 'rgba(139, 92, 246, 0.16)',
    badgeBorder: 'rgba(139, 92, 246, 0.45)',
  },
  'right-index': {
    id: 'right-index',
    name: 'Right Index',
    hand: 'right',
    color: '#f59e0b', // Radiant Amber / Warm Gold
    badgeBg: 'rgba(245, 158, 11, 0.16)',
    badgeBorder: 'rgba(245, 158, 11, 0.45)',
  },
  'right-middle': {
    id: 'right-middle',
    name: 'Right Middle',
    hand: 'right',
    color: '#06b6d4', // Vivid Cyan
    badgeBg: 'rgba(6, 182, 212, 0.16)',
    badgeBorder: 'rgba(6, 182, 212, 0.45)',
  },
  'right-ring': {
    id: 'right-ring',
    name: 'Right Ring',
    hand: 'right',
    color: '#3b82f6', // Vivid Royal Blue
    badgeBg: 'rgba(59, 130, 246, 0.16)',
    badgeBorder: 'rgba(59, 130, 246, 0.45)',
  },
  'right-pinky': {
    id: 'right-pinky',
    name: 'Right Pinky',
    hand: 'right',
    color: '#ec4899', // Vivid Rose/Pink
    badgeBg: 'rgba(236, 72, 153, 0.16)',
    badgeBorder: 'rgba(236, 72, 153, 0.45)',
  },
};

// Maps any standard keyboard character to its touch typing finger
export const CHAR_TO_FINGER_MAP: Record<string, FingerId> = {
  // Left Pinky
  '`': 'left-pinky',
  '~': 'left-pinky',
  '1': 'left-pinky',
  '!': 'left-pinky',
  q: 'left-pinky',
  Q: 'left-pinky',
  a: 'left-pinky',
  A: 'left-pinky',
  z: 'left-pinky',
  Z: 'left-pinky',

  // Left Ring
  '2': 'left-ring',
  '@': 'left-ring',
  w: 'left-ring',
  W: 'left-ring',
  s: 'left-ring',
  S: 'left-ring',
  x: 'left-ring',
  X: 'left-ring',

  // Left Middle
  '3': 'left-middle',
  '#': 'left-middle',
  e: 'left-middle',
  E: 'left-middle',
  d: 'left-middle',
  D: 'left-middle',
  c: 'left-middle',
  C: 'left-middle',

  // Left Index
  '4': 'left-index',
  $: 'left-index',
  '5': 'left-index',
  '%': 'left-index',
  r: 'left-index',
  R: 'left-index',
  t: 'left-index',
  T: 'left-index',
  f: 'left-index',
  F: 'left-index',
  g: 'left-index',
  G: 'left-index',
  v: 'left-index',
  V: 'left-index',
  b: 'left-index',
  B: 'left-index',

  // Thumbs
  ' ': 'thumb',

  // Right Index
  '6': 'right-index',
  '^': 'right-index',
  '7': 'right-index',
  '&': 'right-index',
  y: 'right-index',
  Y: 'right-index',
  u: 'right-index',
  U: 'right-index',
  h: 'right-index',
  H: 'right-index',
  j: 'right-index',
  J: 'right-index',
  n: 'right-index',
  N: 'right-index',
  m: 'right-index',
  M: 'right-index',

  // Right Middle
  '8': 'right-middle',
  '*': 'right-middle',
  i: 'right-middle',
  I: 'right-middle',
  k: 'right-middle',
  K: 'right-middle',
  ',': 'right-middle',
  '<': 'right-middle',

  // Right Ring
  '9': 'right-ring',
  '(': 'right-ring',
  o: 'right-ring',
  O: 'right-ring',
  l: 'right-ring',
  L: 'right-ring',
  '.': 'right-ring',
  '>': 'right-ring',

  // Right Pinky
  '0': 'right-pinky',
  ')': 'right-pinky',
  '-': 'right-pinky',
  _: 'right-pinky',
  '=': 'right-pinky',
  '+': 'right-pinky',
  p: 'right-pinky',
  P: 'right-pinky',
  '[': 'right-pinky',
  '{': 'right-pinky',
  ']': 'right-pinky',
  '}': 'right-pinky',
  ';': 'right-pinky',
  ':': 'right-pinky',
  "'": 'right-pinky',
  '"': 'right-pinky',
  '/': 'right-pinky',
  '?': 'right-pinky',
  '\\': 'right-pinky',
  '|': 'right-pinky',
};

export interface KeyLayoutItem {
  key: string;
  display: string;
  finger: FingerId;
  width?: number; // flex basis or relative multiplier
  isHomeAnchor?: boolean;
}

export const KEYBOARD_LAYOUT_ROWS: KeyLayoutItem[][] = [
  // Number row
  [
    { key: '`', display: '`', finger: 'left-pinky' },
    { key: '1', display: '1', finger: 'left-pinky' },
    { key: '2', display: '2', finger: 'left-ring' },
    { key: '3', display: '3', finger: 'left-middle' },
    { key: '4', display: '4', finger: 'left-index' },
    { key: '5', display: '5', finger: 'left-index' },
    { key: '6', display: '6', finger: 'right-index' },
    { key: '7', display: '7', finger: 'right-index' },
    { key: '8', display: '8', finger: 'right-middle' },
    { key: '9', display: '9', finger: 'right-ring' },
    { key: '0', display: '0', finger: 'right-pinky' },
    { key: '-', display: '-', finger: 'right-pinky' },
    { key: '=', display: '=', finger: 'right-pinky' },
    { key: 'Backspace', display: 'Bksp', finger: 'right-pinky', width: 1.5 },
  ],
  // Top row (QWERTY)
  [
    { key: 'Tab', display: 'Tab', finger: 'left-pinky', width: 1.4 },
    { key: 'q', display: 'Q', finger: 'left-pinky' },
    { key: 'w', display: 'W', finger: 'left-ring' },
    { key: 'e', display: 'E', finger: 'left-middle' },
    { key: 'r', display: 'R', finger: 'left-index' },
    { key: 't', display: 'T', finger: 'left-index' },
    { key: 'y', display: 'Y', finger: 'right-index' },
    { key: 'u', display: 'U', finger: 'right-index' },
    { key: 'i', display: 'I', finger: 'right-middle' },
    { key: 'o', display: 'O', finger: 'right-ring' },
    { key: 'p', display: 'P', finger: 'right-pinky' },
    { key: '[', display: '[', finger: 'right-pinky' },
    { key: ']', display: ']', finger: 'right-pinky' },
    { key: '\\', display: '\\', finger: 'right-pinky', width: 1.1 },
  ],
  // Home row (ASDF JKL;)
  [
    { key: 'Caps', display: 'Caps', finger: 'left-pinky', width: 1.7 },
    { key: 'a', display: 'A', finger: 'left-pinky' },
    { key: 's', display: 'S', finger: 'left-ring' },
    { key: 'd', display: 'D', finger: 'left-middle' },
    { key: 'f', display: 'F', finger: 'left-index', isHomeAnchor: true },
    { key: 'g', display: 'G', finger: 'left-index' },
    { key: 'h', display: 'H', finger: 'right-index' },
    { key: 'j', display: 'J', finger: 'right-index', isHomeAnchor: true },
    { key: 'k', display: 'K', finger: 'right-middle' },
    { key: 'l', display: 'L', finger: 'right-ring' },
    { key: ';', display: ';', finger: 'right-pinky' },
    { key: "'", display: "'", finger: 'right-pinky' },
    { key: 'Enter', display: 'Enter', finger: 'right-pinky', width: 1.8 },
  ],
  // Bottom row (ZXCVBNM)
  [
    { key: 'ShiftLeft', display: 'Shift', finger: 'left-pinky', width: 2.2 },
    { key: 'z', display: 'Z', finger: 'left-pinky' },
    { key: 'x', display: 'X', finger: 'left-ring' },
    { key: 'c', display: 'C', finger: 'left-middle' },
    { key: 'v', display: 'V', finger: 'left-index' },
    { key: 'b', display: 'B', finger: 'left-index' },
    { key: 'n', display: 'N', finger: 'right-index' },
    { key: 'm', display: 'M', finger: 'right-index' },
    { key: ',', display: ',', finger: 'right-middle' },
    { key: '.', display: '.', finger: 'right-ring' },
    { key: '/', display: '/', finger: 'right-pinky' },
    { key: 'ShiftRight', display: 'Shift', finger: 'right-pinky', width: 2.3 },
  ],
  // Space row (sum of weights = 14.5 to perfectly align with rows 1-4)
  [
    { key: 'Ctrl', display: 'Ctrl', finger: 'left-pinky', width: 1.75 },
    { key: 'Alt', display: 'Alt', finger: 'thumb', width: 1.75 },
    { key: ' ', display: 'Spacebar', finger: 'thumb', width: 7.5 },
    { key: 'AltRight', display: 'Alt', finger: 'thumb', width: 1.75 },
    { key: 'CtrlRight', display: 'Ctrl', finger: 'right-pinky', width: 1.75 },
  ],
];

export interface FingerReachOffset {
  fingerId: FingerId;
  dx: number; // offset on 1024x1024 hand coordinates
  dy: number;
  row: 'number' | 'top' | 'home' | 'bottom' | 'space';
  label: string;
}

export const KEY_REACH_DATA: Record<string, FingerReachOffset> = {
  // Left Pinky (Home anchor: A)
  '`': { fingerId: 'left-pinky', dx: -140, dy: -230, row: 'number', label: '`' },
  '~': { fingerId: 'left-pinky', dx: -140, dy: -230, row: 'number', label: '~' },
  '1': { fingerId: 'left-pinky', dx: -30, dy: -230, row: 'number', label: '1' },
  '!': { fingerId: 'left-pinky', dx: -30, dy: -230, row: 'number', label: '1' },
  tab: { fingerId: 'left-pinky', dx: -140, dy: -115, row: 'top', label: 'Tab' },
  q: { fingerId: 'left-pinky', dx: -30, dy: -115, row: 'top', label: 'Q' },
  caps: { fingerId: 'left-pinky', dx: -130, dy: 0, row: 'home', label: 'Caps' },
  a: { fingerId: 'left-pinky', dx: 0, dy: 0, row: 'home', label: 'A' },
  shift: { fingerId: 'left-pinky', dx: -140, dy: 115, row: 'bottom', label: 'Shift' },
  shiftleft: { fingerId: 'left-pinky', dx: -140, dy: 115, row: 'bottom', label: 'Shift' },
  z: { fingerId: 'left-pinky', dx: 25, dy: 115, row: 'bottom', label: 'Z' },
  ctrl: { fingerId: 'left-pinky', dx: -140, dy: 230, row: 'space', label: 'Ctrl' },

  // Left Ring (Home anchor: S)
  '2': { fingerId: 'left-ring', dx: -30, dy: -230, row: 'number', label: '2' },
  '@': { fingerId: 'left-ring', dx: -30, dy: -230, row: 'number', label: '2' },
  w: { fingerId: 'left-ring', dx: -25, dy: -115, row: 'top', label: 'W' },
  s: { fingerId: 'left-ring', dx: 0, dy: 0, row: 'home', label: 'S' },
  x: { fingerId: 'left-ring', dx: 25, dy: 115, row: 'bottom', label: 'X' },

  // Left Middle (Home anchor: D)
  '3': { fingerId: 'left-middle', dx: -30, dy: -230, row: 'number', label: '3' },
  '#': { fingerId: 'left-middle', dx: -30, dy: -230, row: 'number', label: '3' },
  e: { fingerId: 'left-middle', dx: -25, dy: -115, row: 'top', label: 'E' },
  d: { fingerId: 'left-middle', dx: 0, dy: 0, row: 'home', label: 'D' },
  c: { fingerId: 'left-middle', dx: 25, dy: 115, row: 'bottom', label: 'C' },

  // Left Index (Home anchor: F)
  '4': { fingerId: 'left-index', dx: -30, dy: -230, row: 'number', label: '4' },
  $: { fingerId: 'left-index', dx: -30, dy: -230, row: 'number', label: '4' },
  '5': { fingerId: 'left-index', dx: 85, dy: -230, row: 'number', label: '5' },
  '%': { fingerId: 'left-index', dx: 85, dy: -230, row: 'number', label: '5' },
  r: { fingerId: 'left-index', dx: -30, dy: -115, row: 'top', label: 'R' },
  t: { fingerId: 'left-index', dx: 85, dy: -115, row: 'top', label: 'T' },
  f: { fingerId: 'left-index', dx: 0, dy: 0, row: 'home', label: 'F' },
  g: { fingerId: 'left-index', dx: 115, dy: 0, row: 'home', label: 'G' },
  v: { fingerId: 'left-index', dx: -25, dy: 115, row: 'bottom', label: 'V' },
  b: { fingerId: 'left-index', dx: 90, dy: 115, row: 'bottom', label: 'B' },

  // Thumbs (Home anchor: Spacebar)
  ' ': { fingerId: 'thumb', dx: 0, dy: 15, row: 'space', label: 'SPACE' },
  alt: { fingerId: 'thumb', dx: -90, dy: 15, row: 'space', label: 'Alt' },
  altright: { fingerId: 'thumb', dx: 90, dy: 15, row: 'space', label: 'Alt' },

  // Right Index (Home anchor: J)
  '6': { fingerId: 'right-index', dx: -140, dy: -230, row: 'number', label: '6' },
  '^': { fingerId: 'right-index', dx: -140, dy: -230, row: 'number', label: '6' },
  '7': { fingerId: 'right-index', dx: -25, dy: -230, row: 'number', label: '7' },
  '&': { fingerId: 'right-index', dx: -25, dy: -230, row: 'number', label: '7' },
  y: { fingerId: 'right-index', dx: -140, dy: -115, row: 'top', label: 'Y' },
  u: { fingerId: 'right-index', dx: -25, dy: -115, row: 'top', label: 'U' },
  h: { fingerId: 'right-index', dx: -115, dy: 0, row: 'home', label: 'H' },
  j: { fingerId: 'right-index', dx: 0, dy: 0, row: 'home', label: 'J' },
  n: { fingerId: 'right-index', dx: -90, dy: 115, row: 'bottom', label: 'N' },
  m: { fingerId: 'right-index', dx: 25, dy: 115, row: 'bottom', label: 'M' },

  // Right Middle (Home anchor: K)
  '8': { fingerId: 'right-middle', dx: -25, dy: -230, row: 'number', label: '8' },
  '*': { fingerId: 'right-middle', dx: -25, dy: -230, row: 'number', label: '8' },
  i: { fingerId: 'right-middle', dx: -25, dy: -115, row: 'top', label: 'I' },
  k: { fingerId: 'right-middle', dx: 0, dy: 0, row: 'home', label: 'K' },
  ',': { fingerId: 'right-middle', dx: 25, dy: 115, row: 'bottom', label: ',' },
  '<': { fingerId: 'right-middle', dx: 25, dy: 115, row: 'bottom', label: '<' },

  // Right Ring (Home anchor: L)
  '9': { fingerId: 'right-ring', dx: -25, dy: -230, row: 'number', label: '9' },
  '(': { fingerId: 'right-ring', dx: -25, dy: -230, row: 'number', label: '9' },
  o: { fingerId: 'right-ring', dx: -25, dy: -115, row: 'top', label: 'O' },
  l: { fingerId: 'right-ring', dx: 0, dy: 0, row: 'home', label: 'L' },
  '.': { fingerId: 'right-ring', dx: 25, dy: 115, row: 'bottom', label: '.' },
  '>': { fingerId: 'right-ring', dx: 25, dy: 115, row: 'bottom', label: '>' },

  // Right Pinky (Home anchor: ;)
  '0': { fingerId: 'right-pinky', dx: -25, dy: -230, row: 'number', label: '0' },
  ')': { fingerId: 'right-pinky', dx: -25, dy: -230, row: 'number', label: '0' },
  '-': { fingerId: 'right-pinky', dx: 85, dy: -230, row: 'number', label: '-' },
  _: { fingerId: 'right-pinky', dx: 85, dy: -230, row: 'number', label: '_' },
  '=': { fingerId: 'right-pinky', dx: 195, dy: -230, row: 'number', label: '=' },
  '+': { fingerId: 'right-pinky', dx: 195, dy: -230, row: 'number', label: '+' },
  bksp: { fingerId: 'right-pinky', dx: 310, dy: -230, row: 'number', label: '⌫' },
  p: { fingerId: 'right-pinky', dx: -25, dy: -115, row: 'top', label: 'P' },
  '[': { fingerId: 'right-pinky', dx: 85, dy: -115, row: 'top', label: '[' },
  '{': { fingerId: 'right-pinky', dx: 85, dy: -115, row: 'top', label: '{' },
  ']': { fingerId: 'right-pinky', dx: 195, dy: -115, row: 'top', label: ']' },
  '}': { fingerId: 'right-pinky', dx: 195, dy: -115, row: 'top', label: '}' },
  '\\': { fingerId: 'right-pinky', dx: 300, dy: -115, row: 'top', label: '\\' },
  ';': { fingerId: 'right-pinky', dx: 0, dy: 0, row: 'home', label: ';' },
  ':': { fingerId: 'right-pinky', dx: 0, dy: 0, row: 'home', label: ':' },
  "'": { fingerId: 'right-pinky', dx: 115, dy: 0, row: 'home', label: "'" },
  '"': { fingerId: 'right-pinky', dx: 115, dy: 0, row: 'home', label: '"' },
  enter: { fingerId: 'right-pinky', dx: 220, dy: 0, row: 'home', label: 'Enter' },
  '/': { fingerId: 'right-pinky', dx: 25, dy: 115, row: 'bottom', label: '/' },
  '?': { fingerId: 'right-pinky', dx: 25, dy: 115, row: 'bottom', label: '?' },
  shiftright: { fingerId: 'right-pinky', dx: 190, dy: 115, row: 'bottom', label: 'Shift' },
  ctrlright: { fingerId: 'right-pinky', dx: 220, dy: 230, row: 'space', label: 'Ctrl' },
};

export function getFingerForKey(char: string): FingerInfo | null {
  if (!char) return null;
  const normalized = char.length === 1 ? char.toLowerCase() : char;
  const fingerId = CHAR_TO_FINGER_MAP[char] || CHAR_TO_FINGER_MAP[normalized];
  if (!fingerId) return null;
  return FINGER_DATA[fingerId] || null;
}

export function getKeyReach(char: string): FingerReachOffset | null {
  if (!char) return null;
  const normalized = char.length === 1 ? char.toLowerCase() : char.toLowerCase();
  return KEY_REACH_DATA[char] || KEY_REACH_DATA[normalized] || null;
}
