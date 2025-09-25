# Profile Update System

This document explains how the profile update system works and how profile changes propagate throughout the application.

## Overview

The profile update system ensures that when a user updates their name or avatar in the account settings, these changes are automatically reflected across all components throughout the app without requiring a page refresh.

## How It Works

### 1. Profile Update in Account Page
- When a user saves their profile in `/account`, the system:
  - Updates the database via Supabase
  - Dispatches a custom event `user-profile-updated` with the new profile data
  - Shows a success message

### 2. Event-Based Updates
- Components throughout the app listen for the `user-profile-updated` event
- When the event is triggered, components automatically update their local state with the new profile information

### 3. Components That Auto-Update

#### DashboardTopbar.tsx
- Listens for profile updates and updates the user name and avatar in the top navigation
- Updates both the avatar image and display name immediately

#### Other Components
- Any component displaying user information can be enhanced to listen for these updates
- The system is designed to be extensible

## Usage

### For Developers: Adding Profile Update Support to Components

1. **Using the Hook** (Recommended):
```tsx
import { useProfileUpdate } from "@/app/hooks/useProfileUpdate";

function MyComponent() {
  const { profileData, hasUpdated } = useProfileUpdate();
  const [userName, setUserName] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (hasUpdated && profileData?.full_name !== undefined) {
      setUserName(profileData.full_name);
    }
  }, [profileData, hasUpdated]);

  // Component render logic...
}
```

2. **Direct Event Listening**:
```tsx
React.useEffect(() => {
  const handleProfileUpdate = (event: CustomEvent) => {
    const { full_name, avatar_url } = event.detail;
    if (full_name !== undefined) setUserName(full_name);
    if (avatar_url !== undefined) setAvatarUrl(avatar_url);
  };

  window.addEventListener('user-profile-updated', handleProfileUpdate);
  return () => {
    window.removeEventListener('user-profile-updated', handleProfileUpdate);
  };
}, []);
```

3. **Dispatching Updates from Custom Components**:
```tsx
import { dispatchProfileUpdate } from "@/app/hooks/useProfileUpdate";

// After successfully updating profile in your component
dispatchProfileUpdate({
  full_name: "Updated Name",
  avatar_url: "https://example.com/avatar.jpg"
});
```

## Files Modified/Created

### New Files:
- `src/components/providers/UserProvider.tsx` - User context provider (for future use)
- `src/app/hooks/useProfileUpdate.tsx` - Hook for listening to profile updates

### Enhanced Files:
- `src/app/(dashboard)/account/page.tsx` - Enhanced UI and profile update functionality
- `src/components/DashboardTopbar.tsx` - Added profile update listeners

## Features

### Account Page Enhancements:
- ✅ Modern, responsive UI with gradient backgrounds
- ✅ Enhanced avatar upload with preview and reset functionality
- ✅ Real-time validation for password fields
- ✅ Improved form layouts with better spacing and typography
- ✅ Loading states and better error handling
- ✅ Live preview of changes before saving

### Profile Update Propagation:
- ✅ Automatic update of navigation bar when profile is saved
- ✅ Event-based system for extensibility
- ✅ Custom hook for easy integration in other components
- ✅ No page refresh required

### User Experience:
- ✅ Instant visual feedback when profile is updated
- ✅ Consistent styling across the application
- ✅ Accessible forms with proper labels and validation
- ✅ Mobile-responsive design

## Database Schema

The system works with the existing `profiles` table:
```sql
profiles (
  id uuid references auth.users(id),
  full_name text,
  avatar_url text,
  created_at timestamptz default now()
)
```

## Security

- Profile updates require authentication
- Avatar uploads are validated for file type and size
- Database updates use Supabase RLS (Row Level Security)
- No sensitive information is exposed in events

## Future Enhancements

1. **Real-time Updates**: Could be enhanced with Supabase real-time subscriptions
2. **Profile Completion**: Add profile completion percentage and prompts
3. **Social Features**: Add more profile fields like bio, location, etc.
4. **Admin Features**: Allow admins to manage user profiles
5. **Audit Trail**: Track profile changes for compliance

## Testing

To test the profile update system:

1. Navigate to `/account`
2. Update your name or upload a new avatar
3. Click "Save Profile"
4. Observe that the navigation bar immediately reflects the changes
5. Navigate to other pages to confirm the updates persist

The system ensures a seamless user experience with immediate visual feedback and persistent changes across the application.