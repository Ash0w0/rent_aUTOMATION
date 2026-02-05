import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Edit2, Trash2, Users, Key } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { supabase } from '../../lib/supabase';
import { Database } from '../../types/supabase';

type Room = Database['public']['Tables']['rooms']['Row'];

const roomSchema = z.object({
  room_number: z.string().min(1, 'Room number is required'),
  floor_number: z.coerce.number().min(0, 'Floor number must be 0 or greater'),
  monthly_rent: z.coerce.number().min(0, 'Rent must be 0 or greater'),
});

type RoomFormValues = z.infer<typeof roomSchema>;

const RoomManagement: React.FC = () => {
  const [rooms, setRooms] = React.useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RoomFormValues>({
    resolver: zodResolver(roomSchema),
  });

  // Fetch rooms on component mount
  React.useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .order('room_number');

      if (error) throw error;
      setRooms(data || []);
    } catch (error) {
      console.error('Error fetching rooms:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: RoomFormValues) => {
    try {
      if (selectedRoom) {
        // Update existing room
        const { error } = await supabase
          .from('rooms')
          .update(data)
          .eq('id', selectedRoom.id);

        if (error) throw error;
      } else {
        // Create new room
        const { error } = await supabase
          .from('rooms')
          .insert([data]);

        if (error) throw error;
      }

      setIsModalOpen(false);
      reset();
      setSelectedRoom(null);
      fetchRooms();
    } catch (error) {
      console.error('Error saving room:', error);
    }
  };

  const handleEdit = (room: Room) => {
    setSelectedRoom(room);
    reset({
      room_number: room.room_number,
      floor_number: room.floor_number,
      monthly_rent: room.monthly_rent,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (roomId: string) => {
    if (!confirm('Are you sure you want to delete this room?')) return;

    try {
      const { error } = await supabase
        .from('rooms')
        .delete()
        .eq('id', roomId);

      if (error) throw error;
      fetchRooms();
    } catch (error) {
      console.error('Error deleting room:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Room Management</h1>
        <Button
          variant="primary"
          onClick={() => {
            reset();
            setSelectedRoom(null);
            setIsModalOpen(true);
          }}
          leftIcon={<Plus className="w-5 h-5" />}
        >
          Add Room
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading rooms...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map((room) => (
            <Card key={room.id} className="transform transition-all hover:shadow-lg">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    Room {room.room_number}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Floor {room.floor_number}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(room)}
                    className="p-1 text-gray-400 hover:text-gray-600"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(room.id)}
                    className="p-1 text-gray-400 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Monthly Rent</span>
                  <span className="font-medium">${room.monthly_rent}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Status</span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    room.is_occupied
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {room.is_occupied ? 'Occupied' : 'Available'}
                  </span>
                </div>

                {room.is_occupied && room.current_tenant_id && (
                  <Button
                    variant="outline"
                    fullWidth
                    size="sm"
                    leftIcon={<Users className="w-4 h-4" />}
                  >
                    View Tenant
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          reset();
          setSelectedRoom(null);
        }}
        title={selectedRoom ? 'Edit Room' : 'Add New Room'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Room Number"
            {...register('room_number')}
            error={errors.room_number?.message}
          />

          <Input
            label="Floor Number"
            type="number"
            {...register('floor_number')}
            error={errors.floor_number?.message}
          />

          <Input
            label="Monthly Rent"
            type="number"
            {...register('monthly_rent')}
            error={errors.monthly_rent?.message}
            leftIcon={<span className="text-gray-500">$</span>}
          />

          <div className="flex justify-end space-x-3 mt-6">
            <Button
              variant="outline"
              onClick={() => {
                setIsModalOpen(false);
                reset();
                setSelectedRoom(null);
              }}
            >
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              {selectedRoom ? 'Update Room' : 'Add Room'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default RoomManagement;