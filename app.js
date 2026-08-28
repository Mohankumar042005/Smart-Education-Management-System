// State management
let currentUser = null;
let currentChart = null;

// DOM Elements
const sidebarMenu = document.getElementById('sidebar-menu');
const mainContentArea = document.getElementById('main-content-area');
const chatbotPanel = document.getElementById('chatbot-panel');
const chatMessages = document.getElementById('chat-messages');
const chatInput = document.getElementById('chat-input');
const profileName = document.getElementById('profile-name');
const profileRole = document.getElementById('profile-role');
const profileAvatar = document.getElementById('profile-avatar');

// Initial Load
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    loadProfile();
});

// Theme Management
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    const toggleBtn = document.getElementById('theme-toggle');
    if (toggleBtn) {
        toggleBtn.innerHTML = savedTheme === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
        toggleBtn.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            toggleBtn.innerHTML = newTheme === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
        });
    }
}

// Fetch Profile and Build Sidebar
async function loadProfile() {
    try {
        const res = await fetch('/api/auth/profile');
        if (res.status === 401) {
            // Redirect or show login if not authenticated (Security handles this, but helper check)
            window.location.href = '/login';
            return;
        }
        currentUser = await res.json();
        
        // Update Header Profile
        profileName.innerText = currentUser.fullName;
        profileRole.innerText = currentUser.role;
        profileAvatar.innerText = currentUser.fullName.split(' ').map(n => n[0]).join('');

        buildSidebar();
        loadView('dashboard'); // Default view
    } catch (e) {
        console.error("Error loading profile", e);
    }
}

// Build Role-Based Sidebar Navigation
function buildSidebar() {
    sidebarMenu.innerHTML = '';
    
    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: 'fas fa-chart-pie', roles: ['ADMIN', 'FACULTY', 'STUDENT', 'PARENT'] },
        { id: 'students', label: 'Student Directory', icon: 'fas fa-user-graduate', roles: ['ADMIN', 'FACULTY'] },
        { id: 'faculty', label: 'Faculty Roster', icon: 'fas fa-chalkboard-teacher', roles: ['ADMIN'] },
        { id: 'attendance', label: 'Attendance logs', icon: 'fas fa-calendar-check', roles: ['ADMIN', 'FACULTY', 'STUDENT', 'PARENT'] },
        { id: 'marks', label: 'Grades & Exams', icon: 'fas fa-file-invoice', roles: ['ADMIN', 'FACULTY', 'STUDENT', 'PARENT'] },
        { id: 'timetable', label: 'Timetable Scheduling', icon: 'fas fa-clock', roles: ['ADMIN', 'FACULTY', 'STUDENT', 'PARENT'] },
        { id: 'fees', label: 'Fee Management', icon: 'fas fa-wallet', roles: ['ADMIN', 'STUDENT', 'PARENT'] },
        { id: 'library', label: 'Library Management', icon: 'fas fa-book', roles: ['ADMIN', 'STUDENT', 'PARENT'] },
        { id: 'hostel-transport', label: 'Hostel & Transport', icon: 'fas fa-bus-alt', roles: ['ADMIN', 'STUDENT', 'PARENT'] }
    ];

    menuItems.forEach(item => {
        if (item.roles.includes(currentUser.role)) {
            const li = document.createElement('li');
            li.className = 'nav-item';
            li.id = `nav-${item.id}`;
            li.innerHTML = `
                <a href="#" onclick="loadView('${item.id}'); return false;">
                    <i class="${item.icon}"></i>
                    <span>${item.label}</span>
                </a>
            `;
            sidebarMenu.appendChild(li);
        }
    });
}

// Router Logic
function loadView(viewId) {
    // Update active nav item
    document.querySelectorAll('.nav-menu .nav-item').forEach(el => el.classList.remove('active'));
    const activeNav = document.getElementById(`nav-${viewId}`);
    if (activeNav) activeNav.classList.add('active');

    // Load templates
    switch (viewId) {
        case 'dashboard':
            renderDashboard();
            break;
        case 'students':
            renderStudents();
            break;
        case 'faculty':
            renderFaculty();
            break;
        case 'attendance':
            renderAttendance();
            break;
        case 'marks':
            renderMarks();
            break;
        case 'timetable':
            renderTimetable();
            break;
        case 'fees':
            renderFees();
            break;
        case 'library':
            renderLibrary();
            break;
        case 'hostel-transport':
            renderHostelTransport();
            break;
        default:
            mainContentArea.innerHTML = `<h2>Module Coming Soon</h2>`;
    }
}

