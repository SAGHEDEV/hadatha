# Real-Time Refresh Usage Guide

All event hooks now support real-time data updates through two mechanisms:

## 1. Automatic Polling (refetchInterval)

Pass a `refetchInterval` parameter (in milliseconds) to automatically poll for updates:

```typescript
// Refresh every 5 seconds
const { events, isLoading, error, refetch } = useGetAllEventDetails(5000);

// Refresh every 10 seconds
const { event, refetch } = useGetEventById(eventId, 10000);

// Refresh every 3 seconds
const { events, refetch } = useGetEventsByStatus("ongoing", 3000);
```

## 2. Manual Refresh (refetch function)

Call the `refetch()` function to manually trigger a data refresh:

```typescript
const { events, refetch } = useGetAllEventDetails();

// Later, when you need to refresh:
const handleRefresh = async () => {
  await refetch();
};

// Or in a button click
<button onClick={refetch}>Refresh Events</button>;
```

## Examples

### Example 1: Auto-refresh event list every 5 seconds

```typescript
"use client";

import { useGetAllEventDetails } from "@/hooks/sui/useGetAllEvents";

export default function EventsPage() {
  // Auto-refresh every 5 seconds (5000ms)
  const { events, isLoading, error, refetch } = useGetAllEventDetails(5000);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h1>Events (Auto-refreshing)</h1>
      {events.map((event) => (
        <div key={event.id}>{event.title}</div>
      ))}
    </div>
  );
}
```

### Example 2: Manual refresh button

```typescript
"use client";

import { useGetEventById } from "@/hooks/sui/useGetAllEvents";

export default function EventDetails({ eventId }: { eventId: string }) {
  const { event, isLoading, refetch } = useGetEventById(eventId);

  const handleRefresh = async () => {
    await refetch();
  };

  if (isLoading) return <div>Loading...</div>;
  if (!event) return <div>Event not found</div>;

  return (
    <div>
      <button onClick={handleRefresh}>🔄 Refresh</button>
      <h1>{event.title}</h1>
      <p>Attendees: {event.attendeesCount}</p>
    </div>
  );
}
```

### Example 3: Refresh after making changes

```typescript
"use client";

import { useGetEventByIdWithAttendees } from "@/hooks/sui/useGetAllEvents";
import { useCheckInUser } from "@/hooks/sui/useCheckInUser";

export default function AttendeeList({ eventId }: { eventId: string }) {
  const { attendees, refetch } = useGetEventByIdWithAttendees(eventId);
  const checkIn = useCheckInUser();

  const handleCheckIn = async (attendeeAddress: string) => {
    await checkIn.mutateAsync({ eventId, attendeeAddress });
    // Refresh to see the updated check-in status
    await refetch();
  };

  return (
    <div>
      {attendees.map((attendee) => (
        <div key={attendee.address}>
          {attendee.name}
          <button onClick={() => handleCheckIn(attendee.address)}>
            Check In
          </button>
        </div>
      ))}
    </div>
  );
}
```

### Example 4: Combine auto-refresh with manual refresh

```typescript
"use client";

import { useGetEventsByOrganizer } from "@/hooks/sui/useGetAllEvents";

export default function MyEvents({
  organizerAddress,
}: {
  organizerAddress: string;
}) {
  // Auto-refresh every 30 seconds, but also allow manual refresh
  const { events, isLoading, refetch } = useGetEventsByOrganizer(
    organizerAddress,
    30000 // 30 seconds
  );

  return (
    <div>
      <div className="flex justify-between items-center">
        <h1>My Events</h1>
        <button onClick={refetch}>🔄 Refresh Now</button>
      </div>
      <p className="text-sm text-gray-500">Auto-refreshing every 30 seconds</p>
      {events.map((event) => (
        <div key={event.id}>{event.title}</div>
      ))}
    </div>
  );
}
```

## Available Hooks with Refresh Support

All the following hooks now support both `refetchInterval` and return a `refetch` function:

- `useGetAllEvents(refetchInterval?)`
- `useGetAllEventDetails(refetchInterval?)`
- `useGetEventById(eventId, refetchInterval?)`
- `useGetEventsByStatus(status, refetchInterval?)`
- `useGetEventsByOrganizer(organizerAddress, refetchInterval?)`
- `useGetEventByIdWithAttendees(eventId, refetchInterval?)`
- `useGetEventAttendees(eventId, refetchInterval?)`

## Best Practices

1. **Choose appropriate intervals**: Don't poll too frequently (< 1000ms) as it can cause performance issues
2. **Use manual refresh for user actions**: After creating/updating data, use `refetch()` instead of waiting for the next poll
3. **Disable auto-refresh when not needed**: Only use `refetchInterval` when you need real-time updates
4. **Combine both methods**: Use auto-refresh for background updates and manual refresh for immediate feedback

## Performance Considerations

- Polling creates network requests at regular intervals
- Consider disabling auto-refresh when the component is not visible
- Use longer intervals (10-30 seconds) for less critical data
- Use shorter intervals (2-5 seconds) only for critical real-time data like live event attendees
