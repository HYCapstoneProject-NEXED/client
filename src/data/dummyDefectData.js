const dummyDefectData = [
  {
    id: 1,
    image: '/circle-placeholder.png',
    line: 'Line-A',
    cameraId: 1,
    timestamp: '2025-04-19T10:00:00',
    type: ['Crack']
  },
  {
    id: 2,
    image: '/circle-placeholder.png',
    line: 'Line-B',
    cameraId: 2,
    timestamp: '2025-04-19T10:05:00',
    type: ['Scratch', 'Burr']
  },
  {
    id: 3,
    image: '/circle-placeholder.png',
    line: 'Line-C',
    cameraId: 3,
    timestamp: '2025-04-19T10:10:00',
    type: ['Crack']
  },
  {
    id: 4,
    image: '/circle-placeholder.png',
    line: 'Line-A',
    cameraId: 4,
    timestamp: '2025-04-19T10:15:00',
    type: ['Scratch']
  },
  {
    id: 5,
    image: '/circle-placeholder.png',
    line: 'Line-B',
    cameraId: 5,
    timestamp: '2025-04-19T10:20:00',
    type: ['Crack', 'Burr']
  },
  {
    id: 6,
    image: '/circle-placeholder.png',
    line: 'Line-C',
    cameraId: 1,
    timestamp: '2025-04-19T10:25:00',
    type: ['Scratch']
  },
  {
    id: 7,
    image: '/circle-placeholder.png',
    line: 'Line-A',
    cameraId: 2,
    timestamp: '2025-04-19T10:30:00',
    type: ['Crack']
  },
  {
    id: 8,
    image: '/circle-placeholder.png',
    line: 'Line-B',
    cameraId: 3,
    timestamp: '2025-04-19T10:35:00',
    type: ['Scratch']
  },
  {
    id: 9,
    image: '/circle-placeholder.png',
    line: 'Line-C',
    cameraId: 4,
    timestamp: '2025-04-19T10:40:00',
    type: ['Crack']
  },
  {
    id: 10,
    image: '/circle-placeholder.png',
    line: 'Line-A',
    cameraId: 5,
    timestamp: '2025-04-19T10:45:00',
    type: ['Scratch']
  },
  {
    id: 11,
    image: '/circle-placeholder.png',
    line: 'Line-B',
    cameraId: 1,
    timestamp: '2025-04-19T10:50:00',
    type: ['Crack']
  },
  {
    id: 12,
    image: '/circle-placeholder.png',
    line: 'Line-C',
    cameraId: 2,
    timestamp: '2025-04-19T10:55:00',
    type: ['Scratch']
  },
  {
    id: 13,
    image: '/circle-placeholder.png',
    line: 'Line-A',
    cameraId: 2,
    timestamp: '2025-04-18T09:00:00',
    type: ['Crack']
  },
  {
    id: 14,
    image: '/circle-placeholder.png',
    line: 'Line-B',
    cameraId: 3,
    timestamp: '2025-04-18T11:30:00',
    type: ['Particle']
  },
  {
    id: 15,
    image: '/circle-placeholder.png',
    line: 'Line-C',
    cameraId: 4,
    timestamp: '2025-04-20T14:15:00',
    type: ['Scratch']
  },
  {
    id: 16,
    image: '/circle-placeholder.png',
    line: 'Line-A',
    cameraId: 5,
    timestamp: '2025-04-20T15:45:00',
    type: ['Burr']
  },
  {
    id: 17,
    image: '/circle-placeholder.png',
    line: 'Line-B',
    cameraId: 1,
    timestamp: '2025-04-18T16:20:00',
    type: ['Crack', 'Particle']
  },
  {
    id: 18,
    image: '/circle-placeholder.png',
    line: 'Line-C',
    cameraId: 2,
    timestamp: '2025-04-20T17:10:00',
    type: ['Scratch', 'Burr']
  }
];

const defectStats = [
  {
    class_name: 'Crack',
    class_color: '#FFF7CC',
    count: 28,
    change: -5
  },
  {
    class_name: 'Scratch',
    class_color: '#DBE4FF',
    count: 15,
    change: 3
  },
  {
    class_name: 'Particle',
    class_color: '#D4F7F4',
    count: 3,
    change: 0
  }
];

export default dummyDefectData;
export { defectStats }; 