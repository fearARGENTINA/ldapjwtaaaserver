import socket
import os
import logging
from concurrent_log_handler import ConcurrentRotatingFileHandler

HOST = '0.0.0.0'  # Standard loopback interface address (localhost)
PORT = 80        # Port to listen on (non-privileged ports are > 1023)
LOGFILE = "/logSocketReceiver/logs/test.log"
# LOGFILE = "./test.log"

log = logging.getLogger(__name__)
rotateHandler = ConcurrentRotatingFileHandler(LOGFILE, "a", 512*1024, 5)
log.addHandler(rotateHandler)
log.setLevel(logging.INFO)


with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
    s.bind((HOST, PORT))
    s.listen(1)
    while True:
        conn, addr = s.accept()
        
        with conn:
            print('Connected by', addr)
            while True:
                data = conn.recv(1024)
                log.info(data.decode('utf-8'))
                if not data:
                    break
                conn.sendall(data)