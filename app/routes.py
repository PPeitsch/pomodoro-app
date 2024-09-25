from flask import render_template, jsonify, request
from app import app
from database import get_tasks, save_tasks, get_settings, save_settings, save_session, get_sessions


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/get_tasks')
def get_tasks_route():
    tasks = get_tasks()
    return jsonify([{'text': task['task'], 'status': task['status']} for task in tasks])


@app.route('/save_tasks', methods=['POST'])
def save_tasks_route():
    tasks = request.json['tasks']
    save_tasks([{'task': task['text'], 'status': task['status']} for task in tasks])
    return jsonify({'status': 'success'})


@app.route('/get_settings')
def get_settings_route():
    return jsonify(get_settings())


@app.route('/save_settings', methods=['POST'])
def save_settings_route():
    settings = request.json
    save_settings(settings)
    return jsonify({'status': 'success'})


@app.route('/save_session', methods=['POST'])
def save_session_route():
    timestamp = request.json['timestamp']
    save_session(timestamp)
    return jsonify({'status': 'success'})


@app.route('/get_sessions')
def get_sessions_route():
    return jsonify(get_sessions())


@app.route('/<path:filename>')
def serve_static(filename):
    return app.send_static_file(filename)
