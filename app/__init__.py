from flask import Flask
import os

app = Flask(__name__, static_folder=os.path.abspath('app/static'))

from app import routes
