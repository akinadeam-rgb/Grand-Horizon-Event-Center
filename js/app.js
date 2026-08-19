/**
 * Application Controller & State Engine for Grand Horizon Event Center
 */

// Application State
let state = {
  currentView: 'planner',
  activeDay: 'Monday',
  adminFilterStatus: 'all',
  adminSearchQuery: ''
};

// Initialize Application on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  initApp();
});

function initApp() {
  renderDayTabs();
  renderPlannerView();
  renderAdminDashboard();
  updateHeaderBadges();
}

/**
 * View Switcher (Planner vs Admin)
 */
function switchView(viewName) {
  state.currentView = viewName;

  const plannerSection = document.getElementById('planner-view');
  const adminSection = document.getElementById('admin-view');
  const navPlannerBtn = document.getElementById('nav-planner-btn');
  const navAdminBtn = document.getElementById('nav-admin-btn');

  if (viewName === 'planner') {
    plannerSection.classList.remove('hidden');
    adminSection.classList.add('hidden');

    navPlannerBtn.className = "px-3 sm:px-5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-150 flex items-center space-x-2 bg-white text-blue-900 shadow-sm";
    navAdminBtn.className = "px-3 sm:px-5 py-2 rounded-lg text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-900 transition-all duration-150 flex items-center space-x-2 relative";
    
    renderPlannerView();
  } else {
    plannerSection.classList.add('hidden');
    adminSection.classList.remove('hidden');

    navAdminBtn.className = "px-3 sm:px-5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-150 flex items-center space-x-2 bg-white text-blue-900 shadow-sm";
    navPlannerBtn.className = "px-3 sm:px-5 py-2 rounded-lg text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-900 transition-all duration-150 flex items-center space-x-2 relative";

    renderAdminDashboard();
  }
}

/**
 * Update Header Badges
 */
function updateHeaderBadges() {
  const requests = StorageService.getRequests();
  const pendingCount = requests.filter(r => r.status === 'pending').length;
  
  const navPendingBadge = document.getElementById('nav-pending-badge');
  if (pendingCount > 0) {
    navPendingBadge.textContent = pendingCount;
    navPendingBadge.classList.remove('hidden');
  } else {
    navPendingBadge.classList.add('hidden');
  }

  const trackerBadge = document.getElementById('tracker-count-badge');
  if (trackerBadge) {
    trackerBadge.textContent = requests.length;
  }
}

/**
 * PLANNER VIEW LOGIC
 */

function selectDay(dayName) {
  state.activeDay = dayName;
  renderDayTabs();
  renderPlannerView();
}

