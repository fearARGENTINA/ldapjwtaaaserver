FROM python:3.9

WORKDIR /authService

COPY . /authService/

RUN apt-get update && apt-get install -y python-dev libldap2-dev libsasl2-dev libssl-dev
RUN pip install -r requirements.txt
RUN mkdir -p /authService/logs

CMD [ "python3", "run.py"]