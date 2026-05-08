/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Timestamp } from 'firebase/firestore';

export interface UserProfile {
  uid: string;
  displayName: string;
  photoURL: string;
  email: string;
  bio?: string;
  createdAt: Timestamp;
}

export interface Video {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  creatorId: string;
  creatorName: string;
  creatorPhoto: string;
  likes: string[]; // Array of uids
  shares: number;
  createdAt: Timestamp;
}

export interface Message {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  createdAt: Timestamp;
}

export interface ChatChannel {
  id: string;
  name: string;
  participants: string[];
  lastMessage?: string;
  updatedAt: Timestamp;
}

export enum CallStatus {
  IDLE = 'idle',
  RINGING = 'ringing',
  CONNECTED = 'connected',
}
