/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { io } from "socket.io-client";

const API_URL = ""; // Current host

// Socket initialization
export const socket = io(API_URL);

// Mock Auth Helper
export const getAuthUser = () => {
  const user = localStorage.getItem("vibe_user");
  return user ? JSON.parse(user) : null;
};

export const setAuthUser = (user: any) => {
  localStorage.setItem("vibe_user", JSON.stringify(user));
};

export const clearAuthUser = () => {
  localStorage.removeItem("vibe_user");
};

// API Helpers
export const api = {
  async getVideos() {
    const res = await fetch("/api/videos");
    return res.json();
  },

  async uploadVideo(videoData: any) {
    const res = await fetch("/api/videos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(videoData),
    });
    return res.json();
  },

  async likeVideo(videoId: string, userId: string) {
    const res = await fetch(`/api/videos/${videoId}/like`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    return res.json();
  },

  async getMessages() {
    const res = await fetch("/api/messages");
    return res.json();
  },

  async syncUser(user: any) {
    await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(user),
    });
  }
};
