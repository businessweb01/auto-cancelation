import { ref, onChildAdded, get, set, remove } from 'firebase/database';
import { rtdb } from './firebase.js';

const activeTimers = new Map();

function log(message, data = null) {
  console.log(`[AutoCancel ${new Date().toISOString()}] ${message}`, data || '');
}

function cancelBooking(bookingId, bookingData) {
  const bookingRef = ref(rtdb, `Bookings/${bookingId}`);
  const cancelledRef = ref(rtdb, `Auto_Cancelled_Bookings/${bookingId}`);

  return set(cancelledRef, {
    ...bookingData,
    cancelled_at: Date.now(),
    cancelled_reason: 'Auto-cancelled after 5s timeout',
  }).then(() => {
    return remove(bookingRef);
  }).then(() => {
    log(`Auto-cancelled booking: ${bookingId}`);
  }).catch((err) => {
    log(`Error cancelling booking ${bookingId}`, err);
  });
}

function monitorNewBookings() {
  const bookingsRef = ref(rtdb, 'Bookings');

  onChildAdded(bookingsRef, (snapshot) => {
    const bookingId = snapshot.key;
    const bookingData = snapshot.val();

    if (bookingData.booking_status === 'Pending') {
      log(`New pending booking detected: ${bookingId}`);

      if (activeTimers.has(bookingId)) return;

      const timeout = setTimeout(() => {
        cancelBooking(bookingId, bookingData);
        activeTimers.delete(bookingId);
      }, 30000); // 5 seconds

      activeTimers.set(bookingId, timeout);
    }
  });
}

export function startAutoCancelSystem() {
  log('Starting Auto-Cancellation System with 5s timeout per booking...');
  monitorNewBookings();
}
