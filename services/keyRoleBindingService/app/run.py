import sys
from app import app, db
import logging
import ecs_logging
from concurrent_log_handler import ConcurrentRotatingFileHandler

if __name__ == '__main__':
    file_handler = ConcurrentRotatingFileHandler("logs/app.json", "a", maxBytes=50*1024, backupCount=20) 
    file_handler.setLevel(logging.INFO)
    file_handler.setFormatter(ecs_logging.StdlibFormatter())
    app.logger.addHandler(file_handler)
    
    with app.app_context():
        db.create_all()
    
    app.run(host='0.0.0.0', debug=False)
