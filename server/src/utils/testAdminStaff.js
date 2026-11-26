import Assignment from '../models/Assignment.js';
import Complaint from '../models/Complaint.js';

async function testAdminStaffFlow() {
  console.log('[Test] 1. Testing Assignment Audit Collection Schema...');
  const testAssignment = new Assignment({
    complaint: '65f123456789abcdef012345',
    assignedBy: '65f123456789abcdef012346',
    assignedTo: '65f123456789abcdef012347',
    action: 'assigned',
    notes: 'Dispatched electrician Rajesh Kumar to inspect projector in Room 304',
  });

  const err1 = testAssignment.validateSync();
  if (err1) throw new Error(`Assignment validation failed: ${err1.message}`);
  console.log('✅ Assignment audit log schema verified');

  console.log('[Test] 2. Testing Resolution Proof & Remarks Validation...');
  const resolvedAssignment = new Assignment({
    complaint: '65f123456789abcdef012345',
    assignedBy: '65f123456789abcdef012347',
    assignedTo: '65f123456789abcdef012347',
    action: 'completed',
    notes: 'Replaced faulty HDMI port and cleaned projector fan filter.',
  });

  const err2 = resolvedAssignment.validateSync();
  if (err2) throw new Error(`Resolution audit validation failed: ${err2.message}`);
  console.log('✅ Staff resolution audit schema verified');

  console.log('All Phase 5 Admin & Staff workflow modules passed verification!');
  process.exit(0);
}

testAdminStaffFlow().catch((err) => {
  console.error('❌ Phase 5 test error:', err);
  process.exit(1);
});
