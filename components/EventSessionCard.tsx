import { FC, ReactNode } from 'react';
import Image from 'next/image';

export interface EventSessionCardProps {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  eventId: string;
  sessionId: string;
  cost: number;
  isRegistered: boolean;
  paymentStatus: string;
  children?: ReactNode;
}

export const EventSessionCard: FC<EventSessionCardProps> = ({
  id,
  title,
  description,
  imageUrl,
  eventId,
  sessionId,
  cost,
  isRegistered,
  paymentStatus,
  children,
}) => {
  return (
    <div className="bg-gray-50 rounded-lg shadow overflow-hidden flex flex-col">
      <div className="relative w-full h-48">
        <Image
          src={imageUrl}
          alt={title}
          fill
          className="object-cover transition-transform duration-300 hover:scale-105"
        />
      </div>
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-semibold text-lg">{title}</h3>
        <p className="text-gray-600 flex-1">{description}</p>
        <p className="text-gray-700 font-medium mt-2">
          {cost > 0 ? `${cost}` : 'Free'}
        </p>
        <div className="mt-4">{children}</div> {/* Render optional children like RegisterButton */}
      </div>
    </div>
  );
};
