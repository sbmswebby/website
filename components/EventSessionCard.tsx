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
  title,
  description,
  imageUrl,
  cost,
  children,
}) => {
  return (
    <div className="event-card shimmer-effect w-full max-w-5xl mx-auto">
      <div className="event-card-image flex justify-center items-center bg-black">
        <Image
          src={imageUrl}
          alt={title}
          width={800}
          height={400}
          className="object-contain max-h-96 w-auto"
        />
      </div>
      <div className="event-card-content flex flex-col md:flex-row items-start md:items-end justify-between">
        {/* Text Section */}
        <div className="event-card-text">
          <h3 className="event-card-title">{title}</h3>
          <p className="event-card-description">{description}</p>
          <p className="event-card-meta">
            {cost > 0 ? `₹${cost}` : 'Free'}
          </p>
        </div>

        {/* Button Section */}
        <div className="mt-4 md:mt-0">{children}</div>
      </div>
    </div>
  );
};