// ==========================================
// 1. DASHBOARD VIEW
// ==========================================
async function renderDashboard() {
    mainContentArea.innerHTML = `
        <div class="row g-4 mb-4">
            <div class="col-md-3">
                <div class="glass-card p-4">
                    <div class="d-flex align-items-center justify-content-between">
                        <div>
                            <span class="text-secondary d-block mb-1">Total Students</span>
                            <h3 id="stat-students" class="mb-0 font-weight-bold">--</h3>
                        </div>
                        <div class="avatar bg-primary-light text-primary p-3 rounded-circle"><i class="fas fa-user-graduate"></i></div>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="glass-card p-4">
                    <div class="d-flex align-items-center justify-content-between">
                        <div>
                            <span class="text-secondary d-block mb-1">Total Faculty</span>
                            <h3 id="stat-faculty" class="mb-0 font-weight-bold">--</h3>
                        </div>
                        <div class="avatar bg-success-light text-success p-3 rounded-circle"><i class="fas fa-chalkboard-teacher"></i></div>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="glass-card p-4">
                    <div class="d-flex align-items-center justify-content-between">
                        <div>
                            <span class="text-secondary d-block mb-1">Average Attendance</span>
                            <h3 id="stat-attendance" class="mb-0 font-weight-bold">--%</h3>
                        </div>
                        <div class="avatar bg-info-light text-info p-3 rounded-circle" style="background-color:rgba(6,182,212,0.1);color:#06b6d4;"><i class="fas fa-calendar-check"></i></div>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="glass-card p-4">
                    <div class="d-flex align-items-center justify-content-between">
                        <div>
                            <span class="text-secondary d-block mb-1">Pending Invoices</span>
                            <h3 id="stat-fees" class="mb-0 font-weight-bold">--</h3>
                        </div>
                        <div class="avatar bg-warning-light text-warning p-3 rounded-circle"><i class="fas fa-file-invoice-dollar"></i></div>
                    </div>
                </div>
            </div>
        </div>

        <div class="row g-4">
            <!-- Main statistics graph -->
            <div class="col-md-8">
                <div class="glass-card p-4 mb-4">
                    <h5 class="mb-4">Institution Performance Index & Attendance Trends</h5>
                    <div class="chart-container">
                        <canvas id="dashboardChart"></canvas>
                    </div>
                </div>
            </div>
            
            <!-- AI Insights Panel -->
            <div class="col-md-4">
                <div class="glass-card p-4 h-100">
                    <h5 class="mb-4 d-flex align-items-center gap-2">
                        <i class="fas fa-robot text-primary"></i> 
                        <span>AI Cognitive Insights</span>
                    </h5>
                    <div id="ai-insights-container">
                        <p class="text-secondary small">Gathering cognitive telemetry from AI model...</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Latest Notifications -->
        <div class="glass-card p-4 mt-4">
            <h5 class="mb-4">Recent Alerts & Communications</h5>
            <div id="dashboard-notifications" class="d-flex flex-column gap-3">
                <p class="text-secondary small">No notifications found.</p>
            </div>
        </div>
    `;

    // Fetch and populate stats
    const statsRes = await fetch('/api/dashboard/stats');
    const stats = await statsRes.json();
    document.getElementById('stat-students').innerText = stats.totalStudents;
    document.getElementById('stat-faculty').innerText = stats.totalFaculty;
    document.getElementById('stat-attendance').innerText = stats.averageAttendance + '%';
    document.getElementById('stat-fees').innerText = stats.pendingFeesCount;

    // Fetch and populate notifications
    loadDashboardNotifications();

    // Trigger AI Insights depending on logged in Student or overall
    loadAiInsights();

    // Render Chart
    const ctx = document.getElementById('dashboardChart').getContext('2d');
    if (currentChart) currentChart.destroy();
    
    currentChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7', 'Day 8', 'Day 9', 'Day 10'],
            datasets: [
                {
                    label: 'Bobby Johnson Attendance (%)',
                    data: [100, 100, 0, 100, 100, 100, 0, 100, 0, 100],
                    borderColor: '#6366f1',
                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                    fill: true,
                    tension: 0.4
                },
                {
                    label: 'Jane Smith Attendance (%)',
                    data: [100, 100, 100, 100, 100, 100, 100, 100, 100, 100],
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.05)',
                    fill: true,
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { min: 0, max: 100 }
            }
        }
    });
}

async function loadDashboardNotifications() {
    try {
        const res = await fetch('/api/notifications');
        const notifs = await res.json();
        const container = document.getElementById('dashboard-notifications');
        
        if (notifs.length > 0) {
            container.innerHTML = notifs.map(n => `
                <div class="p-3 rounded border border-glass d-flex justify-content-between align-items-center ${n.read ? '' : 'bg-primary-light'}">
                    <div>
                        <h6 class="mb-1 font-weight-bold">${n.title}</h6>
                        <p class="text-secondary small mb-0">${n.message}</p>
                    </div>
                    <div class="d-flex align-items-center gap-2">
                        <span class="text-muted small">${n.sentAt.replace('T', ' ').substring(0, 16)}</span>
                        ${n.read ? '' : `<button onclick="markAsRead(${n.id})" class="btn btn-sm btn-outline-primary py-0 px-2" style="font-size:0.75rem;">Mark Read</button>`}
                    </div>
                </div>
            `).join('');
        }
    } catch(e) {
        console.error("Error fetching notifications", e);
    }
}

async function markAsRead(id) {
    await fetch(`/api/notifications/read/${id}`, { method: 'POST' });
    loadDashboardNotifications();
}

async function loadAiInsights() {
    const container = document.getElementById('ai-insights-container');
    // We target Student 1 (Bobby) for AI diagnostics display
    try {
        // Fetch Performance Prediction
        const perfRes = await fetch('/api/ai/performance/1');
        const perf = await perfRes.json();

        // Fetch Fail Risk Classifier
        const riskRes = await fetch('/api/ai/fail-risk/1');
        const risk = await riskRes.json();

        container.innerHTML = `
            <div class="d-flex flex-column gap-3">
                <div class="ai-highlight-card p-3 rounded">
                    <h6 class="font-weight-bold mb-1"><i class="fas fa-graduation-cap"></i> GPA Forecast</h6>
                    <p class="mb-1 small">Predicted Final GPA: <strong class="text-primary">${perf.predictedGpa} / 4.00</strong></p>
                    <p class="text-muted mb-0" style="font-size: 0.75rem;">Confidence: ${perf.confidence}</p>
                </div>
                
                <div class="p-3 rounded ${risk.risk === 'HIGH' ? 'ai-warning-card' : 'ai-highlight-card'}">
                    <h6 class="font-weight-bold mb-1">
                        <i class="fas fa-exclamation-triangle ${risk.risk === 'HIGH' ? 'text-danger' : 'text-warning'}"></i> 
                        Fail/Debarment Risk: <span class="${risk.risk === 'HIGH' ? 'text-danger' : 'text-primary'}">${risk.risk}</span>
                    </h6>
                    <p class="mb-0 small text-secondary">${risk.reason}</p>
                </div>

                <div class="p-3 rounded border border-glass bg-glass">
                    <h6 class="font-weight-bold mb-1"><i class="fas fa-lightbulb text-warning"></i> AI Action Recommendation</h6>
                    <p class="mb-0 small text-secondary">${perf.recommendation}</p>
                </div>
            </div>
        `;
    } catch(e) {
        container.innerHTML = `<p class="text-danger small">Error running machine learning models.</p>`;
    }
}

