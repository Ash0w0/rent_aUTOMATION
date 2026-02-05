import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Room } from '../types';

// Generate initial rooms data
const generateInitialRooms = (count: number): Room[] => {
  const rooms: Room[] = [];
  for (let i = 1; i <= count; i++) {
    const isOccupied = Math.random() > 0.4;
    rooms.push({
      id: `room-${i}`,
      number: i,
      occupied: isOccupied,
      tenantId: isOccupied ? `tenant-${Math.floor(Math.random() * 20) + 1}` : undefined,
      rent: 500 + Math.floor(Math.random() * 500),
      status: isOccupied ? 'occupied' : 'available',
      area: 300 + Math.floor(Math.random() * 200),
      amenities: ['Air Conditioning', 'WiFi', 'Furnished'].filter(() => Math.random() > 0.3),
    });
  }
  return rooms;
};

interface RoomState {
  rooms: Room[];
  totalRooms: number;
  setTotalRooms: (count: number) => void;
  updateRoom: (room: Room) => void;
  addRoom: (room: Omit<Room, 'id'>) => void;
  deleteRoom: (id: string) => void;
  getRoomByTenantId: (tenantId: string) => Room | undefined;
  getRoomById: (id: string) => Room | undefined;
}

export const useRoomStore = create<RoomState>()(
  persist(
    (set, get) => ({
      rooms: generateInitialRooms(30),
      totalRooms: 30,
      setTotalRooms: (count) => {
        const currentRooms = get().rooms;
        let newRooms = [...currentRooms];
        
        if (count > currentRooms.length) {
          // Add more rooms
          const additionalRooms = generateInitialRooms(count - currentRooms.length);
          newRooms = [...currentRooms, ...additionalRooms];
        } else if (count < currentRooms.length) {
          // Remove excess rooms
          newRooms = currentRooms.slice(0, count);
        }
        
        set({ rooms: newRooms, totalRooms: count });
      },
      updateRoom: (updatedRoom) => {
        set((state) => ({
          rooms: state.rooms.map((room) => 
            room.id === updatedRoom.id ? updatedRoom : room
          ),
        }));
      },
      addRoom: (newRoom) => {
        const id = `room-${Date.now()}`;
        set((state) => ({
          rooms: [...state.rooms, { ...newRoom, id }],
          totalRooms: state.totalRooms + 1,
        }));
      },
      deleteRoom: (id) => {
        set((state) => ({
          rooms: state.rooms.filter((room) => room.id !== id),
          totalRooms: state.totalRooms - 1,
        }));
      },
      getRoomByTenantId: (tenantId) => {
        return get().rooms.find((room) => room.tenantId === tenantId);
      },
      getRoomById: (id) => {
        return get().rooms.find((room) => room.id === id);
      },
    }),
    {
      name: 'room-storage',
    }
  )
);