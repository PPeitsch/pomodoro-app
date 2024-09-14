from flask import render_template, send_from_directory
from app import app
import os


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/<path:filename>')
def serve_static(filename):
    return send_from_directory(app.static_folder, filename)