// ==========================================
// 2. STUDENT DIRECTORY CRUD
// ==========================================
async function renderStudents() {
    mainContentArea.innerHTML = `
        <div class="glass-card p-4">
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h5 class="mb-0">Student Directory</h5>
                ${currentUser.role === 'ADMIN' ? `<button class="btn btn-premium" data-bs-toggle="modal" data-bs-target="#studentModal"><i class="fas fa-plus"></i> Add Student</button>` : ''}
            </div>
            <div class="table-responsive">
                <table class="table align-middle">
                    <thead>
                        <tr>
                            <th>Roll No.</th>
                            <th>Name</th>
                            <th>Grade</th>
                            <th>Email</th>
                            <th>Parent Details</th>
                            <th>Hostel</th>
                            <th>Transport</th>
                            ${currentUser.role === 'ADMIN' ? '<th>Actions</th>' : ''}
                        </tr>
                    </thead>
                    <tbody id="students-table-body">
                        <tr><td colspan="8" class="text-center text-secondary py-4">Loading directory...</td></tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Student Modal -->
        <div class="modal fade" id="studentModal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-lg">
                <div class="modal-content glass-panel" style="border-radius:20px;color:var(--text-primary);">
                    <div class="modal-header card-header-premium">
                        <h5 class="modal-title">Register New Student</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <form id="student-form">
                            <div class="row g-3">
                                <div class="col-md-6">
                                    <label class="form-label">Full Name</label>
                                    <input type="text" id="s-fullname" class="form-control form-control-premium" required>
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label">Username</label>
                                    <input type="text" id="s-username" class="form-control form-control-premium" required>
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label">Email</label>
                                    <input type="email" id="s-email" class="form-control form-control-premium" required>
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label">Roll Number</label>
                                    <input type="text" id="s-roll" class="form-control form-control-premium" required placeholder="STUxxx">
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label">Class Grade</label>
                                    <input type="text" id="s-grade" class="form-control form-control-premium" required placeholder="Grade 10">
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label">Parent Name</label>
                                    <input type="text" id="s-parent-name" class="form-control form-control-premium">
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label">Parent Email</label>
                                    <input type="email" id="s-parent-email" class="form-control form-control-premium">
                                </div>
                                <div class="col-md-3">
                                    <label class="form-label">Hostel Status</label>
                                    <select id="s-hostel" class="form-select form-control-premium">
                                        <option value="false">Day Scholar</option>
                                        <option value="true">Hostel Resident</option>
                                    </select>
                                </div>
                                <div class="col-md-3">
                                    <label class="form-label">Hostel Room</label>
                                    <input type="text" id="s-hostel-room" class="form-control form-control-premium" placeholder="102-A">
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label">Transport Route</label>
                                    <input type="text" id="s-route" class="form-control form-control-premium" placeholder="Route 4-East">
                                </div>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        <button type="button" onclick="submitStudentForm()" class="btn btn-premium">Register Student</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    loadStudentsTable();
}

async function loadStudentsTable() {
    try {
        const res = await fetch('/api/students');
        const list = await res.json();
        const body = document.getElementById('students-table-body');
        
        body.innerHTML = list.map(s => `
            <tr>
                <td><strong class="text-primary">${s.rollNumber}</strong></td>
                <td>${s.user.fullName}</td>
                <td>${s.classGrade}</td>
                <td>${s.user.email}</td>
                <td>${s.parentName || '--'} <br> <span class="text-muted small">${s.parentEmail || ''}</span></td>
                <td>
                    <span class="badge ${s.hostelStatus ? 'bg-success-light text-success' : 'bg-secondary text-muted'}">
                        ${s.hostelStatus ? `Hostel (${s.hostelRoom})` : 'Day Scholar'}
                    </span>
                </td>
                <td>
                    <span class="badge ${s.transportRoute ? 'bg-info-light text-info' : 'bg-secondary text-muted'}">
                        ${s.transportRoute ? `Bus: ${s.transportRoute}` : 'No Transport'}
                    </span>
                </td>
                ${currentUser.role === 'ADMIN' ? `<td><button onclick="deleteStudent(${s.id})" class="btn btn-sm btn-outline-danger"><i class="fas fa-trash"></i></button></td>` : ''}
            </tr>
        `).join('');
    } catch(e) {
        console.error(e);
    }
}

async function submitStudentForm() {
    const data = {
        fullName: document.getElementById('s-fullname').value,
        username: document.getElementById('s-username').value,
        email: document.getElementById('s-email').value,
        rollNumber: document.getElementById('s-roll').value,
        classGrade: document.getElementById('s-grade').value,
        parentName: document.getElementById('s-parent-name').value,
        parentEmail: document.getElementById('s-parent-email').value,
        hostelStatus: document.getElementById('s-hostel').value,
        hostelRoom: document.getElementById('s-hostel-room').value,
        transportStatus: document.getElementById('s-route').value ? 'true' : 'false',
        transportRoute: document.getElementById('s-route').value
    };

    const res = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });

    if (res.ok) {
        bootstrap.Modal.getInstance(document.getElementById('studentModal')).hide();
        renderStudents();
    } else {
        alert("Registration failed. Check if username or roll number is unique.");
    }
}

async function deleteStudent(id) {
    if (confirm("Are you sure you want to delete this student record?")) {
        await fetch(`/api/students/${id}`, { method: 'DELETE' });
        loadStudentsTable();
    }
}

// ==========================================
// 3. FACULTY ROSTER
// ==========================================
async function renderFaculty() {
    mainContentArea.innerHTML = `
        <div class="glass-card p-4">
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h5 class="mb-0">Faculty Roster</h5>
                <button class="btn btn-premium" data-bs-toggle="modal" data-bs-target="#facultyModal"><i class="fas fa-plus"></i> Add Faculty</button>
            </div>
            <div class="table-responsive">
                <table class="table align-middle">
                    <thead>
                        <tr>
                            <th>Employee ID</th>
                            <th>Name</th>
                            <th>Department</th>
                            <th>Designation</th>
                            <th>Email</th>
                        </tr>
                    </thead>
                    <tbody id="faculty-table-body">
                        <tr><td colspan="5" class="text-center text-secondary py-4">Loading roster...</td></tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Faculty Modal -->
        <div class="modal fade" id="facultyModal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content glass-panel" style="border-radius:20px;color:var(--text-primary);">
                    <div class="modal-header card-header-premium">
                        <h5 class="modal-title">Register New Faculty</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <form id="faculty-form">
                            <div class="mb-3">
                                <label class="form-label">Full Name</label>
                                <input type="text" id="f-fullname" class="form-control form-control-premium" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Username</label>
                                <input type="text" id="f-username" class="form-control form-control-premium" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Email</label>
                                <input type="email" id="f-email" class="form-control form-control-premium" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Employee ID</label>
                                <input type="text" id="f-empid" class="form-control form-control-premium" required placeholder="EMPxxx">
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Department</label>
                                <input type="text" id="f-dept" class="form-control form-control-premium" required placeholder="Science / Humanities">
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Designation</label>
                                <input type="text" id="f-desig" class="form-control form-control-premium" required placeholder="Senior Lecturer">
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        <button type="button" onclick="submitFacultyForm()" class="btn btn-premium">Register Faculty</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    loadFacultyTable();
}

