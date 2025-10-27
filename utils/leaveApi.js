import { apiRequest } from './api.js';

const leaveApi = {
  // Leave Request Operations
  async createLeaveRequest(data) {
    return apiRequest('/api/leave/request', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' }
    });
  },

  async getMyLeaves() {
    return apiRequest('/api/leave/my-leaves', { method: 'GET' });
  },

  async getPendingApprovals() {
    return apiRequest('/api/leave/pending-approvals', { method: 'GET' });
  },

  async approveLeave(id, comment) {
    return apiRequest(`/api/leave/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify({ comment }),
      headers: { 'Content-Type': 'application/json' }
    });
  },

  async rejectLeave(id, reason, comment) {
    return apiRequest(`/api/leave/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason, comment }),
      headers: { 'Content-Type': 'application/json' }
    });
  },

  async cancelLeaveRequest(id) {
    return apiRequest(`/api/leave/${id}/cancel`, { method: 'DELETE' });
  },

  async getTeamLeaves() {
    return apiRequest('/api/leave/team-leaves', { method: 'GET' });
  },

  async getDepartmentLeaves() {
    return apiRequest('/api/leave/department-leaves', { method: 'GET' });
  },

  async getAllLeaves() {
    return apiRequest('/api/leave/all', { method: 'GET' });
  },

  // Leave Balance Operations
  async getMyBalance() {
    return apiRequest('/api/leave/balance/my', { method: 'GET' });
  },

  async getAllBalances() {
    return apiRequest('/api/leave/balance/all', { method: 'GET' });
  },

  async initializeStaffBalance(data) {
    return apiRequest('/api/leave/balance/initialize', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' }
    });
  },

  async adjustBalance(id, data) {
    return apiRequest(`/api/leave/balance/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' }
    });
  },

  // Leave Type Operations
  async getLeaveTypes() {
    return apiRequest('/api/leave/types', { method: 'GET' });
  },

  async getAllLeaveTypesAdmin() {
    return apiRequest('/api/leave/types/admin', { method: 'GET' });
  },

  async createLeaveType(data) {
    return apiRequest('/api/leave/types', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' }
    });
  },

  async updateLeaveType(id, data) {
    return apiRequest(`/api/leave/types/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' }
    });
  },

  async deleteLeaveType(id) {
    return apiRequest(`/api/leave/types/${id}`, { method: 'DELETE' });
  },

  // Calendar Operations
  async getPersonalCalendar(startDate, endDate) {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const query = params.toString();
    return apiRequest(`/api/leave/calendar/personal${query ? `?${query}` : ''}`, { method: 'GET' });
  },

  async getTeamCalendar(startDate, endDate) {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const query = params.toString();
    return apiRequest(`/api/leave/calendar/team${query ? `?${query}` : ''}`, { method: 'GET' });
  },

  async getDepartmentCalendar(startDate, endDate) {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const query = params.toString();
    return apiRequest(`/api/leave/calendar/department${query ? `?${query}` : ''}`, { method: 'GET' });
  },

  async getCompanyCalendar(startDate, endDate) {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const query = params.toString();
    return apiRequest(`/api/leave/calendar/company${query ? `?${query}` : ''}`, { method: 'GET' });
  },

  // Report Operations
  async generateStaffReport(startDate, endDate) {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const query = params.toString();
    return apiRequest(`/api/leave/reports/staff${query ? `?${query}` : ''}`, { method: 'GET' });
  },

  async generateTeamReport(startDate, endDate) {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const query = params.toString();
    return apiRequest(`/api/leave/reports/team${query ? `?${query}` : ''}`, { method: 'GET' });
  },

  async generateDepartmentReport(startDate, endDate) {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const query = params.toString();
    return apiRequest(`/api/leave/reports/department${query ? `?${query}` : ''}`, { method: 'GET' });
  },

  async generateCompanyReport(startDate, endDate) {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const query = params.toString();
    return apiRequest(`/api/leave/reports/company${query ? `?${query}` : ''}`, { method: 'GET' });
  }
};

export default leaveApi;

