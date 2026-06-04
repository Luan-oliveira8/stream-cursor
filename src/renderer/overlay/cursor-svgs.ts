export interface CursorDef {
  svg: (fill: string, stroke: string, glowRadius: number, glowColor: string) => string
  hotspotX: number
  hotspotY: number
  width: number
  height: number
  animated?: boolean
}

function glowFilter(radius: number, color: string): string {
  if (radius <= 0) return ''
  return `<defs><filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
    <feGaussianBlur stdDeviation="${radius}" result="blur"/>
    <feFlood flood-color="${color}" flood-opacity="0.6" result="color"/>
    <feComposite in="color" in2="blur" operator="in" result="shadow"/>
    <feMerge><feMergeNode in="shadow"/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter></defs>`
}

const f = (r: number) => r > 0 ? 'filter="url(#glow)"' : ''

export const CURSOR_DEFS: Record<string, CursorDef> = {
  arrow: {
    svg: (fill, stroke, gr, gc) => `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
      ${glowFilter(gr, gc)}
      <path d="M4,2 L4,28 L10.5,21.5 L16,30 L20,28 L14.5,19.5 L22,19.5 Z"
        fill="${fill}" stroke="${stroke}" stroke-width="1.5" stroke-linejoin="round" ${f(gr)}/>
    </svg>`,
    hotspotX: 4, hotspotY: 2, width: 32, height: 32
  },

  pointer: {
    svg: (fill, stroke, gr, gc) => `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
      ${glowFilter(gr, gc)}
      <path d="M10,2 C10,2 10,20 10,20 L7,17 L4,23 L2,22 L5,16 L1,16 Z
               M14,8 L14,20 M18,10 L18,20 M22,12 L22,20
               M10,20 Q10,26 16,26 Q26,26 26,20 L26,16
               Q26,12 22,12 L22,12 Q18,10 18,10 L18,10 Q14,8 14,8 Z"
        fill="${fill}" stroke="${stroke}" stroke-width="1.2" stroke-linejoin="round" ${f(gr)}/>
    </svg>`,
    hotspotX: 10, hotspotY: 2, width: 32, height: 32
  },

  text: {
    svg: (fill, stroke, gr, gc) => `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
      ${glowFilter(gr, gc)}
      <path d="M10,4 L16,4 M16,4 L22,4 M16,4 L16,28 M10,28 L22,28"
        fill="none" stroke="${fill}" stroke-width="2.5" stroke-linecap="round" ${f(gr)}/>
    </svg>`,
    hotspotX: 16, hotspotY: 16, width: 32, height: 32
  },

  wait: {
    svg: (fill, stroke, gr, gc) => `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
      ${glowFilter(gr, gc)}
      <circle cx="16" cy="16" r="12" fill="none" stroke="${stroke}" stroke-width="2.5" opacity="0.3" ${f(gr)}/>
      <path d="M16,4 A12,12 0 0,1 28,16" fill="none" stroke="${fill}" stroke-width="2.5" stroke-linecap="round" ${f(gr)}/>
    </svg>`,
    hotspotX: 16, hotspotY: 16, width: 32, height: 32,
    animated: true
  },

  progress: {
    svg: (fill, stroke, gr, gc) => `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
      ${glowFilter(gr, gc)}
      <path d="M2,2 L2,18 L6.5,13.5 L10,18 L13,16 L9.5,11.5 L14,11.5 Z"
        fill="${fill}" stroke="${stroke}" stroke-width="1" stroke-linejoin="round" ${f(gr)}/>
      <circle cx="23" cy="23" r="7" fill="none" stroke="${stroke}" stroke-width="2" opacity="0.3"/>
      <path d="M23,16 A7,7 0 0,1 30,23" fill="none" stroke="${fill}" stroke-width="2" stroke-linecap="round"/>
    </svg>`,
    hotspotX: 2, hotspotY: 2, width: 32, height: 32,
    animated: true
  },

  move: {
    svg: (fill, stroke, gr, gc) => `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
      ${glowFilter(gr, gc)}
      <path d="M16,2 L20,7 L17,7 L17,14 L24,14 L24,11 L29,16 L24,21 L24,18 L17,18 L17,25 L20,25 L16,30
               L12,25 L15,25 L15,18 L8,18 L8,21 L3,16 L8,11 L8,14 L15,14 L15,7 L12,7 Z"
        fill="${fill}" stroke="${stroke}" stroke-width="1" stroke-linejoin="round" ${f(gr)}/>
    </svg>`,
    hotspotX: 16, hotspotY: 16, width: 32, height: 32
  },

  'not-allowed': {
    svg: (fill, stroke, gr, gc) => `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
      ${glowFilter(gr, gc)}
      <circle cx="16" cy="16" r="13" fill="none" stroke="${fill}" stroke-width="2.5" ${f(gr)}/>
      <line x1="6.5" y1="6.5" x2="25.5" y2="25.5" stroke="${fill}" stroke-width="2.5" stroke-linecap="round" ${f(gr)}/>
    </svg>`,
    hotspotX: 16, hotspotY: 16, width: 32, height: 32
  },

  crosshair: {
    svg: (fill, stroke, gr, gc) => `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
      ${glowFilter(gr, gc)}
      <circle cx="16" cy="16" r="10" fill="none" stroke="${fill}" stroke-width="1.5" ${f(gr)}/>
      <line x1="16" y1="2" x2="16" y2="10" stroke="${fill}" stroke-width="1.5" ${f(gr)}/>
      <line x1="16" y1="22" x2="16" y2="30" stroke="${fill}" stroke-width="1.5" ${f(gr)}/>
      <line x1="2" y1="16" x2="10" y2="16" stroke="${fill}" stroke-width="1.5" ${f(gr)}/>
      <line x1="22" y1="16" x2="30" y2="16" stroke="${fill}" stroke-width="1.5" ${f(gr)}/>
    </svg>`,
    hotspotX: 16, hotspotY: 16, width: 32, height: 32
  },

  'resize-ns': {
    svg: (fill, stroke, gr, gc) => `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
      ${glowFilter(gr, gc)}
      <path d="M16,2 L22,9 L18,9 L18,23 L22,23 L16,30 L10,23 L14,23 L14,9 L10,9 Z"
        fill="${fill}" stroke="${stroke}" stroke-width="1.2" stroke-linejoin="round" ${f(gr)}/>
    </svg>`,
    hotspotX: 16, hotspotY: 16, width: 32, height: 32
  },

  'resize-ew': {
    svg: (fill, stroke, gr, gc) => `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
      ${glowFilter(gr, gc)}
      <path d="M2,16 L9,10 L9,14 L23,14 L23,10 L30,16 L23,22 L23,18 L9,18 L9,22 Z"
        fill="${fill}" stroke="${stroke}" stroke-width="1.2" stroke-linejoin="round" ${f(gr)}/>
    </svg>`,
    hotspotX: 16, hotspotY: 16, width: 32, height: 32
  },

  'resize-nwse': {
    svg: (fill, stroke, gr, gc) => `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
      ${glowFilter(gr, gc)}
      <path d="M4,2 L14,2 L10,6 L22,18 L26,14 L26,24 L16,24 L20,20 L8,8 L4,12 Z"
        fill="${fill}" stroke="${stroke}" stroke-width="1" stroke-linejoin="round" ${f(gr)}/>
    </svg>`,
    hotspotX: 16, hotspotY: 16, width: 32, height: 32
  },

  'resize-nesw': {
    svg: (fill, stroke, gr, gc) => `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
      ${glowFilter(gr, gc)}
      <path d="M28,2 L18,2 L22,6 L10,18 L6,14 L6,24 L16,24 L12,20 L24,8 L28,12 Z"
        fill="${fill}" stroke="${stroke}" stroke-width="1" stroke-linejoin="round" ${f(gr)}/>
    </svg>`,
    hotspotX: 16, hotspotY: 16, width: 32, height: 32
  },

  help: {
    svg: (fill, stroke, gr, gc) => `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
      ${glowFilter(gr, gc)}
      <path d="M4,2 L4,22 L8.5,17.5 L12,22 L15,20 L11.5,15.5 L16,15.5 Z"
        fill="${fill}" stroke="${stroke}" stroke-width="1.2" stroke-linejoin="round" ${f(gr)}/>
      <text x="22" y="26" font-family="Arial,sans-serif" font-size="16" font-weight="bold"
        fill="${fill}" stroke="${stroke}" stroke-width="0.5" text-anchor="middle" ${f(gr)}>?</text>
    </svg>`,
    hotspotX: 4, hotspotY: 2, width: 32, height: 32
  }
}
