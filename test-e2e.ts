// Comprehensive E2E API and logic test script
import http from 'http';

const BASE_URL = 'http://localhost:3001';

async function req(path: string, options: any = {}) {
  const url = `${BASE_URL}${path}`;
  const headers: any = { 'Content-Type': 'application/json', ...options.headers };
  const res = await fetch(url, {
    ...options,
    headers,
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, ok: res.ok, data };
}

async function runTests() {
  console.log('--- STARTING COMPREHENSIVE END-TO-END TESTS ---');

  // 1. Health check
  console.log('\n[1/10] Testing Health Endpoint...');
  const health = await req('/api/health');
  if (!health.ok || health.data.status !== 'ok') {
    throw new Error('Health check failed: ' + JSON.stringify(health));
  }
  console.log('✓ Health check passed');

  // 2. Student Login
  console.log('\n[2/10] Testing Student Login...');
  const studentLogin = await req('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'student@demo.com', password: 'student123' }),
  });
  if (!studentLogin.ok || !studentLogin.data.token || studentLogin.data.user.role !== 'STUDENT') {
    throw new Error('Student login failed: ' + JSON.stringify(studentLogin));
  }
  const studentToken = studentLogin.data.token;
  console.log(`✓ Student authenticated: ${studentLogin.data.user.name} (${studentLogin.data.user.role})`);

  // 3. Admin Login
  console.log('\n[3/10] Testing Admin Login...');
  const adminLogin = await req('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'admin@demo.com', password: 'admin123' }),
  });
  if (!adminLogin.ok || !adminLogin.data.token || adminLogin.data.user.role !== 'ADMIN') {
    throw new Error('Admin login failed: ' + JSON.stringify(adminLogin));
  }
  const adminToken = adminLogin.data.token;
  console.log(`✓ Admin authenticated: ${adminLogin.data.user.name} (${adminLogin.data.user.role})`);

  // 4. Role Authorization Guard Test
  console.log('\n[4/10] Testing Role Guard (Student trying Admin endpoint)...');
  const studentAnalyticsAttempt = await req('/api/analytics', {
    headers: { Authorization: `Bearer ${studentToken}` },
  });
  if (studentAnalyticsAttempt.status !== 403) {
    throw new Error('Security failure: Student was able to access /api/analytics!');
  }
  console.log('✓ Student correctly blocked from admin endpoint (HTTP 403 Forbidden)');

  // 5. Test Analytics for Admin
  console.log('\n[5/10] Testing Admin Analytics API...');
  const analyticsRes = await req('/api/analytics', {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  if (!analyticsRes.ok || !analyticsRes.data.metrics) {
    throw new Error('Analytics failed: ' + JSON.stringify(analyticsRes));
  }
  console.log(`✓ Analytics returned metrics: Total=${analyticsRes.data.metrics.total}, Resolved=${analyticsRes.data.metrics.resolved}, AvgHours=${analyticsRes.data.metrics.avgResolutionHours}h`);
  console.log(`✓ Categories analyzed: ${analyticsRes.data.categories.length}, Locations analyzed: ${analyticsRes.data.locations.length}`);

  // 6. Test Duplicate Detection
  console.log('\n[6/10] Testing Rule-Based Duplicate Detection...');
  // There is a seeded complaint: 'Ceiling Fan Making Loud Noise & Sparking' at 'Engineering Hall', room '204', category 'Electrical'
  const dupCheck1 = await req('/api/complaints/check-duplicate', {
    method: 'POST',
    headers: { Authorization: `Bearer ${studentToken}` },
    body: JSON.stringify({
      title: 'Ceiling fan sparking and broken',
      description: 'The fan in this classroom is sparking at regulator',
      category: 'Electrical',
      location: 'Engineering Hall',
      roomNumber: '204',
    }),
  });
  if (!dupCheck1.data.isDuplicate) {
    throw new Error('Duplicate check failed: Expected duplicate detection for Room 204 fan');
  }
  console.log(`✓ Duplicate detected correctly: "${dupCheck1.data.matchReason}"`);

  // Non-duplicate check
  const dupCheck2 = await req('/api/complaints/check-duplicate', {
    method: 'POST',
    headers: { Authorization: `Bearer ${studentToken}` },
    body: JSON.stringify({
      title: 'Water tap leaking in Chemistry washroom',
      description: 'Completely different area and category',
      category: 'Water',
      location: 'Sports Complex',
      roomNumber: 'Gym 1',
    }),
  });
  if (dupCheck2.data.isDuplicate) {
    throw new Error('Duplicate false positive on distinct location');
  }
  console.log('✓ Non-duplicate correctly passed without warning');

  // 7. Test Complaint Creation
  console.log('\n[7/10] Testing Complaint Creation...');
  const newComplaintRes = await req('/api/complaints', {
    method: 'POST',
    headers: { Authorization: `Bearer ${studentToken}` },
    body: JSON.stringify({
      title: 'Air Conditioner Blowing Warm Air',
      description: 'Room is sweltering during thermodynamics lecture; thermostat set to 18C but blows hot ambient air.',
      category: 'Classroom',
      priority: 'High',
      location: 'Science Block',
      roomNumber: 'Room 305',
      image: '/uploads/sample-fan.svg',
    }),
  });
  if (!newComplaintRes.ok || !newComplaintRes.data.complaintId) {
    throw new Error('Failed to create complaint: ' + JSON.stringify(newComplaintRes));
  }
  const createdId = newComplaintRes.data.complaintId;
  console.log(`✓ Complaint created successfully with ID: ${createdId}`);

  // 8. Test Details and Timeline
  console.log('\n[8/10] Testing Complaint Details & Timeline Retrieval...');
  const detailsRes = await req(`/api/complaints/${createdId}`, {
    headers: { Authorization: `Bearer ${studentToken}` },
  });
  if (!detailsRes.ok || detailsRes.data.complaint.id !== createdId) {
    throw new Error('Failed to retrieve complaint details: ' + JSON.stringify(detailsRes));
  }
  console.log(`✓ Retrieved complaint details: status=${detailsRes.data.complaint.status}, timeline events=${detailsRes.data.timeline.length}`);

  // 9. Test Admin Assignment and Status Transition
  console.log('\n[9/10] Testing Admin Technician Assignment...');
  const assignRes = await req(`/api/complaints/${createdId}/assign`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({
      assignedTo: 'HVAC Maintenance Team',
      note: 'Urgent HVAC dispatch for Room 305 AC coil inspection',
    }),
  });
  if (!assignRes.ok) {
    throw new Error('Failed to assign technician: ' + JSON.stringify(assignRes));
  }
  console.log('✓ Assigned to HVAC Maintenance Team');

  // 10. Test Resolution with Resolution Notes & Proof Image
  console.log('\n[10/10] Testing Complaint Resolution & Audit Timeline...');
  const resolveRes = await req(`/api/complaints/${createdId}/status`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({
      status: 'Resolved',
      note: 'AC refrigerant refilled and air filter cleaned.',
      resolutionNotes: 'Refrigerant pressure restored to 65 PSI. Air filter washed and dried. Temperature output measured at 18.2C.',
      resolutionImage: '/uploads/sample-fixed.svg',
    }),
  });
  if (!resolveRes.ok) {
    throw new Error('Failed to resolve complaint: ' + JSON.stringify(resolveRes));
  }
  console.log('✓ Complaint marked as Resolved with resolution notes and proof photo');

  // Verify updated state in details
  const finalCheck = await req(`/api/complaints/${createdId}`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  if (finalCheck.data.complaint.status !== 'Resolved' || !finalCheck.data.complaint.resolvedAt) {
    throw new Error('Final check failed: Status not resolved or resolvedAt missing');
  }
  console.log(`✓ Final verification: status=${finalCheck.data.complaint.status}, resolvedAt=${finalCheck.data.complaint.resolvedAt}`);
  console.log(`✓ Final timeline events: ${finalCheck.data.timeline.length}`);

  console.log('\n========================================');
  console.log('ALL 10 TEST SUITES PASSED FLAWLESSLY! ✓');
  console.log('========================================\n');
}

runTests().catch((err) => {
  console.error('\n❌ TEST FAILURE:', err);
  process.exit(1);
});