async function loadFacultyTable() {
    try {
        const res = await fetch('/api/faculties');
        const list = await res.json();
        const body = document.getElementById('faculty-table-body');
        
        body.innerHTML = list.map(f => `
            <tr>
                <td><strong class="text-primary">${f.employeeId}</strong></td>
                <td>${f.user.fullName}</td>
                <td>${f.department}</td>
                <td>${f.designation}</td>
                <td>${f.user.email}</td>
            </tr>
        `).join('');
    } catch(e) {
        console.error(e);
    }
}

async function submitFacultyForm() {
    const data = {
        fullName: document.getElementById('f-fullname').value,
        username: document.getElementById('f-username').value,
        email: document.getElementById('f-email').value,
        employeeId: document.getElementById('f-empid').value,
        department: document.getElementById('f-dept').value,
        designation: document.getElementById('f-desig').value
    };

    const res = await fetch('/api/faculties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });

    if (res.ok) {
        bootstrap.Modal.getInstance(document.getElementById('facultyModal')).hide();
        renderFaculty();
    } else {
        alert("Registration failed. Check username/employee ID uniqueness.");
    }
}

// ==========================================
// 4. ATTENDANCE LOGS & MARKING
// ==========================================
async function renderAttendance() {
    if (currentUser.role === 'FACULTY' || currentUser.role === 'ADMIN') {
        mainContentArea.innerHTML = `
            <div class="glass-card p-4">
                <h5 class="mb-4">Record Daily Attendance</h5>
                <div class="row g-3 mb-4 align-items-end">
                    <div class="col-md-4">
                        <label class="form-label">Select Date</label>
                        <input type="date" id="att-date" class="form-control form-control-premium" value="${new Date().toISOString().substring(0,10)}">
                    </div>
                    <div class="col-md-4">
                        <button onclick="loadAttendanceMarkingSheet()" class="btn btn-premium">Load Student List</button>
                    </div>
                </div>
                
                <div class="table-responsive mt-3" style="display:none;" id="attendance-marking-area">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Roll No.</th>
                                <th>Student Name</th>
                                <th>Status Designation</th>
                            </tr>
                        </thead>
                        <tbody id="attendance-students-body"></tbody>
                    </table>
                    <button onclick="saveAttendanceSheet()" class="btn btn-success mt-3"><i class="fas fa-check"></i> Submit Attendance</button>
                </div>
            </div>
        `;
    } else {
        // Student/Parent View
        const studentId = currentUser.studentId || currentUser.childId;
        mainContentArea.innerHTML = `
            <div class="glass-card p-4">
                <h5 class="mb-4">Attendance Logs for ${currentUser.fullName}</h5>
                <div class="table-responsive">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Status</th>
                                <th>Marked By</th>
                            </tr>
                        </thead>
                        <tbody id="student-attendance-body">
                            <tr><td colspan="3" class="text-center py-4">Fetching logs...</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        loadStudentAttendanceLogs(studentId);
    }
}

async function loadAttendanceMarkingSheet() {
    const res = await fetch('/api/students');
    const students = await res.json();
    
    const body = document.getElementById('attendance-students-body');
    body.innerHTML = students.map(s => `
        <tr data-student-id="${s.id}">
            <td><strong>${s.rollNumber}</strong></td>
            <td>${s.user.fullName}</td>
            <td>
                <div class="form-check form-check-inline">
                    <input class="form-check-input" type="radio" name="status-${s.id}" id="present-${s.id}" value="PRESENT" checked>
                    <label class="form-check-label text-success" for="present-${s.id}">Present</label>
                </div>
                <div class="form-check form-check-inline">
                    <input class="form-check-input" type="radio" name="status-${s.id}" id="absent-${s.id}" value="ABSENT">
                    <label class="form-check-label text-danger" for="absent-${s.id}">Absent</label>
                </div>
            </td>
        </tr>
    `).join('');
    
    document.getElementById('attendance-marking-area').style.display = 'block';
}

async function saveAttendanceSheet() {
    const date = document.getElementById('att-date').value;
    const records = [];
    
    document.querySelectorAll('#attendance-students-body tr').forEach(row => {
        const studentId = row.getAttribute('data-student-id');
        const status = row.querySelector(`input[name="status-${studentId}"]:checked`).value;
        records.push({ studentId, status });
    });

    const res = await fetch('/api/attendance/mark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, records })
    });

    if (res.ok) {
        alert("Attendance submitted successfully!");
        renderAttendance();
    }
}

async function loadStudentAttendanceLogs(studentId) {
    const res = await fetch(`/api/attendance?studentId=${studentId}`);
    const logs = await res.json();
    const body = document.getElementById('student-attendance-body');
    
    if (logs.length === 0) {
        body.innerHTML = `<tr><td colspan="3" class="text-center py-3 text-muted">No attendance marked yet.</td></tr>`;
        return;
    }

    body.innerHTML = logs.map(l => `
        <tr>
            <td>${l.date}</td>
            <td>
                <span class="badge ${l.status === 'PRESENT' ? 'bg-success-light text-success' : 'bg-danger-light text-danger'}">
                    ${l.status}
                </span>
            </td>
            <td>${l.markedBy ? l.markedBy.user.fullName : 'System'}</td>
        </tr>
    `).join('');
}

// ==========================================
// 5. GRADES & EXAM MARKS
// ==========================================
async function renderMarks() {
    if (currentUser.role === 'FACULTY' || currentUser.role === 'ADMIN') {
        // Load courses for grading selector
        const courseRes = await fetch('/api/students'); // Simple mapping: need students first
        const students = await courseRes.json();

        mainContentArea.innerHTML = `
            <div class="row g-4">
                <div class="col-md-5">
                    <div class="glass-card p-4">
                        <h5 class="mb-4">Submit Student Grade</h5>
                        <form id="marks-form" onsubmit="submitMarkForm(event)">
                            <div class="mb-3">
                                <label class="form-label">Student</label>
                                <select id="m-student" class="form-select form-control-premium" required>
                                    ${students.map(s => `<option value="${s.id}">${s.user.fullName} (${s.rollNumber})</option>`).join('')}
                                </select>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Course Subject</label>
                                <select id="m-course" class="form-select form-control-premium" required>
                                    <option value="1">Mathematics (MATH101)</option>
                                    <option value="2">Physics (PHYS101)</option>
                                    <option value="3">Chemistry (CHEM101)</option>
                                </select>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Exam Category</label>
                                <select id="m-type" class="form-select form-control-premium" required>
                                    <option value="MID_TERM">Mid Term Exam</option>
                                    <option value="FINAL">Final Exam</option>
                                    <option value="QUIZ">Quiz / Assessment</option>
                                </select>
                            </div>
                            <div class="row mb-3">
                                <div class="col-6">
                                    <label class="form-label">Marks Obtained</label>
                                    <input type="number" step="0.1" id="m-obtained" class="form-control form-control-premium" required>
                                </div>
                                <div class="col-6">
                                    <label class="form-label">Max Marks</label>
                                    <input type="number" id="m-max" class="form-control form-control-premium" value="100" required>
                                </div>
                            </div>
                            <button type="submit" class="btn btn-premium w-100">Submit Exam Grades</button>
                        </form>
                    </div>
                </div>
                
                <div class="col-md-7">
                    <div class="glass-card p-4 h-100">
                        <h5 class="mb-4">Recent Institutional Mark Entries</h5>
                        <div class="table-responsive">
                            <table class="table">
                                <thead>
                                    <tr>
                                        <th>Student</th>
                                        <th>Subject</th>
                                        <th>Type</th>
                                        <th>Score</th>
                                        <th>Grade</th>
                                    </tr>
                                </thead>
                                <tbody id="marks-table-body">
                                    <tr><td colspan="5" class="text-center py-4">Loading marks table...</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        `;
        loadMarksTable();
    } else {
        // Student/Parent views their own marks and gets AI learning resources
        const studentId = currentUser.studentId || currentUser.childId;
        mainContentArea.innerHTML = `
            <div class="row g-4">
                <div class="col-md-8">
                    <div class="glass-card p-4">
                        <h5 class="mb-4">Report Card for ${currentUser.fullName}</h5>
                        <div class="table-responsive">
                            <table class="table">
                                <thead>
                                    <tr>
                                        <th>Subject</th>
                                        <th>Exam Category</th>
                                        <th>Score Obtained</th>
                                        <th>Max Marks</th>
                                        <th>Grade</th>
                                    </tr>
                                </thead>
                                <tbody id="student-marks-body">
                                    <tr><td colspan="5" class="text-center py-4">Fetching report card...</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                
                <div class="col-md-4">
                    <div class="glass-card p-4">
                        <h5 class="mb-4 d-flex align-items-center gap-2">
                            <i class="fas fa-lightbulb text-warning"></i>
                            <span>AI Study Companion</span>
                        </h5>
                        <div id="ai-study-recommendations">
                            <p class="text-secondary small">Generating custom recommendations...</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
        loadStudentMarks(studentId);
    }
}

async function loadMarksTable() {
    const res = await fetch('/api/marks');
    const marks = await res.json();
    const body = document.getElementById('marks-table-body');
    
    body.innerHTML = marks.map(m => `
        <tr>
            <td><strong>${m.student.user.fullName}</strong></td>
            <td>${m.course.name}</td>
            <td>${m.examType}</td>
            <td>${m.marksObtained} / ${m.maxMarks}</td>
            <td><span class="badge ${m.grade.startsWith('A') ? 'bg-success' : 'bg-primary'}">${m.grade}</span></td>
        </tr>
    `).join('');
}

async function submitMarkForm(e) {
    e.preventDefault();
    const data = {
        studentId: document.getElementById('m-student').value,
        courseId: document.getElementById('m-course').value,
        examType: document.getElementById('m-type').value,
        marksObtained: document.getElementById('m-obtained').value,
        maxMarks: document.getElementById('m-max').value
    };

    const res = await fetch('/api/marks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });

    if (res.ok) {
        document.getElementById('marks-form').reset();
        loadMarksTable();
    }
}

async function loadStudentMarks(studentId) {
    const res = await fetch(`/api/marks?studentId=${studentId}`);
    const marks = await res.json();
    const body = document.getElementById('student-marks-body');
    
    if (marks.length === 0) {
        body.innerHTML = `<tr><td colspan="5" class="text-center py-3 text-muted">No marks recorded yet.</td></tr>`;
        return;
    }

    body.innerHTML = marks.map(m => `
        <tr>
            <td><strong>${m.course.name}</strong></td>
            <td>${m.examType}</td>
            <td>${m.marksObtained}</td>
            <td>${m.maxMarks}</td>
            <td><span class="badge ${m.grade.startsWith('A') ? 'bg-success' : 'bg-primary'}">${m.grade}</span></td>
        </tr>
    `).join('');

    // Fetch AI resources recommendation
    const recRes = await fetch(`/api/ai/resources/${studentId}`);
    const rec = await recRes.json();
    const recContainer = document.getElementById('ai-study-recommendations');
    
    recContainer.innerHTML = `
        <div class="mb-3">
            <p class="small text-secondary mb-1">Struggling Area detected:</p>
            <h6 class="font-weight-bold mb-1 text-danger">${rec.weakestSubject} (Score: ${rec.score}%)</h6>
            <p class="text-muted small">Our AI model suggests these targeted learning aids to improve your grades:</p>
        </div>
        <div class="d-flex flex-column gap-2">
            ${rec.resources.map(r => `
                <a href="${r.url}" target="_blank" class="p-3 rounded border border-glass d-block text-decoration-none glass-card" style="margin-bottom:0.5rem;">
                    <div class="d-flex justify-content-between align-items-center">
                        <span class="badge bg-primary-light text-primary mb-1 d-inline-block" style="font-size:0.7rem;">${r.type}</span>
                    </div>
                    <h6 class="mb-0 text-primary small font-weight-bold" style="font-size:0.875rem;">${r.title}</h6>
                </a>
            `).join('')}
        </div>
    `;
}

// ==========================================
// 6. TIMETABLE SCHEDULING
// ==========================================
async function renderTimetable() {
    mainContentArea.innerHTML = `
        <div class="glass-card p-4">
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h5 class="mb-0">Class Timetable Schedule</h5>
                ${currentUser.role === 'ADMIN' ? `<button onclick="runAITimetableOptimizer()" class="btn btn-premium"><i class="fas fa-magic"></i> Optimize with AI</button>` : ''}
            </div>
            
            <div class="table-responsive">
                <table class="table table-bordered text-center align-middle">
                    <thead>
                        <tr class="bg-primary-light">
                            <th style="width: 15%;">Time Slot</th>
                            <th style="width: 17%;">Monday</th>
                            <th style="width: 17%;">Tuesday</th>
                            <th style="width: 17%;">Wednesday</th>
                            <th style="width: 17%;">Thursday</th>
                            <th style="width: 17%;">Friday</th>
                        </tr>
                    </thead>
                    <tbody id="timetable-body">
                        <tr><td colspan="6" class="text-center py-4">Generating timetable cells...</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;
    loadTimetableGrid();
}

async function loadTimetableGrid() {
    const res = await fetch('/api/timetable');
    const slots = await res.json();
    const body = document.getElementById('timetable-body');

    const timeSlots = ["09:00 AM - 10:30 AM", "11:00 AM - 12:30 PM", "02:00 PM - 03:30 PM"];
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

    body.innerHTML = timeSlots.map(time => {
        let rowHtml = `<tr><td><strong class="small text-secondary">${time}</strong></td>`;
        
        days.forEach(day => {
            // Find slot matching day and time
            const matching = slots.find(s => s.dayOfWeek.trim() === day && s.timeSlot.trim() === time);
            if (matching) {
                rowHtml += `
                    <td class="p-3">
                        <div class="p-2 rounded border border-primary bg-primary-light" style="font-size:0.875rem;">
                            <strong class="text-primary d-block">${matching.course.name}</strong>
                            <span class="text-secondary small d-block">${matching.faculty.user.fullName}</span>
                            <span class="badge bg-secondary text-muted small mt-1 font-weight-normal">${matching.classroom}</span>
                        </div>
                    </td>
                `;
            } else {
                rowHtml += `<td class="text-muted small font-italic" style="background-color:var(--bg-primary);">No Class Scheduled</td>`;
            }
        });
        
        rowHtml += `</tr>`;
        return rowHtml;
    }).join('');
}

async function runAITimetableOptimizer() {
    const btn = document.querySelector('button[onclick="runAITimetableOptimizer()"]');
    btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Rescheduling slots...`;
    btn.disabled = true;

    try {
        const res = await fetch('/api/timetable/optimize', { method: 'POST' });
        if (res.ok) {
            alert("Success: The neural scheduling engine has optimized classroom layouts and resolved instructor timetables!");
            loadTimetableGrid();
        }
    } catch(e) {
        console.error(e);
    } finally {
        btn.innerHTML = `<i class="fas fa-magic"></i> Optimize with AI`;
        btn.disabled = false;
    }
}

// ==========================================
// 7. FEE MANAGEMENT
// ==========================================
async function renderFees() {
    mainContentArea.innerHTML = `
        <div class="glass-card p-4">
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h5 class="mb-0">Tuition Invoices & Payment Ledger</h5>
                ${currentUser.role === 'ADMIN' ? `<button onclick="sendAIFeeReminders()" class="btn btn-premium"><i class="fas fa-paper-plane"></i> Send AI Reminders</button>` : ''}
            </div>
            
            <div class="table-responsive">
                <table class="table align-middle">
                    <thead>
                        <tr>
                            <th>Student</th>
                            <th>Installment Amount</th>
                            <th>Due Date</th>
                            <th>Status</th>
                            <th>Payment Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="fees-table-body">
                        <tr><td colspan="6" class="text-center py-4">Fetching invoices...</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;
    loadFeesLedger();
}

async function loadFeesLedger() {
    const studentId = (currentUser.role === 'STUDENT' || currentUser.role === 'PARENT') ? (currentUser.studentId || currentUser.childId) : null;
    const url = studentId ? `/api/fees?studentId=${studentId}` : '/api/fees';
    
    const res = await fetch(url);
    const fees = await res.json();
    const body = document.getElementById('fees-table-body');

    if (fees.length === 0) {
        body.innerHTML = `<tr><td colspan="6" class="text-center py-3 text-muted">No fee records found.</td></tr>`;
        return;
    }

    body.innerHTML = fees.map(f => `
        <tr>
            <td><strong>${f.student.user.fullName}</strong> <br> <span class="text-muted small">${f.student.rollNumber}</span></td>
            <td>$${f.amount.toFixed(2)}</td>
            <td>${f.dueDate}</td>
            <td>
                <span class="badge ${f.status === 'PAID' ? 'bg-success-light text-success' : 'bg-warning-light text-warning'}">
                    ${f.status}
                </span>
            </td>
            <td>${f.paymentDate || '--'}</td>
            <td>
                ${f.status === 'PENDING' && (currentUser.role === 'PARENT' || currentUser.role === 'STUDENT') ? 
                    `<button onclick="simulateFeePayment(${f.id})" class="btn btn-sm btn-success">Pay Now</button>` : 
                    '<span class="text-muted small">No actions</span>'
                }
            </td>
        </tr>
    `).join('');
}

async function simulateFeePayment(id) {
    if (confirm("Proceed to simulate online banking gateway integration for payment?")) {
        const res = await fetch(`/api/fees/${id}/pay`, { method: 'POST' });
        if (res.ok) {
            alert("Payment successful! Transact receipt logged in ledger.");
            loadFeesLedger();
        }
    }
}

async function sendAIFeeReminders() {
    const btn = document.querySelector('button[onclick="sendAIFeeReminders()"]');
    btn.disabled = true;
    btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Triggering alerts...`;

    try {
        const res = await fetch('/api/fees/send-reminders', { method: 'POST' });
        const result = await res.json();
        alert(result.message);
    } catch(e) {
        console.error(e);
    } finally {
        btn.disabled = false;
        btn.innerHTML = `<i class="fas fa-paper-plane"></i> Send AI Reminders`;
    }
}

// ==========================================
// 8. LIBRARY CATALOG
// ==========================================
async function renderLibrary() {
    mainContentArea.innerHTML = `
        <div class="row g-4">
            <div class="col-md-8">
                <div class="glass-card p-4">
                    <h5 class="mb-4">Library Catalog Book List</h5>
                    <div class="table-responsive">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Title</th>
                                    <th>Author</th>
                                    <th>ISBN</th>
                                    <th>Copies available</th>
                                    ${currentUser.role === 'ADMIN' ? '<th>Action</th>' : ''}
                                </tr>
                            </thead>
                            <tbody id="library-books-body">
                                <tr><td colspan="5" class="text-center py-4">Retrieving library index...</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <div class="col-md-4">
                <div class="glass-card p-4 mb-4">
                    <h5 class="mb-3">Checkout Register</h5>
                    <div id="library-issues-container" class="d-flex flex-column gap-3">
                        <p class="text-muted small">Loading borrows...</p>
                    </div>
                </div>

                ${currentUser.role === 'ADMIN' ? `
                <div class="glass-card p-4">
                    <h5 class="mb-3">Simulate Issue Book</h5>
                    <form id="issue-form" onsubmit="submitIssueForm(event)">
                        <div class="mb-3">
                            <label class="form-label">Select Book</label>
                            <select id="issue-book" class="form-select form-control-premium" required></select>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Student Borrower</label>
                            <select id="issue-student" class="form-select form-control-premium" required></select>
                        </div>
                        <button type="submit" class="btn btn-premium w-100">Checkout Book</button>
                    </form>
                </div>
                ` : ''}
            </div>
        </div>
    `;

    loadLibraryCatalog();
}

async function loadLibraryCatalog() {
    try {
        const bookRes = await fetch('/api/books');
        const books = await bookRes.json();
        
        const body = document.getElementById('library-books-body');
        body.innerHTML = books.map(b => `
            <tr>
                <td><strong>${b.title}</strong></td>
                <td>${b.author}</td>
                <td><code class="small">${b.isbn}</code></td>
                <td>
                    <span class="badge ${b.availableCopies > 0 ? 'bg-success-light text-success' : 'bg-danger-light text-danger'}">
                        ${b.availableCopies} of ${b.totalCopies} available
                    </span>
                </td>
                ${currentUser.role === 'ADMIN' ? `<td>--</td>` : ''}
            </tr>
        `).join('');

        // Populate selects
        if (currentUser.role === 'ADMIN') {
            const stuRes = await fetch('/api/students');
            const students = await stuRes.json();

            document.getElementById('issue-book').innerHTML = books.map(b => `<option value="${b.id}">${b.title}</option>`).join('');
            document.getElementById('issue-student').innerHTML = students.map(s => `<option value="${s.id}">${s.user.fullName} (${s.rollNumber})</option>`).join('');
        }

        loadBorrowRegister();
    } catch(e) {
        console.error(e);
    }
}

async function loadBorrowRegister() {
    const res = await fetch('/api/books/issues');
    const issues = await res.json();
    const container = document.getElementById('library-issues-container');

    // Filter if student or parent
    let displayIssues = issues;
    if (currentUser.role === 'STUDENT' || currentUser.role === 'PARENT') {
        const studentId = currentUser.studentId || currentUser.childId;
        displayIssues = issues.filter(i => i.student.id === studentId);
    }

    if (displayIssues.length === 0) {
        container.innerHTML = `<p class="text-secondary small">No current borrowings logged.</p>`;
        return;
    }

    container.innerHTML = displayIssues.map(i => `
        <div class="p-3 rounded border border-glass d-flex justify-content-between align-items-center">
            <div>
                <h6 class="mb-1 font-weight-bold small">${i.book.title}</h6>
                <p class="text-muted mb-0" style="font-size:0.75rem;">Borrowed by: ${i.student.user.fullName}</p>
                <p class="text-muted mb-0" style="font-size:0.75rem;">Due: ${i.dueDate}</p>
                <span class="badge mt-1 ${i.status === 'ISSUED' ? 'bg-primary-light text-primary' : 'bg-success-light text-success'}" style="font-size:0.65rem;">${i.status}</span>
            </div>
            ${i.status === 'ISSUED' && currentUser.role === 'ADMIN' ? 
                `<button onclick="returnLibraryBook(${i.id})" class="btn btn-sm btn-outline-success p-1" style="font-size:0.75rem;">Check In</button>` : ''
            }
        </div>
    `).join('');
}

async function submitIssueForm(e) {
    e.preventDefault();
    const data = {
        bookId: document.getElementById('issue-book').value,
        studentId: document.getElementById('issue-student').value
    };

    const res = await fetch('/api/books/issue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });

    if (res.ok) {
        loadLibraryCatalog();
    } else {
        alert("Checkout failed. Confirm copy availability.");
    }
}

async function returnLibraryBook(issueId) {
    const res = await fetch(`/api/books/return/${issueId}`, { method: 'POST' });
    if (res.ok) {
        loadLibraryCatalog();
    }
}

// ==========================================
// 9. HOSTEL & TRANSPORT INFO
// ==========================================
async function renderHostelTransport() {
    mainContentArea.innerHTML = `
        <div class="row g-4">
            <div class="col-md-6">
                <div class="glass-card p-4">
                    <h5 class="mb-4"><i class="fas fa-hotel text-primary"></i> Dormitory & Hostel Allotments</h5>
                    <p class="text-secondary small">Detailed registry of institution resident halls and students room keys.</p>
                    
                    <div class="d-flex flex-column gap-3 mt-3">
                        <div class="p-3 rounded border border-glass bg-glass">
                            <h6 class="font-weight-bold mb-1">Bobby Johnson (STU001)</h6>
                            <p class="mb-0 small text-secondary">Resident Status: <span class="text-success font-weight-bold">Hostel Resident</span></p>
                            <p class="mb-0 small text-secondary">Dorm Room: <strong>Room 104-A (Main Wing)</strong></p>
                            <p class="mb-0 small text-secondary">Warden Contact: Warden James (Ext: 820)</p>
                        </div>
                        <div class="p-3 rounded border border-glass bg-glass">
                            <h6 class="font-weight-bold mb-1">Jane Smith (STU002)</h6>
                            <p class="mb-0 small text-secondary">Resident Status: <span class="text-muted">Day Scholar</span></p>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="col-md-6">
                <div class="glass-card p-4">
                    <h5 class="mb-4"><i class="fas fa-bus text-success"></i> Institution Transit & Bus Routes</h5>
                    <p class="text-secondary small">Real-time scheduling of campus transit vehicles and students transit codes.</p>
                    
                    <div class="d-flex flex-column gap-3 mt-3">
                        <div class="p-3 rounded border border-glass bg-glass">
                            <h6 class="font-weight-bold mb-1">Bobby Johnson (STU001)</h6>
                            <p class="mb-0 small text-secondary">Transit Status: <span class="text-muted">Self / Walk-in</span></p>
                        </div>
                        <div class="p-3 rounded border border-glass bg-glass">
                            <h6 class="font-weight-bold mb-1">Jane Smith (STU002)</h6>
                            <p class="mb-0 small text-secondary">Transit Status: <span class="text-success font-weight-bold">Active Transit Rider</span></p>
                            <p class="mb-0 small text-secondary">Bus Assigned: <strong>Bus #12 (Transit Route 7-North)</strong></p>
                            <p class="mb-0 small text-secondary">Pickup Time: 07:35 AM (Drop off: 04:15 PM)</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// ==========================================
// 10. FLOATING CHATBOT WIDGET
// ==========================================
function toggleChatbot() {
    chatbotPanel.classList.toggle('active');
    if (chatbotPanel.classList.contains('active')) {
        chatInput.focus();
        // If empty conversation, seed initial greeting
        if (chatMessages.children.length === 0) {
            appendChatBubble("bot", `Hello ${currentUser.fullName}! I'm your Smart Edu virtual assistant, running on the integrated Machine Learning process. Ask me anything about your timetable, fee statuses, attendance warning risks, or course recommendations.`);
        }
    }
}

function appendChatBubble(sender, text) {
    const bubble = document.createElement('div');
    bubble.className = `chat-bubble ${sender}`;
    bubble.innerText = text;
    chatMessages.appendChild(bubble);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

async function sendChatMessage() {
    const text = chatInput.value.trim();
    if (!text) return;
    
    appendChatBubble("user", text);
    chatInput.value = '';

    // Show bot typing dot indicators
    const typingIndicator = document.createElement('div');
    typingIndicator.className = 'chat-bubble bot typing-indicator';
    typingIndicator.innerHTML = '<i class="fas fa-ellipsis-h fa-pulse"></i>';
    chatMessages.appendChild(typingIndicator);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    try {
        const res = await fetch('/api/ai/chatbot', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: text })
        });
        
        const data = await res.json();
        chatMessages.removeChild(typingIndicator);
        appendChatBubble("bot", data.reply);
    } catch(e) {
        chatMessages.removeChild(typingIndicator);
        appendChatBubble("bot", "I ran into a connection glitch talking to the cognitive core. Please try again.");
    }
}

// Bind Enter key in Chat
if (chatInput) {
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendChatMessage();
        }
    });
}
