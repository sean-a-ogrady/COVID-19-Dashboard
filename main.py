# Imports
from flask import Flask, render_template
import pandas as pd
import numpy as np
import json

app = Flask(__name__)


# Route to dashboard page
@app.route('/')
def dashboard():
    # Pass Python preprocessing into the HTML
    return render_template("dashboard.html")

# Run the app. This line belongs LAST.
if __name__ == '__main__':
    app.run(debug = True)