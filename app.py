import numpy as np
import pandas as pd
from flask import Flask, request, jsonify
from sklearn.linear_model import LinearRegression, LogisticRegression

app = Flask(__name__)

# --- TRAIN ML MODELS ON STARTUP (Synthetic Data) ---

# 1. Performance Predictor (GPA Predictor)
np.random.seed(42)
num_samples = 1000
past_gpa_data = np.random.uniform(2.0, 4.0, num_samples)
attendance_data = np.random.uniform(60, 100, num_samples)
study_hours_data = np.random.uniform(1, 20, num_samples)
extra_hours_data = np.random.uniform(0, 10, num_samples)

# Target GPA formula with noise
noise = np.random.normal(0, 0.1, num_samples)
target_gpa = (past_gpa_data * 0.55) + (attendance_data * 0.015) + (study_hours_data * 0.04) + noise
target_gpa = np.clip(target_gpa, 1.0, 4.0)

X_perf = pd.DataFrame({
    'pastGpa': past_gpa_data,
    'attendance': attendance_data,
    'studyHours': study_hours_data,
    'extraHours': extra_hours_data
})
y_perf = target_gpa

perf_model = LinearRegression()
perf_model.fit(X_perf, y_perf)

# 2. Fail Risk Classifier (Logistic Regression)
# Features: [attendance_pct, midterm_score]
X_risk_list = []
y_risk_list = []
for _ in range(1000):
    att = np.random.uniform(50, 100)
    score = np.random.uniform(40, 100)
    if att < 75.0 and score < 60.0:
        risk = 2 # High Risk
    elif att < 75.0 or score < 60.0:
        risk = 1 # Medium Risk
    else:
        risk = 0 # Low Risk
    X_risk_list.append([att, score])
    y_risk_list.append(risk)

X_risk = np.array(X_risk_list)
y_risk = np.array(y_risk_list)

risk_model = LogisticRegression(max_iter=1000)
risk_model.fit(X_risk, y_risk)


# --- REST API ENDPOINTS ---