function renderDayTabs() {
  const container = document.getElementById('day-tabs-container');
  if (!container) return;

  const requests = StorageService.getRequests();

  container.innerHTML = DAYS_OF_WEEK.map(day => {
    const isActive = day === state.activeDay;

    // Calculate available slots out of 5 for this day
    let bookedOrPendingCount = 0;
    TIME_SLOTS.forEach(slot => {
      const slotId = `${day}-${slot.id}`;
      const activeReq = getSlotActiveRequest(requests, slotId, day, slot.id);
      if (activeReq && (activeReq.status === 'approved' || activeReq.status === 'pending')) {
        bookedOrPendingCount++;
      }
    });

    const availableCount = 5 - bookedOrPendingCount;

    const baseClass = "px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-all flex items-center space-x-2 cursor-pointer border";
    const activeClass = isActive 
      ? "bg-blue-900 text-white border-blue-900 shadow-md shadow-blue-900/10" 
      : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300";

    const badgeClass = isActive
      ? "bg-blue-800 text-blue-100"
      : (availableCount === 5 ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600");

    return `
      <button onclick="selectDay('${day}')" class="${baseClass} ${activeClass}">
        <span>${day}</span>
        <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${badgeClass}">
          ${availableCount} Free
        </span>
      </button>
    `;
  }).join('');
}

function getSlotActiveRequest(requests, slotId, day, slotIdOnly) {
  // Find requests matching this slot
  const slotReqs = requests.filter(r => r.slotId === slotId || (r.day === day && r.slotIdOnly === slotIdOnly));
  
  // Priority: Approved > Pending. Cancelled doesn't block.
  const approved = slotReqs.find(r => r.status === 'approved');
  if (approved) return approved;

  const pending = slotReqs.find(r => r.status === 'pending');
  if (pending) return pending;

  return null;
}

function renderPlannerView() {
  const requests = StorageService.getRequests();
  const day = state.activeDay;

  // Update Title & Subtitle
  document.getElementById('active-day-title').textContent = `${day} Schedule`;
  document.getElementById('active-day-subtitle').textContent = `Showing 5 standardized time slots for ${day}`;

  let availCount = 0;
  let pendCount = 0;
  let bookCount = 0;

  const slotsGrid = document.getElementById('slots-grid');
  if (!slotsGrid) return;

  slotsGrid.innerHTML = TIME_SLOTS.map(slot => {
    const slotId = `${day}-${slot.id}`;
    const activeReq = getSlotActiveRequest(requests, slotId, day, slot.id);

    if (!activeReq) {
      availCount++;
      return renderAvailableSlotCard(day, slot);
    } else if (activeReq.status === 'pending') {
      pendCount++;
      return renderPendingSlotCard(day, slot, activeReq);
    } else if (activeReq.status === 'approved') {
      bookCount++;
      return renderBookedSlotCard(day, slot, activeReq);
    }
  }).join('');

  // Update Legend Stats
  document.getElementById('legend-available-count').textContent = availCount;
  document.getElementById('legend-pending-count').textContent = pendCount;
  document.getElementById('legend-booked-count').textContent = bookCount;
}

function renderAvailableSlotCard(day, slot) {
  return `
    <div class="slot-card bg-white border border-emerald-200/90 rounded-2xl p-5 shadow-sm hover:border-emerald-400 hover:shadow-md flex flex-col justify-between h-full relative overflow-hidden group">
      <div class="absolute top-0 right-0 w-12 h-12 bg-emerald-500/10 rounded-bl-full pointer-events-none group-hover:bg-emerald-500/20 transition-colors"></div>
      
      <div>
        <!-- Slot Header -->
        <div class="flex items-center justify-between mb-3">
          <span class="inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span>
            Available
          </span>
          <i class="fa-solid ${slot.icon} text-emerald-500 text-base"></i>
        </div>

        <!-- Slot Name & Time -->
        <h4 class="text-base font-bold text-slate-900">${slot.name}</h4>
        <p class="text-xs text-slate-500 font-medium mt-0.5 flex items-center space-x-1">
          <i class="fa-regular fa-clock text-[10px]"></i>
          <span>${slot.time}</span>
        </p>

        <p class="text-xs text-slate-400 mt-4 leading-relaxed">
          Slot is open for instant booking request.
        </p>
      </div>

      <!-- Action Button -->
      <div class="mt-6 pt-4 border-t border-slate-100">
        <button onclick="openBookingModal('${day}', '${slot.id}', '${slot.name}', '${slot.time}', '${slot.icon}')" 
                class="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center space-x-2">
          <i class="fa-solid fa-calendar-plus"></i>
          <span>Book This Slot</span>
        </button>
      </div>
    </div>
  `;
}

function renderPendingSlotCard(day, slot, req) {
  return `
    <div class="slot-card bg-amber-50/40 border border-amber-300/80 rounded-2xl p-5 shadow-sm flex flex-col justify-between h-full relative">
      <div>
        <!-- Slot Header -->
        <div class="flex items-center justify-between mb-3">
          <span class="inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <i class="fa-solid fa-hourglass-half text-[10px] mr-1.5 animate-spin"></i>
            Awaiting Admin Review
          </span>
          <i class="fa-solid ${slot.icon} text-amber-500 text-base"></i>
        </div>

        <!-- Slot Name & Time -->
        <h4 class="text-base font-bold text-slate-900">${slot.name}</h4>
        <p class="text-xs text-amber-700/80 font-medium mt-0.5 flex items-center space-x-1">
          <i class="fa-regular fa-clock text-[10px]"></i>
          <span>${slot.time}</span>
        </p>

        <!-- Booking Details Preview -->
        <div class="mt-4 p-3 bg-white/80 rounded-xl border border-amber-200/80 space-y-1">
          <p class="text-xs font-bold text-slate-900 truncate" title="${escapeHtml(req.eventTitle)}">
            ${escapeHtml(req.eventTitle)}
          </p>
          <p class="text-[11px] text-slate-500 flex items-center space-x-1">
            <i class="fa-regular fa-user text-[10px]"></i>
            <span class="truncate">${escapeHtml(req.organizer)}</span>
          </p>
        </div>
      </div>

      <!-- Action Button -->
      <div class="mt-6 pt-4 border-t border-amber-200/60">
        <button onclick="openDetailsModal('${req.id}')" 
                class="w-full py-2.5 px-3 rounded-xl bg-white border border-amber-300 hover:bg-amber-100/60 text-amber-900 font-bold text-xs transition-all flex items-center justify-center space-x-1.5 shadow-sm">
          <i class="fa-solid fa-eye text-amber-600"></i>
          <span>View Pending Request</span>
        </button>
      </div>
    </div>
  `;
}

function renderBookedSlotCard(day, slot, req) {
  return `
    <div class="slot-card bg-slate-900 text-white border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between h-full relative overflow-hidden">
      <div class="absolute top-0 right-0 w-16 h-16 bg-blue-500/10 rounded-bl-full pointer-events-none"></div>

      <div>
        <!-- Slot Header -->
        <div class="flex items-center justify-between mb-3">
          <span class="inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
            <i class="fa-solid fa-lock text-[10px] mr-1.5 text-rose-400"></i>
            Slot Unavailable
          </span>
          <i class="fa-solid ${slot.icon} text-blue-400 text-base"></i>
        </div>

        <!-- Slot Name & Time -->
        <h4 class="text-base font-bold text-white">${slot.name}</h4>
        <p class="text-xs text-slate-400 font-medium mt-0.5 flex items-center space-x-1">
          <i class="fa-regular fa-clock text-[10px]"></i>
          <span>${slot.time}</span>
        </p>

        <!-- Confirmed Event Card -->
        <div class="mt-4 p-3 bg-slate-800/90 rounded-xl border border-slate-700/80 space-y-1">
          <span class="px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider rounded bg-blue-900 text-blue-200">
            ${escapeHtml(req.category || 'Confirmed Event')}
          </span>
          <p class="text-xs font-bold text-white truncate mt-1" title="${escapeHtml(req.eventTitle)}">
            ${escapeHtml(req.eventTitle)}
          </p>
          <p class="text-[11px] text-slate-300 flex items-center space-x-1">
            <i class="fa-solid fa-user-tie text-[10px] text-slate-400"></i>
            <span class="truncate">${escapeHtml(req.organizer)}</span>
          </p>
        </div>
      </div>

      <!-- Action Button -->
      <div class="mt-6 pt-4 border-t border-slate-800">
        <button onclick="openDetailsModal('${req.id}')" 
                class="w-full py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-all flex items-center justify-center space-x-1.5">
          <i class="fa-solid fa-circle-info text-blue-400"></i>
          <span>Reservation Info</span>
        </button>
      </div>
    </div>
  `;
}

/**
 * BOOKING FORM & MODAL HANDLERS
 */

function openBookingModal(day, slotIdOnly, slotName, slotTime, slotIcon) {
  const slotId = `${day}-${slotIdOnly}`;

  document.getElementById('bm-slot-id').value = slotId;
  document.getElementById('bm-day-input').value = day;
  document.getElementById('bm-slot-name-input').value = slotName;
  document.getElementById('bm-slot-time-input').value = slotTime;

  document.getElementById('bm-day-name').textContent = day;
  document.getElementById('bm-slot-details').textContent = `${slotName} (${slotTime})`;
  document.getElementById('bm-slot-icon').className = `fa-solid ${slotIcon}`;

  // Reset form inputs
  document.getElementById('bm-event-title').value = '';
  document.getElementById('bm-organizer').value = '';
  document.getElementById('bm-category').value = 'Corporate';
  document.getElementById('bm-guests').value = '';
  document.getElementById('bm-notes').value = '';

  document.getElementById('form-error-alert').classList.add('hidden');

  document.getElementById('booking-modal').classList.remove('hidden');
}

function closeBookingModal() {
  document.getElementById('booking-modal').classList.add('hidden');
}

function handleBookingSubmit(event) {
  event.preventDefault();

  const slotId = document.getElementById('bm-slot-id').value;
  const day = document.getElementById('bm-day-input').value;
  const slotName = document.getElementById('bm-slot-name-input').value;
  const slotTime = document.getElementById('bm-slot-time-input').value;

  const eventTitle = document.getElementById('bm-event-title').value.trim();
  const organizer = document.getElementById('bm-organizer').value.trim();
  const category = document.getElementById('bm-category').value;
  const guests = parseInt(document.getElementById('bm-guests').value) || 0;
  const notes = document.getElementById('bm-notes').value.trim();

  // Basic Validation
  if (!eventTitle || !organizer) {
    showFormError('Please enter both the Event Title and Organizer/Company Name.');
    return;
  }

  // Conflict Check before saving
  const requests = StorageService.getRequests();
  const existingActive = requests.find(r => r.slotId === slotId && (r.status === 'pending' || r.status === 'approved'));

  if (existingActive) {
    showFormError(`Sorry, this time slot has just been reserved by "${existingActive.organizer}".`);
    return;
  }

  const newReq = {
    id: `req-${Date.now()}`,
    slotId: slotId,
    day: day,
    slotIdOnly: slotId.split('-')[1],
    slotName: slotName,
    slotTime: slotTime,
    eventTitle: eventTitle,
    organizer: organizer,
    category: category,
    estimatedGuests: guests,
    notes: notes,
    status: 'pending',
    createdAt: new Date().toISOString()
  };

  StorageService.addRequest(newReq);

  closeBookingModal();
  renderDayTabs();
  renderPlannerView();
  renderAdminDashboard();
  updateHeaderBadges();

  showToast('Booking request submitted! Awaiting Admin approval.', 'success');
}

function showFormError(msg) {
  const alertEl = document.getElementById('form-error-alert');
  const textEl = document.getElementById('form-error-text');
  textEl.textContent = msg;
  alertEl.classList.remove('hidden');
}

/**
 * ADMIN DASHBOARD LOGIC
 */

function renderAdminDashboard() {
  const requests = StorageService.getRequests();

  // Update KPI Counts
  const totalCount = requests.length;
  const pendingCount = requests.filter(r => r.status === 'pending').length;
  const approvedCount = requests.filter(r => r.status === 'approved').length;
  const cancelledCount = requests.filter(r => r.status === 'cancelled').length;

  document.getElementById('kpi-total').textContent = totalCount;
  document.getElementById('kpi-pending').textContent = pendingCount;
  document.getElementById('kpi-approved').textContent = approvedCount;
  document.getElementById('kpi-cancelled').textContent = cancelledCount;

  // Filter Counts
  document.getElementById('filter-count-all').textContent = totalCount;
  document.getElementById('filter-count-pending').textContent = pendingCount;
  document.getElementById('filter-count-approved').textContent = approvedCount;
  document.getElementById('filter-count-cancelled').textContent = cancelledCount;

  // Filter and Search logic
  let filtered = requests;

  if (state.adminFilterStatus !== 'all') {
    filtered = filtered.filter(r => r.status === state.adminFilterStatus);
  }

  if (state.adminSearchQuery) {
    const q = state.adminSearchQuery.toLowerCase();
    filtered = filtered.filter(r => 
      (r.eventTitle && r.eventTitle.toLowerCase().includes(q)) ||
      (r.organizer && r.organizer.toLowerCase().includes(q)) ||
      (r.day && r.day.toLowerCase().includes(q)) ||
      (r.category && r.category.toLowerCase().includes(q))
    );
  }

  // Sort descending by createdAt
  filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const tableBody = document.getElementById('admin-table-body');
  const emptyState = document.getElementById('admin-empty-state');

  if (!tableBody) return;

  if (filtered.length === 0) {
    tableBody.innerHTML = '';
    emptyState.classList.remove('hidden');
    return;
  }

  emptyState.classList.add('hidden');

  tableBody.innerHTML = filtered.map(req => {
    const statusBadge = getStatusBadgeHTML(req.status);

    return `
      <tr class="hover:bg-slate-50/80 transition-colors border-b border-slate-200/70">
        <!-- Event & Category -->
        <td class="py-4 px-4 sm:px-6">
          <div class="font-bold text-slate-900 text-sm">${escapeHtml(req.eventTitle)}</div>
          <div class="flex items-center space-x-2 mt-1">
            <span class="px-2 py-0.5 text-[10px] font-semibold bg-slate-100 text-slate-600 rounded-md border border-slate-200">
              ${escapeHtml(req.category || 'General')}
            </span>
          </div>
        </td>

        <!-- Organizer -->
        <td class="py-4 px-4">
          <div class="font-semibold text-slate-800">${escapeHtml(req.organizer)}</div>
        </td>

        <!-- Day & Time Slot -->
        <td class="py-4 px-4">
          <div class="font-semibold text-slate-900">${req.day}</div>
          <div class="text-xs text-slate-500 font-medium flex items-center space-x-1 mt-0.5">
            <i class="fa-regular fa-clock text-[10px]"></i>
            <span>${req.slotName} (${req.slotTime})</span>
          </div>
        </td>

        <!-- Guests -->
        <td class="py-4 px-4 text-center font-semibold text-slate-700">
          ${req.estimatedGuests ? req.estimatedGuests : '-'}
        </td>

        <!-- Status -->
        <td class="py-4 px-4 text-center">
          ${statusBadge}
        </td>

        <!-- Actions -->
        <td class="py-4 px-4 text-right">
          <div class="flex items-center justify-end space-x-1.5">
            ${renderAdminActionButtons(req)}
            <button onclick="openDetailsModal('${req.id}')" title="View Full Details" 
                    class="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
              <i class="fa-solid fa-ellipsis-vertical text-sm"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function getStatusBadgeHTML(status) {
  if (status === 'approved') {
    return `<span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></span>Approved
            </span>`;
  } else if (status === 'pending') {
    return `<span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200 animate-pulse">
              <span class="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5"></span>Pending
            </span>`;
  } else if (status === 'cancelled') {
    return `<span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
              <span class="w-1.5 h-1.5 rounded-full bg-rose-500 mr-1.5"></span>Cancelled
            </span>`;
  }
  return status;
}

function renderAdminActionButtons(req) {
  if (req.status === 'pending') {
    return `
      <button onclick="changeStatus('${req.id}', 'approved')" 
              class="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all flex items-center space-x-1">
        <i class="fa-solid fa-check"></i>
        <span>Approve</span>
      </button>
      <button onclick="changeStatus('${req.id}', 'cancelled')" 
              class="px-3 py-1.5 rounded-lg bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-700 font-bold text-xs transition-all flex items-center space-x-1">
        <i class="fa-solid fa-xmark"></i>
        <span>Reject</span>
      </button>
    `;
  } else if (req.status === 'approved') {
    return `
      <button onclick="changeStatus('${req.id}', 'cancelled')" 
              class="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 hover:text-rose-700 border border-slate-200 text-slate-700 font-semibold text-xs transition-all">
        Cancel Booking
      </button>
    `;
  } else if (req.status === 'cancelled') {
    return `
      <button onclick="changeStatus('${req.id}', 'approved')" 
              class="px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200 hover:bg-blue-100 text-blue-700 font-semibold text-xs transition-all">
        Re-approve
      </button>
      <button onclick="deleteRecord('${req.id}')" title="Delete Record"
              class="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
        <i class="fa-regular fa-trash-can text-sm"></i>
      </button>
    `;
  }
  return '';
}

function changeStatus(reqId, newStatus) {
  const requests = StorageService.getRequests();
  const targetReq = requests.find(r => r.id === reqId);

  if (newStatus === 'approved' && targetReq) {
    // Conflict Check: verify if another active (approved/pending) booking claims this slot
    const conflict = requests.find(r => 
      r.id !== reqId && 
      r.slotId === targetReq.slotId && 
      (r.status === 'approved' || r.status === 'pending')
    );
    if (conflict) {
      showToast(`Cannot approve: Slot is already claimed by "${escapeHtml(conflict.eventTitle)}" (${escapeHtml(conflict.organizer)}).`, 'error');
      return;
    }
  }

  StorageService.updateRequestStatus(reqId, newStatus);
  
  renderDayTabs();
  renderPlannerView();
  renderAdminDashboard();
  updateHeaderBadges();

  const msg = newStatus === 'approved' ? 'Booking approved!' : 'Booking cancelled.';
  const type = newStatus === 'approved' ? 'success' : 'info';
  showToast(msg, type);

  // Close details modal if open
  closeDetailsModal();
}

function deleteRecord(reqId) {
  StorageService.deleteRequest(reqId);
  
  renderDayTabs();
  renderPlannerView();
  renderAdminDashboard();
  updateHeaderBadges();

  showToast('Record deleted.', 'info');
  closeDetailsModal();
}

function setAdminFilter(status) {
  state.adminFilterStatus = status;

  ['all', 'pending', 'approved', 'cancelled'].forEach(s => {
    const pill = document.getElementById(`filter-pill-${s}`);
    if (pill) {
      if (s === status) {
        pill.className = "px-3.5 py-2 rounded-xl bg-blue-900 text-white shadow-sm transition-all";
      } else {
        pill.className = "px-3.5 py-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all";
      }
    }
  });

  renderAdminDashboard();
}

function handleAdminSearch() {
  const input = document.getElementById('admin-search-input');
  const clearBtn = document.getElementById('admin-search-clear');
  
  state.adminSearchQuery = input.value.trim();

  if (state.adminSearchQuery) {
    clearBtn.classList.remove('hidden');
  } else {
    clearBtn.classList.add('hidden');
  }

  renderAdminDashboard();
}

function clearAdminSearch() {
  const input = document.getElementById('admin-search-input');
  input.value = '';
  state.adminSearchQuery = '';
  document.getElementById('admin-search-clear').classList.add('hidden');
  renderAdminDashboard();
}

/**
 * DETAILS & TRACKER MODALS
 */

function openDetailsModal(reqId) {
  const requests = StorageService.getRequests();
  const req = requests.find(r => r.id === reqId);

  if (!req) return;

  document.getElementById('dm-event-title').textContent = req.eventTitle;
  document.getElementById('dm-organizer').textContent = req.organizer;
  document.getElementById('dm-category').textContent = req.category || 'Not specified';
  document.getElementById('dm-day-time').textContent = `${req.day} • ${req.slotName} (${req.slotTime})`;
  document.getElementById('dm-guests').textContent = req.estimatedGuests ? `${req.estimatedGuests} People` : 'Unspecified';
  document.getElementById('dm-notes').textContent = req.notes || 'No additional notes provided.';
  document.getElementById('dm-req-id').textContent = req.id;
  document.getElementById('dm-created-at').textContent = req.createdAt ? `Submitted ${new Date(req.createdAt).toLocaleDateString()}` : '';

  // Status Badge
  const badgeEl = document.getElementById('dm-status-badge');
  const statusText = document.getElementById('dm-status-text');

  if (req.status === 'approved') {
    badgeEl.className = "inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold mb-1 bg-emerald-100 text-emerald-800 border border-emerald-200";
    statusText.textContent = "Approved Reservation";
  } else if (req.status === 'pending') {
    badgeEl.className = "inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold mb-1 bg-amber-100 text-amber-800 border border-amber-200";
    statusText.textContent = "Pending Admin Review";
  } else {
    badgeEl.className = "inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold mb-1 bg-rose-100 text-rose-800 border border-rose-200";
    statusText.textContent = "Cancelled / Released";
  }

  // Dynamic Action Buttons
  const actionsContainer = document.getElementById('dm-actions-container');
  let buttonsHTML = `<button onclick="closeDetailsModal()" class="px-5 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200 transition-colors text-xs sm:text-sm">Close</button>`;

  if (req.status === 'pending') {
    buttonsHTML += `
      <button onclick="changeStatus('${req.id}', 'cancelled')" class="px-4 py-2 rounded-xl bg-rose-50 text-rose-700 font-bold border border-rose-200 hover:bg-rose-100 text-xs sm:text-sm">Reject</button>
      <button onclick="changeStatus('${req.id}', 'approved')" class="px-5 py-2 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 shadow-md text-xs sm:text-sm">Approve Booking</button>
    `;
  } else if (req.status === 'approved') {
    buttonsHTML += `
      <button onclick="changeStatus('${req.id}', 'cancelled')" class="px-4 py-2 rounded-xl bg-rose-600 text-white font-bold hover:bg-rose-700 shadow-md text-xs sm:text-sm">Cancel Booking</button>
    `;
  } else if (req.status === 'cancelled') {
    buttonsHTML += `
      <button onclick="changeStatus('${req.id}', 'approved')" class="px-4 py-2 rounded-xl bg-blue-900 text-white font-bold hover:bg-blue-800 shadow-md text-xs sm:text-sm">Re-approve Slot</button>
    `;
  }

  actionsContainer.innerHTML = buttonsHTML;

  document.getElementById('details-modal').classList.remove('hidden');
}

function closeDetailsModal() {
  document.getElementById('details-modal').classList.add('hidden');
}

function openTrackerModal() {
  const requests = StorageService.getRequests();
  const container = document.getElementById('tracker-list-container');

  if (requests.length === 0) {
    container.innerHTML = `
      <div class="py-8 text-center text-slate-400">
        <i class="fa-solid fa-folder-open text-3xl mb-2"></i>
        <p class="text-sm font-medium">No booking requests submitted yet.</p>
      </div>
    `;
  } else {
    // Sort descending
    const sorted = [...requests].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    container.innerHTML = sorted.map(req => {
      const badge = getStatusBadgeHTML(req.status);
      return `
        <div class="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white transition-colors shadow-xs">
          <div>
            <div class="flex items-center space-x-2">
              <span class="font-bold text-slate-900 text-sm sm:text-base">${escapeHtml(req.eventTitle)}</span>
              <span class="px-2 py-0.5 text-[10px] font-semibold bg-slate-200 text-slate-700 rounded">${escapeHtml(req.category || 'General')}</span>
            </div>
            <p class="text-xs text-slate-500 font-medium mt-1">
              <span class="font-semibold text-slate-700">${escapeHtml(req.organizer)}</span> • ${req.day} (${req.slotName})
            </p>
          </div>
          <div class="flex items-center justify-between sm:justify-end space-x-3">
            ${badge}
            <button onclick="openDetailsModal('${req.id}')" class="px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50">
              Details
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  document.getElementById('tracker-modal').classList.remove('hidden');
}

function closeTrackerModal() {
  document.getElementById('tracker-modal').classList.add('hidden');
}

/**
 * RESET SEED DATA
 */

function confirmResetSeedData() {
  document.getElementById('reset-modal').classList.remove('hidden');
}

function closeResetModal() {
  document.getElementById('reset-modal').classList.add('hidden');
}

function executeResetSeedData() {
  StorageService.resetToSeedData();
  closeResetModal();

  renderDayTabs();
  renderPlannerView();
  renderAdminDashboard();
  updateHeaderBadges();

  showToast('Demo data restored to seed state!', 'info');
}

/**
 * TOAST NOTIFICATIONS
 */

function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');

  let icon = 'fa-circle-check';
  let colors = 'bg-slate-900 text-white border-slate-800';

  if (type === 'success') {
    icon = 'fa-circle-check text-emerald-400';
  } else if (type === 'warning') {
    icon = 'fa-triangle-exclamation text-amber-400';
  } else if (type === 'error') {
    icon = 'fa-circle-xmark text-rose-400';
  } else if (type === 'info') {
    icon = 'fa-circle-info text-blue-400';
  }

  toast.className = `animate-toast p-4 rounded-2xl shadow-2xl border flex items-center space-x-3 pointer-events-auto ${colors}`;
  toast.innerHTML = `
    <i class="fa-solid ${icon} text-lg"></i>
    <span class="text-xs sm:text-sm font-semibold flex-grow">${escapeHtml(message)}</span>
    <button onclick="this.parentElement.remove()" class="text-slate-400 hover:text-white transition-colors">
      <i class="fa-solid fa-xmark text-sm"></i>
    </button>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    if (toast.parentElement) {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }
  }, 3500);
}

/**
 * Helper to escape HTML characters
 */
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
