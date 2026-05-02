"""
 * GANTT software is free to use and copy as needed.
 * Purpose: Simple local web server to serve application files.
"""

import http.server
import socketserver
import webbrowser
import os
import subprocess

PORT = 8080
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

def kill_port(port):
    try:
        # Try to kill process using the port (Linux/macOS)
        subprocess.run(["fuser", "-k", f"{port}/tcp"], capture_output=True)
    except Exception:
        pass

def run():
    kill_port(PORT)
    # Attempt to open the browser automatically
    webbrowser.open(f"http://localhost:{PORT}")
    
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        print(f"Server started at http://localhost:{PORT}")
        print("Press Ctrl+C to stop the server.")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nShutting down server...")
            httpd.server_close()

if __name__ == "__main__":
    run()