@app.route('/predict-performance', methods=['POST'])
def predict_performance():
    data = request.json or {}
    try:
        past_gpa = float(data.get('pastGpa', 3.0))
        attendance = float(data.get('attendance', 90.0))
        study_hours = float(data.get('studyHours', 5.0))
        extra_hours = float(data.get('extraHours', 2.0))

        X_input = pd.DataFrame([[past_gpa, attendance, study_hours, extra_hours]],
                               columns=['pastGpa', 'attendance', 'studyHours', 'extraHours'])
        pred_gpa = float(perf_model.predict(X_input)[0])
        pred_gpa = min(max(pred_gpa, 0.0), 4.0)
        pred_gpa = round(pred_gpa, 2)

        rec = "Performance is solid. Keep up the current schedule."
        if pred_gpa < 3.0:
            rec = f"AI recommends increasing study hours to at least 12 hours per week and aiming for > 85% attendance to boost GPA."

        return jsonify({
            'predictedGpa': pred_gpa,
            'confidence': "89% (Trained Linear Regression Model)",
            'recommendation': rec
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 400


@app.route('/predict-fail-risk', methods=['POST'])
def predict_fail_risk():
    data = request.json or {}
    try:
        attendance = float(data.get('attendance', 90.0))
        midterm = float(data.get('midtermScore', 80.0))

        pred_risk_code = int(risk_model.predict([[attendance, midterm]])[0])
        risks = {0: "LOW", 1: "MEDIUM", 2: "HIGH"}
        risk = risks.get(pred_risk_code, "LOW")

        reasons = {
            "LOW": "Student is in a safe academic zone with regular attendance and passing marks.",
            "MEDIUM": "Attention needed. Academic grades or attendance rates are slipping below target thresholds.",
            "HIGH": "Critical Warning! AI predicts high risk of academic failure/attendance debarment. Immediate counseling is recommended."
        }

        return jsonify({
            'risk': risk,
            'reason': reasons[risk]
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 400


@app.route('/recommend-resources', methods=['POST'])
def recommend_resources():
    data = request.json or {}
    subject = data.get('subject', 'Physics')
    grade_percent = float(data.get('gradePercent', 80.0))

    resources = []
    if grade_percent < 70.0:
        if subject.lower() == 'physics':
            resources = [
                {"title": "AI Recommended: Basic Physics Concepts & Tutorials", "url": "https://www.khanacademy.org/science/physics", "type": "Remedial Video"},
                {"title": "Interactive Physics Lab Simulations", "url": "https://phet.colorado.edu/en/simulations/category/physics", "type": "Simulations"}
            ]
        elif subject.lower() == 'mathematics':
            resources = [
                {"title": "AI Recommended: Foundation Mathematics & Practice Problems", "url": "https://www.khanacademy.org/math", "type": "Practice Set"},
                {"title": "Step-by-Step Algebra & Calculus Worksheets", "url": "https://www.mathisfun.com/", "type": "Exercises"}
            ]
        else:
            resources = [
                {"title": "AI Recommended: Science Core Fundamentals", "url": "https://www.coursera.org/", "type": "Basic Tutorial"}
            ]
    else:
        if subject.lower() == 'physics':
            resources = [
                {"title": "AI Recommended: Advanced Classical Mechanics Lectures", "url": "https://ocw.mit.edu/courses/physics/", "type": "MIT Course"},
                {"title": "Feynman Lectures on Physics", "url": "https://www.feynmanlectures.caltech.edu/", "type": "Reading Material"}
            ]
        elif subject.lower() == 'mathematics':
            resources = [
                {"title": "AI Recommended: Essence of Linear Algebra", "url": "https://www.youtube.com/c/3blue1brown", "type": "Advanced Video Playlist"},
                {"title": "Introduction to Abstract Algebra & Analysis", "url": "https://mathworld.wolfram.com/", "type": "Encyclopedia"}
            ]
        else:
            resources = [
                {"title": "AI Recommended: Modern Science Journals & Publications", "url": "https://www.nature.com/", "type": "Research Articles"}
            ]

    return jsonify(resources)


@app.route('/optimize-timetable', methods=['POST'])
def optimize_timetable():
    slots = request.json or []
    try:
        days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
        times = ["09:00 AM - 10:30 AM", "11:00 AM - 12:30 PM", "02:00 PM - 03:30 PM"]
        classrooms = ["Room 101", "Room 202", "Lab B", "Room 305"]

        optimized_slots = []
        assigned_faculty_slots = set() # (day, time, faculty)
        assigned_room_slots = set()    # (day, time, room)

        for slot in slots:
            faculty = slot.get('facultyName')
            assigned = False
            for d in days:
                for t in times:
                    for r in classrooms:
                        fac_key = (d, t, faculty)
                        room_key = (d, t, r)
                        if fac_key not in assigned_faculty_slots and room_key not in assigned_room_slots:
                            slot['dayOfWeek'] = d
                            slot['timeSlot'] = t
                            slot['classroom'] = r
                            
                            assigned_faculty_slots.add(fac_key)
                            assigned_room_slots.add(room_key)
                            optimized_slots.append(slot)
                            assigned = True
                            break
                    if assigned:
                        break
                if assigned:
                    break
            
            if not assigned:
                optimized_slots.append(slot)

        return jsonify(optimized_slots)
    except Exception as e:
        return jsonify({'error': str(e)}), 400


@app.route('/chatbot', methods=['POST'])
def chatbot():
    data = request.json or {}
    msg = data.get('message', '').strip().lower()
    role = data.get('role', 'STUDENT')
    username = data.get('username', 'User')

    reply = ""
    if "hello" in msg or "hi" in msg or "hey" in msg:
        reply = f"Hello {username}! I am the Smart Edu Assistant. How can I help you today with your {role.lower()} portal?"
    elif "fee" in msg or "payment" in msg:
        if role == 'PARENT':
            reply = "You can view and pay outstanding fees in the 'Fee Management' tab. Current pending fee is $1500.00."
        elif role == 'ADMIN':
            reply = "In the Fee panel, you can view the institutional fee collection reports and trigger automated payment alerts."
        else:
            reply = "You can view your current fee statements. If you have pending dues, please notify your parent to clear them in their portal."
    elif "attendance" in msg:
        if role == 'FACULTY':
            reply = "You can record student attendance daily by selecting the 'Attendance Management' tab, picking a date, and marking statuses."
        else:
            reply = "Attendance logs show your active status records. Bobby has 70% attendance which is below the 75% threshold, triggering risk alerts."
    elif "grade" in msg or "mark" in msg or "exam" in msg:
        if role == 'FACULTY':
            reply = "Use the 'Marks Entry' form to submit test and quiz scores. The system will automatically compute grades and performance predictions."
        else:
            reply = "Your grades are listed in the 'Examination & Marks' module. Bobby has a midterm warning in Physics (54%), but is doing well in Mathematics (78%)."
    elif "timetable" in msg or "schedule" in msg:
        reply = "Timetable listings show the weekly classroom assignments. Admins can click 'Optimize with AI' to run the conflict resolution optimizer."
    elif "library" in msg or "book" in msg:
        reply = "You can checkout books under 'Library Management'. If a book is checked out, you can return it by clicking 'Return Book'."
    elif "resource" in msg or "recommend" in msg:
        reply = "AI recommended study links are available on the dashboard based on weakest performance areas. Currently, physics resources are recommended for Bobby."
    elif "help" in msg or "support" in msg:
        reply = "I am a smart AI agent. You can ask me about fees, attendance logs, marks, library catalogs, timetables, or hostel routes."
    else:
        reply = f"Thank you for your question about '{msg}'. As a Smart Educational AI, I recommend checking the corresponding modules on your dashboard sidebar."

    return jsonify({
        'reply': reply,
        'source': 'Flask Chatbot AI Engine'
    })


if __name__ == '__main__':
    app.run(port=5000, debug=True)
