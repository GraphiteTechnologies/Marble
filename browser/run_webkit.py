import sys
import os
import subprocess
from PyQt6.QtWidgets import QApplication, QMainWindow
from PyQt6.QtWebEngineWidgets import QWebEngineView
from PyQt6.QtWebEngineCore import QWebEnginePage
from PyQt6.QtCore import QUrl, QObject, pyqtSlot
from PyQt6.QtWebChannel import QWebChannel

class Backend(QObject):
    @pyqtSlot(str, result=str)
    def executeCommand(self, command):
        print(f"Executing command: {command}")
        try:
            result = subprocess.run(
                command,
                shell=True,
                capture_output=True,
                text=True,
                check=False,
                cwd=os.path.expanduser("~")
            )
            output = result.stdout + result.stderr
            if not output.strip():
                return "(No output)"
            return output
        except Exception as e:
            print(f"Error executing command: {e}")
            return f"Error: {str(e)}"

class WebEnginePage(QWebEnginePage):
    def __init__(self, parent):
        super().__init__(parent)
        self.backend = Backend()
        
        self.channel = QWebChannel(self)
        self.setWebChannel(self.channel)
        self.channel.registerObject("backend", self.backend)

class MainWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("Graphite Custom Browser")
        self.setGeometry(100, 100, 1280, 720)

        self.browser = QWebEngineView()
        self.setCentralWidget(self.browser)
        
        self.page = WebEnginePage(self)
        self.browser.setPage(self.page)

        self.browser.setUrl(QUrl("http://localhost:5173"))

if __name__ == "__main__":
    app = QApplication(sys.argv)

    if "--debug" in sys.argv:
        print("Debugging enabled. http://localhost:8080")
        os.environ['QTWEBENGINE_REMOTE_DEBUGGING'] = "8080"

    main_window = MainWindow()
    main_window.show()
    sys.exit(app.exec())