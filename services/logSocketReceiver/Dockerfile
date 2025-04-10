FROM python:3.9

WORKDIR /logSocketReceiver

COPY . /logSocketReceiver/

RUN apt-get update && apt-get install -y python-dev
RUN pip install -r requirements.txt
RUN mkdir -p /logSocketReceiver/logs/

CMD [ "python3", "run.py"]