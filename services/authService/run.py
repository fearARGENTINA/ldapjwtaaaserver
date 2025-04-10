from app import app, db
import logging
import ecs_logging
from concurrent_log_handler import ConcurrentRotatingFileHandler
import uuid

if __name__ == '__main__':
    # file_handler = ConcurrentRotatingFileHandler(f"/authService/logs/{logFileName}", "a", maxBytes=50*1024, backupCount=20) 
    # file_handler.setLevel(logging.INFO)
    # file_handler.setFormatter(ecs_logging.StdlibFormatter())
    # app.logger.addHandler(file_handler)
    
    db.create_all()
    app.run(host='0.0.0.0', port=5001, debug=True)
    #app.run(host='0.0.0.0', debug=False)