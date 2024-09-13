# Pomodoro App

A minimalist, responsive Pomodoro timer web application built with Flask. This app features SVG buttons, an intuitive UI, and smooth timer functionality, perfect for productivity enthusiasts and developers looking for a clean, customizable Pomodoro implementation.

## Features

- 25-minute Pomodoro timer
- Responsive design for both desktop and mobile devices
- Minimalist user interface
- SVG buttons with intuitive shapes for each function
- Start, pause, and reset functionality
- Alert notification when a Pomodoro session is completed

## Technologies Used

- Python
- Flask
- HTML5
- CSS3
- JavaScript

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/your-username/pomodoro-app.git
   cd pomodoro-app
   ```

2. Create a virtual environment (optional but recommended):
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows, use `venv\Scripts\activate`
   ```

3. Install the required dependencies:
   ```
   pip install flask
   ```

## Usage

1. Run the Flask application:
   ```
   python run.py
   ```

2. Open your web browser and navigate to `http://127.0.0.1:5000/`

3. Use the buttons to control the Pomodoro timer:
   - Play button: Start the timer
   - Pause button: Pause the timer
   - Reset button: Reset the timer to 25:00

## Customization

You can easily customize the Pomodoro app by modifying the following:

- Timer duration: Change the `timeLeft` variable in the JavaScript code (index.html)
- Styles: Modify the CSS in the `<style>` section of index.html
- Alert message: Edit the alert text in the JavaScript code (index.html)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the [MIT License](LICENSE).

## Contact

If you have any questions, feel free to reach out to me at [your-email@example.com](mailto:your-email@example.com) or open an issue in this repository.

