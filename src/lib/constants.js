export const ROOM_STATUSES = ['AVAILABLE', 'OCCUPIED', 'DIRTY', 'MAINTENANCE', 'OUT_OF_ORDER']

export const STATUS_STYLES = {
  AVAILABLE:    { bg: 'bg-green-100',  text: 'text-green-700',  dot: 'bg-green-500'  },
  OCCUPIED:     { bg: 'bg-blue-100',   text: 'text-blue-700',   dot: 'bg-blue-500'   },
  DIRTY:        { bg: 'bg-yellow-100', text: 'text-yellow-700', dot: 'bg-yellow-500' },
  MAINTENANCE:  { bg: 'bg-orange-100', text: 'text-orange-700', dot: 'bg-orange-500' },
  OUT_OF_ORDER: { bg: 'bg-red-100',    text: 'text-red-700',    dot: 'bg-red-500'    },
}
