"use client";

import * as React from "react";

export type ProfileUpdateData = {
  full_name?: string | null;
  avatar_url?: string | null;
};

/**
 * Hook to listen for profile updates across the app
 * Components can use this to react to profile changes from anywhere
 */
export function useProfileUpdate() {
  const [profileData, setProfileData] = React.useState<ProfileUpdateData | null>(null);
  const [updateCount, setUpdateCount] = React.useState(0);

  React.useEffect(() => {
    const handleProfileUpdate = (event: CustomEvent) => {
      const newData = event.detail as ProfileUpdateData;
      setProfileData(newData);
      setUpdateCount(prev => prev + 1);
    };

    window.addEventListener('user-profile-updated', handleProfileUpdate as EventListener);

    return () => {
      window.removeEventListener('user-profile-updated', handleProfileUpdate as EventListener);
    };
  }, []);

  return {
    profileData,
    updateCount,
    hasUpdated: updateCount > 0
  };
}

/**
 * Utility function to dispatch profile update events
 */
export function dispatchProfileUpdate(data: ProfileUpdateData) {
  window.dispatchEvent(new CustomEvent('user-profile-updated', {
    detail: data
  }));
}